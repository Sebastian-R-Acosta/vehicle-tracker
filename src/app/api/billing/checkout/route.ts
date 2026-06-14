import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const hasStripeSub = !!(sub?.stripeSubId || sub?.stripeCustomerId);

  if (hasStripeSub) {
    const { POST: stripeCheckout } = await import("@/app/api/stripe/checkout/route");
    return stripeCheckout(request);
  }

  const { POST: paypalCheckout } = await import("@/app/api/paypal/checkout/route");
  return paypalCheckout(request);
}
