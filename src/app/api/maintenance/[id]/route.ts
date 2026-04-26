import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const record = await prisma.maintenanceRecord.findUnique({
    where: { id: params.id },
    include: { vehicle: true },
  });

  if (!record || record.vehicle.userId !== session.user.id) {
    return new NextResponse("Record not found", { status: 404 });
  }

  const body = await request.json();
  const { date, serviceType, mileage, notes, imageUrl, cost } = body;

  const updated = await prisma.maintenanceRecord.update({
    where: { id: params.id },
    data: {
      date: new Date(date),
      serviceType,
      mileage,
      notes,
      imageUrl,
      cost,
    },
  });

  if (mileage > record.vehicle.currentMileage) {
    await prisma.vehicle.update({
      where: { id: record.vehicleId },
      data: { currentMileage: mileage },
    });
  }

  return NextResponse.json(updated);
}