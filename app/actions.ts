"use server";

import {
  generateListingContent,
  normalizeCity,
  parseSearchQuery,
  rankListings,
} from "@/lib/ai/service";
import { getSuziResponse } from "@/lib/ai/suzi-assistant";
import type { SuziReply } from "@/lib/ai/suzi-assistant";
import {
  LISTING_GENERATION_SYSTEM,
  SEARCH_EXTRACTION_SYSTEM,
  listingContext,
  listingFactsContext,
  suziSystemPrompt,
} from "@/lib/ai/prompts";
import { isAiEnabled, runStructured, runText } from "@/lib/ai/provider";
import { getListings } from "@/lib/listings";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  GeneratedListingContent,
  Listing,
  ListingFacts,
  SearchMatch,
} from "@/lib/types";
import { PROPERTY_TYPES } from "@/lib/types";
import { z } from "zod";

/**
 * Server actions. In Supabase mode they persist; in mock mode they validate
 * and succeed so every flow remains demonstrable without configuration.
 *
 * The AI actions follow one shape throughout: compute the deterministic
 * result first, then try the model, and use whichever we got. A missing
 * key, a timeout, a refusal, or a malformed listing all land on the
 * deterministic answer — never on an error screen.
 */

/** How many past turns to replay. Enough for context, bounded for cost. */
const MAX_HISTORY_TURNS = 10;
/** Hard cap on the property context so an oversized listing can't run up tokens. */
const MAX_LISTING_CONTEXT_CHARS = 8_000;

export interface SuziTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AskSuziInput {
  message: string;
  /** Pathname the visitor is on — Suzi uses it as a hint about intent. */
  route: string;
  history?: SuziTurn[];
  /** The property in view, when there is one. */
  listing?: Listing | null;
}

export interface AskSuziResult extends SuziReply {
  /** Whether the text came from the model or the deterministic fallback. */
  source: "model" | "fallback";
}

const askSuziSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  route: z.string().max(200).default("/"),
});

/**
 * The single conversational entry point behind every Suzi surface — the
 * homepage hero, the floating avatar, and the per-property chat.
 */
export async function askSuzi(input: AskSuziInput): Promise<AskSuziResult> {
  const parsed = askSuziSchema.safeParse({
    message: input.message,
    route: input.route,
  });
  if (!parsed.success) {
    return {
      text: "Tell me what you're looking for and I'll take it from there.",
      navigation: null,
      source: "fallback",
    };
  }

  const { message, route } = parsed.data;
  const listing = input.listing ?? null;

  // Deterministic answer first: it is the fallback, and its navigation
  // intent is used on both paths so "sell my property" still routes the
  // visitor to /list-with-ai whether or not a model replied.
  let fallback: SuziReply;
  try {
    fallback = getSuziResponse(message, { route, listing });
  } catch {
    fallback = {
      text: "Tell me what you're looking for and I'll take it from there.",
      navigation: null,
    };
  }

  if (!isAiEnabled()) return { ...fallback, source: "fallback" };

  try {
    const history = (input.history ?? [])
      .slice(-MAX_HISTORY_TURNS)
      .filter((turn) => typeof turn?.content === "string" && turn.content.trim())
      .map((turn) => ({
        role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: turn.content.slice(0, 2000),
      }));

    const context = listing
      ? `${listingContext(listing).slice(0, MAX_LISTING_CONTEXT_CHARS)}\n\n`
      : "";

    const text = await runText({
      system: suziSystemPrompt({ route, hasListing: Boolean(listing) }),
      messages: [...history, { role: "user", content: `${context}${message}` }],
      effort: "low",
      maxTokens: 4_000,
    });

    if (!text) return { ...fallback, source: "fallback" };
    return { text, navigation: fallback.navigation, source: "model" };
  } catch (error) {
    console.error("[suzi:ask] falling back:", error);
    return { ...fallback, source: "fallback" };
  }
}

/* ------------------------------------------------------------------ */
/* Natural-language search                                             */
/* ------------------------------------------------------------------ */

const searchCriteriaSchema = z.object({
  city: z.string().nullable(),
  budget: z.number().nullable(),
  bedrooms: z.number().int().nullable(),
  wantsBeach: z.boolean(),
  mode: z.enum(["rent", "buy"]).nullable(),
  propertyType: z.enum(PROPERTY_TYPES).nullable(),
});

export interface SuziSearchResult {
  matches: SearchMatch[];
  source: "model" | "fallback";
}

/**
 * Free-text property search. The model does the understanding (query →
 * criteria); the deterministic scorer always does the ranking, so the
 * match percentages and reasons shown to the visitor stay inspectable and
 * stable. See `SearchCriteria` in `lib/ai/service.ts`.
 */
export async function askSuziSearch(query: string): Promise<SuziSearchResult> {
  const trimmed = typeof query === "string" ? query.trim().slice(0, 500) : "";
  if (!trimmed) return { matches: [], source: "fallback" };

  const [rentals, sales] = await Promise.all([getListings("rent"), getListings("buy")]);
  const listings = [...rentals, ...sales];

  if (isAiEnabled()) {
    try {
      const criteria = await runStructured({
        system: SEARCH_EXTRACTION_SYSTEM,
        messages: [{ role: "user", content: trimmed }],
        schema: searchCriteriaSchema,
        effort: "low",
        maxTokens: 4_000,
      });

      if (criteria) {
        return {
          matches: rankListings(
            {
              city: normalizeCity(criteria.city, listings),
              budget: criteria.budget && criteria.budget > 0 ? criteria.budget : null,
              bedrooms: criteria.bedrooms && criteria.bedrooms > 0 ? criteria.bedrooms : null,
              wantsBeach: criteria.wantsBeach,
              mode: criteria.mode,
              propertyType: criteria.propertyType,
            },
            listings,
          ),
          source: "model",
        };
      }
    } catch (error) {
      console.error("[suzi:search] falling back:", error);
    }
  }

  return { matches: rankListings(parseSearchQuery(trimmed), listings), source: "fallback" };
}

/* ------------------------------------------------------------------ */
/* Listing generation                                                  */
/* ------------------------------------------------------------------ */

const generatedContentSchema = z.object({
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  featureBullets: z.array(z.string()),
  lifestyleParagraph: z.string(),
  locationParagraph: z.string(),
  idealProfile: z.string(),
  priceExplanation: z.string(),
  ownerRulesSummary: z.string(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  agentKnowledgeBase: z.array(z.string()),
});

export async function generateListingAction(
  facts: ListingFacts,
): Promise<GeneratedListingContent> {
  // Always computed: it supplies the verification checklist and translation
  // map (both platform facts rather than written content), and it is the
  // whole result when no model is available.
  const template = await generateListingContent(facts);

  if (!isAiEnabled()) return template;

  try {
    const written = await runStructured({
      system: LISTING_GENERATION_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${listingFactsContext(facts)}\n\nWrite the listing.`,
        },
      ],
      schema: generatedContentSchema,
      effort: "medium",
    });

    if (!written) return template;

    return {
      ...template,
      ...written,
      title: written.title.trim() || template.title,
    };
  } catch (error) {
    console.error("[suzi:generate] falling back:", error);
    return template;
  }
}

/* ------------------------------------------------------------------ */
/* Forms                                                               */
/* ------------------------------------------------------------------ */

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
