import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderToStream } from "@react-pdf/renderer";
import VehicleReportPDF from "@/components/VehicleReportPDF";
import { requirePro } from "@/lib/billing";

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

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
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

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const lastMaintenance = vehicle.maintenanceRecords[0];
  const nextReminder = vehicle.reminders.find(r => r.dueDate || r.dueMileage);
  const totalCost = vehicle.maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  const data = {
    vehicle: {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      nickname: vehicle.nickname,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      currentMileage: vehicle.currentMileage,
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
    maintenanceHistory: vehicle.maintenanceRecords.map(r => ({
      date: r.date.toISOString(),
      serviceType: r.serviceType,
      mileage: r.mileage,
      notes: r.notes,
      cost: r.cost,
    })),
    ownershipHistory: vehicle.previousOwner
      ? [{ ownerName: vehicle.previousOwner.name || "Unknown", transferDate: null }]
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
      "Content-Disposition": `attachment; filename="vehicle-report-${vehicle.make}-${vehicle.model}.pdf"`,
    },
  });
}
