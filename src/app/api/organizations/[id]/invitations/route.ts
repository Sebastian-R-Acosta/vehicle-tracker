import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canManageMembers, generateInviteToken, getUserRole } from "@/lib/org";

export async function GET(
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

  const invitations = await prisma.invitation.findMany({
    where: { organizationId: params.id, acceptedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invitations);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const requesterRole = await getUserRole(params.id, session.user.id);
  if (!canManageMembers(requesterRole!)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await request.json();
  const { email, role } = body;

  if (!email) {
    return new NextResponse("Email is required", { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: params.id },
  });

  if (!org) {
    return new NextResponse("Organization not found", { status: 404 });
  }

  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: params.id,
      user: { email },
    },
  });

  if (existingMember) {
    return new NextResponse("User is already a member", { status: 409 });
  }

  const token = await generateInviteToken();

  const invitation = await prisma.invitation.create({
    data: {
      organizationId: params.id,
      email,
      role: role || "customer",
      token,
      invitedById: session.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json(invitation);
}
