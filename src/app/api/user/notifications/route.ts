import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true, smsNotifications: true, pushNotifications: true },
  });

  if (!user) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { phone, smsNotifications, pushNotifications } = body;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(phone !== undefined && { phone }),
      ...(smsNotifications !== undefined && { smsNotifications }),
      ...(pushNotifications !== undefined && { pushNotifications }),
    },
    select: { phone: true, smsNotifications: true, pushNotifications: true },
  });

  return NextResponse.json(updated);
}
