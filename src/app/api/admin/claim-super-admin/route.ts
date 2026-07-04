import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can claim super admin" }, { status: 403 });
  }

  const existingSuperAdmin = await prisma.user.findFirst({ where: { superAdmin: true } });
  if (existingSuperAdmin) {
    return NextResponse.json({ error: "A super admin already exists" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { superAdmin: true },
  });

  return NextResponse.json({ success: true });
}
