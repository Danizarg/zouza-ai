import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

/**
 * Real model access for Suzi — SERVER ONLY.
 *
 * This module is the only place in the codebase that talks to a model
 * provider. It is deliberately kept out of `lib/ai/service.ts` and
 * `lib/ai/suzi-assistant.ts`, which stay pure, deterministic and
 * client-safe so they can keep serving as fallbacks (and so the Anthropic
 * SDK never lands in the browser bundle — see CLAUDE.md §4).
 *
 * Every entry point here returns `null` instead of throwing. Callers pair
 * a `null` with the deterministic fallback, so a missing key, a rate
 * limit, or a provider outage degrades the experience rather than
 * breaking the flow.
 */

/** Overridable so the model can be changed without a code deploy. */
export const AI_MODEL = process.env.ZOUZA_AI_MODEL?.trim() || "claude-opus-5";

/** Chat should feel immediate; long-form generation can afford to think. */
export type Effort = "low" | "medium" | "high";

const REQUEST_TIMEOUT_MS = 45_000;

let client: Anthropic | null = null;

/**
 * True when a real model is reachable. `hasAiProvider()` in
 * `lib/ai/service.ts` re-exports this meaning for client-safe callers.
 */
export function isAiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function getClient(): Anthropic | null {
  if (!isAiEnabled()) return null;
  if (!client) {
    client = new Anthropic({ maxRetries: 1, timeout: REQUEST_TIMEOUT_MS });
  }
  return client;
}

function logFailure(label: string, error: unknown): void {
  if (error instanceof Anthropic.AuthenticationError) {
    console.error(`[suzi:${label}] ANTHROPIC_API_KEY rejected — falling back.`);
  } else if (error instanceof Anthropic.RateLimitError) {
    console.warn(`[suzi:${label}] rate limited — falling back.`);
  } else if (error instanceof Anthropic.APIError) {
    console.error(`[suzi:${label}] API error ${error.status}: ${error.message}`);
  } else {
    console.error(`[suzi:${label}] unexpected failure:`, error);
  }
}

export interface ModelRequest {
  system: string;
  messages: Anthropic.MessageParam[];
  /** Thinking tokens count against this, so keep headroom above the answer length. */
  maxTokens?: number;
  effort?: Effort;
}

/** Free-text completion. Returns `null` when unavailable, refused, or empty. */
export async function runText(request: ModelRequest): Promise<string | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: request.maxTokens ?? 8_000,
      system: request.system,
      messages: request.messages,
      output_config: { effort: request.effort ?? "low" },
    });

    if (response.stop_reason === "refusal") {
      console.warn(
        `[suzi:text] model declined (${response.stop_details?.category ?? "unknown"}) — falling back.`,
      );
      return null;
    }

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return text || null;
  } catch (error) {
    logFailure("text", error);
    return null;
  }
}

export interface StructuredRequest<T> extends ModelRequest {
  schema: z.ZodType<T>;
}

/**
 * Schema-constrained completion. The SDK validates the response against
 * `schema`, so a caller that gets a non-null value gets a fully typed one.
 */
export async function runStructured<T>(
  request: StructuredRequest<T>,
): Promise<T | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.parse({
      model: AI_MODEL,
      max_tokens: request.maxTokens ?? 16_000,
      system: request.system,
      messages: request.messages,
      output_config: {
        effort: request.effort ?? "medium",
        format: zodOutputFormat(request.schema),
      },
    });

    if (response.stop_reason === "refusal") {
      console.warn(
        `[suzi:structured] model declined (${response.stop_details?.category ?? "unknown"}) — falling back.`,
      );
      return null;
    }

    // `parsed_output` is null when the response didn't satisfy the schema.
    return response.parsed_output ?? null;
  } catch (error) {
    logFailure("structured", error);
    return null;
  }
}
