import { FALLBACK_IMAGES } from "@/lib/build-listing";
import { getMockListing, MOCK_LISTINGS } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Listing, ListingMode } from "@/lib/types";

export type { ListingFilters, SortOption } from "@/lib/listing-filters";
export { applyFilters, sortListings } from "@/lib/listing-filters";

/** The columns and joins every listing read asks for. */
export const LISTING_SELECT = "*, listing_images(url, sort_order), listing_features(label)";

/**
 * Server-only data access — imports `next/headers` via the Supabase server
 * client, so this module must only be imported from Server Components.
 * Client components needing filter/sort helpers should import from
 * `lib/listing-filters` instead.
 */
export async function getListings(mode: ListingMode): Promise<Listing[]> {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("mode", mode)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(rowToListing);
    }
  }
  return MOCK_LISTINGS.filter((l) => l.mode === mode);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("listings")
      .select(LISTING_SELECT)
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();
    if (data) return rowToListing(data);
  }
  return getMockListing(id) ?? null;
}

/* Row shape coming back from Supabase with joined relations. */
export interface ListingRow extends Omit<Listing, "images" | "features"> {
  listing_images?: Array<{ url: string; sort_order: number }> | null;
  listing_features?: Array<{ label: string }> | null;
}

export function rowToListing(row: ListingRow): Listing {
  const { listing_images, listing_features, ...rest } = row;
  const images = (listing_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.url);
  return {
    ...rest,
    // Cards and the gallery index images[0]; a listing with no photos must still render.
    images: images.length > 0 ? images : FALLBACK_IMAGES,
    features: (listing_features ?? []).map((f) => f.label),
  };
}
