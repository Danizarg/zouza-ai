import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "neutral" | "brand";
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          tone === "brand" && "bg-brand-100 text-brand-700",
          tone === "neutral" && "bg-paper-2 text-ink-2",
        )}
      >
        <Icon className="h-4.5 w-4.5" aria-hidden />
      </span>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
