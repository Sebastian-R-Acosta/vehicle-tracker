import { prisma } from "@/lib/db";

export async function getAccessibleVehicle(vehicleId: string, userId: string) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId },
  });

  if (!vehicle) return null;

  if (vehicle.userId === userId) return vehicle;

  if (vehicle.organizationId) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: vehicle.organizationId,
          userId,
        },
      },
    });
    if (member) return vehicle;
  }

  return null;
}
