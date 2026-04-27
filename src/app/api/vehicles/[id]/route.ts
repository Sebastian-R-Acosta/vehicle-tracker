import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
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
    include: {
      maintenanceRecords: {
        orderBy: { date: "desc" },
      },
      reminders: {
        where: { isCompleted: false },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  return NextResponse.json(vehicle);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { make, model, year, vin, nickname, currentMileage, vehicleType, status } = body;

  const vehicle = await prisma.vehicle.findFirst({
    where: { 
      id: params.id,
      userId: session.user.id 
    },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const updated = await prisma.vehicle.update({
    where: { id: params.id },
    data: {
      make,
      model,
      year,
      vin,
      nickname,
      currentMileage,
      vehicleType: vehicleType || "car",
      status: status || "active",
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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

  await prisma.vehicle.delete({
    where: { id: params.id },
  });

  return new NextResponse("Deleted", { status: 200 });
}