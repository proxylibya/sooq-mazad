-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'AUCTION_WON';
ALTER TYPE "NotificationType" ADD VALUE 'BID_OUTBID';
ALTER TYPE "NotificationType" ADD VALUE 'AUCTION_ENDING';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_REMINDER';

-- AlterTable
ALTER TABLE "auctions" ADD COLUMN     "minimumBidIncrement" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
ADD COLUMN     "reservePrice" DOUBLE PRECISION;
