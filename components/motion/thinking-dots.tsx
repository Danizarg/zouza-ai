"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Three-dot "AI is thinking" indicator, used everywhere Zouza is composing a reply. */
export function ThinkingDots({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`} aria-label="Zouza is thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-navy-400"
          animate={reducedMotion ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={reducedMotion ? undefined : { duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}
