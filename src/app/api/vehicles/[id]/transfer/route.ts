import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { 
      id: params.id,
      userId: session.user.id 
    },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  const transferCode = await prisma.transferCode.create({
    data: {
      vehicleId: params.id,
      ownerId: session.user.id,
      code,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json(transferCode);
}