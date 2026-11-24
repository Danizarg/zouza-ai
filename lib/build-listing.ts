import type { GeneratedListingContent, Listing, ListingFacts } from "@/lib/types";
import { slugify, totalMoveIn } from "@/lib/utils";

/** Shown when a listing has no photo of its own (demo drafts, rows without images). */
export const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
];

/**
 * The listing as the app sees it, assembled from the wizard's facts and Suzi's written content.
 * Pure: no storage, no network. In mock mode this object is saved to localStorage as-is; in
 * Supabase mode `toListingRow()` turns it into the insert and the database fills the rest.
 */
export function buildListing(
  facts: ListingFacts,
  content: GeneratedListingContent,
  imageUrls: string[],
  ownerId = "local-owner",
): Listing {
  const isRent = facts.intent === "rent_out";
  const slug = `${slugify(content.title)}-${Date.now().toString(36)}`;
  const listing: Listing = {
    id: `draft-${slug}`,
    owner_id: ownerId,
    mode: isRent ? "rent" : "buy",
    intent: facts.intent,
    title: content.title,
    slug,
    summary: content.summary,
    description: content.description,
    city: facts.city,
    country: facts.country,
    address_area: facts.address_area,
    latitude: null,
    longitude: null,
    property_type: facts.property_type,
    bedrooms: facts.bedrooms,
    bathrooms: facts.bathrooms,
    size_m2: facts.size_m2,
    floor: facts.floor,
    price_monthly: isRent ? facts.price : null,
    price_sale: isRent ? null : facts.price,
    utilities_monthly: isRent ? facts.utilities_monthly : null,
    deposit: isRent ? facts.deposit : null,
    total_move_in_cost: null,
    available_from: facts.available_from || null,
    minimum_stay: null,
    maximum_stay: null,
    term: null,
    pets_allowed: facts.pets_allowed,
    pool: facts.pool,
    sea_view: facts.sea_view,
    garage: facts.garage,
    furnished: facts.furnished,
    new_build: false,
    direct_owner: true,
    verified_owner: false,
    verified_property: false,
    last_verified_at: null,
    status: "published",
    owner_rules: facts.owner_rules || null,
    owner_name: "You",
    rating: null,
    review_count: 0,
    images: imageUrls.length > 0 ? imageUrls : FALLBACK_IMAGES,
    features: content.featureBullets,
    faq: content.faq,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (isRent) listing.total_move_in_cost = totalMoveIn(listing);
  return listing;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Exactly the columns a signed-in owner may write (migration 0003 grants insert/update on
 * everything except the server-filled trust and derived columns). The id, slug, owner_name and
 * timestamps come back from the database.
 */
export function toListingRow(listing: Listing, ownerId: string) {
  return {
    owner_id: ownerId,
    mode: listing.mode,
    intent: listing.intent,
    title: listing.title,
    summary: listing.summary,
    description: listing.description,
    city: listing.city,
    country: listing.country,
    address_area: listing.address_area,
    latitude: listing.latitude,
    longitude: listing.longitude,
    property_type: listing.property_type,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    size_m2: listing.size_m2,
    floor: listing.floor,
    price_monthly: listing.price_monthly,
    price_sale: listing.price_sale,
    utilities_monthly: listing.utilities_monthly,
    deposit: listing.deposit,
    total_move_in_cost: listing.total_move_in_cost,
    // The chat step collects this as free text; only a real date can go in a date column.
    available_from:
      listing.available_from && ISO_DATE.test(listing.available_from)
        ? listing.available_from
        : null,
    minimum_stay: listing.minimum_stay,
    maximum_stay: listing.maximum_stay,
    term: listing.term,
    pets_allowed: listing.pets_allowed,
    pool: listing.pool,
    sea_view: listing.sea_view,
    garage: listing.garage,
    furnished: listing.furnished,
    new_build: listing.new_build,
    direct_owner: listing.direct_owner,
    status: listing.status,
    owner_rules: listing.owner_rules,
    faq: listing.faq ?? [],
    // No geocoding yet: the pin is the area, not the door.
    location_approximate: true,
  };
}
