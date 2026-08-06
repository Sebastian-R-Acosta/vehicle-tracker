import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  // Same bootstrap-only guard as /api/setup: being merely logged in must never be
  // enough to become superAdmin, even when no superAdmin exists yet.
  const setupSecret = process.env.SETUP_SECRET?.replace(/"/g, "");
  if (!setupSecret || request.headers.get("x-setup-secret") !== setupSecret) {
    return new NextResponse("Not found", { status: 404 });
  }

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
