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
    where: { id: params.id },
  });

  if (!vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isOwner = vehicle.userId === session.user.id;
  const isOrgMember = vehicle.organizationId
    ? !!(await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: vehicle.organizationId,
            userId: session.user.id,
          },
        },
      }))
    : false;

  if (!isOwner && !isOrgMember) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!vehicle.vin) {
    return NextResponse.json({ recalls: [], error: null });
  }

  try {
    const res = await fetch(
      `https://api.nhtsa.gov/recalls/recallsByVehicle?vin=${vehicle.vin}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json({ recalls: [], error: "NHTSA API unavailable" });
    }

    const data = await res.json();
    const results = data.results || [];

    const recalls = results.map((r: any) => ({
      nhtsaCampaignNumber: r.nhtsaCampaignNumber,
      component: r.component || "Unknown",
      summary: r.summary || "No details available",
      reportReceivedDate: r.reportReceivedDate,
      manufacturer: r.manufacturer || vehicle.make,
      safetyRisk: r.safetyRisk || null,
      remedy: r.remedy || null,
    }));

    return NextResponse.json({ recalls, error: null });
  } catch (err) {
    console.error("NHTSA recall lookup failed:", err);
    return NextResponse.json({ recalls: [], error: "Failed to check recalls" });
  }
}
