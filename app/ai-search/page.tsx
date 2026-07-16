"use client";

import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/field";
import { interpretSearchQuery } from "@/lib/ai/service";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import type { Listing } from "@/lib/types";
import { ArrowRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const EXAMPLES = [
  "I want to buy a villa in Marbella under €1.2M.",
  "I need a long-term rental near the beach with 3 bedrooms.",
  "Find investment properties with strong rental potential.",
  "I am relocating from Germany and need a family home.",
];

export default function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);
  const [minBeds, setMinBeds] = useState(0);
  const [maxBudget, setMaxBudget] = useState<number | "">("");

  const results = useMemo(() => {
    if (!submitted) return [];
    return interpretSearchQuery(submitted, MOCK_LISTINGS);
  }, [submitted]);

  const refined = useMemo(() => {
    const base: (Listing & { match_reason?: string })[] = submitted
      ? results.map((r) => ({ ...r.listing, match_reason: r.match_reason }))
      : MOCK_LISTINGS;
    return base.filter((l) => {
      if (minBeds > 0 && l.bedrooms < minBeds) return false;
      if (maxBudget !== "" && maxBudget > 0) {
        const price = l.mode === "rent" ? (l.price_monthly ?? 0) : (l.price_sale ?? 0);
        if (price > maxBudget) return false;
      }
      return true;
    });
  }, [submitted, results, minBeds, maxBudget]);

  function runSearch(q: string) {
    setQuery(q);
    setSubmitted(q);
  }

  return (
    <div className="container-page max-w-3xl py-16 md:py-20">
      <p className="eyebrow text-center">AI search</p>
      <h1 className="mt-3 text-center text-3xl font-semibold text-navy-950 sm:text-4xl">
        Tell Zouza what you&rsquo;re looking for
      </h1>
      <p className="mt-3 text-center text-navy-600">
        Describe the home you want in plain language — Zouza matches
        verified listings and explains why each one fits.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I'm moving from Germany to Marbella. Budget €900,000. Need 3 bedrooms."
            aria-label="Describe what you're looking for"
            className="w-full rounded-lg border border-line bg-white py-3.5 pr-4 pl-10 text-sm focus:border-navy-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-950 px-6 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Search with AI
        </button>
      </form>

      {!submitted ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => runSearch(ex)}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-left text-xs font-medium text-navy-700 transition-colors hover:border-gold-500"
            >
              {ex}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
        <p className="text-sm text-navy-600">
          {submitted ? (
            <>
              <span className="font-semibold text-navy-900">{refined.length}</span> match
              {refined.length === 1 ? "" : "es"}
            </>
          ) : (
            "Showing all verified homes"
          )}
        </p>
        <button
          type="button"
          onClick={() => setRefineOpen((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-950"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Refine manually
        </button>
      </div>

      {refineOpen ? (
        <div className="mt-4 grid gap-4 rounded-xl border border-line bg-white p-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800" htmlFor="min-beds">
              Minimum bedrooms
            </label>
            <Input
              id="min-beds"
              type="number"
              min={0}
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800" htmlFor="max-budget">
              Max budget (€)
            </label>
            <Input
              id="max-budget"
              type="number"
              min={0}
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : "")}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {refined.length === 0 && submitted ? (
          <div className="col-span-full flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-parchment py-16 text-center">
            <p className="font-display text-lg font-semibold text-navy-900">No strong matches yet</p>
            <p className="max-w-sm text-sm text-navy-600">
              Try mentioning a city, a budget, or a bedroom count — or explore
              every verified home instead.
            </p>
          </div>
        ) : (
          refined.map((l) => <ListingCard key={l.id} listing={l} />)
        )}
      </div>

      <div className="mt-10 text-center">
        <a href="/explore" className="inline-flex items-center gap-1.5 text-sm font-medium text-terra-600 hover:text-terra-700">
          Prefer to browse everything? Explore all homes
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}
