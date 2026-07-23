-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN "lastNotifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VehicleDocument" ADD COLUMN "lastNotifiedAt" TIMESTAMP(3);
