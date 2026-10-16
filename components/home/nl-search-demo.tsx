"use client";

import { askSuziSearch } from "@/app/actions";
import { SuziPromptInput } from "@/components/home/suzi-prompt-input";
import { ThinkingDots } from "@/components/motion/thinking-dots";
import { buttonClasses } from "@/components/ui/button";
import { openSuziPanel } from "@/lib/suzi-events";
import type { SearchMatch } from "@/lib/types";
import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

interface NlSearchDemoProps {
  /** The example shown in the empty field. */
  placeholder: string;
  /**
   * The query the server page ranked to produce `initialResults`. Also what
   * "All matches" carries while the field is still empty.
   */
  seedQuery: string;
  /** Ranked on the server, so this client bundle never imports the inventory. */
  initialResults: SearchMatch[];
}

/**
 * The homepage prompt: Suzi's own input (type or speak), four doors as
 * quick actions, and the ranked matches with the reasons behind each one.
 * Every real search goes through the server action, which uses the model
 * when one is configured and the deterministic ranker when not.
 */
export function NlSearchDemo({ placeholder, seedQuery, initialResults }: NlSearchDemoProps) {
  const micFirst = useClientSnapshot(isTouchDevice, false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchMatch[]>(initialResults);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  // Screen-reader announcement; a persistent live region so each change is spoken.
  const [announcement, setAnnouncement] = useState("");

  async function runSearch(q: string) {
    const text = q.trim();
    if (!text || searching) return;
    setSearching(true);
    setFailed(false);
    setAnnouncement("Suzi is reading your request");
    const result = await askSuziSearch(text).catch(() => null);
    if (result) {
      setResults(result.matches);
      setAnnouncement(
        result.matches.length === 0
          ? "No matches yet"
          : `${Math.min(result.matches.length, 3)} of ${result.matches.length} matches shown`,
      );
    } else {
      setFailed(true);
      setAnnouncement("Suzi could not search just now");
    }
    setSearching(false);
  }

  const shown = results.slice(0, 3);
  const allMatchesHref = `/ai-search?q=${encodeURIComponent(query.trim() || seedQuery)}`;

  return (
    <div>
      <SuziPromptInput
        value={query}
        onChange={setQuery}
        onSubmit={runSearch}
        disabled={searching}
        micFirst={micFirst}
        placeholder={placeholder}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/ai-search" className={buttonClasses("outline", "md")}>
          Find a home
        </Link>
        <Link href="/list-with-ai" className={buttonClasses("outline", "md")}>
          List my property
        </Link>
        <Link href="/pro" className={buttonClasses("outline", "md")}>
          I&rsquo;m an agent
        </Link>
        <button type="button" onClick={openSuziPanel} className={buttonClasses("outline", "md")}>
          Talk to Suzi
        </button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {searching ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted">
          Suzi is reading your request <ThinkingDots />
        </p>
      ) : (
        <div className="mt-8 space-y-3">
          {failed ? (
            <p className="text-sm text-muted">Suzi couldn&rsquo;t search just now. Try again in a moment.</p>
          ) : null}

          {shown.length === 0 ? (
            <p className="text-sm text-muted">No matches yet. Try a city, a budget, or bedrooms.</p>
          ) : (
            shown.map((r) => {
              const price = r.listing.mode === "rent" ? r.listing.price_monthly : r.listing.price_sale;
              return (
                <div
                  key={r.listing.id}
                  className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{r.listing.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {r.listing.city} · {formatPrice(price ?? 0)}
                        {r.listing.mode === "rent" ? "/month" : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {r.match_percent}% match
                    </span>
                  </div>

                  {r.reasons.length > 0 ? (
                    <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      {r.reasons.map((reason) => (
                        <li key={reason.label} className="text-xs text-muted">
                          <span className="font-medium text-ink">{reason.label}:</span> {reason.detail}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Link
                    href={`/property/${r.listing.id}#ai`}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    Ask Suzi
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              );
            })
          )}

          {shown.length > 0 ? (
            <Link
              href={allMatchesHref}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              All matches <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
