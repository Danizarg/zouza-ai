import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Only same-site paths: no protocol-relative or absolute URLs from the query string. */
function safeNext(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  return raw;
}

/**
 * Where email links land: sign-up confirmation, password reset, magic links. Supabase sends
 * the visitor here with either a PKCE `code` (the browser that started the flow holds the
 * verifier cookie) or a `token_hash` + `type` pair. Either is turned into a session cookie,
 * then the visitor continues to `next` — the dashboard by default, the new-password form for
 * a recovery link. A link that cannot be verified (expired, already used, opened in another
 * browser) goes to sign in with a message instead of a bare error.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(
    searchParams.get("next"),
    type === "recovery" ? "/auth/update-password" : "/dashboard",
  );

  // Behind Vercel the request origin is the deployment, not the custom domain.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`;
  const go = (path: string) => NextResponse.redirect(new URL(path, base));
  const fail = (reason: "link" | "missing") => go(`/auth/sign-in?error=${reason}`);

  const supabase = await getSupabaseServerClient();
  if (!supabase) return go(next);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? fail("link") : go(next);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    return error ? fail("link") : go(next);
  }

  return fail(
    searchParams.has("error") || searchParams.has("error_description") ? "link" : "missing",
  );
}
