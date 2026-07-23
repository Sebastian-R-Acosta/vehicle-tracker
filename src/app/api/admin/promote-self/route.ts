import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { superAdmin: true },
  });

  if (existingAdmin) {
    return NextResponse.json(
      { error: "A superAdmin already exists. Use the admin panel to promote users." },
      { status: 403 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { superAdmin: true, role: "admin" },
  });

  return NextResponse.json({ message: "You are now a superAdmin", userId: user.id });
}
