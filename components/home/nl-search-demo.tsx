"use client";

import { interpretSearchQuery } from "@/lib/ai/service";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import type { SearchMatch } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const DEFAULT_QUERY = "I'm moving from Germany to Marbella. Budget €900,000. Need 3 bedrooms. Walking distance to beach.";

export function NlSearchDemo() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [results, setResults] = useState<SearchMatch[]>(() => interpretSearchQuery(DEFAULT_QUERY, MOCK_LISTINGS));
  const [searched, setSearched] = useState(true);

  function runSearch(q: string) {
    setResults(interpretSearchQuery(q, MOCK_LISTINGS));
    setSearched(true);
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tell Zouza what you're looking for…"
            aria-label="Natural language property search"
            className="w-full rounded-lg border border-line bg-white py-3 pr-4 pl-10 text-sm focus:border-navy-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-950 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
        >
          Search with AI
        </button>
      </form>

      {searched ? (
        <div className="mt-6 space-y-3">
          {results.length === 0 ? (
            <p className="text-sm text-navy-500">No strong matches yet — try mentioning a city, budget, or bedroom count.</p>
          ) : (
            results.slice(0, 3).map((r) => {
              const price = r.listing.mode === "rent" ? r.listing.price_monthly : r.listing.price_sale;
              return (
                <div key={r.listing.id} className="rounded-xl border border-line bg-white p-4 transition-colors hover:border-navy-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-950">{r.listing.title}</p>
                      <p className="mt-1 text-xs text-navy-500">
                        {r.listing.city} · {formatPrice(price ?? 0)}
                        {r.listing.mode === "rent" ? "/month" : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700">
                      {r.match_percent}% match
                    </span>
                  </div>

                  {r.reasons.length > 0 ? (
                    <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      {r.reasons.map((reason) => (
                        <li key={reason.label} className="text-xs text-navy-600">
                          <span className="font-medium text-navy-900">{reason.label}:</span> {reason.detail}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Link
                    href={`/property/${r.listing.id}#ai`}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-terra-600 hover:text-terra-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    Talk to this property&rsquo;s AI
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
