import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";
import { getServiceInterval } from "@/lib/service-intervals";

/**
 * Workshop flow helpers.
 *
 * A workshop services vehicles it does not own. Access therefore comes from a
 * ServiceAuthorization row rather than from Vehicle.userId / Vehicle.organizationId,
 * so the customer keeps ownership and the full history even after switching shops.
 */

export type WorkshopContext = {
  organizationId: string;
  role: string;
};

/** Roles allowed to run the service desk. Customers are explicitly excluded. */
export function canOperateServiceDesk(role: string): boolean {
  return role === "owner" || role === "admin" || role === "technician";
}

/**
 * Resolves the caller's active organization and role, or null when they are not
 * acting on behalf of one.
 */
export async function getWorkshopContext(
  userId: string,
  organizationId: string | null | undefined
): Promise<WorkshopContext | null> {
  if (!organizationId) return null;
  const role = await getUserRole(organizationId, userId);
  if (!role || !canOperateServiceDesk(role)) return null;
  return { organizationId, role };
}

/**
 * True when the workshop may write service records against this vehicle: either it
 * holds an active authorization, or the vehicle belongs to the organization outright
 * (fleet case).
 */
export async function canServiceVehicle(
  organizationId: string,
  vehicleId: string
): Promise<boolean> {
  const [auth, vehicle] = await Promise.all([
    prisma.serviceAuthorization.findUnique({
      where: { vehicleId_organizationId: { vehicleId, organizationId } },
      select: { status: true },
    }),
    prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true },
    }),
  ]);

  if (auth?.status === "active") return true;
  return !!vehicle && vehicle.organizationId === organizationId;
}

/**
 * Grants (or re-activates) an authorization. Idempotent: re-registering a returning
 * customer's vehicle must not fail on the unique constraint.
 */
export async function grantServiceAuthorization(input: {
  vehicleId: string;
  organizationId: string;
  grantedByUserId?: string | null;
}) {
  return prisma.serviceAuthorization.upsert({
    where: {
      vehicleId_organizationId: {
        vehicleId: input.vehicleId,
        organizationId: input.organizationId,
      },
    },
    update: { status: "active", revokedAt: null },
    create: {
      vehicleId: input.vehicleId,
      organizationId: input.organizationId,
      grantedByUserId: input.grantedByUserId ?? null,
    },
  });
}

/**
 * Asks the owner for access to a vehicle the workshop does not yet service.
 *
 * Never downgrades an existing active authorization, and re-requesting after a
 * revocation is allowed — the owner decides again.
 */
export async function requestServiceAuthorization(input: {
  vehicleId: string;
  organizationId: string;
}): Promise<{ status: "active" | "pending"; alreadyExisted: boolean }> {
  const existing = await prisma.serviceAuthorization.findUnique({
    where: {
      vehicleId_organizationId: {
        vehicleId: input.vehicleId,
        organizationId: input.organizationId,
      },
    },
    select: { status: true },
  });

  if (existing?.status === "active") return { status: "active", alreadyExisted: true };
  if (existing?.status === "pending") return { status: "pending", alreadyExisted: true };

  await prisma.serviceAuthorization.upsert({
    where: {
      vehicleId_organizationId: {
        vehicleId: input.vehicleId,
        organizationId: input.organizationId,
      },
    },
    update: { status: "pending", revokedAt: null },
    create: {
      vehicleId: input.vehicleId,
      organizationId: input.organizationId,
      status: "pending",
    },
  });

  return { status: "pending", alreadyExisted: false };
}

/**
 * Only the person who can revoke access may manage it: the vehicle's owner, or an
 * owner/admin of the organization that owns the vehicle outright (fleet case).
 * Returns the vehicle when allowed, null otherwise.
 */
export async function canManageAuthorizations(vehicleId: string, userId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, userId: true, organizationId: true },
  });
  if (!vehicle) return null;
  if (vehicle.userId === userId) return vehicle;
  if (vehicle.organizationId) {
    const role = await getUserRole(vehicle.organizationId, userId);
    if (role === "owner" || role === "admin") return vehicle;
  }
  return null;
}

export type NextServiceSuggestion = {
  serviceType: string;
  dueDate: Date | null;
  dueMileage: number | null;
};

/**
 * Suggests the follow-up service for a just-completed job. Returns null for job types
 * that do not recur (repairs, "other").
 */
export function suggestNextService(
  serviceType: string,
  performedOn: Date,
  mileage: number
): NextServiceSuggestion | null {
  const interval = getServiceInterval(serviceType);
  if (!interval || (interval.months === 0 && interval.miles === 0)) return null;

  const dueDate = interval.months > 0 ? new Date(performedOn) : null;
  if (dueDate) dueDate.setMonth(dueDate.getMonth() + interval.months);

  return {
    serviceType,
    dueDate,
    dueMileage: interval.miles > 0 ? mileage + interval.miles : null,
  };
}

/** Normalizes a plate for comparison: uppercase, no spaces or dashes. */
export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/[\s-]/g, "");
}
