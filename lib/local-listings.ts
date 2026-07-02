"use client";

import type { Listing } from "@/lib/types";

const STORAGE_KEY = "aurora_local_listings";

/**
 * Client-side listing store used when Supabase is not configured, so the
 * create-listing flow has somewhere real to "publish" to and the listing
 * detail page can look drafts back up after a redirect.
 */
export function saveLocalListing(listing: Listing): void {
  if (typeof window === "undefined") return;
  const all = listLocalListings();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([listing, ...all.filter((l) => l.id !== listing.id)]),
  );
}

export function listLocalListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getLocalListing(id: string): Listing | null {
  return listLocalListings().find((l) => l.id === id || l.slug === id) ?? null;
}
