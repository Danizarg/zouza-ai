"use client";

import { SuziHeroVisual } from "@/components/home/suzi-hero-visual";
import { SuziPromptInput } from "@/components/home/suzi-prompt-input";
import { ThinkingDots } from "@/components/motion/thinking-dots";
import { TypewriterText } from "@/components/motion/typewriter-text";
import { chatRespond } from "@/lib/ai/service";
import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ChatTurn {
  role: "user" | "ai";
  text: string;
}

const STARTER_PROMPTS = [
  "Villa in Marbella with sea view",
  "Apartment for rent in Madrid",
  "Sell my property",
  "Investment opportunities",
];

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function Hero() {
  const micFirst = useClientSnapshot(isTouchDevice, false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, thinking]);

  function ask(message: string) {
    const text = message.trim();
    if (!text || thinking) return;
    setTurns((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setTurns((prev) => {
        const next = [...prev, { role: "ai" as const, text: chatRespond(text) }];
        setTypingIndex(next.length - 1);
        return next;
      });
      setThinking(false);
    }, 700);
  }

  const active = thinking || typingIndex !== null;

  return (
    <section className="container-page grid grid-cols-1 gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      {/* 1. Header text — always first */}
      <div className="order-1 lg:col-start-1 lg:row-start-1">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI-powered real estate platform
        </motion.p>
        <motion.h1
          className="mt-4 text-4xl leading-[1.08] font-semibold text-navy-950 sm:text-5xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Just tell Suzi what you need.
          <br />
          She&rsquo;ll do the rest.
        </motion.h1>
        <motion.p
          className="mt-5 max-w-lg text-lg leading-relaxed text-navy-600"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
        >
          The easy way to buy, rent, sell or list a property. Suzi helps you
          find the right home or sell yours faster — simply by talking or
          typing.
        </motion.p>
      </div>

      {/* 2. Suzi module — portrait + card, side by side on desktop, portrait first on mobile */}
      <motion.div
        className="order-2 lg:col-start-2 lg:row-start-1"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <SuziHeroVisual portraitSrc="/images/suzi-portrait.png" />
      </motion.div>

      {/* 3. Suzi conversation — the interaction entry point, not a search bar */}
      <motion.div
        className={cn(
          "order-3 rounded-xl border bg-white shadow-card transition-shadow duration-500 lg:col-start-1 lg:row-start-2",
          active ? "border-gold-300 shadow-[0_0_0_4px_rgba(179,148,90,0.12)]" : "border-line",
        )}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
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
    </section>
  );
}
