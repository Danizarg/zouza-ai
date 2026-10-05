import type { ProtocolActionId } from "@/lib/ai/protocol";
import { answerAgentQuestion, chatRespond } from "@/lib/ai/service";
import { getSuziResponse, type NavigationIntent } from "@/lib/ai/suzi-assistant";
import { generateSuziReply, NAVIGATION_TARGETS, type SuziTurn } from "@/lib/ai/suzi-brain";
import { findListing, getCatalogue } from "@/lib/server/catalogue";

/**
 * Suzi's conversation core, shared by the website's server actions and the
 * app's /api/v1/suzi/chat route so both surfaces answer identically.
 * Listings are always looked up here by id/slug — a caller can never inject
 * listing data into the prompt.
 */

export type SuziSurface = "global" | "home" | "property";

export interface SuziChatInput {
  message: string;
  surface: SuziSurface;
  route?: string;
  listingId?: string | null;
  history?: SuziTurn[];
}

export interface SuziChatResult {
  text: string;
  action: ProtocolActionId | null;
  navigation: NavigationIntent | null;
  source: "model" | "fallback";
}

export const EMPTY_GLOBAL_REPLY = "Tell me what you're looking for and I'll take it from there.";
export const PROPERTY_NOT_FOUND_REPLY = "I couldn't load that property just now — try refreshing the page.";

function fallback(text: string, navigation: NavigationIntent | null = null): SuziChatResult {
  return { text, action: null, navigation, source: "fallback" };
}

export async function runSuziChat(input: SuziChatInput): Promise<SuziChatResult> {
  const message = input.message.trim();
  const history = input.history ?? [];
  const listingId = input.listingId ?? null;

  if (input.surface === "property") {
    const listing = listingId ? findListing(listingId) : null;
    if (!listing) return fallback(PROPERTY_NOT_FOUND_REPLY);
    if (!message) return fallback(answerAgentQuestion(listing, message));
    const result = await generateSuziReply(message, { route: `/property/${listing.slug}`, listing, history });
    return result
      ? { text: result.reply, action: result.action, navigation: null, source: "model" }
      : fallback(answerAgentQuestion(listing, message));
  }

  if (input.surface === "home") {
    if (!message) return fallback(chatRespond(message));
    const result = await generateSuziReply(message, { route: "/", listings: getCatalogue(), history });
    return result
      ? { text: result.reply, action: result.action, navigation: null, source: "model" }
      : fallback(chatRespond(message));
  }

  if (!message) return fallback(EMPTY_GLOBAL_REPLY);
  const route = input.route || "/";
  const listing = listingId ? findListing(listingId) : null;
  const result = await generateSuziReply(message, { route, listing, listings: getCatalogue(), history });
  if (!result) {
    const reply = getSuziResponse(message, { route, listing });
    return fallback(reply.text, reply.navigation);
  }
  return {
    text: result.reply,
    action: result.action,
    navigation: NAVIGATION_TARGETS[result.action] ?? null,
    source: "model",
  };
}
