import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      licenseNumber: true,
      licenseExpiry: true,
      licenseState: true,
      smsNotifications: true,
      pushNotifications: true,
      vehicles: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          reminders: {
            where: {
              isCompleted: false,
              OR: [
                { dueDate: { lte: in7Days } },
                { dueDate: { lte: now } },
              ],
            },
          },
          documents: {
            where: {
              OR: [
                { expiryDate: { lte: in30Days, gte: now } },
                { expiryDate: { lte: now } },
              ],
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  const notifications: any[] = [];

  for (const vehicle of user.vehicles) {
    for (const reminder of vehicle.reminders) {
      const isOverdue = reminder.dueDate && reminder.dueDate <= now;
      notifications.push({
        id: `reminder-${reminder.id}`,
        type: isOverdue ? "reminder_overdue" : "reminder_upcoming",
        title: reminder.title,
        description: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        dueDate: reminder.dueDate?.toISOString() || null,
        vehicleId: vehicle.id,
        link: `/dashboard/vehicles/${vehicle.id}`,
        severity: isOverdue ? "error" : "warning",
      });
    }

    for (const doc of vehicle.documents) {
      const isExpired = doc.expiryDate && doc.expiryDate <= now;
      notifications.push({
        id: `doc-${doc.id}`,
        type: isExpired ? "doc_expired" : "doc_expiring",
        title: isExpired ? "Document Expired" : "Document Expiring Soon",
        description: `${doc.name} - ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        dueDate: doc.expiryDate?.toISOString() || null,
        vehicleId: vehicle.id,
        link: `/dashboard/vehicles/${vehicle.id}`,
        severity: isExpired ? "error" : "warning",
      });
    }
  }

  if (user.licenseExpiry) {
    const isExpired = user.licenseExpiry <= now;
    const isClose = user.licenseExpiry <= in30Days;
    if (isExpired || isClose) {
      notifications.push({
        id: "license",
        type: isExpired ? "license_expired" : "license_expiring",
        title: isExpired ? "License Expired" : "License Expiring Soon",
        description: `${user.licenseNumber || "License"} expires ${user.licenseExpiry.toLocaleDateString()}`,
        dueDate: user.licenseExpiry.toISOString(),
        vehicleId: null,
        link: "/dashboard/profile",
        severity: isExpired ? "error" : "warning",
      });
    }
  }

  notifications.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return NextResponse.json({
    notifications,
    total: notifications.length,
    unread: notifications.length,
  });
}
