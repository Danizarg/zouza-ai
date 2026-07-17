"use client";

import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { motion } from "framer-motion";

function reduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The collapsed floating trigger — a warm glowing orb, not a support-widget icon. */
export function SuziAvatarButton({
  onClick,
  hasUnread,
}: {
  onClick: () => void;
  hasUnread?: boolean;
}) {
  const reduced = useClientSnapshot(reduceMotion, false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Open Suzi, your AI real estate partner"
      className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-card cursor-pointer"
      style={{
        background: "radial-gradient(circle at 35% 30%, #E8CFA0 0%, #B3945A 45%, #0F1B33 100%)",
      }}
      animate={
        reduced
          ? undefined
          : { boxShadow: ["0 0 0 0 rgba(179,148,90,0.35)", "0 0 0 12px rgba(179,148,90,0)"] }
      }
      transition={reduced ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="font-display text-base font-semibold text-ivory">S</span>
      {hasUnread ? (
        <span
          className="absolute top-0 right-0 h-3 w-3 rounded-full bg-terra-500 ring-2 ring-ivory"
          aria-hidden
        />
      ) : null}
    </motion.button>
  );
}
