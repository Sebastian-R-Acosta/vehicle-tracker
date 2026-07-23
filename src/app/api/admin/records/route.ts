import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [records, total] = await Promise.all([
    prisma.maintenanceRecord.findMany({
      include: { vehicle: { select: { make: true, model: true, user: { select: { email: true } } } } },
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.maintenanceRecord.count(),
  ]);

  return NextResponse.json({ records, total });
}
