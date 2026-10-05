import { describe, expect, it } from "vitest";
import { answerAgentQuestion, generateListingContentWithSource } from "@/lib/ai/service";
import { getMockListing } from "@/lib/mock-data";
import { FACTS } from "./fixtures";

describe("answerAgentQuestion", () => {
  it("never invents viewing slots the owner never offered", () => {
    const listing = getMockListing("l-valencia-penthouse")!;
    const answer = answerAgentQuestion(listing, "Can I book a viewing?");
    expect(answer).not.toMatch(/thursday|saturday|slots available/i);
    expect(answer).toMatch(/Request viewing/);
  });
});

describe("generateListingContentWithSource", () => {
  it("uses the template generator when no model key is configured", async () => {
    const result = await generateListingContentWithSource(FACTS);
    expect(result.source).toBe("fallback");
    expect(result.content.title.length).toBeGreaterThan(0);
    expect(result.content.faq.length).toBeGreaterThan(0);
  });
});
