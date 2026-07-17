"use client";

import type { QuickAction } from "@/lib/ai/suzi-assistant";
import Link from "next/link";

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
          <Link
            key={a.label}
            href={a.href}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-gold-500"
          >
            {a.label}
          </Link>
        ) : (
          <button
            key={a.label}
            type="button"
            onClick={() => a.prompt && onPrompt(a.prompt)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-gold-500 cursor-pointer"
          >
            {a.label}
          </button>
        ),
      )}
    </div>
  );
}
