import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkout = event.data.object as any;
        const userId = checkout.metadata?.userId || checkout.client_reference_id;
        const subId = checkout.subscription;
        const customerId = checkout.customer;

        if (!userId || !subId) break;

        const sub: any = await stripe.subscriptions.retrieve(subId);
        const priceId = sub.items.data[0]?.price.id;

        let tier = "free";
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = "pro";
        else if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) tier = "business";

        const plan = await prisma.subscriptionPlan.findUnique({ where: { tier } });
        if (!plan) break;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            planId: plan.id,
            stripeCustomerId: customerId,
            stripeSubId: subId,
            status: sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          create: {
            userId,
            planId: plan.id,
            stripeCustomerId: customerId,
            stripeSubId: subId,
            status: sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const dbSub = await prisma.subscription.findFirst({
          where: { stripeSubId: sub.id },
        });
        if (!dbSub) break;

        const status = sub.status;
        let tier = "free";
        const priceId = sub.items.data[0]?.price.id;
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = "pro";
        else if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) tier = "business";

        const plan = await prisma.subscriptionPlan.findUnique({ where: { tier } });
        if (!plan) break;

        await prisma.subscription.update({
          where: { id: dbSub.id },
          data: {
            planId: plan.id,
            status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook error:", err);
  }

  return NextResponse.json({ received: true });
}
