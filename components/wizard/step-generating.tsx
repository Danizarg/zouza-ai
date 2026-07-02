"use client";

import { motion } from "framer-motion";
import { BadgeCheck, FileText, Languages, MessageCircle, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const STAGES = [
  { icon: Search, label: "Analysing photos" },
  { icon: BadgeCheck, label: "Detecting features" },
  { icon: FileText, label: "Writing exposé" },
  { icon: MessageCircle, label: "Creating FAQ" },
  { icon: Languages, label: "Preparing translations" },
  { icon: Sparkles, label: "Building property AI agent" },
] as const;

/** Purely presentational — advances a progress narrative while the caller awaits the real (or mock) AI call. */
export function StepGenerating({ onDone }: { onDone: () => void }) {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (activeStage >= STAGES.length) {
      const t = window.setTimeout(onDone, 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setActiveStage((s) => s + 1), 650);
    return () => window.clearTimeout(t);
  }, [activeStage, onDone]);

  return (
    <div className="flex flex-col items-center py-10 text-center">
      <motion.span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-gold-300"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="h-7 w-7" aria-hidden />
      </motion.span>
      <h1 className="mt-6 text-2xl font-semibold text-navy-950 sm:text-3xl">
        Aurora is creating your listing
      </h1>
      <p className="mt-2 max-w-sm text-navy-600">
        This normally takes a few seconds — writing something a real agent
        would charge for.
      </p>

      <ul className="mt-8 w-full max-w-sm space-y-2.5 text-left">
        {STAGES.map((stage, i) => {
          const state = i < activeStage ? "done" : i === activeStage ? "active" : "pending";
          return (
            <li
              key={stage.label}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                state === "pending"
                  ? "border-line bg-white text-navy-400"
                  : "border-gold-200 bg-gold-100 text-navy-900"
              }`}
            >
              <stage.icon
                className={`h-4 w-4 shrink-0 ${state === "active" ? "animate-pulse text-gold-600" : state === "done" ? "text-gold-600" : "text-navy-300"}`}
                aria-hidden
              />
              {stage.label}
              {state === "done" ? <BadgeCheck className="ml-auto h-4 w-4 text-gold-600" aria-hidden /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
