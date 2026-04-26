import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminderCreatedEmail } from "@/lib/email";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    include: { vehicle: true },
    orderBy: [{ dueDate: "asc" }, { dueMileage: "asc" }],
  });

  return NextResponse.json(reminders);
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { vehicleId, title, description, dueDate, dueMileage } = body;

  if (!vehicleId || !title) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  if (!dueDate && !dueMileage) {
    return new NextResponse("Must have at least one trigger", { status: 400 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: session.user.id },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      vehicleId,
      userId: session.user.id,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueMileage,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (user?.email) {
    sendReminderCreatedEmail(user.email, {
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate,
      dueMileage: reminder.dueMileage,
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        nickname: vehicle.nickname,
      },
    }).catch((err) => console.error("Failed to send reminder created email:", err));
  }

  return NextResponse.json(reminder);
}