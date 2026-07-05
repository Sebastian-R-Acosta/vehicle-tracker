import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return new NextResponse("No subscription provided", { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: JSON.stringify(subscription),
        pushNotifications: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return new NextResponse(`Error: ${error}`, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: null,
        pushNotifications: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return new NextResponse(`Error: ${error}`, { status: 500 });
  }
}
