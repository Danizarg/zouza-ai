import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeTone = "gold" | "navy" | "terra" | "olive" | "neutral";

const tones: Record<BadgeTone, string> = {
  gold: "bg-gold-100 text-gold-700 border-gold-200",
  navy: "bg-navy-900 text-ivory border-navy-900",
  terra: "bg-terra-100 text-terra-700 border-terra-200",
  olive: "bg-olive-100 text-olive-600 border-olive-100",
  neutral: "bg-parchment text-navy-700 border-line",
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
