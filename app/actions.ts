"use server";

import {
  answerAgentQuestion,
  chatRespond,
  generateListingContent,
  interpretSearchQuery,
} from "@/lib/ai/service";
import { generateSuziReply, NAVIGATION_TARGETS, type SuziTurn } from "@/lib/ai/suzi-brain";
import { getSuziResponse } from "@/lib/ai/suzi-assistant";
import type { SuziContext, SuziReply } from "@/lib/ai/suzi-assistant";
import { aiSearchListings } from "@/lib/ai/suzi-search";
import { sendTeamNotification } from "@/lib/email";
import { getMockListing, MOCK_LISTINGS } from "@/lib/mock-data";
import { checkRateLimit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { GeneratedListingContent, ListingFacts, SearchMatch } from "@/lib/types";
import { z } from "zod";

/**
 * Server actions. In Supabase mode they persist; in mock mode they validate
 * and succeed so every flow remains demonstrable without configuration.
 */

export async function generateListingAction(
  facts: ListingFacts,
): Promise<GeneratedListingContent> {
  return generateListingContent(facts);
}

/**
 * Suzi's main conversational entry point. Generates a real reply via the
 * model (`lib/ai/suzi-brain.ts`), grounded in the site's actual listings and
 * the property in view, and carrying conversation history so follow-up
 * questions work. Returns both the generated text and any navigation the
 * model chose.
 *
 * Falls back to the deterministic keyword assistant if the model is
 * unavailable for any reason (no key, no credit, network error, timeout),
 * so the assistant always answers. Runs server-side so OPENAI_API_KEY never
 * reaches the browser.
 */
export async function suziReplyAction(
  message: string,
  context: SuziContext,
  history: SuziTurn[] = [],
): Promise<SuziReply> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { text: "Tell me what you're looking for and I'll take it from there.", navigation: null };
  }
  if (!(await checkRateLimit())) return { text: RATE_LIMITED_MESSAGE, navigation: null };

  const result = await generateSuziReply(trimmed, {
    route: context.route,
    listing: context.listing,
    listings: MOCK_LISTINGS,
    history,
  });
  if (!result) return getSuziResponse(trimmed, context);

  return {
    text: result.reply,
    navigation: NAVIGATION_TARGETS[result.action] ?? null,
  };
}

/** Homepage chat panels — same generative brain, text only (these surfaces don't route). */
export async function homeChatAction(message: string, history: SuziTurn[] = []): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) return chatRespond(trimmed);
  if (!(await checkRateLimit())) return RATE_LIMITED_MESSAGE;

  const result = await generateSuziReply(trimmed, {
    route: "/",
    listings: MOCK_LISTINGS,
    history,
  });
  return result?.reply ?? chatRespond(trimmed);
}

/**
 * Per-property chat (the property page's "ask about this home" panel and the
 * homepage agent demo). Grounded in the single listing in view, so Suzi
 * answers from that property's real data rather than generically.
 * Falls back to the deterministic per-listing answerer.
 */
export async function propertyChatAction(
  listingId: string,
  message: string,
  history: SuziTurn[] = [],
): Promise<string> {
  const trimmed = message.trim();
  const listing = getMockListing(listingId);
  if (!listing) return "I couldn't load that property just now — try refreshing the page.";
  if (!trimmed) return answerAgentQuestion(listing, trimmed);
  if (!(await checkRateLimit())) return RATE_LIMITED_MESSAGE;

  const result = await generateSuziReply(trimmed, {
    route: `/property/${listing.slug}`,
    listing,
    history,
  });
  return result?.reply ?? answerAgentQuestion(listing, trimmed);
}

/**
 * AI-driven natural-language property search. The model ranks the real
 * catalogue and writes its own reason per match; falls back to the
 * deterministic scorer in lib/ai/service.ts if it's unavailable, so the
 * search page always returns something.
 */
export async function aiSearchAction(query: string): Promise<SearchMatch[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (!(await checkRateLimit())) return interpretSearchQuery(trimmed, MOCK_LISTINGS);

  const results = await aiSearchListings(trimmed, MOCK_LISTINGS);
  return results ?? interpretSearchQuery(trimmed, MOCK_LISTINGS);
}

const contactSchema = z.object({
  reason: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(4000),
});

export async function submitContact(input: {
  reason: string;
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form fields and try again." };
  }
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    if (error) return { ok: false, error: "Could not save your message. Please retry." };
  }

  const { reason, name, email, message } = parsed.data;
  await sendTeamNotification(
    `New contact form submission — ${reason}`,
    `Name: ${name}\nEmail: ${email}\nReason: ${reason}\n\n${message}`,
  );

  return { ok: true };
}

const waitlistSchema = z.object({
  email: z.string().email(),
  interest: z.string().max(60).optional(),
});

export async function joinWaitlist(
  email: string,
  interest?: string,
): Promise<{ ok: boolean }> {
  const parsed = waitlistSchema.safeParse({ email, interest });
  if (!parsed.success) return { ok: false };
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase
      .from("waitlist_signups")
      .upsert({ email: parsed.data.email, interest: parsed.data.interest ?? null }, { onConflict: "email" });
  }

  await sendTeamNotification(
    "New waitlist signup",
    `Email: ${parsed.data.email}\nInterest: ${parsed.data.interest ?? "—"}`,
  );

  return { ok: true };
}
