import { generateListingAction } from "@/app/actions";
import { PROPERTY_TYPES, type ListingFacts, type PropertyType } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/suzi/generate — listing generation for the Zouza mobile app.
 *
 * The app's listing builder collects a `ListingDraftInput` (its own shape:
 * camelCase, with photo-detected style hints). It is mapped onto the web's
 * `ListingFacts` here and handed to the same `generateListingAction` the
 * website's wizard uses, budget and fallback included. The response is the
 * web `GeneratedListingContent`; the app merges it over its local template.
 */
export const dynamic = "force-dynamic";

const draftSchema = z.object({
  intent: z.enum(["rent_out", "sell"]),
  positioning: z.enum(["rent_long", "rent_holiday", "sale"]).optional(),
  propertyType: z.string().max(40),
  city: z.string().max(100),
  addressArea: z.string().max(200).default(""),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().min(0).max(50),
  sizeM2: z.number().min(0).max(100_000),
  pool: z.boolean().default(false),
  seaView: z.boolean().default(false),
  garage: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  furnished: z.boolean().default(false),
  terrace: z.boolean().optional(),
  garden: z.boolean().optional(),
  style: z.string().max(100).optional(),
  modernisationLevel: z.string().max(100).optional(),
  kitchenStyle: z.string().max(100).optional(),
  priceMonthly: z.number().min(0).optional(),
  priceSale: z.number().min(0).optional(),
  utilitiesMonthly: z.number().min(0).optional(),
  deposit: z.number().min(0).optional(),
  ownerRules: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  photoCount: z.number().int().min(0).max(100).optional(),
});

function toPropertyType(value: string): PropertyType {
  if ((PROPERTY_TYPES as string[]).includes(value)) return value as PropertyType;
  // The app also offers "loft"; the closest web type is an apartment.
  return value === "loft" ? "apartment" : "apartment";
}

function toFacts(draft: z.infer<typeof draftSchema>): ListingFacts {
  const notes = [
    draft.notes,
    draft.style && `Style: ${draft.style}.`,
    draft.modernisationLevel && `Condition: ${draft.modernisationLevel}.`,
    draft.kitchenStyle && `Kitchen: ${draft.kitchenStyle}.`,
    draft.terrace && "Has a private terrace.",
    draft.garden && "Has a garden.",
    draft.positioning === "rent_holiday" && "Positioned as a holiday let (short stays).",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    intent: draft.intent,
    title: "",
    address_area: draft.addressArea,
    city: draft.city,
    country: "Spain",
    property_type: toPropertyType(draft.propertyType),
    bedrooms: draft.bedrooms,
    bathrooms: draft.bathrooms,
    size_m2: draft.sizeM2,
    floor: null,
    pool: draft.pool,
    sea_view: draft.seaView,
    garage: draft.garage,
    pets_allowed: draft.petsAllowed,
    furnished: draft.furnished,
    price: draft.intent === "sell" ? (draft.priceSale ?? 0) : (draft.priceMonthly ?? 0),
    utilities_monthly: draft.utilitiesMonthly ?? null,
    deposit: draft.deposit ?? null,
    available_from: "",
    owner_rules: draft.ownerRules ?? "",
    notes,
    photo_count: draft.photoCount ?? 0,
  };
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = z.object({ draft: draftSchema }).safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const content = await generateListingAction(toFacts(parsed.data.draft));
  return NextResponse.json(content, { headers: { "cache-control": "no-store" } });
}
