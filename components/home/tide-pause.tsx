"use client";

import { useEffect } from "react";

/**
 * Pauses the tide's CSS animations while #landing is off-screen by
 * toggling a DOM attribute that landing.module.css reads. No React
 * state, so nothing re-renders and the set-state-in-effect rule is moot.
 */
export function TidePause() {
  useEffect(() => {
    const el = document.getElementById("landing");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry.isIntersecting ? "false" : "true";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return null;
}
