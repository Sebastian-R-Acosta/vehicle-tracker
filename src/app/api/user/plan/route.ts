import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FREE_TIER_MAX_VEHICLES } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ tier: "free", maxVehicles: FREE_TIER_MAX_VEHICLES });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role === "admin") {
    return NextResponse.json({
      tier: "business",
      maxVehicles: 99999,
      name: "Admin",
      status: "active",
      paymentProcessor: "free",
    });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  if (!sub || sub.status !== "active") {
    return NextResponse.json({
      tier: "free",
      maxVehicles: FREE_TIER_MAX_VEHICLES,
      paymentProcessor: "free",
    });
  }

  return NextResponse.json({
    tier: sub.plan.tier,
    maxVehicles: sub.plan.maxVehicles,
    name: sub.plan.name,
    status: sub.status,
    paymentProcessor: sub.paymentProcessor,
  });
}
