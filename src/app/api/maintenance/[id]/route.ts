import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAccessibleVehicle } from "@/lib/vehicle-access";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const record = await prisma.maintenanceRecord.findFirst({
    where: { id: params.id },
    include: { vehicle: true },
  });

  if (!record) {
    return new NextResponse("Record not found", { status: 404 });
  }

  const vehicle = await getAccessibleVehicle(record.vehicleId, session.user.id);
  if (!vehicle) {
    return new NextResponse("Record not found", { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const existingRecord = await prisma.maintenanceRecord.findFirst({
    where: { id: params.id },
    include: { vehicle: true },
  });

  if (!existingRecord) {
    return new NextResponse("Record not found", { status: 404 });
  }

  const vehicle = await getAccessibleVehicle(existingRecord.vehicleId, session.user.id);
  if (!vehicle) {
    return new NextResponse("Record not found", { status: 404 });
  }

  const body = await request.json();
  const { date, serviceType, mileage, notes, imageUrl, cost } = body;

  const record = await prisma.maintenanceRecord.update({
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

  if (mileage > existingRecord.vehicle.currentMileage) {
    await prisma.vehicle.update({
      where: { id: existingRecord.vehicleId },
      data: { currentMileage: mileage },
    });
  }

  return NextResponse.json(record);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const existingRecord = await prisma.maintenanceRecord.findFirst({
    where: { id: params.id },
    include: { vehicle: true },
  });

  if (!existingRecord) {
    return new NextResponse("Record not found", { status: 404 });
  }

  const vehicle = await getAccessibleVehicle(existingRecord.vehicleId, session.user.id);
  if (!vehicle) {
    return new NextResponse("Record not found", { status: 404 });
  }

  await prisma.maintenanceRecord.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}