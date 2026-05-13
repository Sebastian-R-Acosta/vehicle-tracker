import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getAccessibleAssignment(userId: string, assignmentId: string) {
  const assignment = await prisma.vehicleAssignment.findUnique({
    where: { id: assignmentId },
    include: { vehicle: true },
  });

  if (!assignment) return null;

  const isOwner = assignment.vehicle.userId === userId;
  const isOrgMember = assignment.vehicle.organizationId
    ? !!(await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: assignment.vehicle.organizationId,
            userId,
          },
        },
      }))
    : false;

  if (!isOwner && !isOrgMember) return null;

  return assignment;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; assignmentId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const assignment = await getAccessibleAssignment(session.user.id, params.assignmentId);
  if (!assignment) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await request.json();
  const { startDate, endDate, isPrimary, notes } = body;

  if (isPrimary) {
    await prisma.vehicleAssignment.updateMany({
      where: { vehicleId: assignment.vehicleId, isPrimary: true, id: { not: params.assignmentId } },
      data: { isPrimary: false },
    });
  }

  const updated = await prisma.vehicleAssignment.update({
    where: { id: params.assignmentId },
    data: {
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(isPrimary !== undefined && { isPrimary }),
      ...(notes !== undefined && { notes: notes || null }),
    },
    include: {
      driver: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; assignmentId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const assignment = await getAccessibleAssignment(session.user.id, params.assignmentId);
  if (!assignment) {
    return new NextResponse("Not found", { status: 404 });
  }

  await prisma.vehicleAssignment.delete({
    where: { id: params.assignmentId },
  });

  return new NextResponse("Deleted", { status: 200 });
}
