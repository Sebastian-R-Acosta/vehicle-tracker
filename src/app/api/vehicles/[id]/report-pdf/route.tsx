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

  const reportText = `
VEHICLE HISTORY REPORT
========================

Vehicle Information
--------------------
${vehicle.year} ${vehicle.make} ${vehicle.model}
${vehicle.nickname ? `Nickname: ${vehicle.nickname}` : ''}
${vehicle.vin ? `VIN: ${vehicle.vin}` : ''}
Current Mileage: ${vehicle.currentMileage.toLocaleString()} miles

Summary
--------
${lastMaintenance ? `Last Maintenance: ${new Date(lastMaintenance.date).toLocaleDateString()} - ${lastMaintenance.serviceType} at ${lastMaintenance.mileage.toLocaleString()} miles` : 'No maintenance records'}
${nextReminder ? `Next Due: ${nextReminder.title}${nextReminder.dueDate ? ` on ${new Date(nextReminder.dueDate).toLocaleDateString()}` : ''}${nextReminder.dueMileage ? ` at ${nextReminder.dueMileage.toLocaleString()} miles` : ''}` : ''}

Maintenance History
-------------------
${vehicle.maintenanceRecords.map(r => `${new Date(r.date).toLocaleDateString()}\t${r.serviceType}\t${r.notes || '-'}\t${r.mileage.toLocaleString()} miles`).join('\n')}

Generated on ${new Date().toLocaleDateString()}
  `.trim();

  const blob = new TextEncoder().encode(reportText);
  
  return new NextResponse(blob, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="vehicle-report-${vehicle.make}-${vehicle.model}.txt"`,
    },
  });
}