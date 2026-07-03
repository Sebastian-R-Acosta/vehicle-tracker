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

  if (sub.paymentProcessor === "free" || !sub.paypalSubId) {
    return NextResponse.json({ error: "No active paid subscription" }, { status: 404 });
  }

  return NextResponse.json({
    url: `${process.env.NEXT_PUBLIC_PAYPAL_MANAGE_URL || "https://www.paypal.com/myaccount/autopay/"}`,
    message: "Manage your subscription in your PayPal account settings.",
  });
}
