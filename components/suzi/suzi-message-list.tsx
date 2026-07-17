"use client";

import { SuziThinkingIndicator } from "@/components/suzi/suzi-thinking-indicator";
import { TypewriterText } from "@/components/motion/typewriter-text";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";

export interface SuziMessage {
  role: "user" | "suzi";
  text: string;
}

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
    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {messages.map((m, i) => (
        <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
          <p
            className={cn(
              "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
              m.role === "user" ? "rounded-br-md bg-navy-950 text-ivory" : "rounded-bl-md bg-parchment text-navy-800",
            )}
          >
            {m.role === "suzi" && i === typingIndex ? (
              <TypewriterText text={m.text} onDone={onTypingDone} />
            ) : (
              m.text
            )}
          </p>
        </div>
      ))}
      {thinking ? <SuziThinkingIndicator /> : null}
    </div>
  );
}
