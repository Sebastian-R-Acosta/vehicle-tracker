import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
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

  const updated = await prisma.reminder.update({
    where: { id: params.id },
    data: {
      isCompleted: !reminder.isCompleted,
      completedAt: reminder.isCompleted ? null : new Date(),
    },
  });

  return NextResponse.json(updated);
}