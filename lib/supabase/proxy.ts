import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./config";

/** Routes that need an account. Signed-out visitors are sent to sign in and come back afterwards. */
const PROTECTED_PREFIXES = ["/dashboard"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Runs on every page request (see `proxy.ts`). Three jobs:
 *
 * 1. Keep the session alive: the Supabase server client reads the auth cookies, refreshes an
 *    expired access token, and writes the new cookies onto both the request (so Server
 *    Components in this render see them) and the response (so the browser keeps them).
 * 2. Catch auth links that landed on the wrong page. When a redirect URL is not on the
 *    Supabase allow list, confirmation and reset links fall back to the Site URL (the
 *    homepage) with the `code` still in the query. Send those to `/auth/callback` so the
 *    code is exchanged and the visitor ends up signed in instead of on a page that ignores it.
 * 3. Gate the dashboard. The layout checks again server-side; this just saves a render.
 *
 * In mock mode (no Supabase env) every request passes straight through.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  if (!isSupabaseConfigured()) return NextResponse.next({ request });

  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname !== "/auth/callback" &&
    (searchParams.has("code") || (searchParams.has("token_hash") && searchParams.has("type")))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.has("next")) {
      url.searchParams.set("next", pathname === "/" ? "/dashboard" : pathname);
    }
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates the token with Supabase Auth (and refreshes it); do not swap it for
  // getSession(), which trusts the cookie as-is.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
