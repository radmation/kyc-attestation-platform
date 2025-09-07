/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriptionId]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."BillingStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "public"."clients" ADD COLUMN     "billingStatus" "public"."BillingStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "gracePeriodEndsAt" TIMESTAMP(3),
ADD COLUMN     "lastPaymentFailedAt" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "subscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clients_stripeCustomerId_key" ON "public"."clients"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_subscriptionId_key" ON "public"."clients"("subscriptionId");
