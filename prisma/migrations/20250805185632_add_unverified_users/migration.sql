-- CreateTable
CREATE TABLE "public"."Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MonthlyOverview" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserIncome" (
    "id" TEXT NOT NULL,
    "overviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salaryAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "salaryFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "monthlySalary" DECIMAL(10,2) NOT NULL,
    "additionalIncome" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "UserIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserExpense" (
    "id" TEXT NOT NULL,
    "overviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "sharePercentage" INTEGER,
    "notes" TEXT,

    CONSTRAINT "UserExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "MonthlyOverview_familyId_isActive_idx" ON "public"."MonthlyOverview"("familyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserIncome_overviewId_userId_key" ON "public"."UserIncome"("overviewId", "userId");

-- CreateIndex
CREATE INDEX "UserExpense_overviewId_userId_idx" ON "public"."UserExpense"("overviewId", "userId");

-- CreateIndex
CREATE INDEX "Category_familyId_idx" ON "public"."Category"("familyId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MonthlyOverview" ADD CONSTRAINT "MonthlyOverview_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserIncome" ADD CONSTRAINT "UserIncome_overviewId_fkey" FOREIGN KEY ("overviewId") REFERENCES "public"."MonthlyOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserIncome" ADD CONSTRAINT "UserIncome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExpense" ADD CONSTRAINT "UserExpense_overviewId_fkey" FOREIGN KEY ("overviewId") REFERENCES "public"."MonthlyOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExpense" ADD CONSTRAINT "UserExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExpense" ADD CONSTRAINT "UserExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
