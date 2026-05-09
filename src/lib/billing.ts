import { prisma } from "@/lib/db";
import { FREE_TIER_MAX_VEHICLES } from "@/lib/stripe";

export async function getUserPlan(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  return sub?.plan || null;
}

export async function getVehicleCount(userId: string): Promise<number> {
  return prisma.vehicle.count({
    where: { userId, organizationId: null },
  });
}

export async function canAddVehicle(userId: string): Promise<{ allowed: boolean; limit: number; current: number }> {
  const plan = await getUserPlan(userId);
  const limit = plan?.maxVehicles ?? FREE_TIER_MAX_VEHICLES;
  const current = await getVehicleCount(userId);
  return { allowed: current < limit, limit, current };
}
