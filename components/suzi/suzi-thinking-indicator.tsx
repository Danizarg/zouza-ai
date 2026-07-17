import { ThinkingDots } from "@/components/motion/thinking-dots";

export function SuziThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <p className="flex items-center gap-2 rounded-xl rounded-bl-md bg-parchment px-4 py-2.5 text-sm text-navy-500">
        Suzi is thinking <ThinkingDots />
      </p>
    </div>
  );
}
