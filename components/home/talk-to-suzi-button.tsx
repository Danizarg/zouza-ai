"use client";

import { buttonClasses, type ButtonSize } from "@/components/ui/button";
import { openSuziPanel } from "@/lib/suzi-events";
import { Sparkles } from "lucide-react";

/**
 * "Talk to Suzi" CTA for server-rendered sections. Opens the global Suzi
 * panel — the same behaviour as the header button — instead of navigating
 * to `/list-with-ai`, which is the seller wizard, not the conversation.
 */
export function TalkToSuziButton({
  size = "lg",
  className,
}: {
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <button type="button" onClick={openSuziPanel} className={buttonClasses("primary", size, className)}>
      <Sparkles className="h-4.5 w-4.5" aria-hidden />
      Talk to Suzi
    </button>
  );
}
