import { auth } from "@/auth";
import { NextResponse } from "next/server";

const CATEGORIES = [
  "engine",
  "transmission",
  "brakes",
  "suspension",
  "electrical",
  "body",
  "interior",
  "tires",
  "filters",
  "fluids",
  "belts",
  "hoses",
  "lighting",
  "exhaust",
  "cooling",
  "other",
];

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json(CATEGORIES);
}
