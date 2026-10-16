"use client";

import type { QuickAction } from "@/lib/ai/suzi-assistant";
import Link from "next/link";

/* Compact on a mouse, a full 44px row on touch (WCAG 2.5.8). */
const CHIP =
  "inline-flex min-h-8 items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-brand-500 pointer-coarse:min-h-11";

/**
 * Page-aware shortcuts under the transcript: a link when the action
 * navigates somewhere, a button when it sends a prompt to Suzi.
 */
export function SuziQuickActions({
  actions,
  onPrompt,
}: {
  actions: QuickAction[];
  onPrompt: (text: string) => void;
}) {
  if (actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) =>
        a.href ? (
          <Link key={a.label} href={a.href} className={CHIP}>
            {a.label}
          </Link>
        ) : (
          <button
            key={a.label}
            type="button"
            onClick={() => a.prompt && onPrompt(a.prompt)}
            className={`${CHIP} cursor-pointer`}
          >
            {a.label}
          </button>
        ),
      )}
    </div>
  );
}
