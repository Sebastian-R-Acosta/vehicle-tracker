import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayPalWebhook, getTierFromPayPalPlanId, subscriptionsController } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const headers = request.headers;

  const isValid = await verifyPayPalWebhook(headers, body);
  if (!isValid) {
    return new NextResponse("Invalid webhook signature", { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  try {
    const eventType = event.event_type as string;
    const resource = event.resource as Record<string, unknown>;

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "PAYMENT.SALE.COMPLETED": {
        const billingAgreementId = resource.billing_agreement_id as string | undefined;
        const subResourceId = resource.id as string | undefined;
        const subscriptionId = billingAgreementId || subResourceId || "";
        const customId = (resource.custom_id as string) || "";

        if (!subscriptionId || !customId) break;

        const { result: subDetails } = await subscriptionsController.getSubscription({
          id: subscriptionId,
        });
        const subResult = subDetails as Record<string, unknown> | undefined;
        const planId = (subResult?.planId as string) || (subResult?.plan_id as string) || "";
        const tier = planId ? getTierFromPayPalPlanId(planId) : null;
        if (!tier) break;

        const plan = await prisma.subscriptionPlan.findUnique({ where: { tier } });
        if (!plan) break;

        const payerResource = resource.payer as Record<string, unknown> | undefined;
        const payerId = (payerResource?.payer_id as string) || (payerResource?.email_address as string) || "";

        await prisma.subscription.upsert({
          where: { userId: customId },
          update: {
            planId: plan.id,
            paymentProcessor: "paypal",
            paypalSubId: subscriptionId,
            paypalPayerId: payerId || null,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          create: {
            userId: customId,
            planId: plan.id,
            paymentProcessor: "paypal",
            paypalSubId: subscriptionId,
            paypalPayerId: payerId || null,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subId = resource.id;
        if (!subId) break;

        const existing = await prisma.subscription.findFirst({
          where: { paypalSubId: subId },
        });
        if (!existing) break;

        const newStatus = eventType === "BILLING.SUBSCRIPTION.CANCELLED" ? "canceled" : "suspended";
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { status: newStatus },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.REACTIVATED": {
        const reactivateId = resource.id;
        if (!reactivateId) break;

        const existing = await prisma.subscription.findFirst({
          where: { paypalSubId: reactivateId },
        });
        if (!existing) break;

        await prisma.subscription.update({
          where: { id: existing.id },
          data: { status: "active" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json({ received: false, error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
