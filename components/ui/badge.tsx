import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* design.md v2 badge tones:
   brand   — product/feature tags (brand-100 / brand-700, 7.13:1)
   dark    — mode tags ("For rent", "For sale")
   success — verified / confirmed states
   danger  — cancelled / declined states
   neutral — everything else */
type BadgeTone = "brand" | "dark" | "success" | "danger" | "neutral";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-100 text-brand-700 border-brand-200",
  dark: "bg-brand-900 text-paper border-brand-900",
  success: "bg-success/10 text-success border-success/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  neutral: "bg-paper-2 text-ink-2 border-border",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
