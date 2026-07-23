import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [docs, total] = await Promise.all([
    prisma.vehicleDocument.findMany({
      include: { vehicle: { select: { make: true, model: true, user: { select: { email: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.vehicleDocument.count(),
  ]);

  return NextResponse.json({ docs, total });
}
