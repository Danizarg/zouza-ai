import { updateSession } from "@/lib/supabase/proxy";
import type { NextRequest } from "next/server";

/** Next.js 16 proxy (formerly middleware): refreshes the Supabase session on page requests. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Pages only: skip API routes, Next internals, metadata files and static assets.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
