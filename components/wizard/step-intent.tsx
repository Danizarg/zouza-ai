import { Button } from "@/components/ui/button";
import type { ListingIntent } from "@/lib/types";
import { KeyRound, Landmark } from "lucide-react";

export function StepIntent({
  value,
  onSelect,
  onContinue,
}: {
  value: ListingIntent | null;
  onSelect: (intent: ListingIntent) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
        What would you like to do?
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("rent_out")}
          className={`flex flex-col items-start gap-3 rounded-xl border-2 p-6 text-left transition-colors ${
            value === "rent_out" ? "border-brand-500 bg-brand-50" : "border-border bg-white hover:border-border-strong"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-brand-300">
            <KeyRound className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-semibold text-ink">Rent out</span>
          <span className="text-sm leading-relaxed text-muted">
            Suzi writes the listing and answers tenant questions for you.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("sell")}
          className={`flex flex-col items-start gap-3 rounded-xl border-2 p-6 text-left transition-colors ${
            value === "sell" ? "border-brand-500 bg-brand-50" : "border-border bg-white hover:border-border-strong"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-brand-300">
            <Landmark className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-semibold text-ink">Sell</span>
          <span className="text-sm leading-relaxed text-muted">
            Suzi presents your home to buyers and answers their questions.
          </span>
        </button>
      </div>

      <div className="mt-8 flex justify-end">
        <Button disabled={!value} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
