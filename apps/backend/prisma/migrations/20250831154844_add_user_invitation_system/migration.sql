-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "public"."user_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "clientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "invitedBy" TEXT NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "emailSentCount" INTEGER NOT NULL DEFAULT 0,
    "lastEmailSentAt" TIMESTAMP(3),
    "message" TEXT,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_invitations_id_key" ON "public"."user_invitations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_invitations_token_key" ON "public"."user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_token_idx" ON "public"."user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_email_idx" ON "public"."user_invitations"("email");

-- CreateIndex
CREATE INDEX "user_invitations_clientId_idx" ON "public"."user_invitations"("clientId");

-- CreateIndex
CREATE INDEX "user_invitations_status_idx" ON "public"."user_invitations"("status");

-- CreateIndex
CREATE INDEX "user_invitations_expiresAt_idx" ON "public"."user_invitations"("expiresAt");
