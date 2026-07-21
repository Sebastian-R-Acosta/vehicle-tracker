import { FREE_TIER_MAX_VEHICLES, PRO_TIER, BUSINESS_TIER } from "@/lib/tiers";

describe("tiers", () => {
  it("has correct tier constants", () => {
    expect(FREE_TIER_MAX_VEHICLES).toBe(2);
    expect(PRO_TIER).toBe("pro");
    expect(BUSINESS_TIER).toBe("business");
  });
});
