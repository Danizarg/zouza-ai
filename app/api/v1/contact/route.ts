import { json, parseBody, preflight, tooManyRequests } from "@/lib/api/http";
import { contactRequestSchema } from "@/lib/api/schemas";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import { runSubmitContact } from "@/lib/server/contact";

export const runtime = "nodejs";

/** Every accepted message emails the team inbox, so keep this tight. */
const MESSAGES_PER_MINUTE = 5;

export async function POST(req: Request): Promise<Response> {
  const body = await parseBody(req, contactRequestSchema);
  if (!body.ok) return body.response;
  const { company, ...form } = body.data;
  // Honeypot filled: pretend success so bots learn nothing, send nothing.
  if (company) return json(req, { ok: true });
  const allowed = await checkRateLimit({
    key: clientKeyFromRequest(req),
    bucket: "contact",
    max: MESSAGES_PER_MINUTE,
  });
  if (!allowed) return tooManyRequests(req);
  return json(req, await runSubmitContact(form));
}

export function OPTIONS(req: Request): Response {
  return preflight(req);
}
