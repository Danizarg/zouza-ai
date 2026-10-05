import { headers } from "next/headers";

/**
 * Minimal in-memory rate limiter for the AI server actions.
 *
 * Every AI action spends real money on an OpenAI call and is reachable by
 * anyone without authentication, so an unthrottled endpoint is a direct
 * route to draining the account. This caps how often one visitor can
 * trigger a paid call.
 *
 * Deliberately in-memory: no dependency, no config, works today. The
 * tradeoff is that the counter is per server instance and resets on
 * deploy, so on Vercel's serverless runtime it throttles far less than it
 * appears to. It is a speed bump, not a wall. Before real traffic, move
 * this to a shared store (Upstash Redis / Vercel KV) — see CLAUDE.md §8 P2.
 */

const WINDOW_MS = 60_000;
/**
 * Sized to stop abuse without catching real browsing. A visitor can easily
 * spend a handful of calls legitimately — the homepage demo fires one on
 * mount, then they search, then they chat — so a tight cap locks out
 * genuine users. Thirty AI calls a minute from one address is not a person
 * reading a property site.
 */
const MAX_REQUESTS_PER_WINDOW = 30;
/** Bound the map so a flood of distinct IPs can't grow it without limit. */
const MAX_TRACKED_CLIENTS = 5_000;

const hits = new Map<string, { count: number; resetAt: number }>();

function pruneExpired(now: number): void {
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }
}

/** Best-effort client identity from proxy headers; falls back to a shared bucket. */
async function getClientKey(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]!.trim();
    return h.get("x-real-ip") ?? "unknown";
  } catch {
    return "unknown";
  }
}

export const RATE_LIMIT_WINDOW_SECONDS = WINDOW_MS / 1000;

export interface RateLimitOptions {
  /** Client identity; defaults to the request's forwarded IP via next/headers. */
  key?: string;
  /** Separate counters per purpose, e.g. "ai" (default), "generate", "contact". */
  bucket?: string;
  max?: number;
  windowMs?: number;
}

/**
 * Returns true if this caller is allowed to proceed, false if they've
 * exceeded the window. Fails open — a limiter bug must never take the
 * site down.
 */
export async function checkRateLimit(opts: RateLimitOptions = {}): Promise<boolean> {
  try {
    const client = opts.key ?? (await getClientKey());
    const key = `${opts.bucket ?? "ai"}:${client}`;
    const max = opts.max ?? MAX_REQUESTS_PER_WINDOW;
    const windowMs = opts.windowMs ?? WINDOW_MS;
    const now = Date.now();

    if (hits.size > MAX_TRACKED_CLIENTS) pruneExpired(now);

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= max) return false;

    entry.count += 1;
    return true;
  } catch {
    return true;
  }
}

/** Same identity rule as getClientKey, for Route Handlers that already hold the Request. */
export function clientKeyFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function resetRateLimitsForTests(): void {
  hits.clear();
}

export const RATE_LIMITED_MESSAGE =
  "You're sending messages a little too quickly — give me a moment and try again.";
