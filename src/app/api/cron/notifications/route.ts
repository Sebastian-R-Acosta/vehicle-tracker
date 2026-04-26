import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminderDueEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.replace(/"/g, "");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const overdueReminders = await prisma.reminder.findMany({
      where: {
        isCompleted: false,
        dueDate: { lte: now, gte: yesterday },
      },
      include: {
        vehicle: true,
        user: { select: { email: true } },
      },
    });

    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        isCompleted: false,
        dueDate: { lte: threeDaysFromNow, gt: now },
      },
      include: {
        vehicle: true,
        user: { select: { email: true } },
      },
    });

    const results = [];

    for (const reminder of overdueReminders) {
      if (!reminder.user?.email) continue;

      const result = await sendReminderDueEmail(reminder.user.email, {
        title: reminder.title,
        description: reminder.description,
        dueDate: reminder.dueDate,
        dueMileage: reminder.dueMileage,
        vehicle: {
          make: reminder.vehicle.make,
          model: reminder.vehicle.model,
          year: reminder.vehicle.year,
          nickname: reminder.vehicle.nickname,
          currentMileage: reminder.vehicle.currentMileage,
        },
      });

      results.push({
        reminderId: reminder.id,
        type: "overdue",
        success: result.success,
      });
    }

    for (const reminder of upcomingReminders) {
      if (!reminder.user?.email) continue;

      const result = await sendReminderDueEmail(reminder.user.email, {
        title: reminder.title,
        description: reminder.description,
        dueDate: reminder.dueDate,
        dueMileage: reminder.dueMileage,
        vehicle: {
          make: reminder.vehicle.make,
          model: reminder.vehicle.model,
          year: reminder.vehicle.year,
          nickname: reminder.vehicle.nickname,
          currentMileage: reminder.vehicle.currentMileage,
        },
      });

      results.push({
        reminderId: reminder.id,
        type: "upcoming",
        success: result.success,
      });
    }

    return NextResponse.json({
      overdueCount: overdueReminders.length,
      upcomingCount: upcomingReminders.length,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}