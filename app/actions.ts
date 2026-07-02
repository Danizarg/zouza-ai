"use server";

import { generateListingContent } from "@/lib/ai/service";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { GeneratedListingContent, ListingFacts } from "@/lib/types";
import { z } from "zod";

/**
 * Server actions. In Supabase mode they persist; in mock mode they validate
 * and succeed so every flow remains demonstrable without configuration.
 */

export async function generateListingAction(
  facts: ListingFacts,
): Promise<GeneratedListingContent> {
  return generateListingContent(facts);
}

const contactSchema = z.object({
  reason: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(4000),
});

export async function submitContact(input: {
  reason: string;
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form fields and try again." };
  }
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    if (error) return { ok: false, error: "Could not save your message. Please retry." };
  }
  return { ok: true };
}

const waitlistSchema = z.object({
  email: z.string().email(),
  interest: z.string().max(60).optional(),
});

export async function joinWaitlist(
  email: string,
  interest?: string,
): Promise<{ ok: boolean }> {
  const parsed = waitlistSchema.safeParse({ email, interest });
  if (!parsed.success) return { ok: false };
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase
      .from("waitlist_signups")
      .upsert({ email: parsed.data.email, interest: parsed.data.interest ?? null }, { onConflict: "email" });
  }
  return { ok: true };
}
