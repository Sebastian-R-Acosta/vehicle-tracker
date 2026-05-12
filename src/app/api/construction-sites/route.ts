import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  if (organizationId) {
    const role = await getUserRole(organizationId, session.user.id);
    if (!role) {
      return new NextResponse("Not a member of this organization", { status: 403 });
    }
  } else {
    return new NextResponse("organizationId is required", { status: 400 });
  }

  const sites = await prisma.constructionSite.findMany({
    where: { organizationId },
    include: {
      _count: { select: { vehicles: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sites);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { name, address, city, state, organizationId } = body;

  if (!name || !organizationId) {
    return new NextResponse(JSON.stringify({ error: "Name and organizationId are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const role = await getUserRole(organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Not a member of this organization", { status: 403 });
  }

  const site = await prisma.constructionSite.create({
    data: {
      name,
      address,
      city,
      state,
      organizationId,
    },
  });

  return NextResponse.json(site);
}
