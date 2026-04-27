import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id },
    include: {
      maintenanceRecords: {
        take: 1,
        orderBy: { date: "desc" },
      },
      reminders: {
        where: {
          isCompleted: false,
        },
        take: 10,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { make, model, year, vin, nickname, currentMileage, vehicleType, status } = body;

  if (!make || !model || !year) {
    return new NextResponse(JSON.stringify({ error: "Missing required fields", make, model, year }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const vehicleYear = parseInt(year, 10);
  if (isNaN(vehicleYear)) {
    return new NextResponse(JSON.stringify({ error: "Invalid year" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: session.user.id,
      make,
      model,
      year: vehicleYear,
      vin: vin || null,
      nickname: nickname || null,
      currentMileage: parseInt(currentMileage, 10) || 0,
      vehicleType: vehicleType || "car",
      status: status || "active",
    },
  });

  return NextResponse.json(vehicle);
}