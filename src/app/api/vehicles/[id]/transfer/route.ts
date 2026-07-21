import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { getAccessibleVehicle } from "@/lib/vehicle-access";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await getAccessibleVehicle(params.id, session.user.id);

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const code = randomBytes(6).toString("hex").toUpperCase();

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