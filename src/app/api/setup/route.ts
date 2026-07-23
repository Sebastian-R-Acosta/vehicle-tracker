import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const SUBSCRIPTION_PLANS = [
  {
    id: "plan_free",
    tier: "free",
    name: "Free",
    price: 0,
    maxVehicles: 2,
    features: [
      "2 vehicles",
      "Maintenance logging",
      "Smart reminders",
      "Document storage",
      "Basic reports",
    ],
  },
  {
    id: "plan_pro",
    tier: "pro",
    name: "Pro",
    price: 9.99,
    maxVehicles: 999,
    features: [
      "Unlimited vehicles",
      "Advanced reports",
      "Priority support",
      "Export data",
      "AI-powered insights",
    ],
  },
  {
    id: "plan_business",
    tier: "business",
    name: "Business",
    price: 29.99,
    maxVehicles: 999,
    features: [
      "Everything in Pro",
      "Team management",
      "Multi-location",
      "API access",
      "Custom branding",
    ],
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    const results: string[] = [];

    // 1. Seed subscription plans
    for (const plan of SUBSCRIPTION_PLANS) {
      await prisma.subscriptionPlan.upsert({
        where: { tier: plan.tier },
        update: {
          name: plan.name,
          price: plan.price,
          maxVehicles: plan.maxVehicles,
          features: plan.features,
        },
        create: plan,
      });
      results.push(`Plan "${plan.tier}" ready`);
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Just make them superAdmin
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { superAdmin: true, role: "admin" },
      });

      // Ensure they have a free subscription
      const freePlan = await prisma.subscriptionPlan.findUnique({
        where: { tier: "free" },
      });
      if (freePlan) {
        await prisma.subscription.upsert({
          where: { userId: existingUser.id },
          update: {},
          create: {
            userId: existingUser.id,
            planId: freePlan.id,
            status: "active",
          },
        });
      }

      return NextResponse.json({
        message: "User already existed — promoted to superAdmin",
        userId: existingUser.id,
        email: existingUser.email,
        plans: results,
      });
    }

    // 3. Create user as superAdmin
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
        superAdmin: true,
        role: "admin",
        onboardingCompleted: false,
      },
    });

    // 4. Assign free subscription
    const freePlan = await prisma.subscriptionPlan.findUnique({
      where: { tier: "free" },
    });
    if (freePlan) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: "active",
        },
      });
    }

    results.push(`User "${user.email}" created as superAdmin`);
    results.push("Free subscription assigned");

    return NextResponse.json({
      message: "Database seeded successfully",
      userId: user.id,
      email: user.email,
      plans: results,
    });
  } catch (error: any) {
    console.error("[setup] Error:", error);
    return NextResponse.json(
      { error: error.message || "Setup failed" },
      { status: 500 }
    );
  }
}
