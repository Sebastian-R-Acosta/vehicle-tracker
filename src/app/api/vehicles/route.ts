import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";
import { canAddVehicle } from "@/lib/billing";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  let where: Prisma.VehicleWhereInput;

  if (organizationId) {
    const role = await getUserRole(organizationId, session.user.id);
    if (!role) {
      return new NextResponse("Not a member of this organization", { status: 403 });
    }
    where = { organizationId };
  } else {
    const effectiveOrgId = session.user.currentOrganizationId || null;
    where = effectiveOrgId
      ? { organizationId: effectiveOrgId }
      : { userId: session.user.id, organizationId: null };
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      maintenanceRecords: {
        take: 1,
        orderBy: { date: "desc" },
      },
      reminders: {
        where: { isCompleted: false },
        take: 10,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { make, model, year, vin, licensePlate, nickname, currentMileage, vehicleType, status, organizationId, hoursMeter, serialNumber, weightCapacity, constructionSiteId } = body;

  if (!make || !model || !year) {
    return new NextResponse(JSON.stringify({ error: "Missing required fields", make, model, year }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const vehicleYear = parseInt(year, 10);
  if (isNaN(vehicleYear)) {
    return new NextResponse(JSON.stringify({ error: "Invalid year" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (organizationId) {
    const role = await getUserRole(organizationId, session.user.id);
    if (!role) {
      return new NextResponse("Not a member of this organization", { status: 403 });
    }
  } else {
    const { allowed, limit } = await canAddVehicle(session.user.id);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: `Free tier limited to ${limit} vehicles. Upgrade to add more.` }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: session.user.id,
      organizationId: organizationId || null,
      make,
      model,
      year: vehicleYear,
      vin: vin || null,
      licensePlate: licensePlate || null,
      nickname: nickname || null,
      currentMileage: parseInt(currentMileage, 10) || 0,
      vehicleType: vehicleType || "car",
      status: status || "active",
      hoursMeter: hoursMeter != null ? parseInt(hoursMeter, 10) : null,
      serialNumber: serialNumber || null,
      weightCapacity: weightCapacity != null ? parseFloat(weightCapacity) : null,
      constructionSiteId: constructionSiteId || null,
    },
  });

  return NextResponse.json(vehicle);
}
