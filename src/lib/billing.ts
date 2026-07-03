import { prisma } from "@/lib/db";
import { FREE_TIER_MAX_VEHICLES, PRO_TIER } from "@/lib/tiers";

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "admin";
}

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
  if (await isAdmin(userId)) return { allowed: true, limit: Infinity, current: 0 };
  const plan = await getUserPlan(userId);
  const limit = plan?.maxVehicles ?? FREE_TIER_MAX_VEHICLES;
  const current = await getVehicleCount(userId);
  return { allowed: current < limit, limit, current };
}

export async function isPro(userId: string): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  const plan = await getUserPlan(userId);
  return plan?.tier === PRO_TIER || plan?.tier === "business";
}

export async function requirePro(userId: string): Promise<{ allowed: boolean; error: string | null }> {
  const pro = await isPro(userId);
  if (pro) return { allowed: true, error: null };
  return { allowed: false, error: "This feature requires a Pro subscription" };
}
