"use client";

import { ZMark, ZPulse } from "@/components/brand/z-mark";
import { BadgeCheck, FileText, MessageCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";

const STAGES = [
  { icon: Search, label: "Analysing photos" },
  { icon: BadgeCheck, label: "Detecting features" },
  { icon: FileText, label: "Writing exposé" },
  { icon: MessageCircle, label: "Creating FAQ" },
  { icon: ZMark, label: "Teaching Suzi this property" },
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
      {/* Suzi's mark in its "thinking" state: the stroke draws itself in a
          1.8s loop (CSS-only, still under prefers-reduced-motion). */}
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-900 text-brand-300">
        <ZPulse state="thinking" className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold text-ink sm:text-3xl">
        Suzi is creating your listing
      </h1>
      <p className="mt-2 max-w-sm text-muted">This usually takes a few seconds.</p>

      <ul className="mt-8 w-full max-w-sm space-y-2.5 text-left">
        {STAGES.map((stage, i) => {
          const state = i < activeStage ? "done" : i === activeStage ? "active" : "pending";
          return (
            <li
              key={stage.label}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                state === "pending"
                  ? "border-border bg-white text-muted"
                  : "border-brand-100 bg-brand-50 text-ink"
              }`}
            >
              <stage.icon
                className={`h-4 w-4 shrink-0 ${state === "active" ? "animate-pulse text-brand-600" : state === "done" ? "text-brand-600" : "text-faint"}`}
                aria-hidden
              />
              {stage.label}
              {state === "done" ? <BadgeCheck className="ml-auto h-4 w-4 text-brand-600" aria-hidden /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
