import type { Listing, PropertyType, TermLength } from "@/lib/types";
import { totalMoveIn } from "@/lib/utils";

/**
 * Pure filtering/sorting helpers with no server-only dependencies, so they
 * can be imported from client components (the /rent and /buy search UIs).
 * Data fetching itself lives in `lib/listings.ts`.
 */

export interface ListingFilters {
  query?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType | "any";
  pool?: boolean;
  seaView?: boolean;
  garage?: boolean;
  petsAllowed?: boolean;
  furnished?: boolean;
  newBuild?: boolean;
  directOwner?: boolean;
  verifiedOnly?: boolean;
  availableFrom?: string;
  term?: TermLength | "any";
}

export type SortOption = "recommended" | "total_cost" | "newest" | "most_verified";

export function applyFilters(listings: Listing[], f: ListingFilters): Listing[] {
  return listings.filter((l) => {
    const price = l.mode === "rent" ? (l.price_monthly ?? 0) : (l.price_sale ?? 0);
    if (f.query) {
      const q = f.query.toLowerCase();
      const haystack = `${l.city} ${l.address_area} ${l.title} ${l.country}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.priceMin !== undefined && price < f.priceMin) return false;
    if (f.priceMax !== undefined && f.priceMax > 0 && price > f.priceMax) return false;
    if (f.bedrooms !== undefined && f.bedrooms > 0 && l.bedrooms < f.bedrooms) return false;
    if (f.bathrooms !== undefined && f.bathrooms > 0 && l.bathrooms < f.bathrooms) return false;
    if (f.propertyType && f.propertyType !== "any" && l.property_type !== f.propertyType) return false;
    if (f.pool && !l.pool) return false;
    if (f.seaView && !l.sea_view) return false;
    if (f.garage && !l.garage) return false;
    if (f.petsAllowed && !l.pets_allowed) return false;
    if (f.furnished && !l.furnished) return false;
    if (f.newBuild && !l.new_build) return false;
    if (f.directOwner && !l.direct_owner) return false;
    if (f.verifiedOnly && !(l.verified_owner && l.verified_property)) return false;
    if (f.availableFrom && l.available_from && l.available_from > f.availableFrom) return false;
    if (f.term && f.term !== "any" && l.term && l.term !== f.term) return false;
    return true;
  });
}

export function sortListings(listings: Listing[], sort: SortOption): Listing[] {
  const copy = [...listings];
  switch (sort) {
    case "total_cost":
      return copy.sort(
        (a, b) =>
          (a.mode === "rent" ? totalMoveIn(a) : (a.price_sale ?? 0)) -
          (b.mode === "rent" ? totalMoveIn(b) : (b.price_sale ?? 0)),
      );
    case "newest":
      return copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
    case "most_verified":
      return copy.sort((a, b) => verificationScore(b) - verificationScore(a));
    case "recommended":
    default:
      return copy.sort(
        (a, b) =>
          verificationScore(b) + (b.rating ?? 0) - (verificationScore(a) + (a.rating ?? 0)),
      );
  }
}

function verificationScore(l: Listing): number {
  return (l.verified_owner ? 2 : 0) + (l.verified_property ? 2 : 0) + (l.last_verified_at ? 1 : 0);
}
