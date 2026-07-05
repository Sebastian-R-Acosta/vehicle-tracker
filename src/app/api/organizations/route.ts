import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  const orgs = memberships.map((m) => ({
    ...m.organization,
    role: m.role,
  }));

  return NextResponse.json(orgs);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { name, slug, industryType } = body;

  if (!name || !slug) {
    return new NextResponse("Name and slug are required", { status: 400 });
  }

  const existing = await prisma.organization.findUnique({
    where: { slug },
  });

  if (existing) {
    return new NextResponse("An organization with this slug already exists", { status: 409 });
  }

  const org = await prisma.organization.create({
    data: { name, slug, industryType: industryType ?? "construction" },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: session.user.id,
      role: "owner",
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { currentOrganizationId: org.id },
  });

  return NextResponse.json(org);
}
