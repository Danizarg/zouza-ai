import { beforeEach, describe, expect, it } from "vitest";
import { corsHeaders, parseBody } from "@/lib/api/http";
import { chatRequestSchema, contactRequestSchema, generateRequestSchema } from "@/lib/api/schemas";
import { checkRateLimit, clientKeyFromRequest, resetRateLimitsForTests } from "@/lib/rate-limit";
import { FACTS } from "./fixtures";

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json", ...headers } });

describe("rate limit", () => {
  beforeEach(() => resetRateLimitsForTests());
  it("allows 30 per minute per key and bucket, then blocks", async () => {
    for (let i = 0; i < 30; i++) expect(await checkRateLimit({ key: "1.1.1.1" })).toBe(true);
    expect(await checkRateLimit({ key: "1.1.1.1" })).toBe(false);
    expect(await checkRateLimit({ key: "2.2.2.2" })).toBe(true);
    expect(await checkRateLimit({ key: "1.1.1.1", bucket: "contact", max: 5 })).toBe(true);
  });
  it("reads the first forwarded hop", () => {
    expect(clientKeyFromRequest(post({}, { "x-forwarded-for": "9.9.9.9, 10.0.0.1" }))).toBe("9.9.9.9");
  });
});

describe("parseBody", () => {
  it("400s on invalid JSON", async () => {
    const req = new Request("http://localhost/api", { method: "POST", body: "{nope" });
    const r = await parseBody(req, chatRequestSchema);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(400);
  });
  it("400s on schema violations and keeps only the last 8 history turns", async () => {
    expect((await parseBody(post({ message: "hi" }), chatRequestSchema)).ok).toBe(false);
    const history = Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `t${i}` }));
    const r = await parseBody(post({ message: "hi", surface: "global", history }), chatRequestSchema);
    expect(r.ok && r.data.history?.length).toBe(8);
  });
  it("validates listing facts and contact forms", async () => {
    expect((await parseBody(post({ facts: FACTS }), generateRequestSchema)).ok).toBe(true);
    expect((await parseBody(post({ facts: { ...FACTS, bedrooms: "four" } }), generateRequestSchema)).ok).toBe(false);
    expect((await parseBody(post({ reason: "Support", name: "Ana", email: "ana@example.com", message: "Hello there friend", company: "" }), contactRequestSchema)).ok).toBe(true);
  });
});

describe("corsHeaders", () => {
  it("echoes allowed dev origins only", () => {
    expect(corsHeaders(post({}, { origin: "http://localhost:8081" }))["Access-Control-Allow-Origin"]).toBe("http://localhost:8081");
    expect(corsHeaders(post({}, { origin: "https://evil.example" }))["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});
