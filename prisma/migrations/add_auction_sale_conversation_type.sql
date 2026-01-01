-- Add AUCTION_SALE to ConversationType enum
ALTER TYPE "ConversationType" ADD VALUE IF NOT EXISTS 'AUCTION_SALE';

-- Comment explaining the migration
COMMENT ON TYPE "ConversationType" IS 'Updated to include AUCTION_SALE for tracking sale confirmation conversations';
