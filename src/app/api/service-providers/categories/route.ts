import { auth } from "@/auth";
import { NextResponse } from "next/server";

const CATEGORIES = [
  "general",
  "dealership",
  "independent",
  "tire",
  "body",
  "transmission",
  "oil",
  "brake",
  "electrical",
  "ac",
  "towing",
  "detail",
];

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json(CATEGORIES);
}
