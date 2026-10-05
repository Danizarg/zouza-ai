import { sendTeamNotification } from "@/lib/email";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

export const contactSchema = z.object({
  reason: z.string().min(1).max(120),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(4000),
});

export async function runSubmitContact(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form fields and try again." };
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    if (error) return { ok: false, error: "Could not save your message. Please retry." };
  }
  const { reason, name, email, message } = parsed.data;
  await sendTeamNotification(
    `New contact form submission — ${reason}`,
    `Name: ${name}\nEmail: ${email}\nReason: ${reason}\n\n${message}`,
  );
  return { ok: true };
}

export const waitlistSchema = z.object({
  email: z.string().email(),
  interest: z.string().max(60).optional(),
});

export async function runJoinWaitlist(input: unknown): Promise<{ ok: boolean }> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase
      .from("waitlist_signups")
      .upsert({ email: parsed.data.email, interest: parsed.data.interest ?? null }, { onConflict: "email" });
  }
  await sendTeamNotification(
    "New waitlist signup",
    `Email: ${parsed.data.email}\nInterest: ${parsed.data.interest ?? "—"}`,
  );
  return { ok: true };
}
