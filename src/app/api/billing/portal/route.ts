import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!sub) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  if (sub.paymentProcessor === "free" || (!sub.stripeCustomerId && !sub.paypalSubId)) {
    return NextResponse.json({ error: "No active paid subscription" }, { status: 404 });
  }

  if (sub.stripeCustomerId) {
    const { stripe } = await import("@/lib/stripe");
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });
    return NextResponse.json({ url: portal.url });
  }

  if (sub.paypalSubId) {
    return NextResponse.json({
      url: "https://www.paypal.com/myaccount/autopay/",
      message: "Manage your PayPal subscription in your PayPal account settings.",
    });
  }

  return NextResponse.json({ error: "No subscription management available" }, { status: 404 });
}
