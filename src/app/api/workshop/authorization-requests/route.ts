import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWorkshopContext, requestServiceAuthorization } from "@/lib/workshop";
import { sendAuthorizationRequestEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

/**
 * A workshop asks the owner of an existing vehicle for permission to service it.
 * The row lands in "pending"; only the owner can move it to "active".
 */
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
  const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId : null;
  if (!vehicleId) {
    return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      licensePlate: true,
      user: {
        select: { id: true, name: true, email: true, pushNotifications: true, pushSubscription: true },
      },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const result = await requestServiceAuthorization({
    vehicleId: vehicle.id,
    organizationId: ctx.organizationId,
  });

  if (result.status === "active") {
    return NextResponse.json({ status: "active", message: "Already authorized" });
  }

  // Only notify on a genuinely new request, so re-clicking does not spam the owner.
  if (!result.alreadyExisted && vehicle.user) {
    const org = await prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { name: true },
    });
    const workshopName = org?.name ?? "A workshop";
    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vehicle-tracker-chi.vercel.app";
    const manageUrl = `${baseUrl}/dashboard/vehicles/${vehicle.id}`;

    if (vehicle.user.email) {
      sendAuthorizationRequestEmail(vehicle.user.email, {
        ownerName: vehicle.user.name,
        workshopName,
        vehicleName,
        licensePlate: vehicle.licensePlate,
        manageUrl,
      }).catch((e) => console.error("[workshop] Authorization request email failed:", e));
    }

    if (vehicle.user.pushNotifications && vehicle.user.pushSubscription) {
      sendPushNotification(vehicle.user.pushSubscription, {
        title: "Authorization request",
        body: `${workshopName} wants to log services on your ${vehicleName}`,
        url: `/dashboard/vehicles/${vehicle.id}`,
      }).catch((e) => console.error("[workshop] Authorization request push failed:", e));
    }
  }

  return NextResponse.json({ status: "pending", alreadyExisted: result.alreadyExisted });
}
