"use client";

import { SuziThinkingIndicator } from "@/components/suzi/suzi-thinking-indicator";
import { TypewriterText } from "@/components/motion/typewriter-text";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";

export interface SuziMessage {
  role: "user" | "suzi";
  text: string;
}

/**
 * The transcript. The scroll container is a polite live log, so each new
 * message is announced once as it is appended, and it is a tab stop so
 * keyboard users can scroll it. Suzi's replies type out visually, but the
 * typed-out copy is hidden from assistive tech and a complete sr-only copy
 * sits beside it — otherwise the live region would announce every
 * keystroke of the typewriter, or the reply twice (once while typing, once
 * when the finished text replaced it). The thinking indicator lives
 * outside the log so its own status region is not nested inside it.
 */
export function SuziMessageList({
  messages,
  thinking,
  typingIndex,
  onTypingDone,
  scrollRef,
}: {
  messages: SuziMessage[];
  thinking: boolean;
  typingIndex: number | null;
  onTypingDone: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Conversation with Suzi"
        tabIndex={0}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4 focus-visible:outline-offset-[-2px]"
      >
        {messages.map((m, i) => {
          const fromSuzi = m.role === "suzi";
          return (
            <div key={i} className={cn("flex", fromSuzi ? "justify-start" : "justify-end")}>
              <p
                className={cn(
                  "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                  fromSuzi
                    ? "rounded-bl-md bg-paper-2 text-ink-2"
                    : "rounded-br-md bg-brand-900 text-paper",
                )}
              >
                {fromSuzi ? (
                  <>
                    <span aria-hidden="true">
                      {i === typingIndex ? (
                        <TypewriterText text={m.text} onDone={onTypingDone} />
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
          );
        })}
      </div>
      <SuziThinkingIndicator active={thinking} />
    </>
  );
}
