import { prisma } from "@/lib/db";
import { sendServiceLoggedEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vehicle-tracker-chi.vercel.app";

type NotifyInput = {
  customer: {
    id: string;
    email: string;
    name: string | null;
    pushSubscription: string | null;
    pushNotifications: boolean;
  };
  vehicle: { id: string; make: string; model: string; year: number; nickname: string | null };
  workshopName: string;
  record: {
    id: string;
    serviceType: string;
    mileage: number;
    notes: string | null;
    cost: number | null;
    estimatedHours: number | null;
    status: string;
  };
};

function statusLine(status: string): string {
  if (status === "ready") return "Your vehicle is ready for pickup";
  if (status === "in_progress") return "Service in progress";
  return "Service completed";
}

/**
 * Notifies a customer that a service was logged or its status changed. Email and push
 * are attempted independently so one failing does not suppress the other, and neither
 * is allowed to throw into the request path.
 */
export async function notifyCustomerOfService(input: NotifyInput): Promise<void> {
  const vehicleName =
    input.vehicle.nickname ||
    `${input.vehicle.year} ${input.vehicle.make} ${input.vehicle.model}`;

  const confirmUrl = `${APP_URL}/dashboard/services/${input.record.id}/confirm`;

  if (input.customer.email) {
    try {
      await sendServiceLoggedEmail(input.customer.email, {
        customerName: input.customer.name,
        workshopName: input.workshopName,
        vehicleName,
        serviceType: input.record.serviceType,
        mileage: input.record.mileage,
        notes: input.record.notes,
        cost: input.record.cost,
        estimatedHours: input.record.estimatedHours,
        status: input.record.status,
        confirmUrl,
      });
    } catch (e) {
      console.error("[workshop] Service email failed:", e);
    }
  }

  if (input.customer.pushNotifications && input.customer.pushSubscription) {
    try {
      const result = await sendPushNotification(input.customer.pushSubscription, {
        title: statusLine(input.record.status),
        body: `${input.workshopName}: ${input.record.serviceType} — ${vehicleName}`,
        url: `/dashboard/vehicles/${input.vehicle.id}`,
      });
      if (result.expired) {
        await prisma.user.update({
          where: { id: input.customer.id },
          data: { pushSubscription: null },
        });
      }
    } catch (e) {
      console.error("[workshop] Service push failed:", e);
    }
  }
}
