import { prisma } from "@/lib/db";

export type OrgRole = "owner" | "admin" | "technician" | "customer";

export function canManageMembers(role: string): boolean {
  return role === "owner" || role === "admin";
}

export function canManageVehicles(role: string): boolean {
  return role === "owner" || role === "admin" || role === "technician";
}

export function canDeleteOrg(role: string): boolean {
  return role === "owner";
}

export async function getOrgMembers(organizationId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getUserRole(organizationId: string, userId: string) {
  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  return member?.role ?? null;
}

export async function generateInviteToken(): Promise<string> {
  const { randomBytes } = await import("crypto");
  return randomBytes(18).toString("base64url");
}
