"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * The small proactive greeting next to the collapsed avatar — one nudge,
 * dismissible. role="status" so it is announced politely when it appears.
 */
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
      role="status"
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="relative max-w-[240px] rounded-xl rounded-br-md border border-border bg-white py-3 pr-10 pl-3.5 text-sm leading-snug text-ink-2 shadow-card pointer-coarse:pr-12"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss Suzi's greeting"
        className="absolute top-0 right-0 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink-2 cursor-pointer pointer-coarse:h-11 pointer-coarse:w-11"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <button type="button" onClick={onOpen} className="cursor-pointer rounded-md text-left">
        {text}
      </button>
    </motion.div>
  );
}
