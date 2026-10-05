"use server";

import { chatRespond, generateListingContent } from "@/lib/ai/service";
import type { SuziReply } from "@/lib/ai/suzi-assistant";
import type { SuziTurn } from "@/lib/ai/suzi-brain";
import { checkRateLimit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";
import { findListing } from "@/lib/server/catalogue";
import { runJoinWaitlist, runSubmitContact } from "@/lib/server/contact";
import { runAiSearch, runFallbackSearch } from "@/lib/server/search";
import { EMPTY_GLOBAL_REPLY, runSuziChat } from "@/lib/server/suzi";
import type { GeneratedListingContent, ListingFacts, SearchMatch } from "@/lib/types";

/**
 * Server actions for the website. Each is a thin wrapper over lib/server/*,
 * which the app's /api/v1 routes share, so web and app answer identically.
 */

export async function generateListingAction(facts: ListingFacts): Promise<GeneratedListingContent> {
  return generateListingContent(facts);
}

export async function suziReplyAction(
  message: string,
  context: { route: string; listingId?: string | null },
  history: SuziTurn[] = [],
): Promise<SuziReply> {
  if (!message.trim()) return { text: EMPTY_GLOBAL_REPLY, navigation: null };
  if (!(await checkRateLimit())) return { text: RATE_LIMITED_MESSAGE, navigation: null };
  const r = await runSuziChat({ message, surface: "global", route: context.route, listingId: context.listingId, history });
  return { text: r.text, navigation: r.navigation };
}

export async function homeChatAction(message: string, history: SuziTurn[] = []): Promise<string> {
  if (!message.trim()) return chatRespond("");
  if (!(await checkRateLimit())) return RATE_LIMITED_MESSAGE;
  return (await runSuziChat({ message, surface: "home", history })).text;
}

export async function propertyChatAction(
  listingId: string,
  message: string,
  history: SuziTurn[] = [],
): Promise<string> {
  // The not-found line is answered before the limiter (runSuziChat does that
  // for unresolvable ids), so only resolvable listings with a real message
  // spend a token — as before the shared core.
  if (message.trim() && findListing(listingId) && !(await checkRateLimit())) return RATE_LIMITED_MESSAGE;
  return (await runSuziChat({ message, surface: "property", listingId, history })).text;
}

export async function aiSearchAction(query: string): Promise<SearchMatch[]> {
  if (!query.trim()) return [];
  if (!(await checkRateLimit())) return runFallbackSearch(query);
  return (await runAiSearch(query)).matches;
}

export async function submitContact(input: {
  reason: string;
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  return runSubmitContact(input);
}

export async function joinWaitlist(email: string, interest?: string): Promise<{ ok: boolean }> {
  return runJoinWaitlist({ email, interest });
}
