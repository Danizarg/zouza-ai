"use client";

import { SuziPromptInput } from "@/components/home/suzi-prompt-input";
import { SuziAvatarButton } from "@/components/suzi/suzi-avatar-button";
import { SuziGreetingBubble } from "@/components/suzi/suzi-greeting-bubble";
import { SuziMessageList, type SuziMessage } from "@/components/suzi/suzi-message-list";
import { SuziPanel } from "@/components/suzi/suzi-panel";
import { SuziPropertyContextCard } from "@/components/suzi/suzi-property-context-card";
import { SuziQuickActions } from "@/components/suzi/suzi-quick-actions";
import {
  getGreetingForPage,
  getPageSuggestions,
  getQuickActions,
  getSuziResponse,
} from "@/lib/ai/suzi-assistant";
import { getMockListing } from "@/lib/mock-data";
import { SUZI_OPEN_EVENT } from "@/lib/suzi-events";
import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const DISMISSED_KEY = "suzi_greeting_dismissed";
const OPENED_KEY = "suzi_opened_before";

function readFlag(key: string): () => boolean {
  return () => typeof window !== "undefined" && window.localStorage.getItem(key) === "1";
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Global, page-aware Suzi guide — floating on every page via app/layout.tsx.
 * Distinct from the per-property AgentChat panel embedded in the property
 * page itself; this one follows the visitor everywhere and knows which
 * route (and, on a property page, which listing) they're looking at.
 */
export function SuziAvatarAssistant() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const micFirst = useClientSnapshot(isTouchDevice, false);
  const greetingDismissedBefore = useClientSnapshot(readFlag(DISMISSED_KEY), false);
  const openedBefore = useClientSnapshot(readFlag(OPENED_KEY), false);

  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState<SuziMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const listingMatch = pathname.match(/^\/property\/([^/]+)/);
  const listing = listingMatch ? (getMockListing(listingMatch[1]) ?? null) : null;

  useEffect(() => {
    if (openedBefore || greetingDismissedBefore) return;
    const id = window.setTimeout(() => setShowGreeting(true), 5000);
    return () => window.clearTimeout(id);
  }, [pathname, openedBefore, greetingDismissedBefore]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const openPanel = useCallback(() => {
    setOpen(true);
    setShowGreeting(false);
    window.localStorage.setItem(OPENED_KEY, "1");
    if (messages.length === 0) {
      setMessages([{ role: "suzi", text: getGreetingForPage(pathname, listing) }]);
      setTypingIndex(0);
    }
  }, [pathname, listing, messages.length]);

  function dismissGreeting() {
    setShowGreeting(false);
    window.localStorage.setItem(DISMISSED_KEY, "1");
  }

  useEffect(() => {
    window.addEventListener(SUZI_OPEN_EVENT, openPanel);
    return () => window.removeEventListener(SUZI_OPEN_EVENT, openPanel);
  }, [openPanel]);

  function send(message: string) {
    const text = message.trim();
    if (!text || thinking) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      const reply = getSuziResponse(text, { route: pathname, listing });
      setMessages((prev) => {
        const next = [...prev, { role: "suzi" as const, text: reply.text }];
        setTypingIndex(next.length - 1);
        return next;
      });
      setThinking(false);
      const nav = reply.navigation;
      if (nav) {
        window.setTimeout(() => router.push(nav.href), 900);
      }
    }, 650);
  }

  const suggestions = getPageSuggestions(pathname);
  const quickActions = getQuickActions(pathname);

  return (
    <div
      className="fixed right-4 bottom-24 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {open ? (
        <SuziPanel
          panelRef={panelRef}
          subtitle={listing ? "Ask me about this home" : "Your AI Real Estate Partner"}
          onClose={() => setOpen(false)}
        >
          {listing ? <SuziPropertyContextCard listing={listing} /> : null}
          <SuziMessageList
            messages={messages}
            thinking={thinking}
            typingIndex={typingIndex}
            onTypingDone={() => setTypingIndex(null)}
            scrollRef={scrollRef}
          />
          {messages.length <= 1 ? (
            <div className="flex flex-wrap gap-1.5 border-t border-line px-4 pt-3">
              {suggestions.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-parchment px-2.5 py-1 text-left text-[0.7rem] font-medium text-navy-700 transition-colors hover:border-gold-500 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
          <div className="border-t border-line px-3 py-2.5">
            <SuziQuickActions actions={quickActions} onPrompt={send} />
          </div>
          <div className="border-t border-line p-3">
            <SuziPromptInput
              value={input}
              onChange={setInput}
              onSubmit={send}
              disabled={thinking}
              micFirst={micFirst}
              placeholder="Speak naturally, or type your request…"
            />
          </div>
          <p className="border-t border-line px-4 py-2 text-center text-[0.65rem] leading-snug text-navy-400">
            Suzi guides you, but doesn&rsquo;t give legal, tax, or financial
            advice — and doesn&rsquo;t handle payments.
          </p>
        </SuziPanel>
      ) : showGreeting ? (
        <SuziGreetingBubble
          text={getGreetingForPage(pathname, listing)}
          onOpen={openPanel}
          onDismiss={dismissGreeting}
        />
      ) : null}

      <SuziAvatarButton onClick={() => (open ? setOpen(false) : openPanel())} />
    </div>
  );
}
