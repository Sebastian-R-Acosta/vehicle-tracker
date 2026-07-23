-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "paymentProcessor" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "paypalPayerId" TEXT,
ADD COLUMN     "paypalSubId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "licenseImageBack" TEXT,
ADD COLUMN     "licenseImageFront" TEXT,
ADD COLUMN     "pushSubscription" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "superAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "licensePlate" TEXT;

-- CreateTable
CREATE TABLE "vehicle_tasks" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "estimatedHours" DOUBLE PRECISION,
    "urgency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priorityScore" DOUBLE PRECISION,
    "priorityLabel" TEXT,
    "explanation" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "dependencyIds" TEXT,
    "buildGoalTag" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_tasks_vehicleId_idx" ON "vehicle_tasks"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_tasks_userId_idx" ON "vehicle_tasks"("userId");

-- CreateIndex
CREATE INDEX "vehicle_tasks_status_idx" ON "vehicle_tasks"("status");

-- CreateIndex
CREATE INDEX "Subscription_paymentProcessor_idx" ON "Subscription"("paymentProcessor");

-- AddForeignKey
ALTER TABLE "vehicle_tasks" ADD CONSTRAINT "vehicle_tasks_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_tasks" ADD CONSTRAINT "vehicle_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
