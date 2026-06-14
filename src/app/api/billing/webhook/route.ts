import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const paypalAuth = request.headers.get("paypal-auth-algo");

  if (signature) {
    const { POST: stripeHandler } = await import("@/app/api/stripe/webhook/route");
    return stripeHandler(request);
  }

  if (paypalAuth) {
    const { POST: paypalHandler } = await import("@/app/api/paypal/webhook/route");
    return paypalHandler(request);
  }

  return new NextResponse("Unknown webhook source", { status: 400 });
}
