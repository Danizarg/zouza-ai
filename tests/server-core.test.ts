import { describe, expect, it } from "vitest";
import { answerAgentQuestion, chatRespond } from "@/lib/ai/service";
import { findListing, getCatalogue } from "@/lib/server/catalogue";
import { runSubmitContact } from "@/lib/server/contact";
import { runAiSearch } from "@/lib/server/search";
import { EMPTY_GLOBAL_REPLY, PROPERTY_NOT_FOUND_REPLY, runSuziChat } from "@/lib/server/suzi";

describe("catalogue", () => {
  it("serves the 12 seeded listings and finds by id or slug", () => {
    const all = getCatalogue();
    expect(all).toHaveLength(12);
    expect(findListing(all[0].id)?.id).toBe(all[0].id);
    expect(findListing(all[0].slug)?.id).toBe(all[0].id);
    expect(findListing("nope")).toBeNull();
  });
});

describe("runSuziChat (no model key → deterministic fallback)", () => {
  it("global: routes a seller to the listing wizard", async () => {
    const r = await runSuziChat({ message: "I want to sell my property", surface: "global", route: "/" });
    expect(r.source).toBe("fallback");
    expect(r.navigation?.href).toBe("/list-with-ai");
  });

  it("global: empty message gets the fixed prompt", async () => {
    const r = await runSuziChat({ message: "   ", surface: "global" });
    expect(r.text).toBe(EMPTY_GLOBAL_REPLY);
  });

  it("global: answers from the listing in view when given a listingId", async () => {
    const listing = findListing("l-javea-villa")!;
    const r = await runSuziChat({ message: "Are pets allowed?", surface: "global", route: `/property/${listing.slug}`, listingId: listing.id });
    expect(r.text).toBe(answerAgentQuestion(listing, "Are pets allowed?"));
    expect(r.navigation).toBeNull();
  });

  it("home: never navigates and falls back to chatRespond", async () => {
    const r = await runSuziChat({ message: "Villa in Marbella with sea view", surface: "home" });
    expect(r.navigation).toBeNull();
    expect(r.text).toBe(chatRespond("Villa in Marbella with sea view"));
  });

  it("property: unknown listing gets the not-found line", async () => {
    const r = await runSuziChat({ message: "Is it available?", surface: "property", listingId: "draft-x" });
    expect(r.text).toBe(PROPERTY_NOT_FOUND_REPLY);
  });

  it("property: answers from that listing's data", async () => {
    const listing = findListing("l-marbella-villa")!;
    const r = await runSuziChat({ message: "Are there community fees?", surface: "property", listingId: listing.id });
    expect(r.text).toBe(answerAgentQuestion(listing, "Are there community fees?"));
  });
});

describe("runAiSearch", () => {
  it("falls back to the deterministic scorer", async () => {
    const r = await runAiSearch("villa in Marbella");
    expect(r.source).toBe("fallback");
    expect(r.matches[0]?.listing.id).toBe("l-marbella-villa");
  });
  it("returns nothing for an empty query", async () => {
    expect((await runAiSearch("  ")).matches).toEqual([]);
  });
});

describe("runSubmitContact", () => {
  it("rejects invalid input", async () => {
    expect((await runSubmitContact({ reason: "", name: "A", email: "x", message: "short" })).ok).toBe(false);
  });
  it("accepts valid input in mock mode (no Supabase, no SMTP)", async () => {
    const r = await runSubmitContact({ reason: "Support", name: "Ana", email: "ana@example.com", message: "Hello, I have a question." });
    expect(r.ok).toBe(true);
  });
});
