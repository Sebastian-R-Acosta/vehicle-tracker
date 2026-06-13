import { getTierFromPriceId, FREE_TIER_MAX_VEHICLES, PRO_TIER, BUSINESS_TIER } from "@/lib/stripe";

describe("stripe", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("has correct tier constants", () => {
    expect(FREE_TIER_MAX_VEHICLES).toBe(1);
    expect(PRO_TIER).toBe("pro");
    expect(BUSINESS_TIER).toBe("business");
  });

  it("getTierFromPriceId returns pro for pro price id", () => {
    process.env.STRIPE_PRO_PRICE_ID = "price_pro_123";
    const { getTierFromPriceId } = require("@/lib/stripe");
    expect(getTierFromPriceId("price_pro_123")).toBe("pro");
  });

  it("getTierFromPriceId returns business for business price id", () => {
    process.env.STRIPE_BUSINESS_PRICE_ID = "price_biz_456";
    const { getTierFromPriceId } = require("@/lib/stripe");
    expect(getTierFromPriceId("price_biz_456")).toBe("business");
  });

  it("getTierFromPriceId returns null for unknown price id", () => {
    const { getTierFromPriceId } = require("@/lib/stripe");
    expect(getTierFromPriceId("unknown")).toBeNull();
  });
});
