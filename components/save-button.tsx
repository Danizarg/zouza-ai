"use client";

import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useState } from "react";

const STORAGE_KEY = "aurora_saved_listings";

export function getSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Favourite toggle persisted to localStorage (Supabase `saved_listings` later). */
export function SaveButton({
  listingId,
  className,
}: {
  listingId: string;
  className?: string;
}) {
  const [, setVersion] = useState(0);
  const saved = useClientSnapshot(() => getSavedIds().includes(listingId), false);

  function toggle() {
    const ids = getSavedIds();
    const next = ids.includes(listingId)
      ? ids.filter((id) => id !== listingId)
      : [...ids, listingId];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setVersion((v) => v + 1);
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved homes" : "Save this home"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur transition-transform hover:scale-105 cursor-pointer",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4.5 w-4.5 transition-colors",
          saved ? "fill-terra-600 text-terra-600" : "text-navy-700",
        )}
        aria-hidden
      />
    </button>
  );
}
