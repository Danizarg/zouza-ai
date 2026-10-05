import type { Listing, SearchMatch } from "@/lib/types";
import { formatPrice, totalMoveIn } from "@/lib/utils";
import OpenAI from "openai";

/**
 * AI-driven property search. Server-only — reads OPENAI_API_KEY; call it
 * through the server action in app/actions.ts, never from a Client Component.
 *
 * The model reads the visitor's free-text query against the real catalogue
 * and returns which listings match, how well, and *why* — in its own words.
 * It never invents a property: it may only return IDs from the list it was
 * given, and anything it returns that isn't a real ID is dropped before the
 * result reaches the UI.
 */

/** Non-reasoning model, same rationale and benchmark as suzi-brain.ts — see the note there. */
const MODEL = "gpt-4.1-nano";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RESULTS = 6;

let client: OpenAI | null | undefined;

function getClient(): OpenAI | null {
  if (client !== undefined) return client;
  client = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 })
    : null;
  return client;
}

/** Compact, ID-first description so the model can cite listings unambiguously. */
function describeForSearch(l: Listing): string {
  const price =
    l.mode === "rent"
      ? `${formatPrice(l.price_monthly ?? 0)}/month, ${formatPrice(totalMoveIn(l))} total at move-in`
      : `${formatPrice(l.price_sale ?? 0)} to buy`;
  const perks = [
    l.sea_view && "sea view",
    l.pool && "pool",
    l.garage && "garage",
    l.furnished && "furnished",
    l.pets_allowed && "pets allowed",
    l.new_build && "new build",
    l.distance_to_beach_min != null && `${l.distance_to_beach_min} min to beach`,
    l.verified_owner && "owner verified",
  ]
    .filter(Boolean)
    .join(", ");
  return `id=${l.id} | ${l.title} | ${l.property_type} in ${l.address_area}, ${l.city} | ${l.bedrooms} bed, ${l.bathrooms} bath, ${l.size_m2} m² | ${l.mode === "rent" ? "for rent" : "for sale"} | ${price}${perks ? ` | ${perks}` : ""}`;
}

const SYSTEM_PROMPT = `You are Suzi, Zouza's property search for Spain. You are given a catalogue of properties and a visitor's description of what they want. Return the best 1-${MAX_RESULTS} matches, ranked best first.

ALWAYS RETURN MATCHES. Even a rough fit is useful — return the closest properties you have and be honest in the reason about what doesn't line up. Only return an empty list if the visitor asked for a city that is not in the catalogue at all.

Budget is a preference, not a cutoff: something over budget is still worth returning, just say so. A different city or the wrong rent/sale type is a real mismatch — rank those lower or leave them out if you have better options.

Read intent, not just keywords: "characterful" or "old town" means historic areas and older properties; "for the family" means bedrooms; "remote work" means space and quiet.

For each match give:
- id: copied exactly from the catalogue
- match_percent: 55-100, honest. 90+ only if it meets nearly everything.
- reason: one or two sentences, written to the visitor, naming the concrete details that make it fit and anything that doesn't ("three bedrooms and seven minutes from the beach, though it's €1,450 rather than under €1,200"). Never mention a price or feature that isn't in the catalogue data.

Never give legal, tax or financial advice, and never predict prices or promise investment returns.`;

/**
 * Returns ranked matches, or `null` on any failure so callers fall back to
 * the deterministic scorer in lib/ai/service.ts.
 */
export async function aiSearchListings(
  query: string,
  listings: Listing[],
): Promise<SearchMatch[] | null> {
  const openai = getClient();
  if (!openai || listings.length === 0) return null;

  try {
    const response = await openai.chat.completions.create(
      {
        model: MODEL,
        max_tokens: 1200,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          // Catalogue as reference data in its own system message, so the
          // user turn contains only the visitor's words — a small model
          // otherwise blurs the two and treats the catalogue as part of
          // the request.
          {
            role: "system",
            content: `CATALOGUE — the only properties that exist:\n${listings.map(describeForSearch).join("\n")}`,
          },
          { role: "user", content: query },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "search_results",
            strict: true,
            schema: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", description: "The listing's exact id from the list" },
                      match_percent: { type: "integer" },
                      reason: { type: "string" },
                    },
                    required: ["id", "match_percent", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["matches"],
              additionalProperties: false,
            },
          },
        },
      },
      { timeout: REQUEST_TIMEOUT_MS },
    );

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") return null;

    const parsed = JSON.parse(content) as {
      matches?: { id?: unknown; match_percent?: unknown; reason?: unknown }[];
    };
    if (!Array.isArray(parsed.matches)) return null;

    const byId = new Map(listings.map((l) => [l.id, l]));
    const seen = new Set<string>();
    const results: SearchMatch[] = [];

    for (const m of parsed.matches) {
      if (typeof m.id !== "string") continue;
      const listing = byId.get(m.id);
      // Drop anything that isn't a real listing — the model cannot
      // surface a property that doesn't exist, even if it hallucinates one.
      if (!listing || seen.has(m.id)) continue;
      seen.add(m.id);

      const pct = typeof m.match_percent === "number" ? Math.round(m.match_percent) : 70;
      results.push({
        listing,
        match_reason: typeof m.reason === "string" && m.reason.trim() ? m.reason.trim() : "A good fit for your search.",
        match_percent: Math.max(55, Math.min(100, pct)),
        reasons: [],
      });
      if (results.length >= MAX_RESULTS) break;
    }

    return results;
  } catch (err) {
    console.error("[ai/suzi-search] search failed, falling back to deterministic scoring:", err);
    return null;
  }
}
