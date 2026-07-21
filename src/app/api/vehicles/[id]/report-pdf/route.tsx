import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderToStream } from "@react-pdf/renderer";
import VehicleReportPDF from "@/components/VehicleReportPDF";
import { requirePro } from "@/lib/billing";
import { getAccessibleVehicle } from "@/lib/vehicle-access";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { allowed, error } = await requirePro(session.user.id);
  if (!allowed) {
    return NextResponse.json({ error }, { status: 403 });
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
      previousOwner: true,
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
  const totalCost = fullVehicle.maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  const data = {
    vehicle: {
      year: fullVehicle.year,
      make: fullVehicle.make,
      model: fullVehicle.model,
      nickname: fullVehicle.nickname,
      licensePlate: fullVehicle.licensePlate,
      vin: fullVehicle.vin,
      currentMileage: fullVehicle.currentMileage,
    },
    summary: {
      lastMaintenance: lastMaintenance ? {
        date: lastMaintenance.date.toISOString(),
        serviceType: lastMaintenance.serviceType,
        mileage: lastMaintenance.mileage,
      } : null,
      nextReminder: nextReminder ? {
        title: nextReminder.title,
        dueDate: nextReminder.dueDate?.toISOString() || null,
        dueMileage: nextReminder.dueMileage,
      } : null,
      totalCost,
    },
    maintenanceHistory: fullVehicle.maintenanceRecords.map(r => ({
      date: r.date.toISOString(),
      serviceType: r.serviceType,
      mileage: r.mileage,
      notes: r.notes,
      cost: r.cost,
    })),
    ownershipHistory: fullVehicle.previousOwner
      ? [{ ownerName: fullVehicle.previousOwner.name || "Unknown", transferDate: null }]
      : undefined,
  };

  const stream = await renderToStream(<VehicleReportPDF data={data} />);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="vehicle-report-${fullVehicle.make}-${fullVehicle.model}.pdf"`,
    },
  });
}
