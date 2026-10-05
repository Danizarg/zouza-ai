import { json, parseBody, preflight, tooManyRequests } from "@/lib/api/http";
import { searchRequestSchema } from "@/lib/api/schemas";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import { runAiSearch } from "@/lib/server/search";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  const body = await parseBody(req, searchRequestSchema);
  if (!body.ok) return body.response;
  if (!(await checkRateLimit({ key: clientKeyFromRequest(req) }))) return tooManyRequests(req);
  return json(req, await runAiSearch(body.data.query));
}

export function OPTIONS(req: Request): Response {
  return preflight(req);
}
