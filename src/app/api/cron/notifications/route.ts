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

    // ── Reminder notifications (existing) ──────────────────────────
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

    // ── License expiry notifications ──────────────────────────
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const usersWithExpiringLicense = await prisma.user.findMany({
      where: {
        licenseExpiry: { not: null },
        pushNotifications: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        licenseNumber: true,
        licenseExpiry: true,
        pushNotifications: true,
      },
    });

    for (const u of usersWithExpiringLicense) {
      if (!u.licenseExpiry) continue;
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

      if (shouldNotify && u.email) {
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

        results.push({
          userId: u.id,
          type: notificationType,
          emailSent: result.success,
        });
      }

      // Send push notification
      const userWithSub = await prisma.user.findUnique({
        where: { id: u.id },
        select: { pushSubscription: true },
      });

      if (userWithSub?.pushSubscription) {
        const { sendPushNotification } = await import("@/lib/push");
        const pushResult = await sendPushNotification(userWithSub.pushSubscription, {
          title: notificationType === "license_expired" ? "License Expired" : "License Expiring Soon",
          body: `Your driver's license${u.licenseNumber ? ` (${u.licenseNumber})` : ""} expires on ${u.licenseExpiry.toLocaleDateString()}.`,
          url: "/dashboard/profile",
        });

        if (pushResult.expired) {
          await prisma.user.update({
            where: { id: u.id },
            data: { pushSubscription: null },
          });
        }

        results.push({
          userId: u.id,
          pushSent: pushResult.success,
        });
      }
    }

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

    // ── Document expiry notifications ──────────────────────────────
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringDocuments = await prisma.vehicleDocument.findMany({
      where: {
        expiryDate: { lte: sevenDaysFromNow },
      },
      include: {
        vehicle: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                smsNotifications: true,
              },
            },
          },
        },
      },
    });

    // Group documents by user for consolidated notifications
    const docsByUser = new Map<string, typeof expiringDocuments[number][]>();
    for (const doc of expiringDocuments) {
      const user = doc.vehicle.user;
      if (!user?.email) continue;
      const existing = docsByUser.get(user.id) || [];
      existing.push(doc);
      docsByUser.set(user.id, existing);
    }

    const documentResults = [];

    for (const [userId, docs] of Array.from(docsByUser)) {
      const user = docs[0].vehicle.user;

      // Send email notification about expiring documents
      for (const doc of docs) {
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

        documentResults.push({
          documentId: doc.id,
          type: isExpired ? "expired" : "expiring",
          emailSent: result.success,
        });

        // SMS notification placeholder
        if (user.smsNotifications && user.phone) {
          // TODO: Integrate Twilio for SMS:
          // const twilio = require('twilio');
          // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          // const body = `Bitácora: ${isExpired ? "EXPIRED" : "Expiring"} document "${doc.name}" for ${vehicle.year} ${vehicle.make} ${vehicle.model}`;
          // await client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to: user.phone });
          console.log(`[SMS Placeholder] Would send SMS to ${user.phone} about document "${doc.name}"`);
        }
      }
    }

    return NextResponse.json({
      overdueCount: overdueReminders.length,
      upcomingCount: upcomingReminders.length,
      documentResults,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
