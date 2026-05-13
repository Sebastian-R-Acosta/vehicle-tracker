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
  const orgIdParam = searchParams.get("organizationId");

  let organizationId: string | null = null;

  if (orgIdParam) {
    const role = await getUserRole(orgIdParam, session.user.id);
    if (!role) {
      return new NextResponse("Not a member of this organization", { status: 403 });
    }
    organizationId = orgIdParam;
  } else if (session.user.currentOrganizationId) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: session.user.currentOrganizationId,
          userId: session.user.id,
        },
      },
    });
    if (member) {
      organizationId = session.user.currentOrganizationId;
    }
  }

  if (!organizationId) {
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
    });
    organizationId = member?.organizationId ?? null;
  }

  if (!organizationId) {
    return NextResponse.json([]);
  }

  const drivers = await prisma.driver.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(drivers);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { name, email, phone, licenseNumber, licenseExpiry, licenseState, notes, organizationId: bodyOrgId } = body;

  if (!name) {
    return new NextResponse(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let organizationId: string | null = bodyOrgId ?? null;

  if (!organizationId) {
    if (session.user.currentOrganizationId) {
      const member = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: session.user.currentOrganizationId,
            userId: session.user.id,
          },
        },
      });
      if (member) {
        organizationId = session.user.currentOrganizationId;
      }
    }
  }

  if (!organizationId) {
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
    });
    organizationId = member?.organizationId ?? null;
  }

  if (!organizationId) {
    return new NextResponse(JSON.stringify({ error: "No organization found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const role = await getUserRole(organizationId, session.user.id);
  if (!role) {
    return new NextResponse("Not a member of this organization", { status: 403 });
  }

  const driver = await prisma.driver.create({
    data: {
      organizationId,
      name,
      email: email || null,
      phone: phone || null,
      licenseNumber: licenseNumber || null,
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
      licenseState: licenseState || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(driver);
}
