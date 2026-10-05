import { describe, expect, it } from "vitest";
import { totalMoveIn } from "@/lib/utils";

describe("totalMoveIn", () => {
  it("adds rent, utilities, deposit and the fee on one month's rent", () => {
    expect(
      totalMoveIn({ price_monthly: 1200, utilities_monthly: 150, deposit: 1200, platform_fee_percent: 3 }),
    ).toBe(2586);
  });
});
