import { AiSearchClient } from "@/components/search/ai-search-client";
import { Suspense } from "react";

/* In Next 16 `searchParams` is a Promise and a request-time API. It is read
   inside the Suspense boundary (not at the top of the page) so the static
   shell streams first and the route stays valid if Cache Components is
   switched on later. */
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function pickQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 500);
}

async function SeededSearch({ searchParams }: { searchParams: SearchParams }) {
  const q = pickQuery((await searchParams).q);
  // Keyed by the query so a client navigation to a new `?q=` remounts the
  // search with fresh seeded state instead of mutating state in an effect.
  return <AiSearchClient key={q || "blank"} initialQuery={q} />;
}

function AiSearchShell() {
  return (
    <div className="container-page max-w-3xl py-16 md:py-20" aria-busy="true">
      <p className="eyebrow text-center">Ask Suzi</p>
      <h1 className="mt-3 text-center text-3xl font-semibold text-ink sm:text-4xl">
        Tell Suzi what you need
      </h1>
      <div className="mt-8 min-h-11 animate-pulse rounded-lg border border-border bg-paper-2" />
    </div>
  );
}

export default function AiSearchPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<AiSearchShell />}>
      <SeededSearch searchParams={searchParams} />
    </Suspense>
  );
}
