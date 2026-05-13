import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";

const VALID_CATEGORIES = ["general", "dealership", "independent", "tire", "body", "transmission", "oil", "brake", "electrical", "ac", "towing", "detail"];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: params.id },
    include: {
      reviews: {
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!provider) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (provider.organizationId) {
    const role = await getUserRole(provider.organizationId, session.user.id);
    if (!role) {
      return new NextResponse("Not a member", { status: 403 });
    }
  }

  return NextResponse.json(provider);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: params.id },
  });

  if (!provider) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (provider.organizationId) {
    const role = await getUserRole(provider.organizationId, session.user.id);
    if (!role) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const body = await request.json();
  const { name, category, address, phone, website, email, notes, isPreferred } = body;

  const updateData: any = {};

  if (name !== undefined) {
    if (!name || typeof name !== "string" || !name.trim()) {
      return new NextResponse(JSON.stringify({ error: "Name cannot be empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    updateData.name = name.trim();
  }

  if (category !== undefined) {
    updateData.category = VALID_CATEGORIES.includes(category) ? category : "general";
  }

  if (address !== undefined) updateData.address = address || null;
  if (phone !== undefined) updateData.phone = phone || null;
  if (website !== undefined) updateData.website = website || null;
  if (email !== undefined) updateData.email = email || null;
  if (notes !== undefined) updateData.notes = notes || null;
  if (isPreferred !== undefined) updateData.isPreferred = isPreferred;

  const updated = await prisma.serviceProvider.update({
    where: { id: params.id },
    data: updateData,
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

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: params.id },
  });

  if (!provider) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (provider.organizationId) {
    const role = await getUserRole(provider.organizationId, session.user.id);
    if (!role) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  await prisma.serviceProvider.delete({
    where: { id: params.id },
  });

  return new NextResponse("Deleted", { status: 200 });
}
