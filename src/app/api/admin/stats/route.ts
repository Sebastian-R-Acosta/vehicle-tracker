import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [userCount, vehicleCount, recordCount, docCount, orgCount, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.vehicle.count(),
    prisma.maintenanceRecord.count(),
    prisma.vehicleDocument.count(),
    prisma.organization.count(),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return NextResponse.json({ userCount, vehicleCount, recordCount, docCount, orgCount, recentUsers });
}
