import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import VehicleReportPDF from "@/components/VehicleReportPDF";

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
  const totalCost = vehicle.maintenanceRecords.reduce(
    (sum, record) => sum + (record.cost || 0),
    0
  );

  const reportData = {
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
    maintenanceHistory: vehicle.maintenanceRecords.map(record => ({
      date: record.date.toISOString().split('T')[0],
      serviceType: record.serviceType,
      mileage: record.mileage,
      notes: record.notes,
      cost: record.cost,
    })),
  };

  try {
    const pdfBuffer = await renderToBuffer(
      VehicleReportPDF({ data: reportData })
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vehicle-report-${vehicle.year}-${vehicle.make}-${vehicle.model}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}