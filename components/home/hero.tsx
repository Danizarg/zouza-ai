"use client";

import { chatRespond } from "@/lib/ai/service";
import { MOCK_AI_CHAT_EXAMPLES } from "@/lib/mock-data";
import { buttonClasses } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ChatTurn {
  role: "user" | "ai";
  text: string;
}

const STARTER_PROMPTS = MOCK_AI_CHAT_EXAMPLES.slice(0, 4).map((e) => e.prompt);

export function Hero() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
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
      setTurns((prev) => [...prev, { role: "ai", text: chatRespond(text) }]);
      setThinking(false);
    }, 700);
  }

  return (
    <section className="container-page grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.05fr]">
      <div>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          The AI operating system for real estate
        </motion.p>
        <motion.h1
          className="mt-4 text-4xl leading-[1.08] font-semibold text-navy-950 sm:text-5xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Your AI real estate partner.
        </motion.h1>
        <motion.p
          className="mt-5 max-w-lg text-lg leading-relaxed text-navy-600"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
        >
          Buy, rent, sell, or list a property — tell Zouza what you want to do,
          and the AI does the work: search, listings, pricing, and the
          questions you&rsquo;d normally ask an agent.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/list-with-ai" className={buttonClasses("primary", "lg")}>
            <Sparkles className="h-4.5 w-4.5" aria-hidden />
            Start with AI
          </Link>
          <Link href="/explore" className={buttonClasses("outline", "lg")}>
            Explore homes
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>
      </div>

      {/* AI interaction panel — the hero centerpiece */}
      <motion.div
        className="rounded-xl border border-line bg-white shadow-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <div className="flex items-center gap-3 border-b border-line bg-navy-950 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/20 text-gold-300">
            <Sparkles className="h-4.5 w-4.5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-ivory">Zouza</p>
            <p className="text-xs text-navy-300">What would you like to do today?</p>
          </div>
        </div>

        <div ref={scrollRef} className="h-72 space-y-3 overflow-y-auto px-5 py-4">
          {turns.length === 0 ? (
            <p className="text-sm text-navy-500">
              Try one of the prompts below, or type your own — buying, renting,
              selling, or listing a property.
            </p>
          ) : null}
          {turns.map((t, i) => (
            <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={
                  t.role === "user"
                    ? "max-w-[85%] rounded-xl rounded-br-md bg-navy-950 px-4 py-2.5 text-sm leading-relaxed text-ivory"
                    : "max-w-[85%] rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm leading-relaxed text-navy-800"
                }
              >
                {t.text}
              </p>
            </div>
          ))}
          {thinking ? (
            <div className="flex justify-start">
              <p className="rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm text-navy-400">
                Zouza is thinking…
              </p>
            </div>
          ) : null}
        </div>

        {turns.length === 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-line bg-ivory px-5 pt-3">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => ask(p)}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-xs font-medium text-navy-700 transition-colors hover:border-gold-500 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}

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
            placeholder="I'm moving to Marbella with a €900,000 budget…"
            aria-label="Tell Zouza what you want to do"
            className="flex-1 rounded-lg border border-line bg-white px-4 py-2 text-sm focus:border-navy-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-ivory disabled:opacity-40 cursor-pointer"
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </motion.div>
    </section>
  );
}
