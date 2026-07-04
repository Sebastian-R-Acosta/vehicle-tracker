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
    return new NextResponse("Missing ids query parameter", { status: 400 });
  }

  const ids = idsParam.split(",").filter(Boolean);

  if (ids.length === 0) {
    return new NextResponse("No valid IDs provided", { status: 400 });
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
    },
  });

  const statusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "maintenance": return "In Maintenance";
      case "sold": return "Sold";
      case "inactive": return "Inactive";
      default: return status;
    }
  };

  const escapeCsv = (value: string | number | null | undefined): string => {
    if (value == null) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = "Year,Make,Model,License Plate,VIN,Mileage,Status,Last Service Date,Last Service Type,Total Maintenance Cost";

  const rows = vehicles.map((v) => {
    const lastMaint = v.maintenanceRecords[0];
    const totalCost = v.maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

    return [
      escapeCsv(v.year),
      escapeCsv(v.make),
      escapeCsv(v.model),
      escapeCsv(v.licensePlate),
      escapeCsv(v.vin),
      escapeCsv(v.currentMileage),
      escapeCsv(statusLabel(v.status)),
      escapeCsv(lastMaint ? lastMaint.date.toISOString().split("T")[0] : null),
      escapeCsv(lastMaint ? lastMaint.serviceType : null),
      escapeCsv(totalCost > 0 ? totalCost.toFixed(2) : null),
    ].join(",");
  });

  const csv = [header, ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="vehicles-export.csv"`,
    },
  });
}
