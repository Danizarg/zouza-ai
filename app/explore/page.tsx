"use client";

import { FilterPanel } from "@/components/search/filter-panel";
import { ListingCard } from "@/components/listing-card";
import { Select } from "@/components/ui/field";
import { applyFilters, sortListings, type ListingFilters, type SortOption } from "@/lib/listing-filters";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { useMemo, useState } from "react";

type ExploreMode = "all" | "rent" | "buy";

export default function ExplorePage() {
  const [mode, setMode] = useState<ExploreMode>("all");
  const [filters, setFilters] = useState<ListingFilters>({});
  const [sort, setSort] = useState<SortOption>("recommended");

  const scoped = useMemo(
    () => (mode === "all" ? MOCK_LISTINGS : MOCK_LISTINGS.filter((l) => l.mode === mode)),
    [mode],
  );
  const results = useMemo(
    () => sortListings(applyFilters(scoped, filters), sort),
    [scoped, filters, sort],
  );

  return (
    <div>
      <div className="border-b border-line bg-parchment py-10">
        <div className="container-page">
          <p className="eyebrow">Explore · AI-enhanced</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy-950 sm:text-4xl">
            Browse every verified home
          </h1>
          <p className="mt-2 max-w-xl text-navy-600">
            Prefer to browse? Every card still shows why it&rsquo;s verified,
            the real total cost, and a direct line to talk to its AI.
          </p>
          <div className="mt-5 inline-flex rounded-lg border border-line bg-white p-1">
            {(["all", "rent", "buy"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  mode === m ? "bg-navy-950 text-ivory" : "text-navy-600"
                }`}
              >
                {m === "all" ? "All homes" : m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[280px_1fr] lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel mode={mode === "buy" ? "buy" : "rent"} filters={filters} onChange={setFilters} />
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-sm text-navy-600">
              <span className="font-semibold text-navy-900">{results.length}</span>{" "}
              {results.length === 1 ? "home" : "homes"} found
            </p>
            <Select
              aria-label="Sort by"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-auto"
            >
              <option value="recommended">Recommended</option>
              <option value="total_cost">Lowest cost</option>
              <option value="newest">Newest</option>
              <option value="most_verified">Most verified</option>
            </Select>
          </div>

          {results.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-parchment py-16 text-center">
              <p className="font-display text-lg font-semibold text-navy-900">No homes match yet</p>
              <p className="max-w-sm text-sm text-navy-600">
                Try widening your budget or clearing a filter.
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
    </div>
  );
}
