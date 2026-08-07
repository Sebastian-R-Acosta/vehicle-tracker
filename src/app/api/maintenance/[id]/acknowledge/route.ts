import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Customer confirms they saw the service notification, so the workshop can tell a
 * delivered notice from an unread one. Only the vehicle owner can acknowledge.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const record = await prisma.maintenanceRecord.findUnique({
    where: { id: params.id },
    include: { vehicle: { select: { userId: true } } },
  });

  if (!record || record.vehicle.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (record.acknowledgedAt) {
    return NextResponse.json({ acknowledgedAt: record.acknowledgedAt, alreadyConfirmed: true });
  }

  const updated = await prisma.maintenanceRecord.update({
    where: { id: params.id },
    data: { acknowledgedAt: new Date() },
    select: { acknowledgedAt: true },
  });

  return NextResponse.json({ acknowledgedAt: updated.acknowledgedAt, alreadyConfirmed: false });
}
