import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { organizationId } = body;

  if (organizationId) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return new NextResponse("Not a member of this organization", { status: 403 });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { currentOrganizationId: organizationId || null },
  });

  return NextResponse.json({ currentOrganizationId: organizationId || null });
}
