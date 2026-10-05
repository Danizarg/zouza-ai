import { json, preflight } from "@/lib/api/http";

export const runtime = "nodejs";

/**
 * The app blocks with an "Update Zouza" screen when its version is below minAppVersion.
 * Both values use `||`, not `??`: an empty env var (a blank line copied from
 * .env.example) must fall back to 1.0.0 instead of being served as "".
 */
export function GET(req: Request): Response {
  return json(
    req,
    {
      minAppVersion: process.env.APP_MIN_VERSION || "1.0.0",
      latestAppVersion: process.env.APP_LATEST_VERSION || "1.0.0",
    },
    { headers: { "Cache-Control": "public, s-maxage=300" } },
  );
}

export function OPTIONS(req: Request): Response {
  return preflight(req);
}
