import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "Missing ids query parameter" }, { status: 400 });
  }

  const ids = idsParam.split(",").filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ error: "No valid IDs provided" }, { status: 400 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
    include: {
      maintenanceRecords: {
        orderBy: { date: "desc" },
      },
      reminders: {
        where: { isCompleted: false },
        orderBy: [{ dueDate: "asc" }, { dueMileage: "asc" }],
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const reports = vehicles.map((vehicle) => {
    const lastMaintenance = vehicle.maintenanceRecords[0];
    const nextReminder = vehicle.reminders.find((r) => r.dueDate || r.dueMileage);
    const totalCost = vehicle.maintenanceRecords.reduce(
      (sum, r) => sum + (r.cost || 0),
      0
    );

    return {
      vehicle: {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        nickname: vehicle.nickname,
        licensePlate: vehicle.licensePlate,
        vin: vehicle.vin,
        currentMileage: vehicle.currentMileage,
        status: vehicle.status,
      },
      summary: {
        lastMaintenance: lastMaintenance
          ? {
              date: lastMaintenance.date.toISOString().split("T")[0],
              serviceType: lastMaintenance.serviceType,
              mileage: lastMaintenance.mileage,
            }
          : null,
        nextReminder: nextReminder
          ? {
              title: nextReminder.title,
              dueDate: nextReminder.dueDate?.toISOString().split("T")[0] ?? null,
              dueMileage: nextReminder.dueMileage,
            }
          : null,
        totalCost: totalCost > 0 ? totalCost : null,
      },
      maintenanceHistory: vehicle.maintenanceRecords.map((r) => ({
        date: r.date.toISOString().split("T")[0],
        serviceType: r.serviceType,
        mileage: r.mileage,
        notes: r.notes,
        cost: r.cost,
      })),
      reminders: vehicle.reminders.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        dueDate: r.dueDate?.toISOString().split("T")[0] ?? null,
        dueMileage: r.dueMileage,
      })),
      documents: vehicle.documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        fileUrl: d.fileUrl,
        expiryDate: d.expiryDate?.toISOString().split("T")[0] ?? null,
      })),
    };
  });

  return NextResponse.json({ vehicles: reports });
}
