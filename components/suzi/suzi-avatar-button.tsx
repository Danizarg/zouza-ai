"use client";

import { ZPulse, type ZPulseState } from "@/components/brand/z-mark";
import { cn } from "@/lib/utils";
import type { Ref } from "react";

/**
 * The collapsed floating trigger: the Z mark in white on a brand-500
 * disc, 56px — comfortably over the 44px touch minimum. Hover and press
 * feedback are CSS transforms, switched off under prefers-reduced-motion;
 * the mark itself carries Suzi's state (ready / thinking) via <ZPulse>.
 * No continuous motion: the design system keeps ambient animation for
 * the landing tide only.
 */
export function SuziAvatarButton({
  onClick,
  open = false,
  controls,
  state = "ready",
  hasUnread,
  ref,
}: {
  onClick: () => void;
  /** Whether the panel this button toggles is currently open. */
  open?: boolean;
  /** id of the panel, exposed through aria-controls while it is open. */
  controls?: string;
  state?: ZPulseState;
  hasUnread?: boolean;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={open ? "Close Suzi" : "Open Suzi, your AI real estate partner"}
      aria-expanded={open}
      aria-controls={open ? controls : undefined}
      className={cn(
        "relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lift transition-[background-color,transform] duration-200 cursor-pointer",
        "hover:scale-105 hover:bg-brand-600 active:scale-95",
        "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
      )}
    >
      <ZPulse state={state} className="h-7 w-7" />
      {hasUnread ? (
        <span
          className="absolute top-0 right-0 h-3 w-3 rounded-full bg-brand-900 ring-2 ring-paper"
          aria-hidden
        />
      ) : null}
    </button>
  );
}
