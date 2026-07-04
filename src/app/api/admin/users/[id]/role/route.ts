import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.superAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { role } = await req.json();
  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.superAdmin) {
    return NextResponse.json({ error: "Cannot change role of a super admin" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { role },
  });

  return NextResponse.json({ success: true });
}
