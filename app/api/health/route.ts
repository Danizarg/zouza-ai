import { getAiModel, getAiProvider } from "@/lib/ai/provider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { NextResponse } from "next/server";

/**
 * Deployment self-check: which backends this deployment can see.
 *
 * `GET /api/health` answers the question "is Suzi actually on the real
 * model here?" without reading server logs. It reports configuration only
 * — provider name and model id, never a key — and the Supabase mode, so
 * a tester-facing deploy can be checked in one request:
 *
 *   { ok: true, ai: { enabled: true, provider: "openai", model: "gpt-5-nano" },
 *     supabase: { configured: false } }
 *
 * `enabled: true` means a key is set, not that the provider accepted it;
 * a rejected key still logs `API key rejected — falling back` on the first
 * real call. Excluded from indexing via robots.ts.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const provider = getAiProvider();
  return NextResponse.json(
    {
      ok: true,
      ai: {
        enabled: provider !== null,
        provider,
        model: getAiModel(),
      },
      supabase: { configured: isSupabaseConfigured() },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
