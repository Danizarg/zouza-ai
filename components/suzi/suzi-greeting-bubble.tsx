"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

/** The small proactive greeting that appears next to the collapsed avatar — one nudge, dismissible. */
export function SuziGreetingBubble({
  text,
  onOpen,
  onDismiss,
}: {
  text: string;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="relative max-w-[220px] rounded-xl rounded-br-md border border-line bg-white py-3 pr-7 pl-3.5 text-sm leading-snug text-navy-800 shadow-card"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center text-navy-400 hover:text-navy-700 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button type="button" onClick={onOpen} className="cursor-pointer text-left">
        {text}
      </button>
    </motion.div>
  );
}
