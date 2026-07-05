import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canDeleteOrg, canManageMembers, getUserRole } from "@/lib/org";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const role = await getUserRole(params.id, session.user.id);
  if (!role) {
    return new NextResponse("Not a member of this organization", { status: 403 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { members: true, vehicles: true } },
    },
  });

  if (!org) {
    return new NextResponse("Organization not found", { status: 404 });
  }

  return NextResponse.json({ ...org, role });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const role = await getUserRole(params.id, session.user.id);
  if (!canManageMembers(role!)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await request.json();
  const { name, slug, logoUrl, primaryColor, industryType } = body;

  if (slug) {
    const existing = await prisma.organization.findFirst({
      where: { slug, NOT: { id: params.id } },
    });
    if (existing) {
      return new NextResponse("Slug already taken", { status: 409 });
    }
  }

  const org = await prisma.organization.update({
    where: { id: params.id },
    data: { name, slug, logoUrl, primaryColor, industryType },
  });

  return NextResponse.json(org);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const role = await getUserRole(params.id, session.user.id);
  if (!canDeleteOrg(role!)) {
    return new NextResponse("Only the owner can delete the organization", { status: 403 });
  }

  const members = await prisma.user.updateMany({
    where: { currentOrganizationId: params.id },
    data: { currentOrganizationId: null },
  });

  await prisma.organization.delete({
    where: { id: params.id },
  });

  return new NextResponse("Deleted", { status: 200 });
}
