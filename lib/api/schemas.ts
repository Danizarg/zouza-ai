import { contactSchema } from "@/lib/server/contact";
import { z } from "zod";

const turn = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(1000),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  surface: z.enum(["global", "home", "property"]),
  route: z.string().max(200).optional(),
  listingId: z.string().max(200).nullable().optional(),
  // Older app builds may send longer histories; accept and keep the last 8.
  history: z.array(turn).max(50).transform((h) => h.slice(-8)).optional(),
});

export const searchRequestSchema = z.object({
  query: z.string().trim().min(1).max(500),
});

const flag = z.boolean();

export const listingFactsSchema = z.object({
  intent: z.enum(["rent_out", "sell"]),
  title: z.string().max(200),
  address_area: z.string().max(200),
  city: z.string().max(120),
  country: z.string().max(120),
  property_type: z.enum(["apartment", "house", "villa", "townhouse", "penthouse", "finca", "studio"]),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  size_m2: z.number().min(0).max(100_000),
  floor: z.number().int().min(-5).max(200).nullable(),
  pool: flag,
  sea_view: flag,
  garage: flag,
  pets_allowed: flag,
  furnished: flag,
  price: z.number().min(0).max(1_000_000_000),
  utilities_monthly: z.number().min(0).max(1_000_000).nullable(),
  deposit: z.number().min(0).max(1_000_000_000).nullable(),
  platform_fee_percent: z.number().min(0).max(100),
  available_from: z.string().max(40),
  owner_rules: z.string().max(2000),
  notes: z.string().max(4000),
  photo_count: z.number().int().min(0).max(200),
});

export const generateRequestSchema = z.object({ facts: listingFactsSchema });

/** `company` is a honeypot: humans never see it, bots fill it. */
export const contactRequestSchema = contactSchema.extend({
  company: z.string().max(200).optional(),
});
