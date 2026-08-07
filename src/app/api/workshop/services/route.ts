import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWorkshopContext, canServiceVehicle, suggestNextService } from "@/lib/workshop";
import { notifyCustomerOfService } from "@/lib/workshop-notify";

const VALID_STATUSES = new Set(["in_progress", "ready", "completed"]);

/** The workshop's own history: every service it has logged, newest first. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const ctx = await getWorkshopContext(session.user.id, session.user.currentOrganizationId);
  if (!ctx) {
    return new NextResponse("Not a workshop operator", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const records = await prisma.maintenanceRecord.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(status && VALID_STATUSES.has(status) ? { status } : {}),
    },
    include: {
      vehicle: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          licensePlate: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(records);
}

/** Log a service against a customer vehicle and notify the customer. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const ctx = await getWorkshopContext(session.user.id, session.user.currentOrganizationId);
  if (!ctx) {
    return new NextResponse("Not a workshop operator", { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    vehicleId,
    serviceType,
    mileage,
    notes,
    imageUrl,
    cost,
    estimatedHours,
    status,
    createReminder,
  } = body as Record<string, unknown>;

  if (!vehicleId || !serviceType || mileage == null) {
    return NextResponse.json(
      { error: "vehicleId, serviceType and mileage are required" },
      { status: 400 }
    );
  }

  const nextStatus = typeof status === "string" && VALID_STATUSES.has(status) ? status : "in_progress";

  const allowed = await canServiceVehicle(ctx.organizationId, String(vehicleId));
  if (!allowed) {
    return NextResponse.json({ error: "Not authorized to service this vehicle" }, { status: 403 });
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: String(vehicleId) },
    include: {
      user: { select: { id: true, email: true, name: true, pushSubscription: true, pushNotifications: true } },
    },
  });
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const performedOn = new Date();
  const mileageNum = Number(mileage);

  const record = await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicle.id,
      organizationId: ctx.organizationId,
      date: performedOn,
      serviceType: String(serviceType),
      mileage: mileageNum,
      notes: notes ? String(notes) : null,
      imageUrl: imageUrl ? String(imageUrl) : null,
      cost: cost != null ? Number(cost) : null,
      estimatedHours: estimatedHours != null ? Number(estimatedHours) : null,
      status: nextStatus,
      readyAt: nextStatus === "ready" ? new Date() : null,
    },
  });

  if (mileageNum > vehicle.currentMileage) {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { currentMileage: mileageNum },
    });
  }

  // The follow-up reminder belongs to the vehicle owner, not to the workshop operator.
  let nextReminder = null;
  const suggestion = suggestNextService(String(serviceType), performedOn, mileageNum);
  if (suggestion && createReminder !== false) {
    nextReminder = await prisma.reminder.create({
      data: {
        vehicleId: vehicle.id,
        userId: vehicle.userId,
        title: `Next ${serviceType}`,
        description: `Based on ${serviceType} performed on ${performedOn.toLocaleDateString()}`,
        dueDate: suggestion.dueDate,
        dueMileage: suggestion.dueMileage,
      },
    });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { name: true },
  });

  // Fire and forget: a mail/push failure must not lose the service record.
  notifyCustomerOfService({
    customer: vehicle.user,
    vehicle,
    workshopName: organization?.name ?? "",
    record,
  }).catch((e) => console.error("[workshop] Customer notification failed:", e));

  return NextResponse.json({ record, nextReminder });
}
