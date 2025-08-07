/*
  Warnings:

  - You are about to drop the `InvitationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."InvitationToken";

-- DropTable
DROP TABLE "public"."PasswordResetToken";

-- DropTable
DROP TABLE "public"."VerificationToken";

-- CreateTable
CREATE TABLE "public"."EmailToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "familyId" TEXT,
    "invitedBy" TEXT,

    CONSTRAINT "EmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailToken_token_key" ON "public"."EmailToken"("token");

-- CreateIndex
CREATE INDEX "EmailToken_email_type_idx" ON "public"."EmailToken"("email", "type");

-- CreateIndex
CREATE INDEX "EmailToken_token_idx" ON "public"."EmailToken"("token");
