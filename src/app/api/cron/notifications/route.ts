import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminderDueEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

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

    const results: unknown[] = [];

    // ── Helper: send push + clean up expired subscriptions ───────
    const tryPush = async (
      userId: string,
      pushSubscription: string | null,
      title: string,
      body: string,
      url: string
    ) => {
      if (!pushSubscription) return;
      const pushResult = await sendPushNotification(pushSubscription, { title, body, url });
      if (pushResult.expired) {
        await prisma.user.update({ where: { id: userId }, data: { pushSubscription: null } });
      }
      results.push({ userId, pushSent: pushResult.success });
    };

    // ── Overdue reminders (due in last 24h, not already notified today) ──
    const overdueReminders = await prisma.reminder.findMany({
      where: {
        isCompleted: false,
        dueDate: { lte: now, gte: yesterday },
        OR: [{ lastNotifiedAt: null }, { lastNotifiedAt: { lte: yesterday } }],
      },
      include: {
        vehicle: true,
        user: { select: { id: true, email: true, pushNotifications: true, pushSubscription: true } },
      },
    });

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

      if (result.success) {
        await prisma.reminder.update({ where: { id: reminder.id }, data: { lastNotifiedAt: now } });
      }

      results.push({ reminderId: reminder.id, type: "overdue", emailSent: result.success });

      if (reminder.user.pushNotifications) {
        await tryPush(
          reminder.user.id,
          reminder.user.pushSubscription,
          "Reminder Overdue!",
          `${reminder.title} — ${reminder.vehicle.year} ${reminder.vehicle.make} ${reminder.vehicle.model}`,
          `/dashboard/vehicles/${reminder.vehicleId}`
        );
      }
    }

    // ── Upcoming reminders (due in next 3 days, not already notified today) ──
    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        isCompleted: false,
        dueDate: { lte: threeDaysFromNow, gt: now },
        OR: [{ lastNotifiedAt: null }, { lastNotifiedAt: { lte: yesterday } }],
      },
      include: {
        vehicle: true,
        user: { select: { id: true, email: true, pushNotifications: true, pushSubscription: true } },
      },
    });

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

      if (result.success) {
        await prisma.reminder.update({ where: { id: reminder.id }, data: { lastNotifiedAt: now } });
      }

      results.push({ reminderId: reminder.id, type: "upcoming", emailSent: result.success });
    }

    // ── License expiry notifications (ALL users, not just push-opted) ──
    const usersWithExpiringLicense = await prisma.user.findMany({
      where: {
        licenseExpiry: { not: null },
      },
      select: {
        id: true,
        email: true,
        name: true,
        licenseNumber: true,
        licenseExpiry: true,
        pushNotifications: true,
        pushSubscription: true,
      },
    });

    for (const u of usersWithExpiringLicense) {
      if (!u.licenseExpiry || !u.email) continue;
      const daysUntil = Math.ceil((u.licenseExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let shouldNotify = false;
      let notificationType = "";

      if (daysUntil <= 0) {
        shouldNotify = true;
        notificationType = "license_expired";
      } else if (daysUntil <= 30) {
        shouldNotify = true;
        notificationType = "license_30days";
      } else if (daysUntil <= 90) {
        shouldNotify = true;
        notificationType = "license_90days";
      }

      if (shouldNotify) {
        const result = await sendReminderDueEmail(u.email, {
          title: notificationType === "license_expired" ? "License Expired" : "License Expiring Soon",
          description: `Your driver's license${u.licenseNumber ? ` (${u.licenseNumber})` : ""} expires on ${u.licenseExpiry.toLocaleDateString()}. Please renew.`,
          dueDate: u.licenseExpiry,
          dueMileage: null,
          vehicle: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            nickname: null,
            currentMileage: 0,
          },
        });

        results.push({ userId: u.id, type: notificationType, emailSent: result.success });

        if (u.pushNotifications) {
          await tryPush(
            u.id,
            u.pushSubscription,
            notificationType === "license_expired" ? "License Expired" : "License Expiring Soon",
            `Your driver's license${u.licenseNumber ? ` (${u.licenseNumber})` : ""} expires on ${u.licenseExpiry.toLocaleDateString()}.`,
            "/dashboard/profile"
          );
        }
      }
    }

    // ── Document expiry notifications (not already notified today) ──
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringDocuments = await prisma.vehicleDocument.findMany({
      where: {
        expiryDate: { lte: sevenDaysFromNow },
        OR: [{ lastNotifiedAt: null }, { lastNotifiedAt: { lte: yesterday } }],
      },
      include: {
        vehicle: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                pushNotifications: true,
                pushSubscription: true,
              },
            },
          },
        },
      },
    });

    for (const doc of expiringDocuments) {
      const user = doc.vehicle.user;
      if (!user?.email) continue;

      const isExpired = doc.expiryDate && doc.expiryDate <= now;
      const vehicle = doc.vehicle;

      const result = await sendReminderDueEmail(user.email, {
        title: `${isExpired ? "EXPIRED" : "Expiring Soon"}: ${doc.name}`,
        description: doc.notes || `${doc.type} document for ${vehicle.year} ${vehicle.make} ${vehicle.model}${doc.expiryDate ? ` expires on ${doc.expiryDate.toLocaleDateString()}` : ""}`,
        dueDate: doc.expiryDate,
        dueMileage: null,
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          nickname: vehicle.nickname,
          currentMileage: vehicle.currentMileage,
        },
      });

      if (result.success) {
        await prisma.vehicleDocument.update({ where: { id: doc.id }, data: { lastNotifiedAt: now } });
      }

      results.push({ documentId: doc.id, type: isExpired ? "expired" : "expiring", emailSent: result.success });

      if (user.pushNotifications) {
        await tryPush(
          user.id,
          user.pushSubscription,
          `${isExpired ? "EXPIRED" : "Expiring"}: ${doc.name}`,
          `${vehicle.year} ${vehicle.make} ${vehicle.model}${doc.expiryDate ? ` — expires ${doc.expiryDate.toLocaleDateString()}` : ""}`,
          `/dashboard/vehicles/${vehicle.id}`
        );
      }
    }

    return NextResponse.json({
      overdueCount: overdueReminders.length,
      upcomingCount: upcomingReminders.length,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[cron] Notifications error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
