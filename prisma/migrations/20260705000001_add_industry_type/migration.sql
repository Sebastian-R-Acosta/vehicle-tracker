-- AlterTable: Add industryType column to Organization
ALTER TABLE "Organization" ADD COLUMN "industryType" TEXT NOT NULL DEFAULT 'construction';
