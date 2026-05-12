import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const NHTSA_API = "https://api.nhtsa.gov/recalls/recallsByVehicle";

async function fetchRecalls(vin: string) {
  const url = `${NHTSA_API}?vin=${encodeURIComponent(vin)}`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "VehicleTracker/1.0",
    },
  });

  const data = await res.json().catch(() => null);
  if (!data) {
    throw new Error(`NHTSA returned ${res.status}: invalid response`);
  }

  return data.results || [];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: params.id },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!vehicle.vin || vehicle.vin.length < 11) {
    return NextResponse.json({ recalls: [], error: null });
  }

  try {
    const results = await fetchRecalls(vehicle.vin);

    const recalls = results.map((r: any) => ({
      nhtsaCampaignNumber: r.nhtsaCampaignNumber || r.NHTSACampaignNumber,
      component: r.component || r.Component || "Unknown",
      summary: r.summary || r.Summary || r.defectSummary || "No details available",
      reportReceivedDate: r.reportReceivedDate || r.ReportReceivedDate,
      manufacturer: r.manufacturer || r.Manufacturer || vehicle.make,
      safetyRisk: r.safetyRisk || r.SafetyRisk || r.consequenceDefect || null,
      remedy: r.remedy || r.RemedialAction || r.Remedy || null,
    }));

    return NextResponse.json({ recalls, error: null });
  } catch (err: any) {
    console.error("NHTSA recall lookup failed:", err?.message || err);

    return NextResponse.json({
      recalls: [],
      error: "Recall check temporarily unavailable",
    });
  }
}
