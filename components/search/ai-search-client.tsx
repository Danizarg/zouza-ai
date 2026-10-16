"use client";

import { askSuziSearch } from "@/app/actions";
import { ZMark } from "@/components/brand/z-mark";
import { ListingCard } from "@/components/listing-card";
import { ThinkingDots } from "@/components/motion/thinking-dots";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import type { Listing, SearchMatch } from "@/lib/types";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* Each example names a mode, a place, a count, a budget or the beach, so the
   deterministic parser in lib/ai/service.ts scores it as well as the model. */
const EXAMPLES = [
  "Buy a villa in Marbella under €1.2M",
  "Rent a 3-bed near the beach",
  "Investment apartment under €400k",
  "4-bedroom family home in Valencia",
];

export function AiSearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const seed = initialQuery.trim();

  // A query arriving in the URL (/ai-search?q=…) seeds the state directly, so
  // the first paint already shows "Suzi is reading your request". The server
  // page keys this component by `q`, so a new URL query remounts it.
  const [query, setQuery] = useState(seed);
  const [submitted, setSubmitted] = useState<string | null>(seed || null);
  const [searching, setSearching] = useState(seed.length > 0);
  const [results, setResults] = useState<SearchMatch[]>([]);

  const [refineOpen, setRefineOpen] = useState(false);
  const [minBeds, setMinBeds] = useState(0);
  const [maxBudget, setMaxBudget] = useState<number | "">("");

  // The seeded search runs once on mount. Every state update happens inside
  // the promise resolution, never synchronously in the effect body.
  useEffect(() => {
    if (!seed) return;
    let cancelled = false;
    askSuziSearch(seed)
      .then((result) => {
        if (cancelled) return;
        setResults(result.matches);
        setSearching(false);
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
        setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [seed]);

  const refined = useMemo(() => {
    const base: (Listing & { match_reason?: string })[] = submitted
      ? results.map((r) => ({ ...r.listing, match_reason: `${r.match_percent}% match — ${r.match_reason}` }))
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

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed || searching) return;
    setQuery(trimmed);
    setSubmitted(trimmed);
    setSearching(true);
    const result = await askSuziSearch(trimmed).catch(() => null);
    setResults(result?.matches ?? []);
    setSearching(false);
  }

  return (
    <div className="container-page max-w-3xl py-16 md:py-20">
      <p className="eyebrow text-center">Ask Suzi</p>
      <h1 className="mt-3 text-center text-3xl font-semibold text-ink sm:text-4xl">
        Tell Suzi what you need
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. a 3-bed near the beach in Marbella under €900,000"
            aria-label="Tell Suzi what you need"
            className="min-h-11 w-full rounded-lg border border-border-strong bg-surface py-3 pr-4 pl-10 text-sm text-ink placeholder:text-muted-2 transition-colors focus:border-brand-500"
          />
        </div>
        <Button type="submit" disabled={searching} className="sm:min-w-36">
          <ZMark className="h-4 w-4" />
          Ask Suzi
        </Button>
      </form>

      {!submitted ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => runSearch(ex)}
              className="min-h-11 rounded-full border border-border bg-surface px-4 py-2 text-left text-sm font-medium text-ink-2 transition-colors hover:border-brand-500 hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
        <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted">
          {searching ? (
            <>
              Suzi is reading your request <ThinkingDots />
            </>
          ) : submitted ? (
            <>
              <span className="font-semibold text-ink">{refined.length}</span> match
              {refined.length === 1 ? "" : "es"}
            </>
          ) : (
            "Showing all homes"
          )}
        </p>
        <button
          type="button"
          onClick={() => setRefineOpen((v) => !v)}
          aria-expanded={refineOpen}
          aria-controls="ai-search-refine"
          className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-ink-2 hover:text-ink"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Refine
        </button>
      </div>

      {refineOpen ? (
        <div
          id="ai-search-refine"
          className="mt-4 grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="min-beds">Minimum bedrooms</Label>
            <Input
              id="min-beds"
              type="number"
              min={0}
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="max-budget">Max budget (€)</Label>
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
        {refined.length === 0 && submitted && !searching ? (
          <div className="col-span-full flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-paper-2 py-16 text-center">
            <p className="font-display text-lg font-semibold text-ink">No strong matches yet</p>
            <p className="max-w-sm text-sm text-muted">Try adding a city, a budget or a bedroom count.</p>
          </div>
        ) : (
          refined.map((l) => <ListingCard key={l.id} listing={l} />)
        )}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/explore"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Browse all homes
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
