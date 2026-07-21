import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAccessibleVehicle } from "@/lib/vehicle-access";

export const dynamic = "force-dynamic";

export async function GET(
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

  const fullVehicle = await prisma.vehicle.findFirst({
    where: { id: params.id },
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

  if (!fullVehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const lastMaintenance = fullVehicle.maintenanceRecords[0];
  const nextReminder = fullVehicle.reminders.find(r => r.dueDate || r.dueMileage);
  const totalCost = fullVehicle.maintenanceRecords.reduce(
    (sum, record) => sum + (record.cost || 0),
    0
  );

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
            date: lastMaintenance.date.toISOString().split('T')[0],
            serviceType: lastMaintenance.serviceType,
            mileage: lastMaintenance.mileage,
          }
        : null,
      nextReminder: nextReminder
        ? {
            title: nextReminder.title,
            dueDate: nextReminder.dueDate?.toISOString().split('T')[0] ?? null,
            dueMileage: nextReminder.dueMileage,
          }
        : null,
      totalCost: totalCost > 0 ? totalCost : null,
    },
    maintenanceHistory: fullVehicle.maintenanceRecords.map(record => ({
      date: record.date.toISOString().split('T')[0],
      serviceType: record.serviceType,
      mileage: record.mileage,
      notes: record.notes,
      cost: record.cost,
    })),
  });
}