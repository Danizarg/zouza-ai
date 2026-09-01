import { PROTOCOL_ACTION_IDS, type ProtocolActionId } from "@/lib/ai/protocol";
import type { Listing } from "@/lib/types";
import { formatPrice, totalMoveIn } from "@/lib/utils";
import OpenAI from "openai";

/**
 * Suzi's actual conversational brain — a real generative model call.
 *
 * Server-only. Do not import from a Client Component; it reads
 * OPENAI_API_KEY. All browser access goes through the server actions in
 * app/actions.ts.
 *
 * Unlike the pure classifier in protocol-classifier.ts (which only picks a
 * bucket), this generates Suzi's actual words. What keeps her on-brand and
 * out of legal trouble is not a fixed script but (a) a system prompt that
 * defines her scope and hard limits, and (b) grounding: real listing data
 * is injected into the prompt so she describes properties that actually
 * exist instead of inventing them.
 *
 * She still returns a `navigate` field so the UI can route the visitor —
 * generated prose and site navigation are not mutually exclusive.
 */

const MODEL = "gpt-5-nano";

/**
 * `gpt-5-nano` is a reasoning model: left at its default effort it spends
 * many seconds thinking before writing, which measured at 20s+ per reply
 * here — unusable for live chat. Conversation doesn't need deep reasoning,
 * so effort is pinned low. Combined with `maxRetries: 0` below (a retried
 * timeout just multiplies the wait; the first failure already means we
 * should fall back), this keeps replies inside a few seconds.
 */
const REASONING_EFFORT = "low";
const REQUEST_TIMEOUT_MS = 25_000;

/** Where each navigable action sends the visitor. Suzi picks the action; this file owns the destination. */
export const NAVIGATION_TARGETS: Partial<Record<ProtocolActionId, { href: string; label: string }>> = {
  navigate_rent: { href: "/explore", label: "Explore Homes" },
  navigate_buy: { href: "/ai-search", label: "Go to AI Search" },
  navigate_list_property: { href: "/list-with-ai", label: "Start listing with Suzi" },
  navigate_pricing: { href: "/pricing", label: "View pricing" },
  navigate_how_it_works: { href: "/how-it-works", label: "How it works" },
  navigate_contact: { href: "/contact", label: "Contact support" },
};

export interface SuziTurn {
  role: "user" | "assistant";
  content: string;
}

export interface SuziBrainResult {
  reply: string;
  action: ProtocolActionId;
}

let client: OpenAI | null | undefined;

function getClient(): OpenAI | null {
  if (client !== undefined) return client;
  client = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 })
    : null;
  return client;
}

/** Compact one-line summary of a listing for prompt grounding — enough to talk about, cheap in tokens. */
function describeListing(l: Listing): string {
  const price =
    l.mode === "rent"
      ? `${formatPrice(l.price_monthly ?? 0)}/month (${formatPrice(totalMoveIn(l))} total at move-in)`
      : `${formatPrice(l.price_sale ?? 0)} to buy`;
  const perks = [
    l.sea_view && "sea view",
    l.pool && "pool",
    l.garage && "garage",
    l.furnished && "furnished",
    l.pets_allowed && "pets allowed",
    l.new_build && "new build",
    l.distance_to_beach_min != null && `${l.distance_to_beach_min} min to beach`,
  ]
    .filter(Boolean)
    .join(", ");
  return `- "${l.title}" (/property/${l.slug}) — ${l.property_type} in ${l.address_area}, ${l.city}. ${l.bedrooms} bed, ${l.bathrooms} bath, ${l.size_m2} m². ${price}.${perks ? ` Features: ${perks}.` : ""}${l.verified_owner ? " Owner verified." : ""}`;
}

/** Full detail for the one property the visitor is actually looking at. */
function describeListingInDetail(l: Listing): string {
  const lines = [
    `Title: ${l.title}`,
    `Location: ${l.address_area}, ${l.city}, ${l.country}`,
    `Type: ${l.property_type}, ${l.bedrooms} bed, ${l.bathrooms} bath, ${l.size_m2} m²${l.floor != null ? `, floor ${l.floor}` : ""}`,
    l.mode === "rent"
      ? `Rent: ${formatPrice(l.price_monthly ?? 0)}/month. Utilities est. ${l.utilities_monthly ? formatPrice(l.utilities_monthly) : "not listed"}. Deposit ${l.deposit ? formatPrice(l.deposit) : "not listed"}. Platform fee ${l.platform_fee_percent ?? 0}%. Total at move-in: ${formatPrice(totalMoveIn(l))}.`
      : `Asking price: ${formatPrice(l.price_sale ?? 0)}, direct from owner, no agency commission.`,
    `Available from: ${l.available_from || "immediately"}`,
    `Pets allowed: ${l.pets_allowed ? "yes" : "no"}`,
    `Pool: ${l.pool ? "yes" : "no"} · Sea view: ${l.sea_view ? "yes" : "no"} · Garage: ${l.garage ? "yes" : "no"} · Furnished: ${l.furnished ? "yes" : "no"}`,
    l.distance_to_beach_min != null ? `Distance to beach: ${l.distance_to_beach_min} minutes` : null,
    l.community_fees_monthly != null
      ? `Community fees: ${formatPrice(l.community_fees_monthly)}/month`
      : "Community fees: none listed",
    l.taxes_note ? `Taxes note: ${l.taxes_note}` : null,
    `Verification: owner ${l.verified_owner ? "verified" : "not yet verified"}, property ${l.verified_property ? "verified" : "not yet verified"}`,
    l.owner_rules ? `Owner's house rules: ${l.owner_rules}` : null,
    l.features.length ? `Features: ${l.features.join(", ")}` : null,
    `Description: ${l.description}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function buildSystemPrompt(route: string, listing: Listing | null, listings: Listing[]): string {
  const base = `You are Suzi, the AI real estate partner for Zouza — a property platform for Spain. You are talking to a visitor on the website.

WHO YOU ARE
You are warm, direct and genuinely useful. You know Spanish property well. You talk like a sharp human colleague, not a chatbot: no corporate filler, no "I'd be happy to assist you with that", no bullet-point walls. Keep replies to 2-4 sentences unless the visitor clearly wants depth. Ask one good follow-up question when it would actually help you help them.

WHAT ZOUZA IS
Zouza connects property owners directly with renters and buyers in Spain. Owners list their property by talking to you — you write the listing from their photos and a few facts. Renters and buyers describe what they want in plain language instead of using filter forms. Every listing shows total costs up front, with no hidden fees. Zouza is a pure intermediary: it introduces people, nothing more.

HARD RULES — these are not stylistic, do not break them
1. Never give legal, tax, or financial advice, and never predict or guarantee investment returns, property values, or rental yields. If asked whether something is a good investment, whether prices will rise, or what the tax implications are, say plainly that you can't advise on that and suggest they speak to a qualified professional. You may still state factual listed figures (a price, a fee, a yield the owner has published).
2. Only ever describe properties from the list given to you below. Never invent a property, a price, an address, or a feature. If you don't have something, say you don't have it and offer to help them search.
3. Zouza never handles money: no payments, deposits, escrow, rent collection, or rent guarantees. Don't imply otherwise.
4. Don't promise anything on an owner's behalf (viewings, discounts, availability) beyond what the listing data states.
5. Stay on real estate and Zouza. If someone asks about something unrelated, redirect warmly in one line.

NAVIGATION — read this carefully, getting it wrong ruins the experience
Alongside your reply you pick one action. A navigate_* action physically moves the visitor to a different page a second after they read your message. That is jarring if they were just asking you a question, so **general_chat is your default**. Only choose a navigate_* action when the visitor is actually asking to go somewhere or to start a task — not when you have just answered them.

Use general_chat when:
- You answered their question (even if the answer mentions properties)
- You asked them a follow-up question
- They're browsing, chatting, greeting, or exploring options with you
- You told them you don't have something
- You're mid-conversation in any way

Use a navigate_* action only when they clearly want to move:
- navigate_rent: explicitly wants to browse/search rentals ("show me the rental search", "take me to rentals")
- navigate_buy: explicitly wants to browse/search homes for sale
- navigate_list_property: they own a property and want to start listing it
- navigate_pricing: they want to see Zouza's fees page
- navigate_how_it_works: they want the explainer page
- navigate_contact: they want to reach a human

Two special actions, neither of which navigates:
- refuse_advice: use this whenever you decline to give legal, tax or financial advice, or decline to predict prices/values/yields or guarantee an outcome. Use it even if you also offer something helpful afterwards.
- answer_property_question: the visitor asked about the specific property in view.

If you're unsure, choose general_chat. Never describe the action itself in your reply text; if you are sending them somewhere, just say so naturally ("I'll take you to the search page").`;

  const context: string[] = [`\n\nCURRENT PAGE: ${route}`];

  if (listing) {
    context.push(
      `\nTHE VISITOR IS LOOKING AT THIS PROPERTY. Answer questions about it from this data only:\n${describeListingInDetail(listing)}`,
    );
  }

  if (listings.length > 0) {
    context.push(
      `\nPROPERTIES CURRENTLY ON ZOUZA (the only ones you may reference — if you mention one, include its /property/... link):\n${listings.map(describeListing).join("\n")}`,
    );
  }

  return base + context.join("\n");
}

/**
 * Generates Suzi's reply. Returns `null` on any failure so callers fall back
 * to the deterministic path — the product never breaks because the model is
 * unavailable.
 */
export async function generateSuziReply(
  message: string,
  opts: {
    route: string;
    listing?: Listing | null;
    listings?: Listing[];
    history?: SuziTurn[];
  },
): Promise<SuziBrainResult | null> {
  const openai = getClient();
  if (!openai) return null;

  const { route, listing = null, listings = [], history = [] } = opts;

  try {
    const response = await openai.chat.completions.create(
      {
        model: MODEL,
        reasoning_effort: REASONING_EFFORT,
        messages: [
          { role: "system", content: buildSystemPrompt(route, listing, listings) },
          // Last few turns only — enough for continuity, bounded for cost.
          ...history.slice(-8).map((t) => ({ role: t.role, content: t.content })),
          { role: "user", content: message },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "suzi_reply",
            strict: true,
            schema: {
              type: "object",
              properties: {
                reply: {
                  type: "string",
                  description: "What Suzi says to the visitor. Natural, warm, 2-4 sentences.",
                },
                action: { type: "string", enum: [...PROTOCOL_ACTION_IDS] },
              },
              required: ["reply", "action"],
              additionalProperties: false,
            },
          },
        },
      },
      { timeout: REQUEST_TIMEOUT_MS },
    );

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") return null;

    const parsed = JSON.parse(content) as { reply?: unknown; action?: unknown };
    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) return null;

    const action = PROTOCOL_ACTION_IDS.includes(parsed.action as ProtocolActionId)
      ? (parsed.action as ProtocolActionId)
      : "general_chat";

    // A property answer only makes sense with a property in view; anything
    // else would leave the UI with an action it can't act on.
    const safeAction = action === "answer_property_question" && !listing ? "general_chat" : action;

    return { reply: parsed.reply.trim(), action: safeAction };
  } catch (err) {
    console.error("[ai/suzi-brain] generation failed, falling back:", err);
    return null;
  }
}
