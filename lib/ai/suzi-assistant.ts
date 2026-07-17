import { answerAgentQuestion, chatRespond } from "@/lib/ai/service";
import type { Listing } from "@/lib/types";

/**
 * Mock AI service for the global Suzi avatar assistant (site-wide guide,
 * distinct from the per-property chat in lib/ai/service.ts, which this
 * module reuses when a listing is in context). Deterministic and
 * keyword-based — no API key required. Swap `getSuziResponse` for a real
 * model call once a provider is connected; the { text, navigation } return
 * shape can stay the same.
 */

export interface SuziContext {
  route: string;
  listing?: Listing | null;
}

export interface QuickAction {
  label: string;
  /** Clicking sends this as a user message. */
  prompt?: string;
  /** Clicking navigates instead of chatting. */
  href?: string;
}

export interface NavigationIntent {
  href: string;
  label: string;
}

const GLOBAL_QUICK_ACTIONS: QuickAction[] = [
  { label: "Find a home", href: "/ai-search" },
  { label: "List my property", href: "/list-with-ai" },
  { label: "Compare homes", href: "/explore" },
  { label: "Contact support", href: "/contact" },
];

const PAGE_QUICK_ACTIONS: Record<string, QuickAction[]> = {
  "/": GLOBAL_QUICK_ACTIONS,
  "/explore": [
    { label: "Find a home", href: "/ai-search" },
    { label: "Only verified homes", prompt: "Only show verified homes" },
    { label: "Sea-view properties", prompt: "Show me sea-view properties" },
  ],
  "/ai-search": [
    { label: "Investment properties", prompt: "Find investment properties" },
    { label: "3-bed near the beach", prompt: "Find a 3-bedroom rental near the beach" },
    { label: "Explain these results", prompt: "Explain these results" },
  ],
  "/list-with-ai": [
    { label: "Upload photos", href: "/list-with-ai" },
    { label: "Estimate my value", prompt: "Estimate my property value" },
    { label: "Write a better description", prompt: "Write a better description" },
  ],
  "/pricing": [
    { label: "Explain the fees", prompt: "Explain the fees" },
    { label: "Any hidden costs?", prompt: "Are there hidden costs?" },
  ],
  "/contact": [
    { label: "Speak to support", prompt: "I want to speak to support" },
    { label: "List my property", href: "/list-with-ai" },
  ],
};

const PROPERTY_QUICK_ACTIONS: QuickAction[] = [
  { label: "Ask about fees", prompt: "Are there community fees?" },
  { label: "Distance to beach", prompt: "How far is it from the beach?" },
  { label: "Request viewing", prompt: "Can I book a viewing?" },
  { label: "Is it available?", prompt: "Is it still available?" },
];

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  "/": [
    "Help me find a home",
    "I want to sell my property",
    "Create my listing from photos",
    "Explain how Zouza works",
  ],
  "/explore": ["Find homes under €900,000", "Show me sea-view properties", "Only show verified homes"],
  "/ai-search": [
    "I'm moving from Germany to Marbella",
    "Find investment properties",
    "Find a 3-bedroom rental near the beach",
  ],
  "/list-with-ai": ["Help me create my listing", "Estimate my property value", "Write a better description"],
  "/pricing": ["Explain the fees", "Are there hidden costs?", "What does transparent pricing mean?"],
  "/contact": ["I want to speak to support", "I want to list my property"],
};

const PROPERTY_SUGGESTIONS = [
  "Is this property available?",
  "Are there community fees?",
  "How far is the beach?",
  "Can I request a viewing?",
];

function matchByPrefix<T>(table: Record<string, T>, route: string, fallback: T): T {
  if (route in table) return table[route];
  const match = Object.keys(table)
    .filter((prefix) => prefix !== "/" && route.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0];
  return match ? table[match] : fallback;
}

export function getGreetingForPage(route: string, listing?: Listing | null): string {
  if (listing) {
    return `Hi, I'm Suzi. 👋 Ask me anything about "${listing.title}" — availability, costs, or the neighbourhood.`;
  }
  if (route.startsWith("/list-with-ai")) {
    return "Want to start by uploading photos? I can create the listing from there.";
  }
  if (route.startsWith("/pricing")) {
    return "I can explain how Zouza avoids hidden costs.";
  }
  if (route.startsWith("/ai-search") || route.startsWith("/explore")) {
    return "Tell me what you're looking for and I'll help you narrow it down.";
  }
  if (route.startsWith("/contact")) {
    return "Not sure who to contact? I can point you in the right direction.";
  }
  return "Hi, I'm Suzi. You can tell me what you're looking for.";
}

export function getPageSuggestions(route: string): string[] {
  if (route.startsWith("/property/")) return PROPERTY_SUGGESTIONS;
  return matchByPrefix(PAGE_SUGGESTIONS, route, PAGE_SUGGESTIONS["/"]);
}

export function getQuickActions(route: string): QuickAction[] {
  if (route.startsWith("/property/")) return PROPERTY_QUICK_ACTIONS;
  return matchByPrefix(PAGE_QUICK_ACTIONS, route, GLOBAL_QUICK_ACTIONS);
}

/** Keyword routing to the page that best matches what the visitor is trying to do. */
export function detectNavigationIntent(message: string): NavigationIntent | null {
  const m = message.toLowerCase();
  if (/(sell|list my|upload photo|create my listing)/.test(m)) {
    return { href: "/list-with-ai", label: "Start listing with Suzi" };
  }
  if (/(rent|rental)/.test(m) && !/(buy|purchase)/.test(m)) {
    return { href: "/explore", label: "Explore Homes" };
  }
  if (/(buy|purchase|villa|investment|invest|show me homes|find.*home)/.test(m)) {
    return { href: "/ai-search", label: "Go to AI Search" };
  }
  if (/(pricing|fee|cost)/.test(m)) {
    return { href: "/pricing", label: "View pricing" };
  }
  if (/how (does|it) .*work/.test(m)) {
    return { href: "/how-it-works", label: "How it works" };
  }
  if (/(contact support|speak to support|talk to.*human|need help)/.test(m)) {
    return { href: "/contact", label: "Contact support" };
  }
  return null;
}

const ADVICE_PATTERN = /(legal advice|tax advice|financial advice|should i invest|is this a good investment|guarantee)/;

export interface SuziReply {
  text: string;
  navigation: NavigationIntent | null;
}

/** Answers within a property's own data — thin, named wrapper over the per-listing agent for spec parity. */
export function getPropertyAnswer(message: string, listing: Listing): string {
  return answerAgentQuestion(listing, message);
}

export function getSuziResponse(message: string, context: SuziContext): SuziReply {
  const trimmed = message.trim();
  if (!trimmed) {
    return { text: "Tell me what you're looking for and I'll take it from there.", navigation: null };
  }

  const lower = trimmed.toLowerCase();
  if (ADVICE_PATTERN.test(lower)) {
    return {
      text: "I can explain general property information, but I can't provide legal, tax, or financial advice. For that, please speak with a qualified professional.",
      navigation: null,
    };
  }

  if (context.listing) {
    return { text: getPropertyAnswer(trimmed, context.listing), navigation: null };
  }

  const navigation = detectNavigationIntent(trimmed);
  if (navigation) {
    return { text: "I can help with that — tap below and I'll take you there.", navigation };
  }

  return { text: chatRespond(trimmed), navigation: null };
}
