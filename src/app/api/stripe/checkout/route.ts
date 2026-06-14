import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe, PRO_PRICE_ID, BUSINESS_PRICE_ID } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!sub?.stripeSubId && !sub?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Stripe is only available for existing subscriptions. New subscriptions use PayPal." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { priceId, tier } = body;

  const resolvedPriceId = priceId || (tier === "business" ? BUSINESS_PRICE_ID : PRO_PRICE_ID);

  if (!resolvedPriceId || (resolvedPriceId !== PRO_PRICE_ID && resolvedPriceId !== BUSINESS_PRICE_ID)) {
    return new NextResponse("Invalid price ID", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  const customerId = user.subscription?.stripeCustomerId;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: resolvedPriceId, quantity: 1 }],
    customer: customerId || undefined,
    customer_email: customerId ? undefined : user.email,
    client_reference_id: user.id,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: checkout.url });
}
