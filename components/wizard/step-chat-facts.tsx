"use client";

import { Button } from "@/components/ui/button";
import type { ListingFacts } from "@/lib/types";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatTurn {
  role: "ai" | "user";
  text: string;
}

interface QuestionStep {
  ask: string;
  apply: (answer: string, facts: ListingFacts) => ListingFacts | null; // null = couldn't parse, re-ask
  retry: string;
}

function buildSteps(forRent: boolean): QuestionStep[] {
  return [
    {
      ask: "First, where's the property? (e.g. \"Tosalet, Jávea\")",
      apply: (answer, facts) => {
        if (!answer.trim()) return null;
        const [area, city] = answer.split(",").map((s) => s.trim());
        return { ...facts, address_area: area, city: city || area };
      },
      retry: "I need at least a city or area name to continue.",
    },
    {
      ask: "How many bedrooms?",
      apply: (answer, facts) => {
        const n = parseInt(answer.replace(/\D/g, ""), 10);
        if (Number.isNaN(n)) return null;
        return { ...facts, bedrooms: n };
      },
      retry: "Just a number, e.g. \"3\".",
    },
    {
      ask: "And how many bathrooms?",
      apply: (answer, facts) => {
        const n = parseInt(answer.replace(/\D/g, ""), 10);
        if (Number.isNaN(n)) return null;
        return { ...facts, bathrooms: n };
      },
      retry: "Just a number, e.g. \"2\".",
    },
    {
      ask: "What's the size, in m²?",
      apply: (answer, facts) => {
        const n = parseInt(answer.replace(/\D/g, ""), 10);
        if (Number.isNaN(n)) return null;
        return { ...facts, size_m2: n };
      },
      retry: "Just the number of square metres, e.g. \"90\".",
    },
    {
      ask: "Is it furnished?",
      apply: (answer, facts) => {
        const a = answer.toLowerCase();
        if (/(yes|yeah|furnish)/.test(a)) return { ...facts, furnished: true };
        if (/(no|not|unfurnish)/.test(a)) return { ...facts, furnished: false };
        return null;
      },
      retry: "Just yes or no.",
    },
    {
      ask: "Are pets allowed?",
      apply: (answer, facts) => {
        const a = answer.toLowerCase();
        if (/(yes|yeah|welcome|ok)/.test(a)) return { ...facts, pets_allowed: true };
        if (/(no|not)/.test(a)) return { ...facts, pets_allowed: false };
        return null;
      },
      retry: "Just yes or no.",
    },
    {
      ask: "Any pool, sea view, or garage? Mention any that apply, or say \"none\".",
      apply: (answer, facts) => {
        const a = answer.toLowerCase();
        return {
          ...facts,
          pool: /pool/.test(a) || facts.pool,
          sea_view: /(sea|view|beach)/.test(a) || facts.sea_view,
          garage: /(garage|parking)/.test(a) || facts.garage,
        };
      },
      retry: "Just tell me which apply, or say \"none\".",
    },
    {
      ask: forRent ? "What's the monthly rent, in euros?" : "What's the asking price, in euros?",
      apply: (answer, facts) => {
        const n = parseInt(answer.replace(/[^\d]/g, ""), 10);
        if (Number.isNaN(n) || n <= 0) return null;
        return forRent
          ? { ...facts, price: n, deposit: n, utilities_monthly: Math.round(n * 0.1) }
          : { ...facts, price: n };
      },
      retry: "Just the number, e.g. \"1500\" or \"450000\".",
    },
  ];
}

/** Chat-driven replacement for a facts form — the owner answers a short sequence of questions instead of filling fields. */
export function StepChatFacts({
  facts,
  onChange,
  onBack,
  onContinue,
}: {
  facts: ListingFacts;
  onChange: (facts: ListingFacts) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [steps] = useState(() => buildSteps(facts.intent === "rent_out"));
  const [stepIndex, setStepIndex] = useState(0);
  const [turns, setTurns] = useState<ChatTurn[]>(() => [{ role: "ai", text: steps[0].ask }]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  function submit() {
    const answer = input.trim();
    if (!answer || done) return;
    setInput("");
    const step = steps[stepIndex];
    const next = step.apply(answer, facts);

    if (!next) {
      setTurns((prev) => [...prev, { role: "user", text: answer }, { role: "ai", text: step.retry }]);
      return;
    }

    onChange(next);
    const isLast = stepIndex === steps.length - 1;
    setTurns((prev) => [
      ...prev,
      { role: "user", text: answer },
      { role: "ai", text: isLast ? "Perfect — I'll include all of that. Generating your listing now…" : steps[stepIndex + 1].ask },
    ]);

    if (isLast) {
      setDone(true);
      window.setTimeout(onContinue, 900);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950 sm:text-3xl">A few quick questions</h1>
      <p className="mt-2 text-navy-600">
        Answer like you would in a chat — Zouza fills in the rest.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-line bg-white">
        <div ref={scrollRef} className="h-96 space-y-3 overflow-y-auto px-5 py-4">
          {turns.map((t, i) => (
            <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={
                  t.role === "user"
                    ? "max-w-[80%] rounded-xl rounded-br-md bg-navy-950 px-4 py-2.5 text-sm leading-relaxed text-ivory"
                    : "max-w-[80%] rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm leading-relaxed text-navy-800"
                }
              >
                {t.text}
              </p>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-2 border-t border-line bg-ivory px-5 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={done ? "" : "Type your answer…"}
            disabled={done}
            aria-label="Your answer"
            autoFocus
            className="flex-1 rounded-lg border border-line bg-white px-4 py-2 text-sm focus:border-navy-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={done || !input.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-ivory disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} disabled={done}>
          Back
        </Button>
      </div>
    </div>
  );
}
