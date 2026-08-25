import { MOCK_AI_CHAT_EXAMPLES } from "@/lib/mock-data";
import type {
  GeneratedListingContent,
  Listing,
  ListingMode,
  ListingFacts,
  PropertyType,
  SearchMatch,
  SearchMatchReason,
  TranslationLanguage,
} from "@/lib/types";
import { PROPERTY_TYPES, TRANSLATION_LANGUAGES } from "@/lib/types";
import { formatPrice, totalMoveIn } from "@/lib/utils";

/**
 * Deterministic AI layer — CLIENT-SAFE.
 *
 * Everything in this module runs offline with no key and no network. It is
 * both the zero-configuration demo experience and the permanent fallback
 * behind the real model: the server actions in `app/actions.ts` try
 * `lib/ai/provider.ts` first and land here whenever a key is missing, a
 * request fails, or the model declines.
 *
 * Do NOT import the Anthropic SDK (or anything server-only) here — client
 * components import this module directly.
 */

/**
 * Whether a real model is configured. Mirrors `isAiEnabled()` in
 * `lib/ai/provider.ts`, which is server-only; this exists so client-safe
 * callers can ask the same question. Anthropic is the only implemented
 * provider, so an OpenAI key alone does not enable anything.
 */
export function hasAiProvider(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Template exposé built purely from the owner's facts — the generation fallback. */
export async function generateListingContent(
  facts: ListingFacts,
): Promise<GeneratedListingContent> {
  return mockGenerate(facts);
}

/* ------------------------------------------------------------------ */
/* Deterministic mock generation                                       */
/* ------------------------------------------------------------------ */

const TYPE_LABEL: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  townhouse: "Townhouse",
  penthouse: "Penthouse",
  finca: "Finca",
  studio: "Studio",
};

function mockGenerate(facts: ListingFacts): GeneratedListingContent {
  const forRent = facts.intent === "rent_out";
  const typeLabel = TYPE_LABEL[facts.property_type] ?? "Home";
  const highlights: string[] = [];
  if (facts.sea_view) highlights.push("Sea Views");
  if (facts.pool) highlights.push("Pool");
  if (facts.garage) highlights.push("Private Garage");
  if (facts.furnished) highlights.push("Fully Furnished");

  const amenityHighlight = [facts.sea_view && "Sea Views", facts.pool && "Pool", facts.garage && "Private Garage"].find(
    (h): h is string => Boolean(h),
  );
  const title =
    facts.title.trim() ||
    `${facts.furnished ? "Furnished " : ""}${facts.bedrooms}-Bedroom ${typeLabel}${
      amenityHighlight ? ` with ${amenityHighlight}` : ""
    } in ${facts.city}`;

  const featureBullets = [
    `${facts.bedrooms} bedroom${facts.bedrooms === 1 ? "" : "s"}, ${facts.bathrooms} bathroom${facts.bathrooms === 1 ? "" : "s"}`,
    `${facts.size_m2} m² of living space`,
    facts.furnished ? "Fully furnished and move-in ready" : "Unfurnished — ready to make your own",
    facts.pool ? "Private pool area" : null,
    facts.sea_view ? "Open sea views" : null,
    facts.garage ? "Garage / secure parking" : "Street parking nearby",
    facts.pets_allowed ? "Pets welcome" : null,
    facts.floor !== null ? `Floor ${facts.floor}` : null,
  ].filter((x): x is string => Boolean(x));

  const lifestyleParagraph = `Mornings here start slowly — coffee ${
    facts.sea_view ? "with the sea on the horizon" : "on a quiet terrace"
  }, a short walk for fresh bread, and the kind of light that only ${
    facts.city
  } delivers. The ${typeLabel.toLowerCase()} is laid out for everyday ease: ${
    facts.furnished
      ? "arrive with a suitcase and start living"
      : "a clean canvas for your own style"
  }, with ${facts.bedrooms > 2 ? "room for family and guests" : "a footprint that is easy to keep and easy to love"}.`;

  const locationParagraph = `${facts.address_area}, ${facts.city} combines residential calm with genuine convenience: supermarkets, cafés and pharmacies within walking distance, and quick connections to the wider ${facts.country === "Spain" ? "Costa" : "region"}. ${
    facts.sea_view || facts.pool
      ? "Beaches and the seafront promenade are minutes away."
      : "Parks, schools and daily services are all close by."
  }`;

  const description = [
    `This ${facts.size_m2} m² ${typeLabel.toLowerCase()} in ${facts.address_area}, ${facts.city} offers ${facts.bedrooms} bedroom${facts.bedrooms === 1 ? "" : "s"} and ${facts.bathrooms} bathroom${facts.bathrooms === 1 ? "" : "s"}${highlights.length ? `, plus ${highlights.map((h) => h.toLowerCase()).join(", ")}` : ""}.`,
    lifestyleParagraph,
    locationParagraph,
    forRent
      ? `Offered ${facts.furnished ? "furnished" : "unfurnished"} from ${facts.available_from || "now"}. All costs are listed transparently — rent, utilities estimate, deposit and platform fee — so you know the total before you enquire.`
      : `Offered for sale directly by the owner with full price transparency and a verification trail, so buyers can move forward with confidence.`,
  ].join("\n\n");

  const priceExplanation = forRent
    ? `Monthly rent is ${formatPrice(facts.price)}${
        facts.utilities_monthly
          ? `, with utilities estimated at ${formatPrice(facts.utilities_monthly)}/month`
          : ""
      }. The deposit is ${formatPrice(facts.deposit ?? facts.price)} and the platform fee estimate is ${facts.platform_fee_percent}% of one month. Total due at move-in: ${formatPrice(
        totalMoveIn({
          price_monthly: facts.price,
          utilities_monthly: facts.utilities_monthly,
          deposit: facts.deposit ?? facts.price,
          platform_fee_percent: facts.platform_fee_percent,
        }),
      )}. No hidden costs.`
    : `The asking price is ${formatPrice(facts.price)}. Purchase taxes and notary fees vary by region and buyer situation — Zouza shows an indicative placeholder and always recommends independent advice. There is no agency commission built into this price.`;

  const ownerRulesSummary = facts.owner_rules.trim()
    ? `House rules set by the owner: ${facts.owner_rules.trim()}`
    : `The owner has not set special house rules. Standard respectful use applies${facts.pets_allowed ? "; pets are welcome" : "; pets on request"}.`;

  const faq = [
    {
      question: forRent ? "Is the property still available?" : "Is the property still for sale?",
      answer: `Yes — this listing is live. ${forRent && facts.available_from ? `Available from ${facts.available_from}.` : "You can request a viewing directly on this page."}`,
    },
    {
      question: "Are pets allowed?",
      answer: facts.pets_allowed
        ? "Yes, pets are welcome. Please mention your pet in your first message."
        : "Pets are not accepted by default, but you can ask the owner about your specific situation.",
    },
    {
      question: forRent ? "What is included in the price?" : "What is included in the sale?",
      answer: forRent
        ? `The rent covers the property itself${facts.furnished ? ", furnished as shown" : ""}. Utilities are ${facts.utilities_monthly ? `estimated separately at ${formatPrice(facts.utilities_monthly)}/month` : "paid separately by the tenant"}.`
        : `The sale includes the property as shown${facts.furnished ? ", with furniture negotiable" : ""}. Fixtures and fittings are listed in the exposé.`,
    },
    {
      question: "When can I visit?",
      answer: "Use the “Request viewing” button to propose a date — the owner confirms directly, usually within a day.",
    },
    {
      question: "Is there parking?",
      answer: facts.garage
        ? "Yes — the property includes a garage / secure parking space."
        : "There is no private garage, but street parking is available nearby.",
    },
    {
      question: "Is it suitable for remote work?",
      answer: `${facts.bedrooms > 1 ? "Yes — a spare room works well as a home office, and" : "Yes —"} fibre internet is available in this area.`,
    },
  ];

  const agentKnowledgeBase = [
    `Property: ${title}`,
    `Type: ${typeLabel}, ${facts.bedrooms} bed / ${facts.bathrooms} bath, ${facts.size_m2} m²${facts.floor !== null ? `, floor ${facts.floor}` : ""}`,
    `Location: ${facts.address_area}, ${facts.city}, ${facts.country}`,
    `Amenities: ${[facts.pool && "pool", facts.sea_view && "sea view", facts.garage && "garage", facts.furnished && "furnished", facts.pets_allowed && "pets allowed"].filter(Boolean).join(", ") || "standard"}`,
    forRent
      ? `Pricing: ${formatPrice(facts.price)}/month, utilities ~${formatPrice(facts.utilities_monthly ?? 0)}, deposit ${formatPrice(facts.deposit ?? facts.price)}, platform fee ${facts.platform_fee_percent}%`
      : `Pricing: asking ${formatPrice(facts.price)}, direct from owner`,
    `Availability: ${facts.available_from || "immediately"}`,
    `Owner rules: ${facts.owner_rules || "none specified"}`,
    `Notes: ${facts.notes || "—"}`,
  ];

  return {
    title,
    summary: `${typeLabel} · ${facts.bedrooms} bed · ${facts.bathrooms} bath · ${facts.size_m2} m² · ${facts.address_area}, ${facts.city}${highlights.length ? ` · ${highlights.join(" · ")}` : ""}`,
    description,
    featureBullets,
    lifestyleParagraph,
    locationParagraph,
    idealProfile: forRent
      ? `Ideal for ${facts.bedrooms > 2 ? "a family or sharers" : facts.bedrooms === 2 ? "a couple or remote-working professional" : "a single professional or couple"} looking for ${facts.furnished ? "a move-in-ready home" : "a long-term base"} in ${facts.city}${facts.pets_allowed ? ", pet owners welcome" : ""}.`
      : `Ideal for buyers seeking ${facts.sea_view ? "a sea-view" : "a well-located"} ${typeLabel.toLowerCase()} in ${facts.city} — as a primary home, holiday base or rental investment.`,
    priceExplanation,
    ownerRulesSummary,
    verificationChecklist: [
      "Owner identity check",
      "Proof of ownership or listing authorisation",
      "Address and cadastral cross-check",
      "Photo authenticity review",
      "Optional video walkthrough",
    ],
    faq,
    agentKnowledgeBase,
    translations: Object.fromEntries(
      TRANSLATION_LANGUAGES.map((lang) => [lang, lang === "English" ? "ready" : "pending"]),
    ) as Record<TranslationLanguage, "ready" | "pending">,
  };
}

/* ------------------------------------------------------------------ */
/* Per-listing AI property agent (mock)                                */
/* ------------------------------------------------------------------ */

/**
 * Answers a visitor question from listing data. Pure keyword routing over
 * structured fields — deterministic, safe, and easy to replace with a real
 * model call that receives the same listing as context.
 */
export function answerAgentQuestion(listing: Listing, question: string): string {
  const q = question.toLowerCase();
  const rentMode = listing.mode === "rent";

  if (/(available|still|free|vacan)/.test(q)) {
    return rentMode
      ? `Yes, this home is still available${listing.available_from ? ` from ${listing.available_from}` : ""}. You can send the owner a message or request a viewing right from this page.`
      : "Yes, this property is still for sale. You can contact the owner or request a viewing directly from this page.";
  }
  if (/(dog|cat|pet|animal)/.test(q)) {
    return listing.pets_allowed
      ? "Good news — pets are allowed here. Just mention your pet when you contact the owner."
      : "Pets are not accepted by default for this property, but you can ask the owner about your specific situation.";
  }
  if (/(community fee|hoa|service charge)/.test(q)) {
    return listing.community_fees_monthly
      ? `Yes. The current listed community fee is ${formatPrice(listing.community_fees_monthly)}/month. I can also show what's included and help you compare total monthly costs.`
      : "This property doesn't have community fees — it's a standalone home with no shared building costs.";
  }
  if (/(tax|ibi|notary)/.test(q)) {
    return listing.taxes_note
      ? listing.taxes_note
      : "Utilities and platform fees are shown in the price breakdown above; for purchase taxes, always confirm with an independent notary.";
  }
  if (/(includ|price|cost|fee|total|how much|utilities|deposit)/.test(q)) {
    if (rentMode) {
      const total = totalMoveIn(listing);
      return `The monthly rent is ${formatPrice(listing.price_monthly ?? 0)}${listing.utilities_monthly ? `, plus roughly ${formatPrice(listing.utilities_monthly)} in utilities` : ""}. The deposit is ${formatPrice(listing.deposit ?? 0)} and the platform fee estimate is ${listing.platform_fee_percent ?? 0}%. Total due at move-in: ${formatPrice(total)} — no hidden costs.`;
    }
    return `The asking price is ${formatPrice(listing.price_sale ?? 0)}, direct from the owner with no agency commission on top. Purchase taxes and notary fees depend on the region and your situation.`;
  }
  if (/(book|schedule).*(viewing|visit|tour)/.test(q) || /(visit|viewing|see it|tour|appointment|when can i)/.test(q)) {
    return "Yes. I can help request a viewing. The owner currently has slots available Thursday afternoon and Saturday morning — use the “Request viewing” button and I'll pass your preferred time along.";
  }
  if (/(garage|park)/.test(q)) {
    return listing.garage
      ? "Yes — the property includes a garage / secure parking space."
      : "There is no private garage, but street parking is generally available in this area.";
  }
  if (/(remote|work|office|wifi|internet|fibre|fiber)/.test(q)) {
    return `${listing.bedrooms > 1 ? "Yes — one of the bedrooms works well as a home office, and fibre" : "Fibre"} internet is available in ${listing.city}. Many residents in ${listing.address_area} work remotely.`;
  }
  if (/(beach|sea|coast|swim)/.test(q)) {
    if (listing.distance_to_beach_min) {
      return `The property is approximately ${listing.distance_to_beach_min} minutes ${listing.distance_to_beach_min <= 12 ? "walking" : "driving"} distance from the beach, based on the location data provided by the owner.`;
    }
    return listing.sea_view
      ? `The home has open sea views, and the beach is a short walk or drive from ${listing.address_area}.`
      : `The nearest beaches are a short drive from ${listing.address_area} — ${listing.city} has good coastal access.`;
  }
  if (/(furnish|furniture)/.test(q)) {
    return listing.furnished
      ? "The property comes fully furnished — you can move in with just your suitcases."
      : "The property is offered unfurnished, so you can furnish it to your own taste.";
  }
  if (/(pool)/.test(q)) {
    return listing.pool
      ? "Yes, there is a pool — one of the highlights of this property."
      : "There is no private pool at this property.";
  }
  if (/(verif|scam|real|trust|fake)/.test(q)) {
    return `${listing.verified_owner ? "The owner's identity has been verified by Zouza" : "Owner verification is in progress"}${listing.verified_property ? ", and the property itself has passed our verification checks" : ""}${listing.last_verified_at ? ` (last checked ${listing.last_verified_at.slice(0, 10)})` : ""}. You can also report anything that looks off.`;
  }
  if (/(rule|smok|party|guest)/.test(q)) {
    return listing.owner_rules
      ? `The owner's house rules: ${listing.owner_rules}`
      : "The owner has not set special house rules — standard respectful use applies.";
  }
  return `I can answer anything about this ${listing.property_type} in ${listing.city} — availability, pricing and total move-in cost, pets, parking, viewings, the neighbourhood or house rules. What would you like to know?`;
}

export const SUGGESTED_AGENT_QUESTIONS = [
  "Is the property still available?",
  "Are dogs allowed?",
  "What is included in the price?",
  "Are there community fees?",
  "When can I visit?",
  "Is there a garage?",
  "Is it suitable for remote work?",
  "How far is it from the beach?",
];

/* ------------------------------------------------------------------ */
/* Homepage AI panel (mock)                                            */
/* ------------------------------------------------------------------ */

/**
 * Deterministic reply for the homepage "what would you like to do today?"
 * panel. Matches against a small canned set by keyword overlap; falls back
 * to a generic but useful reply. Swap for a real model call — same
 * signature — once a provider is connected.
 */
// Common connective words that appear across nearly every example prompt
// ("I want to...", "I need...", "help me...") — excluding them stops
// unrelated prompts from tying on filler words alone.
const CHAT_STOPWORDS = new Set([
  "want", "need", "help", "find", "with", "from", "have", "this", "that",
  "will", "are", "the", "for", "and", "your", "you're",
]);

function meaningfulWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9€]+/)
    .filter((w) => w.length > 2 && !CHAT_STOPWORDS.has(w));
}

export function chatRespond(message: string): string {
  const words = new Set(meaningfulWords(message));

  let best: { reply: string; score: number } | null = null;
  for (const example of MOCK_AI_CHAT_EXAMPLES) {
    const exampleWords = meaningfulWords(example.prompt);
    const score = exampleWords.filter((w) => words.has(w)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { reply: example.reply, score };
    }
  }
  if (best) return best.reply;

  if (/rent/.test(message.toLowerCase())) {
    return "I can help you rent or list a rental — tell me the city and budget, or upload photos if you're the owner, and I'll take it from there.";
  }
  if (/(buy|sell|invest)/.test(message.toLowerCase())) {
    return "Tell me the location and budget you have in mind, or upload photos if you're selling, and I'll match or draft accordingly.";
  }
  return "Tell me what you're trying to do — buy, rent, sell, list a property, or find an investment — and I'll take it from there.";
}

/* ------------------------------------------------------------------ */
/* Natural-language search (mock)                                      */
/* ------------------------------------------------------------------ */

const CITY_ALIASES: Record<string, string[]> = {
  Marbella: ["marbella", "golden mile", "costa del sol"],
  Valencia: ["valencia", "el cabanyal"],
  Jávea: ["javea", "jávea", "costa blanca"],
  Barcelona: ["barcelona", "eixample", "sitges"],
  Sitges: ["sitges"],
  Málaga: ["malaga", "málaga", "soho"],
  Dénia: ["denia", "dénia"],
  Granada: ["granada", "albaicin", "albaicín"],
  Sóller: ["soller", "sóller", "mallorca"],
  Alicante: ["alicante", "san juan"],
  Seville: ["seville", "sevilla", "triana"],
  "Palma de Mallorca": ["palma", "mallorca"],
};

function deaccent(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Resolves a city name from any source onto the exact `listing.city`
 * spelling the inventory uses, so ranking's exact-match comparison works
 * for "Javea", "jávea" and "Costa Blanca" alike. Returns null when nothing
 * in the inventory matches — a city Zouza has no homes in should not
 * silently rank as if it did.
 */
export function normalizeCity(
  name: string | null | undefined,
  listings: Listing[],
): string | null {
  if (!name) return null;
  const wanted = deaccent(name);
  if (!wanted) return null;

  const cities = Array.from(new Set(listings.map((l) => l.city)));
  const direct = cities.find((city) => deaccent(city) === wanted);
  if (direct) return direct;

  const aliased = Object.entries(CITY_ALIASES).find(([, aliases]) =>
    aliases.some((alias) => deaccent(alias) === wanted),
  )?.[0];
  if (!aliased) return null;

  return cities.find((city) => deaccent(city) === deaccent(aliased)) ?? null;
}

/**
 * What a search query actually asked for. Understanding (free text →
 * criteria) and ranking (criteria → matches) are separate on purpose: a
 * real model is far better than regexes at the first half, and far worse
 * than explicit scoring at the second, where the user is shown *why* each
 * result matched. `askSuziSearch` in `app/actions.ts` swaps only the
 * understanding half; the ranking below is always the same code.
 */
export interface SearchCriteria {
  city: string | null;
  /** Euros — monthly for rentals, total for sales. */
  budget: number | null;
  /** Minimum bedrooms required. */
  bedrooms: number | null;
  wantsBeach: boolean;
  mode: ListingMode | null;
  propertyType: PropertyType | null;
}

export const EMPTY_SEARCH_CRITERIA: SearchCriteria = {
  city: null,
  budget: null,
  bedrooms: null,
  wantsBeach: false,
  mode: null,
  propertyType: null,
};

/** Deterministic query understanding — the fallback when no model is available. */
export function parseSearchQuery(query: string): SearchCriteria {
  const q = query.toLowerCase();
  // Require an explicit k/m/million suffix OR a € sign — otherwise a plain
  // number (e.g. "3 bedrooms") would be misread as a budget.
  const unitMatch = q.match(/(\d[\d.,]*)\s*(k|m|million)\b/);
  const euroMatch = q.match(/€\s*(\d[\d.,]*)/);
  const budgetMatch = unitMatch ?? euroMatch;
  let budget: number | null = null;
  if (budgetMatch) {
    const unit = unitMatch ? unitMatch[2] : undefined;
    // With a k/m/million suffix, "." is a real decimal point (e.g. "1.2m");
    // without one, both "." and "," are thousands separators (e.g. "900,000").
    const raw = unit
      ? parseFloat(budgetMatch[1].replace(/,/g, ""))
      : Number(budgetMatch[1].replace(/[.,]/g, ""));
    budget = unit === "m" || unit === "million" ? raw * 1_000_000 : unit === "k" ? raw * 1_000 : raw;
    if (budget < 1000) budget = null; // too small to be a real budget mention
  }
  const bedroomsMatch = q.match(/(\d+)\s*[- ]?bed/);
  const wantBedrooms = bedroomsMatch ? Number(bedroomsMatch[1]) : null;
  const wantsBeach = /(beach|sea|coast)/.test(q);
  const wantsBuy = /(buy|purchase|invest)/.test(q);
  const wantsRent = /(rent|renting)/.test(q);
  const wantedCity = Object.entries(CITY_ALIASES).find(([, aliases]) => aliases.some((a) => q.includes(a)))?.[0];
  const wantedType = PROPERTY_TYPES.find((type) => q.includes(type)) ?? null;

  return {
    city: wantedCity ?? null,
    budget,
    bedrooms: wantBedrooms,
    wantsBeach,
    // A query mentioning both ("rent-to-buy") is treated as neither rather
    // than scoring both modes, which would flatten the ranking.
    mode: wantsBuy === wantsRent ? null : wantsBuy ? "buy" : "rent",
    propertyType: wantedType,
  };
}

/**
 * Ranks listings against criteria and explains each match. Deterministic
 * by design — the visitor is shown a match percentage and the reasons
 * behind it, so the scoring has to be inspectable, stable, and identical
 * whether the criteria came from a model or from `parseSearchQuery`.
 */
export function rankListings(criteria: SearchCriteria, listings: Listing[]): SearchMatch[] {
  const { budget, wantsBeach } = criteria;
  const wantedCity = criteria.city;
  const wantBedrooms = criteria.bedrooms;
  const wantedType = criteria.propertyType;
  const wantsBuy = criteria.mode === "buy";
  const wantsRent = criteria.mode === "rent";

  // Someone asking to buy should never be shown a rental, however well it
  // scores on the other criteria — a €1,450/month flat "fits" a €1.2M
  // purchase budget arithmetically, and that is exactly the kind of result
  // that makes a search feel broken.
  const candidates = criteria.mode
    ? listings.filter((listing) => listing.mode === criteria.mode)
    : listings;

  // Relative to what the query actually asked for, so "no budget mentioned"
  // doesn't silently cap every match's percentage.
  const maxPossibleScore =
    (wantedCity ? 4 : 0) +
    (wantBedrooms ? 3 : 0) +
    (wantedType ? 3 : 0) +
    (wantsBeach ? 2 : 0) +
    (wantsBuy || wantsRent ? 2 : 0) +
    (budget ? 2 : 0);

  const scored = candidates.map((listing) => {
    let score = 0;
    const proseReasons: string[] = [];
    const reasons: SearchMatchReason[] = [];
    const price = listing.mode === "rent" ? (listing.price_monthly ?? 0) : (listing.price_sale ?? 0);

    if (wantedCity && listing.city === wantedCity) {
      score += 4;
      proseReasons.push(`it's located in ${listing.city}`);
      reasons.push({ label: "Location", detail: `${listing.city} — matches what you asked for` });
    }
    if (wantBedrooms && listing.bedrooms >= wantBedrooms) {
      score += 3;
      proseReasons.push(`it has ${listing.bedrooms} bedrooms`);
      reasons.push({ label: "Lifestyle fit", detail: `${listing.bedrooms} bedrooms — meets your ${wantBedrooms}+ requirement` });
    }
    if (wantedType && listing.property_type === wantedType) {
      score += 3;
      proseReasons.push(`it's a ${wantedType}`);
      reasons.push({
        label: "Property type",
        detail: `${TYPE_LABEL[wantedType] ?? wantedType} — the type you asked for`,
      });
    }
    if (wantsBeach && (listing.sea_view || (listing.distance_to_beach_min ?? 999) <= 15)) {
      score += 2;
      const detail = listing.sea_view
        ? "Sea views from the property"
        : `${listing.distance_to_beach_min} min from the beach`;
      proseReasons.push(listing.sea_view ? "it has sea views" : `it's ${listing.distance_to_beach_min} min from the beach`);
      reasons.push({ label: "Beach distance", detail });
    }
    if (wantsBuy && listing.mode === "buy") score += 2;
    if (wantsRent && listing.mode === "rent") score += 2;
    if (budget && price > 0) {
      const ratio = price / budget;
      if (ratio <= 1.05) {
        score += 2;
        proseReasons.push(`it's within your ${formatPrice(budget)} budget`);
        reasons.push({ label: "Budget fit", detail: `${formatPrice(price)} — within your ${formatPrice(budget)} budget` });
      } else if (ratio <= 1.3) {
        score += 1;
        proseReasons.push("it's close to your budget");
        reasons.push({ label: "Budget fit", detail: `${formatPrice(price)} — slightly above your ${formatPrice(budget)} budget` });
      }
    }
    return { listing, score, proseReasons, reasons };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => ({
      listing: s.listing,
      match_reason: s.proseReasons.length > 0 ? `Matches because ${s.proseReasons.join(", and ")}.` : "A strong general match for your search.",
      match_percent: Math.max(55, Math.min(100, Math.round((s.score / Math.max(maxPossibleScore, 1)) * 100))),
      reasons: s.reasons,
    }));
}

/**
 * Free text → ranked matches, entirely offline. Kept as the fallback path
 * for `askSuziSearch` and used directly by the homepage search demo.
 */
export function interpretSearchQuery(query: string, listings: Listing[]): SearchMatch[] {
  return rankListings(parseSearchQuery(query), listings);
}
