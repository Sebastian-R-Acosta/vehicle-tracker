import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canManageAuthorizations } from "@/lib/workshop";

/** Workshops that hold — or are asking for — access to this vehicle. */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await canManageAuthorizations(params.id, session.user.id);
  if (!vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const authorizations = await prisma.serviceAuthorization.findMany({
    where: { vehicleId: params.id, status: { in: ["pending", "active"] } },
    select: {
      id: true,
      status: true,
      createdAt: true,
      organization: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(authorizations);
}
