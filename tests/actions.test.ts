import { beforeEach, describe, expect, it, vi } from "vitest";

// Exhaust the limiter for every caller so we can observe exactly when an
// action consults it and what a limited visitor sees.
const checkRateLimit = vi.fn(async () => false);

vi.mock("@/lib/rate-limit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/rate-limit")>()),
  checkRateLimit: () => checkRateLimit(),
}));

import { propertyChatAction } from "@/app/actions";
import { RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";
import { findListing } from "@/lib/server/catalogue";
import { PROPERTY_NOT_FOUND_REPLY } from "@/lib/server/suzi";

describe("propertyChatAction ordering (not-found before limiter, as before the shared core)", () => {
  beforeEach(() => {
    checkRateLimit.mockClear();
  });

  it("unknown listing: gets the not-found line without spending a limiter token", async () => {
    const reply = await propertyChatAction("draft-x", "Is it available?");
    expect(reply).toBe(PROPERTY_NOT_FOUND_REPLY);
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("known listing, empty message: no limiter token spent", async () => {
    const listing = findListing("l-marbella-villa")!;
    await propertyChatAction(listing.id, "   ");
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("known listing, real message: the limiter applies", async () => {
    const listing = findListing("l-marbella-villa")!;
    const reply = await propertyChatAction(listing.id, "Are there community fees?");
    expect(reply).toBe(RATE_LIMITED_MESSAGE);
    expect(checkRateLimit).toHaveBeenCalledTimes(1);
  });
});
