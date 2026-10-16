import "server-only";

import { headers } from "next/headers";

/**
 * Per-visitor and per-instance ceilings on model calls — SERVER ONLY.
 *
 * The AI server actions are public: anyone who can load the site can call
 * them, and every call that reaches the model costs money. This puts two
 * lids on that before public testing:
 *
 *   - a per-visitor budget per kind of call (chat, search, generate), keyed
 *     on the client IP, so one person or script can't burn the balance;
 *   - a per-instance budget across all visitors, so a flood from many
 *     addresses still tops out.
 *
 * When a budget is spent the caller serves the deterministic answer — the
 * same path a missing key takes — so the product keeps working, it just
 * stops spending. Counters are in process memory: on serverless each
 * instance keeps its own, which makes the effective limits a small multiple
 * of the numbers below. That is fine for a first line of defence; proper
 * metering per account lands with identity (CLAUDE.md §10, P0.2).
 */

export type ModelCallKind = "chat" | "search" | "generate";

interface Budget {
  /** Calls allowed per window. */
  limit: number;
  windowMs: number;
}

/** Per visitor. Chat and search are cheap and frequent; generation is not. */
const VISITOR_BUDGET: Record<ModelCallKind, Budget> = {
  chat: { limit: 40, windowMs: 10 * 60_000 },
  search: { limit: 40, windowMs: 10 * 60_000 },
  generate: { limit: 12, windowMs: 60 * 60_000 },
};

/** Across all visitors on this instance, every kind together. */
const INSTANCE_BUDGET: Budget = { limit: 600, windowMs: 60_000 };

/** Prune the map once it holds this many keys, so idle addresses don't leak. */
const PRUNE_AT = 5_000;

/** key -> timestamps of calls inside the current window, oldest first. */
const calls = new Map<string, number[]>();

/**
 * Record a call against `key` if its budget allows one, sliding-window
 * style. Returns false, recording nothing, when the window is full.
 */
function take(key: string, budget: Budget, now: number): boolean {
  const cutoff = now - budget.windowMs;
  const recent = (calls.get(key) ?? []).filter((t) => t > cutoff);
  if (recent.length >= budget.limit) {
    calls.set(key, recent);
    return false;
  }
  recent.push(now);
  calls.set(key, recent);
  return true;
}

function prune(now: number): void {
  if (calls.size < PRUNE_AT) return;
  const oldest = now - Math.max(...Object.values(VISITOR_BUDGET).map((b) => b.windowMs));
  for (const [key, stamps] of calls) {
    if (!stamps.some((t) => t > oldest)) calls.delete(key);
  }
}

/**
 * The visitor's address as the platform reports it. Vercel sets
 * `x-forwarded-for` (client first) and `x-real-ip`. Outside a request —
 * which no caller of this module should be — fall back to one shared bucket
 * rather than throwing.
 */
async function visitorKey(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || h.get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Whether a model call of this kind may go ahead for the current visitor.
 * Call it only once `isAiEnabled()` is true, right before the model call,
 * so the deterministic path never consumes budget.
 */
export async function allowModelCall(kind: ModelCallKind): Promise<boolean> {
  const now = Date.now();
  prune(now);

  if (!take("instance", INSTANCE_BUDGET, now)) {
    console.warn(`[suzi:limit] instance budget spent — serving fallback for ${kind}.`);
    return false;
  }

  const visitor = await visitorKey();
  if (!take(`${kind}:${visitor}`, VISITOR_BUDGET[kind], now)) {
    console.warn(`[suzi:limit] visitor budget spent — serving fallback for ${kind}.`);
    return false;
  }

  return true;
}
