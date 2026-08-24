import { PROTOCOL_ACTIONS, type ProtocolActionId } from "@/lib/ai/protocol";
import OpenAI from "openai";

/**
 * Server-only. Do not import this file from a Client Component — it reads
 * OPENAI_API_KEY and calling it from the browser would ship the key to
 * every visitor. It is only ever invoked from server actions (app/actions.ts).
 */

const MODEL = "gpt-5-nano";

let client: OpenAI | null | undefined;

/**
 * Lazily constructs the OpenAI client so a missing key never throws — the
 * SDK's constructor throws immediately if no key is present, which would
 * otherwise crash mock mode at import time.
 */
function getClient(): OpenAI | null {
  if (client !== undefined) return client;
  client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  return client;
}

/**
 * Classifies a visitor message into exactly one protocol action.
 *
 * Returns `null` on any failure — missing key, no credits, network error,
 * rate limit, malformed response. This call is never load-bearing: every
 * caller must treat `null` as "run the deterministic fallback classifier
 * instead" (see getSuziResponse / detectNavigationIntent in
 * lib/ai/suzi-assistant.ts), so the product works identically whether or
 * not a key is configured or has credit.
 */
export async function classifyProtocolAction(
  message: string,
  hasListingInContext: boolean,
): Promise<ProtocolActionId | null> {
  const openai = getClient();
  if (!openai) return null;

  const allowedActions = hasListingInContext
    ? PROTOCOL_ACTIONS
    : PROTOCOL_ACTIONS.filter((a) => a.id !== "answer_property_question");

  try {
    const response = await openai.chat.completions.create(
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a strict message classifier for a real-estate site's assistant. " +
              "Read the visitor's message and pick exactly one action from the list below — " +
              "the single best match. Never invent an action outside the list.\n\n" +
              allowedActions.map((a) => `- ${a.id}: ${a.description}`).join("\n"),
          },
          { role: "user", content: message },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "protocol_classification",
            strict: true,
            schema: {
              type: "object",
              properties: {
                action: { type: "string", enum: allowedActions.map((a) => a.id) },
              },
              required: ["action"],
              additionalProperties: false,
            },
          },
        },
      },
      { timeout: 8000 },
    );

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") return null;

    const parsed = JSON.parse(content) as { action?: string };
    const match = allowedActions.find((a) => a.id === parsed.action);
    return match ? match.id : null;
  } catch (err) {
    // Covers: no credits (insufficient_quota), invalid key, rate limit,
    // timeout, network failure, malformed JSON. Log and fall back — never throw.
    console.error("[ai/protocol-classifier] classification failed, falling back to deterministic routing:", err);
    return null;
  }
}
