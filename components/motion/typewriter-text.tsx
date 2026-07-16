"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onDone?: () => void;
  className?: string;
}

/**
 * Reveals text character-by-character. Used for AI replies across the
 * homepage chat panel, the property AI assistant, and the list-with-ai
 * chat facts step, so every AI response "types" rather than appearing
 * instantly. Respects prefers-reduced-motion by rendering instantly.
 */
export function TypewriterText({ text, speed = 14, onDone, className }: TypewriterTextProps) {
  const [shown, setShown] = useState("");
  // Keep the latest callback in a ref (updated post-render, not during) so
  // the typing effect only depends on `text` — including `onDone` directly
  // would restart typing whenever a parent re-render passes a fresh
  // inline function.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Each instance is mounted fresh per message in practice (turns are
    // append-only), so `shown` already starts at "" — no reset needed here.
    // The state updates below happen inside callbacks (timer/interval
    // ticks), not synchronously in the effect body.
    if (reduceMotion) {
      const id = window.setTimeout(() => {
        setShown(text);
        onDoneRef.current?.();
      }, 0);
      return () => window.clearTimeout(id);
    }

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        onDoneRef.current?.();
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return <span className={className}>{shown}</span>;
}
