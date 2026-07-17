"use client";

import { ThinkingDots } from "@/components/motion/thinking-dots";
import { TypewriterText } from "@/components/motion/typewriter-text";
import { cn } from "@/lib/utils";
import { Keyboard, Mic } from "lucide-react";
import { useEffect, useState } from "react";

interface Example {
  key: string;
  tab: string;
  mode: "voice" | "type";
  prompt: string;
  reply: string;
}

const EXAMPLES: Example[] = [
  {
    key: "buy",
    tab: "Buy",
    mode: "type",
    prompt: "Villa in Marbella with sea view",
    reply:
      "Got it. I've got a verified villa on the Golden Mile — 5 beds, infinity pool, sea views, €2.95M. Want me to show it, or narrow by budget first?",
  },
  {
    key: "rent",
    tab: "Rent",
    mode: "voice",
    prompt: "Apartment for rent in Madrid",
    reply:
      "We're growing fastest along Spain's coast right now, so I don't have verified Madrid listings yet — tell me your budget and I'll notify you the moment a strong match appears.",
  },
  {
    key: "sell",
    tab: "Sell",
    mode: "type",
    prompt: "Sell my property",
    reply:
      "I can have your listing ready in minutes. Upload a few photos and I'll detect the rooms and features, then draft the title, description and price estimate for you to review.",
  },
  {
    key: "list",
    tab: "List",
    mode: "voice",
    prompt: "Help me list my property from photos",
    reply:
      "Perfect — drag your photos in and I'll detect bedrooms, pool, sea view and more automatically, then write the whole listing for you to approve.",
  },
  {
    key: "invest",
    tab: "Invest",
    mode: "type",
    prompt: "Investment opportunities",
    reply:
      "For rental yield, I'd look at Alicante or Valencia — lower entry price, strong tenant demand near the coast. Want me to pull verified listings with the numbers worked out?",
  },
];

/** Tabbed showcase of Suzi handling every intent — buy, rent, sell, list, invest — in both voice and type mode. */
export function ConversationShowcase() {
  const [activeKey, setActiveKey] = useState(EXAMPLES[0].key);
  const active = EXAMPLES.find((e) => e.key === activeKey) ?? EXAMPLES[0];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex flex-wrap gap-1.5 border-b border-line bg-parchment p-2">
        {EXAMPLES.map((e) => (
          <button
            key={e.key}
            type="button"
            onClick={() => setActiveKey(e.key)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              e.key === activeKey ? "bg-navy-950 text-ivory" : "text-navy-600 hover:bg-white",
            )}
          >
            {e.tab}
          </button>
        ))}
      </div>

      <ExchangeBubble key={active.key} example={active} />
    </div>
  );
}

function ExchangeBubble({ example }: { example: Example }) {
  const [thinking, setThinking] = useState(true);
  const [typingDone, setTypingDone] = useState(false);

  // Remounted fresh per `key={example.key}` from the parent, so this only
  // ever runs once for the example currently shown — no reset needed.
  useEffect(() => {
    const id = window.setTimeout(() => setThinking(false), 600);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="space-y-3 px-5 py-5">
      <div className="flex justify-end">
        <p className="flex max-w-[85%] items-center gap-2 rounded-xl rounded-br-md bg-navy-950 px-4 py-2.5 text-sm leading-relaxed text-ivory">
          {example.mode === "voice" ? (
            <Mic className="h-3.5 w-3.5 shrink-0 text-gold-300" aria-hidden />
          ) : (
            <Keyboard className="h-3.5 w-3.5 shrink-0 text-gold-300" aria-hidden />
          )}
          {example.prompt}
        </p>
      </div>
      {thinking ? (
        <div className="flex justify-start">
          <p className="flex items-center gap-2 rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm text-navy-500">
            Suzi is thinking <ThinkingDots />
          </p>
        </div>
      ) : (
        <div className="flex justify-start">
          <p className="max-w-[85%] rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm leading-relaxed text-navy-800">
            {typingDone ? example.reply : <TypewriterText text={example.reply} onDone={() => setTypingDone(true)} />}
          </p>
        </div>
      )}
    </div>
  );
}
