-- CreateTable
CREATE TABLE "public"."FamilyOnboarding" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "adultsCount" INTEGER,
    "childrenCount" INTEGER,
    "childrenAges" JSONB,
    "primaryIncome" DECIMAL(10,2),
    "secondaryIncome" DECIMAL(10,2),
    "otherIncome" DECIMAL(10,2),
    "hasInvestments" BOOLEAN NOT NULL DEFAULT false,
    "investmentTypes" JSONB,
    "monthlyInvestmentAmount" DECIMAL(10,2),
    "housingType" TEXT,
    "housingCost" DECIMAL(10,2),
    "savingsGoal" DECIMAL(10,2),
    "financialGoals" JSONB,
    "budgetPriorities" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnboardingConversation" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyOnboarding_familyId_key" ON "public"."FamilyOnboarding"("familyId");

-- CreateIndex
CREATE INDEX "OnboardingConversation_onboardingId_idx" ON "public"."OnboardingConversation"("onboardingId");

-- AddForeignKey
ALTER TABLE "public"."FamilyOnboarding" ADD CONSTRAINT "FamilyOnboarding_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingConversation" ADD CONSTRAINT "OnboardingConversation_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "public"."FamilyOnboarding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
