-- Unified Promotion System
-- Add promotion fields to listings

-- Add promotion fields to cars table
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "promotionPackage" TEXT DEFAULT 'free';
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "promotionDays" INTEGER DEFAULT 0;
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "promotionStartDate" TIMESTAMP(3);
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "promotionEndDate" TIMESTAMP(3);
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "promotionPriority" INTEGER DEFAULT 0;

-- Add promotion fields to auctions table
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "promotionPackage" TEXT DEFAULT 'free';
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "promotionDays" INTEGER DEFAULT 0;
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "promotionStartDate" TIMESTAMP(3);
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "promotionEndDate" TIMESTAMP(3);
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "promotionPriority" INTEGER DEFAULT 0;

-- Add promotion fields to showrooms table
ALTER TABLE "showrooms" ADD COLUMN IF NOT EXISTS "promotionPackage" TEXT DEFAULT 'free';
ALTER TABLE "showrooms" ADD COLUMN IF NOT EXISTS "promotionDays" INTEGER DEFAULT 0;
ALTER TABLE "showrooms" ADD COLUMN IF NOT EXISTS "promotionStartDate" TIMESTAMP(3);
ALTER TABLE "showrooms" ADD COLUMN IF NOT EXISTS "promotionEndDate" TIMESTAMP(3);
ALTER TABLE "showrooms" ADD COLUMN IF NOT EXISTS "promotionPriority" INTEGER DEFAULT 0;

-- Add promotion fields to TransportService table
ALTER TABLE "TransportService" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN DEFAULT false;
ALTER TABLE "TransportService" ADD COLUMN IF NOT EXISTS "promotionPackage" TEXT DEFAULT 'free';
ALTER TABLE "TransportService" ADD COLUMN IF NOT EXISTS "promotionDays" INTEGER DEFAULT 0;
ALTER TABLE "TransportService" ADD COLUMN IF NOT EXISTS "promotionStartDate" TIMESTAMP(3);
ALTER TABLE "TransportService" ADD COLUMN IF NOT EXISTS "promotionEndDate" TIMESTAMP(3);
ALTER TABLE "TransportService" ADD COLUMN IF NOT EXISTS "promotionPriority" INTEGER DEFAULT 0;

-- Create promotion indexes
CREATE INDEX IF NOT EXISTS "cars_promotionPackage_idx" ON "cars"("promotionPackage");
CREATE INDEX IF NOT EXISTS "cars_promotionEndDate_idx" ON "cars"("promotionEndDate");
CREATE INDEX IF NOT EXISTS "cars_featured_promotionPriority_idx" ON "cars"("featured", "promotionPriority" DESC);

CREATE INDEX IF NOT EXISTS "auctions_promotionPackage_idx" ON "auctions"("promotionPackage");
CREATE INDEX IF NOT EXISTS "auctions_promotionEndDate_idx" ON "auctions"("promotionEndDate");
CREATE INDEX IF NOT EXISTS "auctions_featured_promotionPriority_idx" ON "auctions"("featured", "promotionPriority" DESC);

CREATE INDEX IF NOT EXISTS "showrooms_promotionPackage_idx" ON "showrooms"("promotionPackage");
CREATE INDEX IF NOT EXISTS "showrooms_promotionEndDate_idx" ON "showrooms"("promotionEndDate");

CREATE INDEX IF NOT EXISTS "TransportService_featured_idx" ON "TransportService"("featured");
CREATE INDEX IF NOT EXISTS "TransportService_promotionPackage_idx" ON "TransportService"("promotionPackage");

-- Create promotion transactions table
CREATE TABLE IF NOT EXISTS "promotion_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT DEFAULT 'LYD',
    "paymentMethod" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "promotion_transactions_userId_idx" ON "promotion_transactions"("userId");
CREATE INDEX IF NOT EXISTS "promotion_transactions_entityType_entityId_idx" ON "promotion_transactions"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "promotion_transactions_status_idx" ON "promotion_transactions"("status");
CREATE INDEX IF NOT EXISTS "promotion_transactions_endDate_idx" ON "promotion_transactions"("endDate");

-- Add foreign key to users table
ALTER TABLE "promotion_transactions" ADD CONSTRAINT "promotion_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
