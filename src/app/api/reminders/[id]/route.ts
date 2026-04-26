import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const reminder = await prisma.reminder.findFirst({
    where: { 
      id: params.id,
      userId: session.user.id 
    },
  });

  if (!reminder) {
    return new NextResponse("Reminder not found", { status: 404 });
  }

  const body = await request.json();
  const { title, description, dueDate, dueMileage } = body;

  const updated = await prisma.reminder.update({
    where: { id: params.id },
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueMileage,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const reminder = await prisma.reminder.findFirst({
    where: { 
      id: params.id,
      userId: session.user.id 
    },
  });

  if (!reminder) {
    return new NextResponse("Reminder not found", { status: 404 });
  }

  await prisma.reminder.delete({
    where: { id: params.id },
  });

  return new NextResponse("Deleted", { status: 200 });
}