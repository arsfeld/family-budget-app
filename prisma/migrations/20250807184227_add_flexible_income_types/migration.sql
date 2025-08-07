-- CreateTable
CREATE TABLE "public"."Income" (
    "id" TEXT NOT NULL,
    "overviewId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "monthlyAmount" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Income_overviewId_idx" ON "public"."Income"("overviewId");

-- CreateIndex
CREATE INDEX "Income_overviewId_userId_idx" ON "public"."Income"("overviewId", "userId");

-- CreateIndex
CREATE INDEX "Income_type_idx" ON "public"."Income"("type");

-- AddForeignKey
ALTER TABLE "public"."Income" ADD CONSTRAINT "Income_overviewId_fkey" FOREIGN KEY ("overviewId") REFERENCES "public"."MonthlyOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
