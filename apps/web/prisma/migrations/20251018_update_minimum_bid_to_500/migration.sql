-- Update minimum bid increment to 500 LYD

-- Update default value in table
ALTER TABLE "auctions" ALTER COLUMN "minimumBidIncrement" SET DEFAULT 500.0;

-- Update existing auctions with smaller values
UPDATE "auctions" 
SET "minimumBidIncrement" = 500.0 
WHERE "minimumBidIncrement" < 500.0;
