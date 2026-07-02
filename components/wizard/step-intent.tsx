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
      <h1 className="text-2xl font-semibold text-navy-950 sm:text-3xl">
        What would you like to do?
      </h1>
      <p className="mt-2 text-navy-600">Aurora tailors the whole flow to your goal.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("rent_out")}
          className={`flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-colors ${
            value === "rent_out" ? "border-gold-500 bg-gold-100" : "border-line bg-white hover:border-navy-300"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
            <KeyRound className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-semibold text-navy-900">Rent out</span>
          <span className="text-sm leading-relaxed text-navy-600">
            List your property for rent — Aurora writes the exposé and
            answers tenants around the clock.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("sell")}
          className={`flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-colors ${
            value === "sell" ? "border-gold-500 bg-gold-100" : "border-line bg-white hover:border-navy-300"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
            <Landmark className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-semibold text-navy-900">Sell</span>
          <span className="text-sm leading-relaxed text-navy-600">
            List your property for sale — agency-level presentation, direct
            to buyers.
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
