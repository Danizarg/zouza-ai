import { ThinkingDots } from "@/components/motion/thinking-dots";

/**
 * "Suzi is thinking" — a polite status region whose content appears while
 * a reply is pending. The region itself is always mounted (an empty div
 * when idle) because screen readers announce changes *inside* an existing
 * live region, not a live region that is itself inserted with content.
 */
export function SuziThinkingIndicator({ active }: { active: boolean }) {
  return (
    <div role="status" aria-live="polite" className="shrink-0 px-4">
      {active ? (
        <div className="-mt-1 flex justify-start pb-4">
          <p className="flex items-center gap-2 rounded-xl rounded-bl-md bg-paper-2 px-4 py-2.5 text-sm text-muted">
            Suzi is thinking
            <span aria-hidden="true">
              <ThinkingDots />
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
