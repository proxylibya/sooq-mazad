-- نظام كروت الشحن (ليبيانا/مدار)
-- CreateEnum
CREATE TYPE "CardProvider" AS ENUM ('LIBYANA', 'MADAR');
CREATE TYPE "CardStatus" AS ENUM ('AVAILABLE', 'USED', 'RESERVED', 'EXPIRED', 'DISABLED');
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'DEPLETED', 'EXPIRED', 'DISABLED');
CREATE TYPE "CardDepositStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'FAILED');

-- CreateTable: كروت الشحن
CREATE TABLE "recharge_cards" (
    "id" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardHash" TEXT NOT NULL,
    "provider" "CardProvider" NOT NULL,
    "denomination" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'AVAILABLE',
    "batchId" TEXT,
    "serialNumber" TEXT,
    "addedBy" TEXT NOT NULL,
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "recharge_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable: دفعات الكروت
CREATE TABLE "card_batches" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "provider" "CardProvider" NOT NULL,
    "totalCards" INTEGER NOT NULL,
    "usedCards" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "usedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "addedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable: طلبات الإيداع بالكروت
CREATE TABLE "card_deposit_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "provider" "CardProvider" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "CardDepositStatus" NOT NULL DEFAULT 'PENDING',
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "transactionId" TEXT,
    "depositId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_deposit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recharge_cards_cardNumber_key" ON "recharge_cards"("cardNumber");
CREATE UNIQUE INDEX "recharge_cards_cardHash_key" ON "recharge_cards"("cardHash");
CREATE INDEX "recharge_cards_provider_idx" ON "recharge_cards"("provider");
CREATE INDEX "recharge_cards_status_idx" ON "recharge_cards"("status");
CREATE INDEX "recharge_cards_batchId_idx" ON "recharge_cards"("batchId");
CREATE INDEX "recharge_cards_usedBy_idx" ON "recharge_cards"("usedBy");
CREATE INDEX "recharge_cards_createdAt_idx" ON "recharge_cards"("createdAt");

CREATE UNIQUE INDEX "card_batches_batchNumber_key" ON "card_batches"("batchNumber");
CREATE INDEX "card_batches_provider_idx" ON "card_batches"("provider");
CREATE INDEX "card_batches_status_idx" ON "card_batches"("status");

CREATE INDEX "card_deposit_requests_userId_idx" ON "card_deposit_requests"("userId");
CREATE INDEX "card_deposit_requests_status_idx" ON "card_deposit_requests"("status");
CREATE INDEX "card_deposit_requests_provider_idx" ON "card_deposit_requests"("provider");
CREATE INDEX "card_deposit_requests_createdAt_idx" ON "card_deposit_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "card_deposit_requests" ADD CONSTRAINT "card_deposit_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
