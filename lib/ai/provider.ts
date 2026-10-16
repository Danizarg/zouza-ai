import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

/**
 * Real model access for Suzi — SERVER ONLY.
 *
 * This module is the only place in the codebase that talks to a model
 * provider. It is deliberately kept out of `lib/ai/service.ts` and
 * `lib/ai/suzi-assistant.ts`, which stay pure, deterministic and
 * client-safe so they can keep serving as fallbacks (and so no provider
 * SDK ever lands in the browser bundle — see CLAUDE.md §4).
 *
 * Two providers are supported and picked from whichever key is present, so
 * switching is an environment-variable change rather than a deploy:
 *
 *   OPENAI_API_KEY     -> OpenAI     (default model gpt-5-nano)
 *   ANTHROPIC_API_KEY  -> Anthropic  (default model claude-opus-5)
 *
 * Every entry point returns `null` instead of throwing. Callers pair a
 * `null` with the deterministic fallback, so a missing key, a rate limit,
 * or a provider outage degrades the experience rather than breaking the
 * flow.
 */

export type AiProvider = "openai" | "anthropic";

const DEFAULT_MODEL: Record<AiProvider, string> = {
  openai: "gpt-5-nano",
  anthropic: "claude-opus-5",
};

/** Chat should feel immediate; long-form generation can afford to think. */
export type Effort = "low" | "medium" | "high";

const REQUEST_TIMEOUT_MS = 45_000;

/**
 * Which provider to use. `ZOUZA_AI_PROVIDER` forces one; otherwise OpenAI
 * wins when both keys are set, since that is the cheaper default.
 */
export function getAiProvider(): AiProvider | null {
  const forced = process.env.ZOUZA_AI_PROVIDER?.trim().toLowerCase();
  if (forced === "openai") return process.env.OPENAI_API_KEY?.trim() ? "openai" : null;
  if (forced === "anthropic") return process.env.ANTHROPIC_API_KEY?.trim() ? "anthropic" : null;

  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (process.env.ANTHROPIC_API_KEY?.trim()) return "anthropic";
  return null;
}

/** The model actually in use, or null when no provider is configured. */
export function getAiModel(): string | null {
  const provider = getAiProvider();
  if (!provider) return null;
  return process.env.ZOUZA_AI_MODEL?.trim() || DEFAULT_MODEL[provider];
}

/**
 * True when a real model is reachable. `hasAiProvider()` in
 * `lib/ai/service.ts` re-exports this meaning for client-safe callers.
 */
export function isAiEnabled(): boolean {
  return getAiProvider() !== null;
}

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ maxRetries: 1, timeout: REQUEST_TIMEOUT_MS });
  }
  return openaiClient;
}

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ maxRetries: 1, timeout: REQUEST_TIMEOUT_MS });
  }
  return anthropicClient;
}

function logFailure(label: string, error: unknown): void {
  if (error instanceof OpenAI.AuthenticationError || error instanceof Anthropic.AuthenticationError) {
    console.error(`[suzi:${label}] API key rejected — falling back.`);
  } else if (error instanceof OpenAI.RateLimitError || error instanceof Anthropic.RateLimitError) {
    console.warn(`[suzi:${label}] rate limited — falling back.`);
  } else if (error instanceof OpenAI.APIError) {
    console.error(`[suzi:${label}] OpenAI error ${error.status}: ${error.message}`);
  } else if (error instanceof Anthropic.APIError) {
    console.error(`[suzi:${label}] Anthropic error ${error.status}: ${error.message}`);
  } else {
    console.error(`[suzi:${label}] unexpected failure:`, error);
  }
}

/**
 * A reasoning model can spend its whole output budget thinking and return
 * nothing, which otherwise looks identical to "the model had no answer" —
 * we'd silently serve the deterministic fallback with no clue why. Say so.
 */
function warnIfIncomplete(
  label: string,
  status: string | undefined,
  reason: string | undefined,
): void {
  if (status !== "incomplete") return;
  if (reason === "max_output_tokens") {
    console.warn(
      `[suzi:${label}] hit max_output_tokens before answering — raise maxTokens or lower effort.`,
    );
  } else {
    console.warn(`[suzi:${label}] response incomplete (${reason ?? "unknown"}).`);
  }
}

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

export interface ModelRequest {
  /** System prompt — Suzi's persona and rules. */
  system: string;
  messages: Turn[];
  /** Reasoning tokens count against this, so keep headroom above the answer. */
  maxTokens?: number;
  effort?: Effort;
}

/* ------------------------------------------------------------------ */
/* Free-text completion                                                */
/* ------------------------------------------------------------------ */

/** Returns `null` when unavailable, refused, or empty. */
export async function runText(request: ModelRequest): Promise<string | null> {
  const provider = getAiProvider();
  const model = getAiModel();
  if (!provider || !model) return null;

  const maxTokens = request.maxTokens ?? 8_000;
  const effort = request.effort ?? "low";

  try {
    if (provider === "openai") {
      const response = await getOpenAI().responses.create({
        model,
        instructions: request.system,
        input: request.messages,
        max_output_tokens: maxTokens,
        reasoning: { effort },
        // Matches the "keep it short" rule in the prompt — small models
        // follow an explicit parameter more reliably than prose.
        text: { verbosity: effort === "low" ? "low" : "medium" },
        // Suzi carries visitors' own words about where they want to live.
        // Don't leave that sitting in provider-side storage.
        store: false,
      });
      warnIfIncomplete("text", response.status, response.incomplete_details?.reason);
      return response.output_text?.trim() || null;
    }

    const response = await getAnthropic().messages.create({
      model,
      max_tokens: maxTokens,
      system: request.system,
      messages: request.messages,
      output_config: { effort },
    });

    if (response.stop_reason === "refusal") {
      console.warn(`[suzi:text] model declined — falling back.`);
      return null;
    }

    return (
      response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("")
        .trim() || null
    );
  } catch (error) {
    logFailure("text", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Schema-constrained completion                                       */
/* ------------------------------------------------------------------ */

export interface StructuredRequest<T> extends ModelRequest {
  schema: z.ZodType<T>;
  /** Schema name — required by OpenAI's structured outputs. */
  schemaName: string;
}

/**
 * The provider validates the response against `schema`, so a caller that
 * gets a non-null value gets a fully typed one.
 */
export async function runStructured<T>(
  request: StructuredRequest<T>,
): Promise<T | null> {
  const provider = getAiProvider();
  const model = getAiModel();
  if (!provider || !model) return null;

  const maxTokens = request.maxTokens ?? 16_000;
  const effort = request.effort ?? "medium";

  try {
    if (provider === "openai") {
      const response = await getOpenAI().responses.parse({
        model,
        instructions: request.system,
        input: request.messages,
        max_output_tokens: maxTokens,
        reasoning: { effort },
        text: { format: zodTextFormat(request.schema, request.schemaName) },
        store: false,
      });
      warnIfIncomplete("structured", response.status, response.incomplete_details?.reason);
      return response.output_parsed ?? null;
    }

    const response = await getAnthropic().messages.parse({
      model,
      max_tokens: maxTokens,
      system: request.system,
      messages: request.messages,
      output_config: {
        effort,
        format: zodOutputFormat(request.schema),
      },
    });

    if (response.stop_reason === "refusal") {
      console.warn(`[suzi:structured] model declined — falling back.`);
      return null;
    }

    // `parsed_output` is null when the response didn't satisfy the schema.
    return response.parsed_output ?? null;
  } catch (error) {
    logFailure("structured", error);
    return null;
  }
}
