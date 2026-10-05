import { beforeEach, describe, expect, it } from "vitest";
import { GET as getListing } from "@/app/api/v1/listings/[id]/route";
import { POST as contact } from "@/app/api/v1/contact/route";
import { POST as generate } from "@/app/api/v1/listings/generate/route";
import { GET as listings, OPTIONS as listingsOptions } from "@/app/api/v1/listings/route";
import { GET as meta } from "@/app/api/v1/meta/route";
import { POST as search } from "@/app/api/v1/search/route";
import { POST as chat } from "@/app/api/v1/suzi/chat/route";
import { resetRateLimitsForTests } from "@/lib/rate-limit";
import { PROPERTY_NOT_FOUND_REPLY } from "@/lib/server/suzi";
import { FACTS } from "./fixtures";

const post = (body: unknown, ip = "1.2.3.4") =>
  new Request("http://localhost/api", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
  });
const get = (headers: Record<string, string> = {}) => new Request("http://localhost/api", { headers });

beforeEach(() => resetRateLimitsForTests());

describe("GET /api/v1/listings", () => {
  it("returns the catalogue", async () => {
    const body = await (await listings(get())).json();
    expect(body.listings).toHaveLength(12);
  });
  it("answers CORS preflight for the Expo web dev origin", async () => {
    const res = listingsOptions(get({ origin: "http://localhost:8081" }));
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:8081");
  });
});

describe("GET /api/v1/listings/:id", () => {
  it("finds by id and by slug, 404s otherwise", async () => {
    const byId = await getListing(get(), { params: Promise.resolve({ id: "l-marbella-villa" }) });
    const body = await byId.json();
    expect(body.listing.id).toBe("l-marbella-villa");
    expect(Array.isArray(body.reviews)).toBe(true);
    const bySlug = await getListing(get(), { params: Promise.resolve({ id: body.listing.slug }) });
    expect((await bySlug.json()).listing.id).toBe("l-marbella-villa");
    expect((await getListing(get(), { params: Promise.resolve({ id: "missing" }) })).status).toBe(404);
  });
});

describe("POST /api/v1/suzi/chat", () => {
  it("400s without a surface", async () => {
    expect((await chat(post({ message: "hi" }))).status).toBe(400);
  });
  it("routes a seller to the wizard via the fallback brain", async () => {
    const body = await (await chat(post({ message: "I want to sell my flat", surface: "global", route: "/" }))).json();
    expect(body.navigation.href).toBe("/list-with-ai");
    expect(body.source).toBe("fallback");
  });
  it("property surface with an unknown id says so", async () => {
    const body = await (await chat(post({ message: "Is it free?", surface: "property", listingId: "draft-abc" }))).json();
    expect(body.text).toBe(PROPERTY_NOT_FOUND_REPLY);
  });
  it("429s after 30 messages a minute from one IP", async () => {
    for (let i = 0; i < 30; i++) expect((await chat(post({ message: "hi", surface: "home" }, "5.5.5.5"))).status).toBe(200);
    const res = await chat(post({ message: "hi", surface: "home" }, "5.5.5.5"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });
});

describe("POST /api/v1/search", () => {
  it("ranks the catalogue", async () => {
    const body = await (await search(post({ query: "villa in Marbella" }))).json();
    expect(body.matches[0].listing.id).toBe("l-marbella-villa");
  });
  it("400s on an empty query", async () => {
    expect((await search(post({ query: " " }))).status).toBe(400);
  });
});

describe("POST /api/v1/listings/generate", () => {
  it("returns generated content", async () => {
    const body = await (await generate(post({ facts: FACTS }))).json();
    expect(body.content.title.length).toBeGreaterThan(0);
    expect(body.source).toBe("fallback");
  });
  it("400s on malformed facts", async () => {
    expect((await generate(post({ facts: { ...FACTS, intent: "lease" } }))).status).toBe(400);
  });
  it("allows only 6 generations a minute per IP", async () => {
    for (let i = 0; i < 6; i++) expect((await generate(post({ facts: FACTS }, "7.7.7.7"))).status).toBe(200);
    expect((await generate(post({ facts: FACTS }, "7.7.7.7"))).status).toBe(429);
  });
});

describe("POST /api/v1/contact", () => {
  const valid = { reason: "Support", name: "Ana", email: "ana@example.com", message: "Hello, I have a question." };
  it("accepts a valid message", async () => {
    expect(await (await contact(post(valid))).json()).toEqual({ ok: true });
  });
  it("silently drops honeypot submissions", async () => {
    expect(await (await contact(post({ ...valid, company: "Spam Inc" }))).json()).toEqual({ ok: true });
  });
  it("400s on an invalid email", async () => {
    expect((await contact(post({ ...valid, email: "nope" }))).status).toBe(400);
  });
});

describe("GET /api/v1/meta", () => {
  it("reports app versions", async () => {
    const body = await (await meta(get())).json();
    expect(body).toEqual({ minAppVersion: "1.0.0", latestAppVersion: "1.0.0" });
  });
});
