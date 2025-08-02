/*
  Warnings:

  - You are about to drop the column `clientId` on the `attestations` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `attestations` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `attestations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `attestations` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `currency` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the column `isPrimary` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the column `network` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the `identity_profiles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tokenId]` on the table `attestations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chain` to the `attestations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `attestations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smartContract` to the `attestations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `wallets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'CLIENT_ADMIN', 'CLIENT_USER');

-- CreateEnum
CREATE TYPE "public"."KycStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."MonitoringStatus" AS ENUM ('CLEAR', 'FLAGGED', 'BLOCKED', 'UNDER_REVIEW');

-- AlterEnum
ALTER TYPE "public"."AttestationStatus" ADD VALUE 'REVOKED';

-- AlterTable
ALTER TABLE "public"."attestations" DROP COLUMN "clientId",
DROP COLUMN "metadata",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "chain" TEXT NOT NULL,
ADD COLUMN     "metadataUri" TEXT,
ADD COLUMN     "profileId" TEXT NOT NULL,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "smartContract" TEXT NOT NULL,
ADD COLUMN     "tokenId" BIGINT,
ADD COLUMN     "walletId" TEXT,
ALTER COLUMN "issuedAt" DROP NOT NULL,
ALTER COLUMN "issuedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'CLIENT_USER';

-- AlterTable
ALTER TABLE "public"."wallets" DROP COLUMN "currency",
DROP COLUMN "isPrimary",
DROP COLUMN "network",
DROP COLUMN "userId",
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "profileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."identity_profiles";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."branding" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "clientId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "type" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kyc_verifications" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "public"."KycStatus" NOT NULL DEFAULT 'PENDING',
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webhookReceived" BOOLEAN NOT NULL DEFAULT false,
    "profileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."smart_contracts" (
    "id" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smart_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_monitoring" (
    "id" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" "public"."MonitoringStatus" NOT NULL DEFAULT 'CLEAR',
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "flags" TEXT[],
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_monitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_tokens" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "permissions" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "branding_id_key" ON "public"."branding"("id");

-- CreateIndex
CREATE UNIQUE INDEX "branding_clientId_key" ON "public"."branding"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_id_key" ON "public"."profiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_id_key" ON "public"."addresses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_id_key" ON "public"."kyc_verifications"("id");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_providerId_key" ON "public"."kyc_verifications"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "smart_contracts_id_key" ON "public"."smart_contracts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "smart_contracts_contractAddress_key" ON "public"."smart_contracts"("contractAddress");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_monitoring_id_key" ON "public"."transaction_monitoring"("id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_monitoring_transactionHash_key" ON "public"."transaction_monitoring"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_key" ON "public"."roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_id_key" ON "public"."permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "api_tokens_id_key" ON "public"."api_tokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "api_tokens_token_key" ON "public"."api_tokens"("token");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "public"."_RoleToUser"("B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "public"."_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "attestations_tokenId_key" ON "public"."attestations"("tokenId");
