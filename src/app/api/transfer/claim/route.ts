import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { code } = body;

  if (!code) {
    return new NextResponse("Code required", { status: 400 });
  }

  const transferCode = await prisma.transferCode.findUnique({
    where: { code: code.toUpperCase() },
    include: { vehicle: true },
  });

  if (!transferCode) {
    return new NextResponse("Invalid code", { status: 404 });
  }

  if (transferCode.expiresAt < new Date()) {
    return new NextResponse("Code expired", { status: 400 });
  }

  if (transferCode.usedAt) {
    return new NextResponse("Code already used", { status: 400 });
  }

  const previousOwnerId = transferCode.vehicle.userId;

  await prisma.vehicle.update({
    where: { id: transferCode.vehicleId },
    data: {
      userId: session.user.id,
      previousOwnerId,
    },
  });

  await prisma.transferCode.update({
    where: { id: transferCode.id },
    data: {
      usedAt: new Date(),
      usedByUserId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}