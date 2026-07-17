"use client";

import { ThinkingDots } from "@/components/motion/thinking-dots";
import { TypewriterText } from "@/components/motion/typewriter-text";
import { answerAgentQuestion, SUGGESTED_AGENT_QUESTIONS } from "@/lib/ai/service";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BadgeCheck, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

export function AgentChat({ listing }: { listing: Listing }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text: `Hola! I'm Suzi, your AI real estate partner for “${listing.title}”. Ask me about availability, real costs, pets, parking, or the neighbourhood — I answer from this listing's verified facts.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => {
        const next = [...prev, { role: "agent" as const, text: answerAgentQuestion(listing, q) }];
        setTypingIndex(next.length - 1);
        return next;
      });
      setThinking(false);
    }, 650);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center gap-3 border-b border-line bg-navy-900 px-5 py-4">
        <motion.span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/20 text-gold-300"
          animate={thinking ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={{ duration: 1, repeat: thinking ? Infinity : 0 }}
        >
          <Sparkles className="h-4.5 w-4.5" aria-hidden />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ivory">Ask Suzi about this home</p>
          <p className="text-xs text-navy-300">Answers 24/7 from this listing&rsquo;s data</p>
        </div>
        {listing.verified_property ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-500/15 px-2 py-1 text-[0.65rem] font-medium text-gold-300">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            Verified
          </span>
        ) : null}
      </div>

      <div ref={scrollRef} className="h-80 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <p
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user" ? "rounded-br-md bg-navy-900 text-ivory" : "rounded-bl-md bg-parchment text-navy-800",
              )}
            >
              {m.role === "agent" && i === typingIndex ? (
                <TypewriterText text={m.text} onDone={() => setTypingIndex(null)} />
              ) : (
                m.text
              )}
            </p>
          </div>
        ))}
        {thinking ? (
          <div className="flex justify-start">
            <p className="flex items-center gap-2 rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm text-navy-500">
              Suzi is typing <ThinkingDots />
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line bg-ivory px-5 pt-3">
        {SUGGESTED_AGENT_QUESTIONS.slice(0, 4).map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            disabled={thinking}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-gold-500 disabled:opacity-50 cursor-pointer"
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
        className="flex items-center gap-2 border-t border-line bg-ivory px-5 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Suzi about this property…"
          aria-label="Ask Suzi about this property"
          className="flex-1 rounded-lg border border-line bg-white px-4 py-2 text-sm focus:border-navy-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-ivory disabled:opacity-40 cursor-pointer"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
