import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMaintenanceConfirmation } from "@/lib/email";

const SERVICE_RECOMMENDATIONS: Record<string, { miles: number; months: number; hours?: number }> = {
  "Oil Change": { miles: 5000, months: 6, hours: 250 },
  "Tire Rotation": { miles: 7500, months: 6 },
  "Brake Service": { miles: 30000, months: 24 },
  "Air Filter": { miles: 15000, months: 12 },
  "Transmission Service": { miles: 60000, months: 48 },
  "Battery Replacement": { miles: 50000, months: 48 },
  "Inspection": { miles: 12000, months: 12 },
  "Hydraulic Fluid": { miles: 0, months: 12, hours: 500 },
  "Track Inspection": { miles: 0, months: 6, hours: 250 },
  "Engine Service": { miles: 0, months: 6, hours: 250 },
  "Coolant Flush": { miles: 0, months: 24, hours: 1000 },
};

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
  const { date, serviceType, mileage, notes, imageUrl, cost, setReminder } = body;

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

  const rec = SERVICE_RECOMMENDATIONS[serviceType];
  let nextReminder = null;
  
  if (rec && setReminder !== false) {
    const dueMileage = mileage + rec.miles;
    const dueDate = new Date(date);
    dueDate.setMonth(dueDate.getMonth() + rec.months);

    const reminderData: any = {
      vehicleId: params.id,
      userId: session.user.id,
      title: `Next ${serviceType}`,
      description: `Based on ${serviceType} performed on ${new Date(date).toLocaleDateString()}`,
      dueDate,
    };

    if (rec.hours && vehicle.hoursMeter != null) {
      reminderData.dueHours = vehicle.hoursMeter + rec.hours;
    } else {
      reminderData.dueMileage = dueMileage;
    }

    nextReminder = await prisma.reminder.create({
      data: reminderData,
    });
  }

  return NextResponse.json({ record, nextReminder });
}