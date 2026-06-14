/**
 * @jest-environment node
 */

export {};

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe("paypal client", () => {
  it("getTierFromPayPalPlanId returns pro for pro plan id", () => {
    process.env.PAYPAL_PRO_PLAN_ID = "plan_pro_123";
    const { getTierFromPayPalPlanId } = require("@/lib/paypal");
    expect(getTierFromPayPalPlanId("plan_pro_123")).toBe("pro");
  });

  it("getTierFromPayPalPlanId returns business for business plan id", () => {
    process.env.PAYPAL_BUSINESS_PLAN_ID = "plan_biz_456";
    const { getTierFromPayPalPlanId } = require("@/lib/paypal");
    expect(getTierFromPayPalPlanId("plan_biz_456")).toBe("business");
  });

  it("getTierFromPayPalPlanId returns null for unknown plan id", () => {
    const { getTierFromPayPalPlanId } = require("@/lib/paypal");
    expect(getTierFromPayPalPlanId("unknown")).toBeNull();
  });

  it("getPayPalPlanIdFromTier returns pro plan id for pro tier", () => {
    process.env.PAYPAL_PRO_PLAN_ID = "plan_pro_789";
    const { getPayPalPlanIdFromTier } = require("@/lib/paypal");
    expect(getPayPalPlanIdFromTier("pro")).toBe("plan_pro_789");
  });

  it("getPayPalPlanIdFromTier returns business plan id for business tier", () => {
    process.env.PAYPAL_BUSINESS_PLAN_ID = "plan_biz_789";
    const { getPayPalPlanIdFromTier } = require("@/lib/paypal");
    expect(getPayPalPlanIdFromTier("business")).toBe("plan_biz_789");
  });

  it("createPayPalSubscriptionRequest builds the correct request shape", () => {
    const { createPayPalSubscriptionRequest } = require("@/lib/paypal");
    const req = createPayPalSubscriptionRequest(
      "plan_123",
      "user-abc",
      "https://example.com/success",
      "https://example.com/cancel"
    );

    expect(req).toEqual({
      prefer: "return=representation",
      body: {
        planId: "plan_123",
        application_context: {
          brand_name: "Vehicle Tracker",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: "https://example.com/success",
          cancel_url: "https://example.com/cancel",
        },
        custom_id: "user-abc",
      },
    });
  });

  it("has PAYPAL_WEBHOOK_ID exported", () => {
    process.env.PAYPAL_WEBHOOK_ID = "wh_abc123";
    const { PAYPAL_WEBHOOK_ID } = require("@/lib/paypal");
    expect(PAYPAL_WEBHOOK_ID).toBe("wh_abc123");
  });
});
