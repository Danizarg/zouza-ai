"use client";

import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { useEffect, useRef } from "react";

function canUseGlow(): boolean {
  if (typeof window === "undefined") return false;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return canHover && !reduceMotion;
}

/**
 * A soft radial light that follows the pointer, mounted once at the app
 * root. Desktop-with-precise-pointer only (skips touch devices), and
 * disabled entirely under prefers-reduced-motion. Pure visual chrome —
 * pointer-events-none so it never intercepts clicks.
 */
export function CursorGlow() {
  const enabled = useClientSnapshot(canUseGlow, false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    function handleMove(e: PointerEvent) {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX - 200}px, ${e.clientY - 200}px, 0)`;
    }
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-0 h-[400px] w-[400px] rounded-full opacity-[0.06] will-change-transform"
      style={{
        background: "radial-gradient(circle, var(--color-navy-950) 0%, transparent 70%)",
      }}
    />
  );
}
