"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const PHOTOS = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=500&q=70",
];

/** Each stage optionally names which photo (0-indexed) is actively being scanned. */
const STAGES: { label: string; scanning?: number; done?: boolean }[] = [
  { label: "Uploading photos…" },
  { label: "Analysing image 1 of 3…", scanning: 0 },
  { label: "Analysing image 2 of 3…", scanning: 1 },
  { label: "Analysing image 3 of 3…", scanning: 2 },
  { label: "Living room detected", done: true },
  { label: "Kitchen detected", done: true },
  { label: "Sea view detected", done: true },
  { label: "Terrace detected", done: true },
  { label: "3 bedrooms detected", done: true },
  { label: "Modern style detected", done: true },
  { label: "Natural light detected", done: true },
  { label: "Generating title…" },
  { label: "Writing description…" },
  { label: "Creating lifestyle text…" },
  { label: "Estimating market value…" },
  { label: "Creating buyer FAQ…" },
  { label: "Translating to 6 languages…" },
  { label: "Creating property AI assistant…" },
  { label: "Preparing listing…" },
  { label: "Ready to publish." },
];

const RESULT_TITLE = "Whitewashed Villa with Pool and Montgó Views";
const CYCLE_MS = 550;
const PAUSE_STAGES = 4; // extra ticks to hold on the finished result before looping

export function LiveDemo() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStage((s) => (s + 1) % (STAGES.length + PAUSE_STAGES));
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  const done = stage >= STAGES.length;
  const visibleCount = Math.min(stage + 1, STAGES.length);
  const current = STAGES[Math.min(stage, STAGES.length - 1)];
  const progressPct = Math.round((visibleCount / STAGES.length) * 100);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="grid grid-cols-3 gap-2">
        {PHOTOS.map((src, i) => {
          const scanning = !done && current.scanning === i;
          return (
            <div
              key={src}
              className={`relative aspect-square overflow-hidden rounded-lg bg-sand transition-shadow duration-300 ${
                scanning ? "ring-2 ring-gold-400" : ""
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="150px" />
              {!done ? (
                <motion.div
                  className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-gold-300/0 via-gold-200/50 to-gold-300/0"
                  animate={{ top: ["-33%", "100%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-line bg-white p-6">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-parchment">
          <motion.div
            className="h-full rounded-full bg-gold-500"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {STAGES.slice(0, visibleCount).map((s, i) => {
            const isActive = i === visibleCount - 1 && !done;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2.5 text-sm"
              >
                {isActive ? (
                  <motion.span
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-gold-400 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                )}
                <span className={isActive ? "text-navy-500" : "text-navy-900"}>{s.label}</span>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 border-t border-line pt-5"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-gold-600 uppercase">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Generated by Zouza
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold text-navy-950">{RESULT_TITLE}</p>
              <p className="mt-1 text-sm text-navy-500">
                4 bed · 3 bath · 210 m² · Jávea · Ready to publish
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
