import { RATE_LIMIT_WINDOW_SECONDS, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";
import type { ZodType } from "zod";

/**
 * Shared plumbing for the /api/v1 Route Handlers used by the Zouza iOS app.
 * Native apps ignore CORS; these headers exist only so the app's Expo-web
 * dev preview can call a local or deployed API. Never a wildcard.
 */

const DEV_ORIGINS = ["http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:19006"];

function allowedOrigins(): string[] {
  const configured = (process.env.API_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return process.env.NODE_ENV === "production" ? configured : [...configured, ...DEV_ORIGINS];
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !allowedOrigins().includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

export function json(
  req: Request,
  data: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  return Response.json(data, {
    status: init.status ?? 200,
    headers: { ...corsHeaders(req), ...(init.headers ?? {}) },
  });
}

export function preflight(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export function tooManyRequests(req: Request): Response {
  return json(
    req,
    { error: "rate_limited", message: RATE_LIMITED_MESSAGE },
    { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW_SECONDS) } },
  );
}

export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: json(req, { error: "invalid_json" }, { status: 400 }) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: json(
        req,
        {
          error: "invalid_request",
          issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}
