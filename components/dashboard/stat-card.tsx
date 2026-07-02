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
  tone?: "neutral" | "gold" | "terra";
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          tone === "gold" && "bg-gold-100 text-gold-700",
          tone === "terra" && "bg-terra-100 text-terra-700",
          tone === "neutral" && "bg-parchment text-navy-700",
        )}
      >
        <Icon className="h-4.5 w-4.5" aria-hidden />
      </span>
      <p className="mt-3 font-display text-2xl font-semibold text-navy-900">{value}</p>
      <p className="mt-0.5 text-xs text-navy-500">{label}</p>
    </div>
  );
}
