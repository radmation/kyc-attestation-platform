/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `kyc_verifications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."KycStatus" ADD VALUE 'UNDER_REVIEW';
ALTER TYPE "public"."KycStatus" ADD VALUE 'MANUAL_REVIEW';

-- AlterTable
ALTER TABLE "public"."kyc_verifications" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "inquiryData" JSONB,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'idenfy',
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_externalId_key" ON "public"."kyc_verifications"("externalId");
