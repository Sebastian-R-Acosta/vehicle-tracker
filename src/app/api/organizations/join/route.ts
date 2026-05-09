import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { token } = body;

  if (!token) {
    return new NextResponse("Token required", { status: 400 });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invitation) {
    return new NextResponse("Invalid invitation", { status: 404 });
  }

  if (invitation.expiresAt < new Date()) {
    return new NextResponse("Invitation expired", { status: 400 });
  }

  if (invitation.acceptedAt) {
    return new NextResponse("Invitation already used", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.email !== invitation.email) {
    return new NextResponse("This invitation was sent to a different email address", { status: 403 });
  }

  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: invitation.organizationId,
        userId: session.user.id,
      },
    },
  });

  if (existingMember) {
    return new NextResponse("Already a member", { status: 409 });
  }

  await prisma.organizationMember.create({
    data: {
      organizationId: invitation.organizationId,
      userId: session.user.id,
      role: invitation.role,
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { currentOrganizationId: invitation.organizationId },
  });

  return NextResponse.json({ organization: invitation.organization });
}
