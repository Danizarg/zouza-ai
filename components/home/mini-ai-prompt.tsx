"use client";

import { ThinkingDots } from "@/components/motion/thinking-dots";
import { TypewriterText } from "@/components/motion/typewriter-text";
import { chatRespond } from "@/lib/ai/service";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";

/** Compact single-turn AI prompt field — used in the homepage final CTA to echo the hero panel. */
export function MiniAiPrompt() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [typing, setTyping] = useState(false);

  function ask(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    setThinking(true);
    setReply(null);
    window.setTimeout(() => {
      setThinking(false);
      setTyping(true);
      setReply(chatRespond(text));
    }, 650);
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-ivory/15 bg-navy-900 p-1.5">
      <form onSubmit={ask} className="flex items-center gap-2 p-1">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-500/20 text-gold-300">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell Zouza what you want to do…"
          aria-label="Tell Zouza what you want to do"
          className="min-w-0 flex-1 bg-transparent text-sm text-ivory placeholder:text-navy-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          aria-label="Send"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-500 text-navy-950 disabled:opacity-40 cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      </form>
      {thinking || reply ? (
        <div className="border-t border-ivory/10 px-4 py-3 text-sm text-navy-200">
          {thinking ? (
            <span className="flex items-center gap-2 text-navy-400">
              Zouza is thinking <ThinkingDots />
            </span>
          ) : reply ? (
            typing ? (
              <TypewriterText text={reply} onDone={() => setTyping(false)} />
            ) : (
              reply
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
