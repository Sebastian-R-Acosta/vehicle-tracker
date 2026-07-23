import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      include: { user: { select: { email: true, name: true } }, _count: { select: { maintenanceRecords: true, reminders: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.count(),
  ]);

  return NextResponse.json({ vehicles, total });
}
