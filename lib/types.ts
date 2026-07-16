/**
 * Domain types for Zouza.
 * These mirror the Supabase schema in `supabase/schema.sql`.
 */

export type ListingMode = "rent" | "buy";
export type ListingIntent = "rent_out" | "sell";
export type ListingStatus = "draft" | "published" | "archived";
export type TermLength = "short_term" | "medium_term" | "long_term";

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "townhouse"
  | "penthouse"
  | "finca"
  | "studio";

export const PROPERTY_TYPES: PropertyType[] = [
  "apartment",
  "house",
  "villa",
  "townhouse",
  "penthouse",
  "finca",
  "studio",
];

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: "owner" | "seeker" | "both";
  verified: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  mode: ListingMode;
  intent: ListingIntent;
  title: string;
  slug: string;
  summary: string;
  description: string;
  city: string;
  country: string;
  address_area: string;
  latitude: number | null;
  longitude: number | null;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size_m2: number;
  floor: number | null;
  price_monthly: number | null;
  price_sale: number | null;
  utilities_monthly: number | null;
  deposit: number | null;
  platform_fee_percent: number | null;
  total_move_in_cost: number | null;
  available_from: string | null;
  minimum_stay: string | null;
  maximum_stay: string | null;
  term: TermLength | null;
  pets_allowed: boolean;
  pool: boolean;
  sea_view: boolean;
  garage: boolean;
  furnished: boolean;
  new_build: boolean;
  direct_owner: boolean;
  verified_owner: boolean;
  verified_property: boolean;
  last_verified_at: string | null;
  status: ListingStatus;
  owner_rules: string | null;
  owner_name: string;
  rating: number | null;
  review_count: number;
  /** Denormalised for the app; stored in `listing_images` in Supabase. */
  images: string[];
  /** Denormalised for the app; stored in `listing_features` in Supabase. */
  features: string[];
  created_at: string;
  updated_at: string;

  /* AI-first product fields — optional so DB rows predating them still type-check. */
  /** One-line AI-authored summary shown on cards ("why this property"). */
  ai_summary?: string;
  /** Short AI-detected highlight tags, distinct from the longer `features` list. */
  ai_highlights?: string[];
  /** Pre-built FAQ shown on the property page and fed to the property AI assistant. */
  faq?: GeneratedFaqItem[];
  distance_to_beach_min?: number | null;
  community_fees_monthly?: number | null;
  taxes_note?: string | null;
  owner_type?: "private" | "agency";
  /** Populated only on AI search results — why this specific query matched. */
  match_reason?: string;
}

export interface Review {
  id: string;
  listing_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_image: string;
  counterpart_name: string;
  counterpart_role: "owner" | "seeker";
  last_message_at: string;
  unread: number;
  prequalified: boolean;
  prequalification_note: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: "me" | "them" | "zouza_ai";
  body: string;
  created_at: string;
}

export interface ViewingRequest {
  id: string;
  listing_id: string;
  listing_title: string;
  requester_name: string;
  preferred_date: string;
  status: "pending" | "confirmed" | "declined";
  note: string | null;
  created_at: string;
}

export interface VerificationRecord {
  id: string;
  listing_id: string;
  kind: "owner_identity" | "property_ownership" | "video_walkthrough" | "documents";
  status: "pending" | "verified" | "rejected";
  verified_at: string | null;
}

export interface ContactSubmission {
  id: string;
  reason: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

/* ---------------------------------------------------------------- */
/* AI generation                                                     */
/* ---------------------------------------------------------------- */

export const TRANSLATION_LANGUAGES = [
  "English",
  "German",
  "Spanish",
  "French",
  "Italian",
  "Dutch",
] as const;

export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];

export interface GeneratedFaqItem {
  question: string;
  answer: string;
}

/** The structured exposé Zouza generates from photos + facts. */
export interface GeneratedListingContent {
  title: string;
  summary: string;
  description: string;
  featureBullets: string[];
  lifestyleParagraph: string;
  locationParagraph: string;
  idealProfile: string;
  priceExplanation: string;
  ownerRulesSummary: string;
  verificationChecklist: string[];
  faq: GeneratedFaqItem[];
  agentKnowledgeBase: string[];
  translations: Record<TranslationLanguage, "ready" | "pending">;
}

/** Facts the owner provides in the create-listing wizard. */
export interface ListingFacts {
  intent: ListingIntent;
  title: string;
  address_area: string;
  city: string;
  country: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size_m2: number;
  floor: number | null;
  pool: boolean;
  sea_view: boolean;
  garage: boolean;
  pets_allowed: boolean;
  furnished: boolean;
  price: number;
  utilities_monthly: number | null;
  deposit: number | null;
  platform_fee_percent: number;
  available_from: string;
  owner_rules: string;
  notes: string;
  photo_count: number;
}

/* ---------------------------------------------------------------- */
/* Homepage AI demos                                                  */
/* ---------------------------------------------------------------- */

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

/** A canned prompt shown in the homepage AI panel, with a deterministic mock reply. */
export interface AiChatExample {
  prompt: string;
  reply: string;
}

export interface SearchMatch {
  listing: Listing;
  match_reason: string;
}
