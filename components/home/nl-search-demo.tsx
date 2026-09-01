"use client";

import { aiSearchAction } from "@/app/actions";
import { interpretSearchQuery } from "@/lib/ai/service";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import type { SearchMatch } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Chosen so the demo has genuine matches in the catalogue. An earlier
 * default asked for Marbella under €900,000 — the only Marbella property is
 * €2.95M, so a correct AI search returned nothing and the demo looked
 * broken. Keep this query satisfiable if the listings change.
 */
const DEFAULT_QUERY = "I'm moving from Germany with my family. Around €900,000, three bedrooms, walking distance to the beach.";

export function NlSearchDemo() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  // Seeded synchronously with the deterministic scorer purely so the demo
  // paints instantly instead of flashing empty — a server action can't run
  // during render. The effect below immediately replaces it with real AI
  // output, so what the visitor actually reads is never template text.
  const [results, setResults] = useState<SearchMatch[]>(() => interpretSearchQuery(DEFAULT_QUERY, MOCK_LISTINGS));
  const [searched, setSearched] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // No mounted-once ref guard here: in React StrictMode the component
    // mounts, unmounts, then remounts, so a ref guard would skip the second
    // mount's fetch while the first mount's had already been cancelled by
    // cleanup — leaving the template seed on screen forever. The `cancelled`
    // flag alone is the correct guard; StrictMode costs one extra call in
    // dev only.
    let cancelled = false;
    // Apply whatever the AI returns, including an empty result — silently
    // keeping the template seed on an empty answer would misrepresent the
    // AI as having found matches it didn't.
    void aiSearchAction(DEFAULT_QUERY).then((r) => {
      if (!cancelled) setResults(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed || searching) return;
    setSearching(true);
    setResults(await aiSearchAction(trimmed));
    setSearched(true);
    setSearching(false);
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
            placeholder="Tell Suzi what you're looking for…"
            aria-label="Natural language property search"
            className="w-full rounded-lg border border-line bg-white py-3 pr-4 pl-10 text-sm focus:border-navy-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-950 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-navy-800 disabled:opacity-60"
        >
          {searching ? "Searching…" : "Search with AI"}
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

                  {/* AI results carry a written `match_reason`; the deterministic
                      fallback carries a structured `reasons` list instead. */}
                  {r.match_reason ? (
                    <p className="mt-3 text-xs text-navy-600">{r.match_reason}</p>
                  ) : r.reasons.length > 0 ? (
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
                    Talk to Suzi about this property
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
