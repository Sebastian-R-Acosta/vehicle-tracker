import { auth } from "@/auth";
import { NextResponse } from "next/server";

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

  const { POST: paypalCheckout } = await import("@/app/api/paypal/checkout/route");
  return paypalCheckout(request);
}
