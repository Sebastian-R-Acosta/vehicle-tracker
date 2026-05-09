import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canManageMembers, getUserRole } from "@/lib/org";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; invitationId: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const role = await getUserRole(params.id, session.user.id);
  if (!canManageMembers(role!)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const invitation = await prisma.invitation.findFirst({
    where: { id: params.invitationId, organizationId: params.id },
  });

  if (!invitation) {
    return new NextResponse("Invitation not found", { status: 404 });
  }

  await prisma.invitation.delete({
    where: { id: params.invitationId },
  });

  return new NextResponse("Cancelled", { status: 200 });
}
