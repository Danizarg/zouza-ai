"use client";

import { ZPulse, type ZPulseState } from "@/components/brand/z-mark";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useId, type KeyboardEvent, type ReactNode, type Ref } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getAttribute("aria-hidden") !== "true" && el.offsetParent !== null,
  );
}

/**
 * The open Suzi conversation: a modal dialog in the ARIA sense — focus is
 * trapped inside and the page behind is announced as inert — while it
 * stays a floating panel visually. Tab and Shift+Tab cycle through the
 * panel's controls; Escape, moving focus in on open and returning it to
 * the opener on close are handled by SuziAvatarAssistant, which owns the
 * open state.
 */
export function SuziPanel({
  id,
  subtitle,
  state = "ready",
  onClose,
  panelRef,
  children,
}: {
  id?: string;
  subtitle: string;
  /** Drives the Z mark in the header: still when ready, drawing while Suzi thinks. */
  state?: ZPulseState;
  onClose: () => void;
  panelRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  const titleId = useId();
  const subtitleId = useId();

  function trapFocus(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    const root = e.currentTarget;
    const items = focusableWithin(root);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    const inside = active instanceof HTMLElement && active !== root && root.contains(active);

    if (e.shiftKey) {
      // From the dialog itself, or from its first control, wrap to the last.
      if (!inside || active === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (!inside || active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <motion.div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      tabIndex={-1}
      onKeyDown={trapFocus}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex h-[min(560px,75dvh)] w-[min(380px,92vw)] flex-col overflow-hidden rounded-xl border border-border bg-white shadow-lift focus-visible:outline-offset-[-2px]"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-brand-900 py-3 pr-2 pl-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white"
          aria-hidden
        >
          <ZPulse state={state} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-sans text-sm font-semibold tracking-normal text-paper">
            Suzi
          </h2>
          <p id={subtitleId} className="truncate text-xs text-brand-300">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Suzi"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-brand-300 transition-colors hover:bg-brand-800 hover:text-paper focus-visible:outline-brand-300 cursor-pointer"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </motion.div>
  );
}
