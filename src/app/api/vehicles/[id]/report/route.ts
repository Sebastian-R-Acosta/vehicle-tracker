import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { 
      id: params.id,
      userId: session.user.id 
    },
    include: {
      maintenanceRecords: {
        orderBy: { date: "desc" },
      },
      previousOwner: true,
      reminders: {
        where: { isCompleted: false },
        orderBy: [{ dueDate: "asc" }, { dueMileage: "asc" }],
      },
    },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const lastMaintenance = vehicle.maintenanceRecords[0];
  const nextReminder = vehicle.reminders.find(r => r.dueDate || r.dueMileage);

  const reportData = {
    vehicle: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      nickname: vehicle.nickname,
      currentMileage: vehicle.currentMileage,
    },
    summary: {
      lastMaintenance: lastMaintenance
        ? {
            date: lastMaintenance.date,
            serviceType: lastMaintenance.serviceType,
            mileage: lastMaintenance.mileage,
          }
        : null,
      nextReminder: nextReminder
        ? {
            title: nextReminder.title,
            dueDate: nextReminder.dueDate,
            dueMileage: nextReminder.dueMileage,
          }
        : null,
    },
    maintenanceHistory: vehicle.maintenanceRecords.map((r) => ({
      date: r.date,
      serviceType: r.serviceType,
      mileage: r.mileage,
      notes: r.notes,
      imageUrl: r.imageUrl,
      cost: r.cost,
    })),
    ownershipHistory: [
      {
        type: "current",
        userId: vehicle.userId,
        since: vehicle.createdAt,
      },
      ...(vehicle.previousOwnerId
        ? [
            {
              type: "previous",
              userId: vehicle.previousOwnerId,
              name: vehicle.previousOwner?.name,
            },
          ]
        : []),
    ],
  };

  return NextResponse.json(reportData);
}