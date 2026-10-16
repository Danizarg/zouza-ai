import { askSuzi } from "@/app/actions";
import { PROPERTY_TYPES, type Listing, type PropertyType } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/suzi/ask — the Zouza mobile app's door to Suzi.
 *
 * Native clients can't call server actions, so this hands the same
 * `askSuzi` the website uses to anyone who can POST JSON. The listing the
 * app sends is a subset of the web `Listing` (the app has no slug, images
 * as URLs, etc.), so it is validated and widened here with neutral
 * defaults before it reaches the prompt. The per-visitor budget in
 * `lib/ai/rate-limit.ts` applies through `askSuzi` exactly as on the web.
 */
export const dynamic = "force-dynamic";

const turnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});

const listingSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(4000).default(""),
  mode: z.enum(["rent", "buy"]).default("rent"),
  city: z.string().max(100),
  country: z.string().max(100).default("Spain"),
  address_area: z.string().max(200).default(""),
  property_type: z.string().max(40).default("apartment"),
  bedrooms: z.number().int().min(0).max(50).default(0),
  bathrooms: z.number().min(0).max(50).default(0),
  size_m2: z.number().min(0).max(100_000).default(0),
  price_monthly: z.number().nullable().default(null),
  price_sale: z.number().nullable().default(null),
  utilities_monthly: z.number().nullable().default(null),
  deposit: z.number().nullable().default(null),
  available_from: z.string().max(60).nullable().default(null),
  minimum_stay: z.string().max(60).nullable().default(null),
  pets_allowed: z.boolean().default(false),
  pool: z.boolean().default(false),
  sea_view: z.boolean().default(false),
  garage: z.boolean().default(false),
  furnished: z.boolean().default(false),
  verified_owner: z.boolean().default(false),
  verified_property: z.boolean().default(false),
  faq: z.array(z.object({ question: z.string().max(300), answer: z.string().max(1000) })).max(20).default([]),
});

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  route: z.string().max(200).default("/app"),
  history: z.array(turnSchema).max(10).default([]),
  listing: listingSchema.nullable().default(null),
});

function toPropertyType(value: string): PropertyType {
  return (PROPERTY_TYPES as string[]).includes(value) ? (value as PropertyType) : "apartment";
}

/** Widen the app's listing subset into the web `Listing` the prompt builder expects. */
function toListing(input: z.infer<typeof listingSchema>): Listing {
  const now = new Date().toISOString();
  return {
    id: "app",
    owner_id: "app",
    mode: input.mode,
    intent: input.mode === "buy" ? "sell" : "rent_out",
    title: input.title,
    slug: "app",
    summary: "",
    description: input.description,
    city: input.city,
    country: input.country,
    address_area: input.address_area,
    latitude: null,
    longitude: null,
    property_type: toPropertyType(input.property_type),
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    size_m2: input.size_m2,
    floor: null,
    price_monthly: input.price_monthly,
    price_sale: input.price_sale,
    utilities_monthly: input.utilities_monthly,
    deposit: input.deposit,
    total_move_in_cost: null,
    available_from: input.available_from,
    minimum_stay: input.minimum_stay,
    maximum_stay: null,
    term: null,
    pets_allowed: input.pets_allowed,
    pool: input.pool,
    sea_view: input.sea_view,
    garage: input.garage,
    furnished: input.furnished,
    new_build: false,
    direct_owner: true,
    verified_owner: input.verified_owner,
    verified_property: input.verified_property,
    last_verified_at: null,
    status: "published",
    owner_rules: null,
    owner_name: "the owner",
    rating: null,
    review_count: 0,
    images: [],
    features: [],
    created_at: now,
    updated_at: now,
    faq: input.faq,
  };
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { message, route, history, listing } = parsed.data;
  const result = await askSuzi({
    message,
    route,
    history,
    listing: listing ? toListing(listing) : null,
  });

  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
