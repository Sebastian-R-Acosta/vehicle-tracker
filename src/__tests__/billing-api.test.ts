/**
 * @jest-environment node
 */

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    billingPortal: {
      sessions: { create: jest.fn() },
    },
  },
  FREE_TIER_MAX_VEHICLES: 1,
  PRO_TIER: "pro",
  BUSINESS_TIER: "business",
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const mockAuth = auth as unknown as jest.Mock;
const mockPrisma = prisma as unknown as {
  subscription: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    upsert: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
  };
  subscriptionPlan: {
    findUnique: jest.Mock;
  };
};

describe("POST /api/billing/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const { POST } = await import("@/app/api/billing/checkout/route");
    const req = new Request("http://localhost/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ tier: "pro" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid tier", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const { POST } = await import("@/app/api/billing/checkout/route");
    const req = new Request("http://localhost/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ tier: "invalid" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("routes to PayPal for new users without Stripe sub", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeSubId: null,
      stripeCustomerId: null,
    });

    jest.mock("@/app/api/paypal/checkout/route", () => ({
      POST: jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ url: "https://paypal.com/approve", subscriptionId: "sub_123" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      ),
    }));

    const { POST } = await import("@/app/api/billing/checkout/route");
    const req = new Request("http://localhost/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ tier: "pro" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/billing/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for unknown webhook source", async () => {
    const { POST } = await import("@/app/api/billing/webhook/route");
    const req = new Request("http://localhost/api/billing/webhook", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain("Unknown");
  });
});

describe("POST /api/billing/portal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const { POST } = await import("@/app/api/billing/portal/route");
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns 404 when no subscription exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.subscription.findUnique.mockResolvedValue(null);

    const { POST } = await import("@/app/api/billing/portal/route");
    const res = await POST();
    expect(res.status).toBe(404);
  });

  it("returns 404 for free tier user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-free" } });
    mockPrisma.subscription.findUnique.mockResolvedValue({
      paymentProcessor: "free",
      stripeCustomerId: null,
      paypalSubId: null,
    });

    const { POST } = await import("@/app/api/billing/portal/route");
    const res = await POST();
    expect(res.status).toBe(404);
  });

  it("returns Stripe portal URL for Stripe users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-stripe" } });
    mockPrisma.subscription.findUnique.mockResolvedValue({
      paymentProcessor: "stripe",
      stripeCustomerId: "cus_123",
      paypalSubId: null,
    });

    (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue({
      url: "https://stripe.com/portal_session",
    });

    const { POST } = await import("@/app/api/billing/portal/route");
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toContain("stripe.com");
  });

  it("returns PayPal autopay URL for PayPal users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-paypal" } });
    mockPrisma.subscription.findUnique.mockResolvedValue({
      paymentProcessor: "paypal",
      stripeCustomerId: null,
      paypalSubId: "I-ABC123",
    });

    const { POST } = await import("@/app/api/billing/portal/route");
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toContain("paypal.com");
  });
});
