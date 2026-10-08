import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * The two doors, shared by the landing and the closing band: equal
 * primaries because seekers and owners are equal audiences. "Talk to Suzi"
 * jumps to the prompt section on this page; "List with Suzi" opens the
 * listing wizard — each label is literally what happens next.
 */
export function Doors({ className }: { className?: string }) {
  return (
    <div className={cn("grid w-full max-w-md gap-3 sm:grid-cols-2", className)}>
      <a href="#suzi" className={buttonClasses("primary", "lg", "w-full")}>
        Talk to Suzi
      </a>
      <Link href="/list-with-ai" className={buttonClasses("primary", "lg", "w-full")}>
        List with Suzi
      </Link>
    </div>
  );
}
