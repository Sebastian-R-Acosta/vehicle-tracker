-- AlterTable: national ID so workshops can look a customer up by cédula
ALTER TABLE "User" ADD COLUMN     "documentId" TEXT;

-- AlterTable: workshop attribution and service lifecycle on maintenance records.
-- All columns are nullable (or defaulted) so existing owner-created rows stay valid.
ALTER TABLE "MaintenanceRecord" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "serviceProviderId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'completed',
ADD COLUMN     "estimatedHours" DOUBLE PRECISION,
ADD COLUMN     "readyAt" TIMESTAMP(3),
ADD COLUMN     "acknowledgedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ServiceAuthorization" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "grantedByUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_documentId_key" ON "User"("documentId");

-- CreateIndex
CREATE INDEX "User_documentId_idx" ON "User"("documentId");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "Vehicle_licensePlate_idx" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_organizationId_idx" ON "MaintenanceRecord"("organizationId");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_status_idx" ON "MaintenanceRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAuthorization_vehicleId_organizationId_key" ON "ServiceAuthorization"("vehicleId", "organizationId");

-- CreateIndex
CREATE INDEX "ServiceAuthorization_vehicleId_idx" ON "ServiceAuthorization"("vehicleId");

-- CreateIndex
CREATE INDEX "ServiceAuthorization_organizationId_idx" ON "ServiceAuthorization"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceAuthorization_status_idx" ON "ServiceAuthorization"("status");

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAuthorization" ADD CONSTRAINT "ServiceAuthorization_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAuthorization" ADD CONSTRAINT "ServiceAuthorization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAuthorization" ADD CONSTRAINT "ServiceAuthorization_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
