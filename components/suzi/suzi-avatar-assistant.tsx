"use client";

import { SuziPromptInput } from "@/components/home/suzi-prompt-input";
import { SuziAvatarButton } from "@/components/suzi/suzi-avatar-button";
import { SuziGreetingBubble } from "@/components/suzi/suzi-greeting-bubble";
import { SuziMessageList, type SuziMessage } from "@/components/suzi/suzi-message-list";
import { SuziPanel } from "@/components/suzi/suzi-panel";
import { SuziPropertyContextCard } from "@/components/suzi/suzi-property-context-card";
import { SuziQuickActions } from "@/components/suzi/suzi-quick-actions";
import { askSuzi } from "@/app/actions";
import {
  getGreetingForPage,
  getPageSuggestions,
  getQuickActions,
} from "@/lib/ai/suzi-assistant";
import { getMockListing } from "@/lib/mock-data";
import { SUZI_OPEN_EVENT } from "@/lib/suzi-events";
import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

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
 * Global, page-aware Suzi guide — floating on every page, mounted lazily
 * by SuziWidget from app/layout.tsx. Distinct from the per-property
 * AgentChat panel embedded in the property page itself; this one follows
 * the visitor everywhere and knows which route (and, on a property page,
 * which listing) they're looking at.
 *
 * Owns the dialog's open state and therefore its focus choreography:
 * focus moves into the panel when it opens and goes back to whatever
 * opened it (the avatar, or the header's "Talk to Suzi") when it closes.
 */
export function SuziAvatarAssistant({ onReady }: { onReady?: () => void }) {
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
  const panelId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  /** Whatever had focus when the panel opened, so closing can hand it back. */
  const openerRef = useRef<HTMLElement | null>(null);

  const listingMatch = pathname.match(/^\/property\/([^/]+)/);
  const listing = listingMatch ? (getMockListing(listingMatch[1]) ?? null) : null;

  useEffect(() => {
    if (openedBefore || greetingDismissedBefore) return;
    const id = window.setTimeout(() => setShowGreeting(true), 5000);
    return () => window.clearTimeout(id);
  }, [pathname, openedBefore, greetingDismissedBefore]);

  const openPanel = useCallback(() => {
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
    setOpen(true);
    setShowGreeting(false);
    window.localStorage.setItem(OPENED_KEY, "1");
    if (messages.length === 0) {
      setMessages([{ role: "suzi", text: getGreetingForPage(pathname, listing) }]);
      setTypingIndex(0);
    }
  }, [pathname, listing, messages.length]);

  const closePanel = useCallback(() => {
    setOpen(false);
    // Return focus to the opener; fall back to the avatar when the opener
    // is gone (e.g. a header button inside a mobile menu that has closed).
    const opener = openerRef.current;
    openerRef.current = null;
    const target = opener && document.contains(opener) ? opener : avatarRef.current;
    target?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function dismissGreeting() {
    setShowGreeting(false);
    window.localStorage.setItem(DISMISSED_KEY, "1");
  }

  useEffect(() => {
    window.addEventListener(SUZI_OPEN_EVENT, openPanel);
    return () => window.removeEventListener(SUZI_OPEN_EVENT, openPanel);
  }, [openPanel]);

  // Tells the lazy-load wrapper the listener above is attached, so an
  // "open Suzi" request fired before this chunk arrived can be replayed.
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  async function send(message: string) {
    const text = message.trim();
    if (!text || thinking) return;

    const history = messages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
    const replyIndex = messages.length + 1;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setThinking(true);

    const [reply] = await Promise.all([
      askSuzi({ message: text, route: pathname, listing, history }).catch(() => null),
      new Promise((resolve) => window.setTimeout(resolve, 450)),
    ]);

    setMessages((prev) => [
      ...prev,
      {
        role: "suzi" as const,
        text:
          reply?.text ??
          "Sorry — I couldn't reach my brain just then. Try asking me again?",
      },
    ]);
    setTypingIndex(replyIndex);
    setThinking(false);

    const nav = reply?.navigation;
    if (nav) {
      window.setTimeout(() => router.push(nav.href), 900);
    }
  }

  const suggestions = getPageSuggestions(pathname);
  const quickActions = getQuickActions(pathname);
  const markState = thinking ? "thinking" : "ready";

  return (
    <div
      className="fixed right-4 bottom-24 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {open ? (
        <SuziPanel
          id={panelId}
          panelRef={panelRef}
          state={markState}
          subtitle={listing ? "Ask me about this home" : "Your AI real estate partner"}
          onClose={closePanel}
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
            <div className="flex flex-wrap gap-2 border-t border-border px-4 pt-3">
              {suggestions.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="inline-flex min-h-8 items-center rounded-full border border-border bg-paper-2 px-3 py-1 text-left text-xs font-medium text-ink-2 transition-colors hover:border-brand-500 pointer-coarse:min-h-11 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
          <div className="border-t border-border px-3 py-2.5">
            <SuziQuickActions actions={quickActions} onPrompt={send} />
          </div>
          <div className="border-t border-border p-3">
            <SuziPromptInput
              value={input}
              onChange={setInput}
              onSubmit={send}
              disabled={thinking}
              micFirst={micFirst}
              placeholder="Speak naturally, or type your request…"
            />
          </div>
          <p className="border-t border-border px-4 py-2 text-center text-[0.7rem] leading-snug text-muted">
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

      <SuziAvatarButton
        ref={avatarRef}
        open={open}
        controls={panelId}
        state={markState}
        onClick={open ? closePanel : openPanel}
      />
    </div>
  );
}
