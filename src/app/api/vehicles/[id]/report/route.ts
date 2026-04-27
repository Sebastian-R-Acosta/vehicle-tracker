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
        orderBy: [{ dueDate: "asc" }, { dueMileage: "asc" }],
      },
    },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const lastMaintenance = vehicle.maintenanceRecords[0];
  const nextReminder = vehicle.reminders.find(r => r.dueDate || r.dueMileage);

  return NextResponse.json({
    vehicle: {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      nickname: vehicle.nickname,
      vin: vehicle.vin,
      currentMileage: vehicle.currentMileage,
    },
    summary: {
      lastMaintenance: lastMaintenance
        ? {
            date: lastMaintenance.date,
            serviceType: lastMaintenance.serviceType,
            mileage: lastMaintenance.mileage,
          }
        : null,
      nextReminder: nextReminder
        ? {
            title: nextReminder.title,
            dueDate: nextReminder.dueDate,
            dueMileage: nextReminder.dueMileage,
          }
        : null,
    },
    maintenanceHistory: vehicle.maintenanceRecords,
  });
}