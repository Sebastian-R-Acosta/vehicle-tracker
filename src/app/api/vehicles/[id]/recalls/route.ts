import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAccessibleVehicle } from "@/lib/vehicle-access";

const NHTSA_API = "https://api.nhtsa.gov/recalls/recallsByVehicle";

function mapRecall(r: any) {
  return {
    nhtsaCampaignNumber: r.NHTSACampaignNumber,
    component: r.Component || "Unknown",
    summary: r.Summary || r.Consequence || "No details available",
    reportReceivedDate: r.ReportReceivedDate,
    manufacturer: r.Manufacturer || null,
    safetyRisk: r.Consequence || null,
    remedy: r.Remedy || null,
    modelYear: r.ModelYear || null,
    make: r.Make || null,
    model: r.Model || null,
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vehicle = await getAccessibleVehicle(params.id, session.user.id);

  if (!vehicle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!vehicle.vin || vehicle.vin.length < 11) {
    return NextResponse.json({ recalls: [], error: null });
  }

  try {
    const url = `${NHTSA_API}?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&modelYear=${encodeURIComponent(String(vehicle.year))}`;

    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "VehicleTracker/1.0",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`NHTSA returned ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    const results: any[] = data.results || [];

    const recalls = results.map(mapRecall);

    return NextResponse.json({ recalls, error: null });
  } catch (err: any) {
    console.error("NHTSA recall lookup failed:", err?.message || err);
    return NextResponse.json({
      recalls: [],
      error: "Recall check temporarily unavailable",
    });
  }
}
