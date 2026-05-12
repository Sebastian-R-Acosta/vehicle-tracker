import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";

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
    include: {
      maintenanceRecords: {
        orderBy: { date: "desc" },
      },
      reminders: {
        where: { isCompleted: false },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
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

  return NextResponse.json(vehicle);
}

function checkOwnerOrRole(vehicle: any, userId: string, role: string | null) {
  return vehicle.userId === userId || (role && ["owner", "admin", "technician"].includes(role));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { make, model, year, vin, nickname, currentMileage, vehicleType, status, hoursMeter, serialNumber, weightCapacity, constructionSiteId, equipmentStatus } = body;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: params.id },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const role = vehicle.organizationId
    ? await getUserRole(vehicle.organizationId, session.user.id)
    : null;

  if (!checkOwnerOrRole(vehicle, session.user.id, role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const updated = await prisma.vehicle.update({
    where: { id: params.id },
    data: {
      make,
      model,
      year,
      vin,
      nickname,
      currentMileage,
      vehicleType: vehicleType || "car",
      status: status || "active",
      hoursMeter: hoursMeter != null ? parseInt(hoursMeter, 10) : null,
      serialNumber: serialNumber || null,
      weightCapacity: weightCapacity != null ? parseFloat(weightCapacity) : null,
      constructionSiteId: constructionSiteId || null,
      equipmentStatus: equipmentStatus || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const role = vehicle.organizationId
    ? await getUserRole(vehicle.organizationId, session.user.id)
    : null;

  if (!checkOwnerOrRole(vehicle, session.user.id, role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.vehicle.delete({
    where: { id: params.id },
  });

  return new NextResponse("Deleted", { status: 200 });
}