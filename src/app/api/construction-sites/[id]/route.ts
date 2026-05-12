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

  const site = await prisma.constructionSite.findUnique({
    where: { id: params.id },
    include: {
      vehicles: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          maintenanceRecords: { take: 1, orderBy: { date: "desc" } },
          reminders: { where: { isCompleted: false }, take: 10 },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!site) {
    return new NextResponse("Not found", { status: 404 });
  }

  const role = await getUserRole(site.organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Not a member", { status: 403 });
  }

  return NextResponse.json(site);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const site = await prisma.constructionSite.findUnique({
    where: { id: params.id },
  });

  if (!site) {
    return new NextResponse("Not found", { status: 404 });
  }

  const role = await getUserRole(site.organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await request.json();
  const updated = await prisma.constructionSite.update({
    where: { id: params.id },
    data: {
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
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

  const site = await prisma.constructionSite.findUnique({
    where: { id: params.id },
  });

  if (!site) {
    return new NextResponse("Not found", { status: 404 });
  }

  const role = await getUserRole(site.organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.constructionSite.delete({
    where: { id: params.id },
  });

  return new NextResponse("Deleted", { status: 200 });
}
