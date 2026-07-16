"use client";

import { answerAgentQuestion } from "@/lib/ai/service";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const demoListing = MOCK_LISTINGS.find((l) => l.id === "l-marbella-villa") ?? MOCK_LISTINGS[0];

const starterQuestions = [
  "Are there community fees?",
  "How far is it from the beach?",
  "Are dogs allowed?",
  "What is included in the price?",
];

interface DemoMessage {
  role: "user" | "agent";
  text: string;
}

/** Interactive demo of the per-listing AI property agent, on real demo data. */
export function AgentDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      role: "agent",
      text: `Hola! I'm the Zouza assistant for “${demoListing.title}”. Ask me anything about this home — availability, costs, pets, the neighbourhood.`,
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function ask(question: string) {
    if (thinking) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: answerAgentQuestion(demoListing, question) },
      ]);
      setThinking(false);
    }, 700);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center gap-3 border-b border-line bg-navy-900 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/20 text-gold-300">
          <Sparkles className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-ivory">Talk to this property&rsquo;s AI</p>
          <p className="text-xs text-navy-300">
            {demoListing.title.split(",")[0]} · answers 24/7 from listing data
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="h-72 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <p
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "rounded-br-md bg-navy-900 text-ivory"
                  : "rounded-bl-md bg-parchment text-navy-800",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {thinking ? (
          <div className="flex justify-start">
            <p className="rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm text-navy-400">
              Zouza is typing…
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line bg-ivory px-5 py-4">
        {starterQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            disabled={thinking}
            className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-gold-500 hover:text-navy-900 disabled:opacity-50 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
