"use server";

import { chatRespond, generateListingContent } from "@/lib/ai/service";
import { classifyProtocolAction } from "@/lib/ai/protocol-classifier";
import { getSuziResponse, resolveProtocolAction } from "@/lib/ai/suzi-assistant";
import type { SuziContext, SuziReply } from "@/lib/ai/suzi-assistant";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { GeneratedListingContent, ListingFacts } from "@/lib/types";
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
 * Runs the full Suzi protocol for a visitor message: the AI (when
 * OPENAI_API_KEY is set and has credit) classifies the message into one of
 * the fixed actions in lib/ai/protocol.ts, then `resolveProtocolAction`
 * deterministically turns that classification into a reply — the model
 * never generates the reply text itself. If the classifier is unavailable
 * or fails for any reason (no key, no credits, network error), this falls
 * back to the original deterministic keyword classifier, so the assistant
 * behaves identically either way. Runs server-side so OPENAI_API_KEY is
 * never sent to the browser.
 */
export async function suziReplyAction(message: string, context: SuziContext): Promise<SuziReply> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { text: "Tell me what you're looking for and I'll take it from there.", navigation: null };
  }
  const action = await classifyProtocolAction(trimmed, Boolean(context.listing));
  if (!action) return getSuziResponse(trimmed, context);
  return resolveProtocolAction(action, trimmed, context);
}

/** Same protocol as suziReplyAction, for the homepage demo chat panels — no listing/navigation UI there, just the reply text. */
export async function homeChatAction(message: string): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) return chatRespond(trimmed);
  const action = await classifyProtocolAction(trimmed, false);
  if (!action) return chatRespond(trimmed);
  return resolveProtocolAction(action, trimmed, { route: "/" }).text;
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
  return { ok: true };
}
