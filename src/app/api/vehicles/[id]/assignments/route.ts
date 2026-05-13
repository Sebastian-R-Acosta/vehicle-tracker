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

  const assignments = await prisma.vehicleAssignment.findMany({
    where: { vehicleId: params.id },
    include: {
      driver: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(
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

  const body = await request.json();
  const { driverId, startDate, endDate, isPrimary, notes } = body;

  if (!driverId) {
    return new NextResponse(JSON.stringify({ error: "driverId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    return new NextResponse(JSON.stringify({ error: "Driver not found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (isPrimary) {
    await prisma.vehicleAssignment.updateMany({
      where: { vehicleId: params.id, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const assignment = await prisma.vehicleAssignment.create({
    data: {
      vehicleId: params.id,
      driverId,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      isPrimary: isPrimary || false,
      notes: notes || null,
    },
    include: {
      driver: true,
    },
  });

  return NextResponse.json(assignment);
}
