import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { POST: paypalHandler } = await import("@/app/api/paypal/webhook/route");
  return paypalHandler(request);
}
