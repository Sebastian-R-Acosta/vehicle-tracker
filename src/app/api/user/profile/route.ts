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
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      phone: true,
      licenseNumber: true,
      licenseExpiry: true,
      licenseState: true,
      licenseClass: true,
      smsNotifications: true,
      pushNotifications: true,
      createdAt: true,
    },
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
  const { name, phone, licenseNumber, licenseExpiry, licenseState, licenseClass, smsNotifications, pushNotifications } = body;

  const data: Record<string, any> = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (licenseNumber !== undefined) data.licenseNumber = licenseNumber;
  if (licenseExpiry !== undefined) data.licenseExpiry = new Date(licenseExpiry);
  if (licenseState !== undefined) data.licenseState = licenseState;
  if (licenseClass !== undefined) data.licenseClass = licenseClass;
  if (smsNotifications !== undefined) data.smsNotifications = smsNotifications;
  if (pushNotifications !== undefined) data.pushNotifications = pushNotifications;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      phone: true,
      licenseNumber: true,
      licenseExpiry: true,
      licenseState: true,
      licenseClass: true,
      smsNotifications: true,
      pushNotifications: true,
    },
  });

  return NextResponse.json(updated);
}
