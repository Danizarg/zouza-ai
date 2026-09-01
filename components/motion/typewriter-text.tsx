"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  /** Override the per-character interval. Omit to use the adaptive pace below. */
  speed?: number;
  onDone?: () => void;
  className?: string;
}

/**
 * Total time the animation should aim to take, regardless of length. A
 * fixed per-character speed was fine for the old short canned replies, but
 * real generated replies run 200-400 characters — at the previous flat
 * 14ms that was 3-6 seconds of watching text crawl *after* the model had
 * already answered. Pacing to a target duration keeps the effect while
 * bounding the wait.
 */
const TARGET_DURATION_MS = 900;
const MIN_CHAR_MS = 4;
const MAX_CHAR_MS = 14;

function paceFor(length: number): number {
  if (length === 0) return MAX_CHAR_MS;
  return Math.min(MAX_CHAR_MS, Math.max(MIN_CHAR_MS, TARGET_DURATION_MS / length));
}

/**
 * Reveals text character-by-character. Used for AI replies across the
 * homepage chat panel, the property AI assistant, and the list-with-ai
 * chat facts step, so every AI response "types" rather than appearing
 * instantly. Respects prefers-reduced-motion by rendering instantly.
 */
export function TypewriterText({ text, speed, onDone, className }: TypewriterTextProps) {
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

    const charMs = speed ?? paceFor(text.length);
    // At the fast end one character per tick would need sub-frame timers,
    // so reveal several characters per tick instead and keep the interval
    // at a length the browser can actually honour.
    const step = Math.max(1, Math.ceil(MIN_CHAR_MS / charMs));
    const tickMs = charMs * step;

    let i = 0;
    const id = window.setInterval(() => {
      i += step;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        onDoneRef.current?.();
      }
    }, tickMs);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return <span className={className}>{shown}</span>;
}
