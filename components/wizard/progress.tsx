import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Intent",
  "Photos",
  "Facts",
  "AI generation",
  "Review",
  "Preview",
  "Publish",
];

export function WizardProgress({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {STEP_LABELS.map((label, i) => {
        const index = i + 1;
        const state = index < step ? "done" : index === step ? "current" : "upcoming";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                state === "done" && "bg-gold-600 text-ivory",
                state === "current" && "bg-navy-900 text-ivory",
                state === "upcoming" && "bg-parchment text-navy-400",
              )}
            >
              {index}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                state === "upcoming" ? "text-navy-400" : "text-navy-800",
              )}
            >
              {label}
            </span>
            {index < STEP_LABELS.length ? (
              <span className="mx-1 hidden h-px w-6 bg-line sm:inline-block" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
