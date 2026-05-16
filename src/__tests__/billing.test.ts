import { FREE_TIER_MAX_VEHICLES, PRO_TIER, BUSINESS_TIER } from "@/lib/stripe";

jest.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findUnique: jest.fn(),
    },
    vehicle: {
      count: jest.fn(),
    },
  },
}));

jest.mock("@/lib/stripe", () => ({
  ...jest.requireActual("@/lib/stripe"),
  FREE_TIER_MAX_VEHICLES: 2,
  PRO_TIER: "pro",
  BUSINESS_TIER: "business",
}));

import { prisma } from "@/lib/db";

const mockPrisma = prisma as unknown as {
  subscription: { findUnique: jest.Mock };
  vehicle: { count: jest.Mock };
};

describe("billing utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("FREE_TIER_MAX_VEHICLES", () => {
    it("limits free tier to 2 vehicles", () => {
      expect(FREE_TIER_MAX_VEHICLES).toBe(2);
    });
  });

  describe("getUserPlan", () => {
    it("returns the user's plan when subscribed", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        plan: { tier: "pro", maxVehicles: 999, name: "Pro" },
      });

      const { getUserPlan } = await import("@/lib/billing");
      const plan = await getUserPlan("user-1");
      expect(plan?.tier).toBe("pro");
      expect(mockPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        include: { plan: true },
      });
    });

    it("returns null when no subscription exists", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const { getUserPlan } = await import("@/lib/billing");
      const plan = await getUserPlan("user-no-sub");
      expect(plan).toBeNull();
    });
  });

  describe("canAddVehicle", () => {
    it("allows adding when under the limit", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      mockPrisma.vehicle.count.mockResolvedValue(1);

      const { canAddVehicle } = await import("@/lib/billing");
      const result = await canAddVehicle("user-1");
      expect(result.allowed).toBe(true);
      expect(result.current).toBe(1);
      expect(result.limit).toBe(2);
    });

    it("blocks adding when at the limit", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      mockPrisma.vehicle.count.mockResolvedValue(2);

      const { canAddVehicle } = await import("@/lib/billing");
      const result = await canAddVehicle("user-1");
      expect(result.allowed).toBe(false);
      expect(result.current).toBe(2);
      expect(result.limit).toBe(2);
    });

    it("uses pro limits for pro users", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        plan: { tier: "pro", maxVehicles: 999, name: "Pro" },
      });
      mockPrisma.vehicle.count.mockResolvedValue(500);

      const { canAddVehicle } = await import("@/lib/billing");
      const result = await canAddVehicle("pro-user");
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(999);
    });
  });
});
