"use client";

import { FilterPanel } from "@/components/search/filter-panel";
import { ListingCard } from "@/components/listing-card";
import { Select } from "@/components/ui/field";
import { applyFilters, sortListings, type ListingFilters, type SortOption } from "@/lib/listing-filters";
import type { Listing } from "@/lib/types";
import { List, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_FILTERS: ListingFilters = {};

export function SearchResults({
  mode,
  listings,
}: {
  mode: "rent" | "buy";
  listings: Listing[];
}) {
  const [filters, setFilters] = useState<ListingFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [view, setView] = useState<"list" | "map">("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const results = useMemo(
    () => sortListings(applyFilters(listings, filters), sort),
    [listings, filters, sort],
  );

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[280px_1fr] lg:py-12">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <FilterPanel mode={mode} filters={filters} onChange={setFilters} />
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-sm text-navy-600">
              <span className="font-semibold text-navy-900">{results.length}</span>{" "}
              {results.length === 1 ? "home" : "homes"} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-navy-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filters
            </button>
            <Select
              aria-label="Sort by"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-auto"
            >
              <option value="recommended">Recommended</option>
              <option value="total_cost">
                {mode === "rent" ? "Lowest total move-in cost" : "Lowest price"}
              </option>
              <option value="newest">Newest</option>
              <option value="most_verified">Most verified</option>
            </Select>
            <div className="hidden items-center gap-1 rounded-full border border-line bg-white p-1 sm:flex">
              <button
                type="button"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${view === "list" ? "bg-navy-900 text-ivory" : "text-navy-500"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setView("map")}
                aria-pressed={view === "map"}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${view === "map" ? "bg-navy-900 text-ivory" : "text-navy-500"}`}
                aria-label="Map view"
              >
                <MapIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {mobileFiltersOpen ? (
          <div className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <p className="font-display text-lg font-semibold">Filters</p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-sm font-medium text-terra-600"
              >
                Done
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel mode={mode} filters={filters} onChange={setFilters} />
            </div>
          </div>
        ) : null}

        {view === "map" ? (
          <div className="mt-6 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-line bg-parchment text-sm text-navy-500">
            Interactive map view — coming soon. Showing {results.length} pinned homes.
          </div>
        ) : results.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-parchment py-16 text-center">
            <p className="font-display text-lg font-semibold text-navy-900">No homes match yet</p>
            <p className="max-w-sm text-sm text-navy-600">
              Try widening your budget or clearing a filter — new verified homes
              are added every week.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
