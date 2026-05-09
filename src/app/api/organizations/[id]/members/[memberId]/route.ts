import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canManageMembers, canDeleteOrg, getUserRole } from "@/lib/org";

export async function PUT(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
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
  const { role } = body;

  const member = await prisma.organizationMember.findFirst({
    where: { id: params.memberId, organizationId: params.id },
  });

  if (!member) {
    return new NextResponse("Member not found", { status: 404 });
  }

  if (member.role === "owner" && !canDeleteOrg(requesterRole!)) {
    return new NextResponse("Cannot change the owner's role", { status: 403 });
  }

  const updated = await prisma.organizationMember.update({
    where: { id: params.memberId },
    data: { role },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const requesterRole = await getUserRole(params.id, session.user.id);
  if (!canManageMembers(requesterRole!)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const member = await prisma.organizationMember.findFirst({
    where: { id: params.memberId, organizationId: params.id },
  });

  if (!member) {
    return new NextResponse("Member not found", { status: 404 });
  }

  if (member.role === "owner") {
    return new NextResponse("Cannot remove the owner", { status: 403 });
  }

  await prisma.organizationMember.delete({
    where: { id: params.memberId },
  });

  return new NextResponse("Removed", { status: 200 });
}
