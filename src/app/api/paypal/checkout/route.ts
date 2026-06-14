import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { subscriptionsController, getPayPalPlanIdFromTier, createPayPalSubscriptionRequest } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tier } = body as { tier: "pro" | "business" };

  if (tier !== "pro" && tier !== "business") {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const planId = getPayPalPlanIdFromTier(tier);
  if (!planId) {
    return NextResponse.json({ error: "PayPal plan not configured" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const input = createPayPalSubscriptionRequest(
      planId,
      session.user.id,
      `${appUrl}/dashboard?checkout=success`,
      `${appUrl}/pricing`
    );

    const { result } = await subscriptionsController.createSubscription(input);
    const links = result?.links as Array<{ rel: string; href: string }> | undefined;
    const approvalUrl = links?.find((l) => l.rel === "approve")?.href;

    if (!approvalUrl || !result?.id) {
      return NextResponse.json({ error: "Failed to create PayPal subscription" }, { status: 500 });
    }

    return NextResponse.json({ url: approvalUrl, subscriptionId: result.id });
  } catch (err) {
    console.error("PayPal checkout error:", err);
    return NextResponse.json({ error: "Payment processor error" }, { status: 500 });
  }
}
