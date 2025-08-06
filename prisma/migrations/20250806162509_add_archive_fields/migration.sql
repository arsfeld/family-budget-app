-- AlterTable
ALTER TABLE "public"."MonthlyOverview" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "MonthlyOverview_familyId_isArchived_idx" ON "public"."MonthlyOverview"("familyId", "isArchived");
