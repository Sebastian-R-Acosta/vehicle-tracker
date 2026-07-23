import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [orgs, total] = await Promise.all([
    prisma.organization.findMany({
      include: { _count: { select: { members: true, vehicles: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.count(),
  ]);

  return NextResponse.json({ orgs, total });
}
