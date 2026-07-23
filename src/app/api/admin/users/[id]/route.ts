import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      vehicles: { include: { _count: { select: { maintenanceRecords: true, reminders: true } } } },
      subscription: { include: { plan: true } },
    },
  });

  if (!user) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(user);
}
