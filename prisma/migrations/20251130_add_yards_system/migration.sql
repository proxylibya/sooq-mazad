-- CreateEnum
CREATE TYPE "YardStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateTable
CREATE TABLE "yards" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "images" TEXT[],
    "city" TEXT NOT NULL,
    "area" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "phones" TEXT[],
    "email" TEXT,
    "auctionDays" TEXT[],
    "auctionTimeFrom" TEXT,
    "auctionTimeTo" TEXT,
    "workingHours" TEXT,
    "capacity" INTEGER,
    "status" "YardStatus" NOT NULL DEFAULT 'PENDING',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "managerId" TEXT,
    "managerName" TEXT,
    "managerPhone" TEXT,
    "services" TEXT[],
    "vehicleTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yards_pkey" PRIMARY KEY ("id")
);

-- AddColumn to auctions
ALTER TABLE "auctions" ADD COLUMN "yardId" TEXT;

-- CreateIndexes
CREATE UNIQUE INDEX "yards_slug_key" ON "yards"("slug");
CREATE INDEX "yards_city_idx" ON "yards"("city");
CREATE INDEX "yards_status_idx" ON "yards"("status");
CREATE INDEX "yards_featured_idx" ON "yards"("featured");
CREATE INDEX "yards_slug_idx" ON "yards"("slug");
CREATE INDEX "auctions_yardId_idx" ON "auctions"("yardId");

-- AddForeignKey
ALTER TABLE "yards" ADD CONSTRAINT "yards_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_yardId_fkey" FOREIGN KEY ("yardId") REFERENCES "yards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
