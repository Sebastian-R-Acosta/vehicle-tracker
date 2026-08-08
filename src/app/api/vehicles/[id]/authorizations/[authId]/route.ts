import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canManageAuthorizations } from "@/lib/workshop";

const DECISIONS = ["approve", "reject", "revoke"] as const;
type Decision = (typeof DECISIONS)[number];

/**
 * The owner decides on a workshop's access.
 *
 * approve -> active | reject -> revoked (a pending request that was turned down)
 * revoke  -> revoked (access that had already been granted)
 *
 * Revoking stops future writes but deliberately leaves past MaintenanceRecords in
 * place: the customer keeps the history the workshop produced.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; authId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await canManageAuthorizations(params.id, session.user.id);
  if (!vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const decision = body.decision as Decision | undefined;
  if (!decision || !DECISIONS.includes(decision)) {
    return NextResponse.json(
      { error: `decision must be one of: ${DECISIONS.join(", ")}` },
      { status: 400 }
    );
  }

  const authorization = await prisma.serviceAuthorization.findUnique({
    where: { id: params.authId },
    select: { id: true, vehicleId: true, status: true },
  });

  // Guard against an authId belonging to a different vehicle.
  if (!authorization || authorization.vehicleId !== params.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (decision === "approve" && authorization.status !== "pending") {
    return NextResponse.json(
      { error: "Only a pending request can be approved" },
      { status: 409 }
    );
  }

  const updated = await prisma.serviceAuthorization.update({
    where: { id: authorization.id },
    data:
      decision === "approve"
        ? { status: "active", revokedAt: null, grantedByUserId: session.user.id }
        : { status: "revoked", revokedAt: new Date() },
    select: { id: true, status: true },
  });

  return NextResponse.json(updated);
}
