import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";

const VALID_CATEGORIES = ["general", "dealership", "independent", "tire", "body", "transmission", "oil", "brake", "electrical", "ac", "towing", "detail"];

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const organizationId = session.user.currentOrganizationId;

  if (!organizationId) {
    return NextResponse.json([]);
  }

  const role = await getUserRole(organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Not a member of this organization", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where: any = { organizationId };

  if (category && VALID_CATEGORIES.includes(category)) {
    where.category = category;
  }

  const providers = await prisma.serviceProvider.findMany({
    where,
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
    orderBy: [{ isPreferred: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(providers);
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
  const { name, category, address, phone, website, email, notes, isPreferred } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return new NextResponse(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const providerCategory = category && VALID_CATEGORIES.includes(category) ? category : "general";

  const provider = await prisma.serviceProvider.create({
    data: {
      organizationId,
      name: name.trim(),
      category: providerCategory,
      address: address || null,
      phone: phone || null,
      website: website || null,
      email: email || null,
      notes: notes || null,
      isPreferred: isPreferred ?? false,
    },
  });

  return NextResponse.json(provider);
}
