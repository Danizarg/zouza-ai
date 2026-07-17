"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode, Ref } from "react";

export function SuziPanel({
  subtitle,
  onClose,
  panelRef,
  children,
}: {
  subtitle: string;
  onClose: () => void;
  panelRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="Suzi, your AI real estate partner"
      tabIndex={-1}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex h-[min(560px,75vh)] w-[min(380px,92vw)] flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-line bg-navy-950 px-4 py-3.5">
        <span
          className="h-9 w-9 shrink-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #E8CFA0 0%, #B3945A 45%, #0F1B33 100%)",
          }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ivory">Suzi</p>
          <p className="truncate text-xs text-navy-300">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Suzi"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-navy-300 transition-colors hover:bg-navy-900 hover:text-ivory cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </motion.div>
  );
}
