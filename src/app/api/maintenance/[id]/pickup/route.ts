import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Customer confirms they collected the vehicle, closing the job the workshop marked
 * as "ready". Only the owner can do this, and only from "ready" — a job still in
 * progress cannot be picked up, and a completed one is already closed.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const record = await prisma.maintenanceRecord.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      status: true,
      acknowledgedAt: true,
      vehicle: { select: { userId: true } },
    },
  });

  if (!record || record.vehicle.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (record.status === "completed") {
    return NextResponse.json({ status: "completed", alreadyCompleted: true });
  }

  if (record.status !== "ready") {
    return NextResponse.json(
      { error: "This service is not ready for pickup yet" },
      { status: 409 }
    );
  }

  const updated = await prisma.maintenanceRecord.update({
    where: { id: params.id },
    data: {
      status: "completed",
      // Picking the vehicle up is a stronger signal than opening the email, so it
      // also settles the acknowledgement if that never happened.
      acknowledgedAt: record.acknowledgedAt ?? new Date(),
    },
    select: { status: true, acknowledgedAt: true },
  });

  return NextResponse.json({ ...updated, alreadyCompleted: false });
}
