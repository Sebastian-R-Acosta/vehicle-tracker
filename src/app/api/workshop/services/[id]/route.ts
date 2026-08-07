import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWorkshopContext } from "@/lib/workshop";
import { notifyCustomerOfService } from "@/lib/workshop-notify";

const VALID_STATUSES = new Set(["in_progress", "ready", "completed"]);

/** Move a job along the board: in_progress -> ready -> completed. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const ctx = await getWorkshopContext(session.user.id, session.user.currentOrganizationId);
  if (!ctx) {
    return new NextResponse("Not a workshop operator", { status: 403 });
  }

  const record = await prisma.maintenanceRecord.findUnique({
    where: { id: params.id },
    include: {
      vehicle: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              pushSubscription: true,
              pushNotifications: true,
            },
          },
        },
      },
    },
  });

  if (!record || record.organizationId !== ctx.organizationId) {
    // Same 404 for "does not exist" and "belongs to another workshop", so the endpoint
    // cannot be used to probe for record ids.
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { status, notes, cost, estimatedHours } = body as Record<string, unknown>;

  if (status != null && (typeof status !== "string" || !VALID_STATUSES.has(status))) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const nextStatus = typeof status === "string" ? status : record.status;
  const statusChanged = nextStatus !== record.status;

  const updated = await prisma.maintenanceRecord.update({
    where: { id: params.id },
    data: {
      status: nextStatus,
      readyAt: nextStatus === "ready" && !record.readyAt ? new Date() : record.readyAt,
      ...(notes !== undefined ? { notes: notes ? String(notes) : null } : {}),
      ...(cost !== undefined ? { cost: cost != null ? Number(cost) : null } : {}),
      ...(estimatedHours !== undefined
        ? { estimatedHours: estimatedHours != null ? Number(estimatedHours) : null }
        : {}),
    },
  });

  // Only ping the customer when the status actually moved — editing a note should not
  // send them another email.
  if (statusChanged) {
    const organization = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { name: true },
    });

    notifyCustomerOfService({
      customer: record.vehicle.user,
      vehicle: record.vehicle,
      workshopName: organization?.name ?? "",
      record: updated,
    }).catch((e) => console.error("[workshop] Status notification failed:", e));
  }

  return NextResponse.json(updated);
}
