import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMaintenanceConfirmation } from "@/lib/email";

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
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const records = await prisma.maintenanceRecord.findMany({
    where: { vehicleId: params.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}

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

  const body = await request.json();
  const { date, serviceType, mileage, notes, imageUrl, cost } = body;

  if (!date || !serviceType || !mileage) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const record = await prisma.maintenanceRecord.create({
    data: {
      vehicleId: params.id,
      date: new Date(date),
      serviceType,
      mileage,
      notes,
      imageUrl,
      cost,
    },
  });

  if (mileage > vehicle.currentMileage) {
    await prisma.vehicle.update({
      where: { id: params.id },
      data: { currentMileage: mileage },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (user?.email) {
    sendMaintenanceConfirmation(user.email, vehicle, {
      serviceType,
      date: new Date(date),
      mileage,
      notes,
    }).catch((err) => console.error("Failed to send maintenance email:", err));
  }

  return NextResponse.json(record);
}