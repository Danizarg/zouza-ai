import { json, parseBody, preflight, tooManyRequests } from "@/lib/api/http";
import { chatRequestSchema } from "@/lib/api/schemas";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import { runSuziChat } from "@/lib/server/suzi";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  const body = await parseBody(req, chatRequestSchema);
  if (!body.ok) return body.response;
  if (!(await checkRateLimit({ key: clientKeyFromRequest(req) }))) return tooManyRequests(req);
  return json(req, await runSuziChat(body.data));
}

export function OPTIONS(req: Request): Response {
  return preflight(req);
}
