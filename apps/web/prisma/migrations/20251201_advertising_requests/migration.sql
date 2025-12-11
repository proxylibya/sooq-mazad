-- CreateEnum for AdvertisingRequestType
CREATE TYPE "AdvertisingRequestType" AS ENUM ('ADVERTISING_SERVICE', 'TEAM_CONTACT');

-- CreateEnum for AdvertisingRequestStatus  
CREATE TYPE "AdvertisingRequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum for AdvertisingRequestPriority
CREATE TYPE "AdvertisingRequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "advertising_requests" (
    "id" TEXT NOT NULL,
    "requestType" "AdvertisingRequestType" NOT NULL DEFAULT 'ADVERTISING_SERVICE',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dialCode" TEXT NOT NULL DEFAULT '+218',
    "city" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "serviceType" TEXT NOT NULL,
    "packageType" TEXT,
    "message" TEXT,
    "budget" DOUBLE PRECISION,
    "preferredDate" TIMESTAMP(3),
    "status" "AdvertisingRequestStatus" NOT NULL DEFAULT 'NEW',
    "priority" "AdvertisingRequestPriority" NOT NULL DEFAULT 'NORMAL',
    "assignedTo" TEXT,
    "adminNotes" TEXT,
    "contactedAt" TIMESTAMP(3),
    "contactMethod" TEXT,
    "contactNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "source" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertising_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "advertising_requests_status_idx" ON "advertising_requests"("status");

-- CreateIndex
CREATE INDEX "advertising_requests_requestType_idx" ON "advertising_requests"("requestType");

-- CreateIndex
CREATE INDEX "advertising_requests_priority_idx" ON "advertising_requests"("priority");

-- CreateIndex
CREATE INDEX "advertising_requests_city_idx" ON "advertising_requests"("city");

-- CreateIndex
CREATE INDEX "advertising_requests_createdAt_idx" ON "advertising_requests"("createdAt");

-- CreateIndex
CREATE INDEX "advertising_requests_assignedTo_idx" ON "advertising_requests"("assignedTo");

-- CreateIndex
CREATE INDEX "advertising_requests_phone_idx" ON "advertising_requests"("phone");

-- AddForeignKey
ALTER TABLE "advertising_requests" ADD CONSTRAINT "advertising_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising_requests" ADD CONSTRAINT "advertising_requests_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
