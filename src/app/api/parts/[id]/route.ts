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

  const part = await prisma.part.findUnique({
    where: { id: params.id },
    include: {
      vehicle: {
        select: { id: true, make: true, model: true, nickname: true },
      },
    },
  });

  if (!part) {
    return new NextResponse("Part not found", { status: 404 });
  }

  if (part.organizationId) {
    const isMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: part.organizationId,
          userId: session.user.id,
        },
      },
    });
    if (!isMember) {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  return NextResponse.json(part);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const part = await prisma.part.findUnique({
    where: { id: params.id },
  });

  if (!part) {
    return new NextResponse("Part not found", { status: 404 });
  }

  if (!part.organizationId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const role = await getUserRole(part.organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await request.json();
  const { name, partNumber, category, quantity, minStock, unitCost, supplier, notes, vehicleId } = body;

  const updated = await prisma.part.update({
    where: { id: params.id },
    data: {
      name: name || undefined,
      partNumber: partNumber || null,
      category: category || "other",
      quantity: quantity != null ? parseInt(quantity, 10) : 0,
      minStock: minStock != null ? parseInt(minStock, 10) : 0,
      unitCost: unitCost != null ? parseFloat(unitCost) : null,
      supplier: supplier || null,
      notes: notes || null,
      vehicleId: vehicleId || null,
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

  const part = await prisma.part.findUnique({
    where: { id: params.id },
  });

  if (!part) {
    return new NextResponse("Part not found", { status: 404 });
  }

  if (!part.organizationId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const role = await getUserRole(part.organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.part.delete({
    where: { id: params.id },
  });

  return new NextResponse("Deleted", { status: 200 });
}
