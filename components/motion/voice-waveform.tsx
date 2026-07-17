"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const BARS = [0, 1, 2, 3, 4];

/** Small animated waveform shown while Suzi is listening for voice input. */
export function VoiceWaveform({ active, className }: { active: boolean; className?: string }) {
  return (
    <div className={cn("flex h-4 items-end gap-0.5", className)} aria-hidden>
      {BARS.map((i) => (
        <motion.span
          key={i}
          className="w-0.5 rounded-full bg-current"
          animate={active ? { height: [4, 16, 7, 13, 4] } : { height: 4 }}
          transition={
            active
              ? { duration: 0.9, repeat: Infinity, delay: i * 0.09, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}
