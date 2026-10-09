"use client";

import { SuziHeroVisual } from "@/components/home/suzi-hero-visual";
import { SuziPromptInput } from "@/components/home/suzi-prompt-input";
import { ThinkingDots } from "@/components/motion/thinking-dots";
import { TypewriterText } from "@/components/motion/typewriter-text";
import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ChatTurn {
  role: "user" | "ai";
  text: string;
  href?: string;
  action?: string;
}

const STARTER_PROMPTS = [
  "Villa in Marbella with sea view",
  "Apartment for rent in Madrid",
  "Find a home near the beach",
];

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function heroReply(message: string): ChatTurn {
  if (/\b(sell|seller|list|listing|owner)\b/i.test(message)) {
    return {
      role: "ai",
      text: "Share the details you have and review a listing draft before it goes live.",
      href: "/list-with-ai",
      action: "Start a listing draft",
    };
  }
  return {
    role: "ai",
    text: "Search example properties by location, budget, and home type, then ask about the details shown on a listing.",
    href: "/ai-search",
    action: "Search example homes",
  };
}

export function Hero() {
  const reducedMotion = useReducedMotion();
  const micFirst = useClientSnapshot(isTouchDevice, false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [turns, thinking, reducedMotion]);

  function ask(message: string) {
    const text = message.trim();
    if (!text || thinking) return;
    setTurns((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setTurns((prev) => {
        const next = [...prev, heroReply(text)];
        setTypingIndex(next.length - 1);
        return next;
      });
      setThinking(false);
    }, 700);
  }

  const active = thinking || typingIndex !== null;

  return (
    <section className="container-page grid grid-cols-1 gap-8 pt-16 pb-12 md:pt-24 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-12">
      <div className="min-w-0">
        <motion.p
          className="eyebrow"
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          AI-powered real estate platform
        </motion.p>
        <motion.h1
          className="mt-3 max-w-xl text-4xl leading-[1.08] font-semibold text-navy-950 sm:text-5xl"
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.05 }}
        >
          Tell Suzi what you&rsquo;re looking for.
        </motion.h1>
        <motion.p
          className="mt-3 max-w-lg text-lg leading-relaxed text-navy-600"
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.12 }}
        >
          Ask about example homes by typing or speaking naturally.
        </motion.p>

        <motion.div
          className={cn(
            "mt-8 rounded-xl border bg-white shadow-card transition-shadow duration-500 motion-reduce:transition-none",
            active ? "border-gold-300 shadow-[0_0_0_4px_rgba(179,148,90,0.12)]" : "border-line",
          )}
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.15 }}
        >
        {turns.length > 0 || thinking ? (
          <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto px-5 py-4">
            {turns.map((t, i) => (
              <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <p
                  className={
                    t.role === "user"
                      ? "max-w-[85%] rounded-xl rounded-br-md bg-navy-950 px-4 py-2.5 text-sm leading-relaxed text-ivory"
                      : "max-w-[85%] rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm leading-relaxed text-navy-800"
                  }
                >
                  {t.role === "ai" && i === typingIndex ? (
                    <TypewriterText text={t.text} onDone={() => setTypingIndex(null)} />
                  ) : (
                    t.text
                  )}
                  {t.href && t.action && i !== typingIndex ? (
                    <Link href={t.href} className="mt-2 block font-medium text-navy-700 underline underline-offset-2 hover:text-navy-950">
                      {t.action}
                    </Link>
                  ) : null}
                </p>
              </div>
            ))}
            {thinking ? (
              <div className="flex justify-start">
                <p className="flex items-center gap-2 rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm text-navy-500">
                  Suzi is thinking <ThinkingDots />
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="px-5 pt-4">
            <p className="text-xs font-medium tracking-wide text-navy-400 uppercase">Try something like</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => ask(p)}
                  className="rounded-full border border-line bg-parchment px-3 py-1.5 text-left text-xs font-medium text-navy-700 transition-colors hover:border-gold-500 cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3">
          <SuziPromptInput
            value={input}
            onChange={setInput}
            onSubmit={ask}
            disabled={thinking}
            micFirst={micFirst}
            placeholder="I'm moving to Marbella with a €900,000 budget…"
          />
        </div>
        </motion.div>
      </div>
      <motion.div
        className="mx-auto w-full max-w-md lg:max-w-none"
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.2 }}
      >
        <SuziHeroVisual portraitSrc="/images/suzi-portrait.png" />
      </motion.div>
    </section>
  );
}
