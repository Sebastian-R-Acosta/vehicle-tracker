import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";

async function getDriver(userId: string, driverId: string) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: {
      assignments: {
        where: { endDate: null },
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              nickname: true,
              vehicleType: true,
              licensePlate: true,
            },
          },
        },
      },
    },
  });

  if (!driver) return null;

  const role = await getUserRole(driver.organizationId, userId);
  if (!role) return null;

  return {
    ...driver,
    vehicles: driver.assignments.map((a) => a.vehicle),
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const driver = await getDriver(session.user.id, params.id);
  if (!driver) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(driver);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return handleUpdate(request, params);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: Request,
  params: { id: string }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const driver = await getDriver(session.user.id, params.id);
  if (!driver) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await request.json();
  const { name, email, phone, licenseNumber, licenseExpiry, licenseState, notes, isActive } = body;

  const updated = await prisma.driver.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(licenseNumber !== undefined && { licenseNumber: licenseNumber || null }),
      ...(licenseExpiry !== undefined && { licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null }),
      ...(licenseState !== undefined && { licenseState: licenseState || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      assignments: {
        where: { endDate: null },
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              nickname: true,
              vehicleType: true,
              licensePlate: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    ...updated,
    vehicles: updated.assignments.map((a) => a.vehicle),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const driver = await getDriver(session.user.id, params.id);
  if (!driver) {
    return new NextResponse("Not found", { status: 404 });
  }

  await prisma.driver.delete({
    where: { id: params.id },
  });

  return new NextResponse("Deleted", { status: 200 });
}
