import { interpretSearchQuery } from "@/lib/ai/service";
import { aiSearchListings } from "@/lib/ai/suzi-search";
import { getCatalogue } from "@/lib/server/catalogue";
import type { SearchMatch } from "@/lib/types";

export function runFallbackSearch(query: string): SearchMatch[] {
  return interpretSearchQuery(query.trim(), getCatalogue());
}

export async function runAiSearch(
  query: string,
): Promise<{ matches: SearchMatch[]; source: "model" | "fallback" }> {
  const trimmed = query.trim();
  if (!trimmed) return { matches: [], source: "fallback" };
  const results = await aiSearchListings(trimmed, getCatalogue());
  return results
    ? { matches: results, source: "model" }
    : { matches: runFallbackSearch(trimmed), source: "fallback" };
}
