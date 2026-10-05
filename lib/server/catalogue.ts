import { getMockListing, getMockReviews, MOCK_LISTINGS } from "@/lib/mock-data";
import type { Listing, Review } from "@/lib/types";

/**
 * The single catalogue that the website, the iOS app (via /api/v1) and
 * Suzi's prompt grounding all read. Today it is the seeded listings in
 * lib/mock-data.ts; when listings move to Supabase, change it here only.
 */
export function getCatalogue(): Listing[] {
  return MOCK_LISTINGS;
}

export function findListing(idOrSlug: string): Listing | null {
  return getMockListing(idOrSlug) ?? null;
}

export function getReviewsFor(listingId: string): Review[] {
  return getMockReviews(listingId);
}
