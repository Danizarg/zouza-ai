import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

/** The signed-in person as the server sees them: the auth user plus their `profiles` row. */
export interface Viewer {
  id: string;
  email: string | null;
  name: string;
  role: "owner" | "seeker" | "both";
  verified: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

/**
 * Who is signed in for this request, or `null` (signed out, or mock mode). Cached per
 * request, so the layout, the page and any section can all ask without extra round trips.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, verified, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const metaName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

  return {
    id: user.id,
    email: user.email ?? null,
    name: profile?.full_name || metaName || "Zouza user",
    role: profile?.role ?? "seeker",
    verified: profile?.verified ?? false,
    avatarUrl: profile?.avatar_url ?? null,
    createdAt: profile?.created_at ?? user.created_at,
  };
});

/**
 * For pages that belong to an account. In Supabase mode a signed-out visitor is redirected to
 * sign in and brought back to `next` afterwards. In mock mode it returns `null` and the page
 * renders its demo, so the app stays demonstrable with zero configuration (CLAUDE.md §11.1).
 */
export async function requireViewer(next: string): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) return null;
  const viewer = await getViewer();
  if (!viewer) redirect(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  return viewer;
}
