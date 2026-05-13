import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const organizationId = session.user.currentOrganizationId;

  if (!organizationId) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { organizationId };

  if (category) {
    where.category = category;
  }

  const parts = await prisma.part.findMany({
    where,
    include: {
      vehicle: {
        select: { id: true, make: true, model: true, nickname: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(parts);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const organizationId = session.user.currentOrganizationId;

  if (!organizationId) {
    return new NextResponse("No organization selected", { status: 400 });
  }

  const role = await getUserRole(organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Not a member of this organization", { status: 403 });
  }

  const body = await request.json();
  const { name, partNumber, category, quantity, minStock, unitCost, supplier, notes, vehicleId } = body;

  if (!name) {
    return new NextResponse(
      JSON.stringify({ error: "Missing required field: name" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const part = await prisma.part.create({
    data: {
      organizationId,
      name,
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

  return NextResponse.json(part);
}
