"use client";

import { ThinkingDots } from "@/components/motion/thinking-dots";
import { TypewriterText } from "@/components/motion/typewriter-text";
import { askSuzi } from "@/app/actions";
import { ZPulse } from "@/components/brand/z-mark";
import { SUGGESTED_AGENT_QUESTIONS } from "@/lib/ai/service";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BadgeCheck, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

export function AgentChat({ listing }: { listing: Listing }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text: `Hola! I'm Suzi, your AI real estate partner for “${listing.title}”. Ask me about availability, real costs, pets, parking, or the neighbourhood — I answer from ${
        listing.verified_property ? "this listing's verified facts" : "this listing's details"
      }.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;

    const history = messages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
    const replyIndex = messages.length + 1;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setThinking(true);

    const [reply] = await Promise.all([
      askSuzi({
        message: q,
        route: `/property/${listing.id}`,
        listing,
        history,
      }).catch(() => null),
      new Promise((resolve) => window.setTimeout(resolve, 400)),
    ]);

    setMessages((prev) => [
      ...prev,
      {
        role: "agent" as const,
        text:
          reply?.text ??
          "Sorry — I couldn't reach my brain just then. Ask me again and I'll answer from this listing's data.",
      },
    ]);
    setTypingIndex(replyIndex);
    setThinking(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex items-center gap-3 border-b border-border bg-brand-900 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
          <ZPulse state={thinking ? "thinking" : "ready"} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-paper">Ask Suzi about this home</p>
          <p className="text-xs text-brand-300">Answers 24/7 from this listing&rsquo;s data</p>
        </div>
        {listing.verified_property ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-500/15 px-2 py-1 text-[0.65rem] font-medium text-brand-300">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            Verified
          </span>
        ) : null}
      </div>

      {/* The conversation is a polite live region so replies are announced.
          Suzi's text is rendered twice on purpose: the visible copy (which
          may be mid-typewriter) is hidden from assistive tech, and a
          visually hidden copy carries the full reply so it is announced
          once, not once per character. The region is focusable so the
          80-unit scroller is reachable from the keyboard. */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with Suzi"
        tabIndex={0}
        className="h-80 space-y-3 overflow-y-auto px-5 py-4 focus-visible:-outline-offset-2"
      >
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <p
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user" ? "rounded-br-md bg-brand-900 text-paper" : "rounded-bl-md bg-paper-2 text-ink-2",
              )}
            >
              {m.role === "agent" ? (
                <>
                  <span aria-hidden>
                    {i === typingIndex ? (
                      <TypewriterText text={m.text} onDone={() => setTypingIndex(null)} />
                    ) : (
                      m.text
                    )}
                  </span>
                  <span className="sr-only">{m.text}</span>
                </>
              ) : (
                m.text
              )}
            </p>
          </div>
        ))}
        {thinking ? (
          <div className="flex justify-start">
            <p className="flex items-center gap-2 rounded-xl rounded-bl-md bg-paper-2 px-4 py-2.5 text-sm text-muted">
              Suzi is typing
              <span aria-hidden>
                <ThinkingDots />
              </span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border bg-paper px-5 pt-3">
        {SUGGESTED_AGENT_QUESTIONS.slice(0, 4).map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            disabled={thinking}
            className="min-h-11 cursor-pointer rounded-full border border-border bg-white px-4 text-sm font-medium text-ink-2 transition-colors hover:border-brand-500 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2 border-t border-border bg-paper px-5 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Suzi about this property…"
          aria-label="Ask Suzi about this property"
          className="min-h-11 flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-brand-900 text-paper disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
