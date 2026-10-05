import { generateListingContentWithSource } from "@/lib/ai/service";
import { json, parseBody, preflight, tooManyRequests } from "@/lib/api/http";
import { generateRequestSchema } from "@/lib/api/schemas";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Writing a full exposé is the most expensive call; owners need only a few a minute. */
const GENERATIONS_PER_MINUTE = 6;

export async function POST(req: Request): Promise<Response> {
  const body = await parseBody(req, generateRequestSchema);
  if (!body.ok) return body.response;
  const allowed = await checkRateLimit({
    key: clientKeyFromRequest(req),
    bucket: "generate",
    max: GENERATIONS_PER_MINUTE,
  });
  if (!allowed) return tooManyRequests(req);
  return json(req, await generateListingContentWithSource(body.data.facts));
}

export function OPTIONS(req: Request): Response {
  return preflight(req);
}
