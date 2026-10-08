"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Root motion settings for the whole app. `reducedMotion="user"` makes
 * every framer-motion animation honour prefers-reduced-motion: transform
 * and layout animations snap to their end state while opacity still
 * fades. Components therefore don't each have to read the media query.
 *
 * Only `MotionConfig` is imported here (framer-motion is side-effect
 * free), so the shared layout bundle gets the context, not the `motion`
 * component factory — that stays in the lazily loaded Suzi chunk and the
 * pages that animate.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
