import { json, preflight } from "@/lib/api/http";
import { getCatalogue } from "@/lib/server/catalogue";

export const runtime = "nodejs";

const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

export function GET(req: Request): Response {
  return json(req, { listings: getCatalogue() }, { headers: CACHE });
}

export function OPTIONS(req: Request): Response {
  return preflight(req);
}
