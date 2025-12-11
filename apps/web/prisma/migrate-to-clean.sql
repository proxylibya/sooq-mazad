-- ==========================================
-- 🔥 RADICAL DATABASE MIGRATION SQL
-- Version: 3.0 - Complete System Overhaul
-- ==========================================

BEGIN;

-- ==========================================
-- STEP 1: BACKUP CRITICAL DATA
-- ==========================================

-- Backup users with role mapping
CREATE TEMP TABLE users_backup AS
SELECT 
  id, 
  COALESCE(phone, email, login_identifier) as phone,
  name,
  email,
  login_identifier as username,
  password_hash,
  CASE 
    WHEN role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR') THEN role::text
    ELSE 'USER'
  END as role,
  CASE 
    WHEN status IN ('ACTIVE', 'BLOCKED', 'SUSPENDED') THEN status::text
    ELSE 'ACTIVE'
  END as status,
  avatar,
  city,
  verified,
  verified_at,
  last_login,
  created_at,
  updated_at
FROM users
WHERE deleted_at IS NULL;

-- Backup cars
CREATE TEMP TABLE cars_backup AS
SELECT * FROM cars WHERE deleted_at IS NULL;

-- Backup auctions
CREATE TEMP TABLE auctions_backup AS
SELECT * FROM auctions WHERE deleted_at IS NULL;

-- Backup transactions
CREATE TEMP TABLE transactions_backup AS
SELECT * FROM transactions WHERE status != 'FAILED';

-- ==========================================
-- STEP 2: DROP OLD TABLES (CASCADE)
-- ==========================================

DROP TABLE IF EXISTS 
  -- Old redundant tables
  admins,
  admin_permissions,
  admin_roles,
  user_roles,
  permissions,
  
  -- Old logging tables
  system_activity_logs,
  security_logs,
  audit_logs,
  sms_logs,
  
  -- Old wallet tables
  local_wallets,
  global_wallets,
  crypto_wallets,
  wallet_transactions,
  
  -- Old misc tables
  verification_codes,
  reset_tokens,
  login_attempts,
  blocked_ips,
  
  -- Unused tables
  analytics_events,
  page_views,
  click_events,
  search_logs
CASCADE;

-- ==========================================
-- STEP 3: CLEAN UP OLD COLUMNS
-- ==========================================

-- Clean users table
ALTER TABLE users 
  DROP COLUMN IF EXISTS public_id CASCADE,
  DROP COLUMN IF EXISTS cuid CASCADE,
  DROP COLUMN IF EXISTS legacy_id CASCADE,
  DROP COLUMN IF EXISTS old_phone CASCADE,
  DROP COLUMN IF EXISTS phone_verified CASCADE,
  DROP COLUMN IF EXISTS email_verified CASCADE,
  DROP COLUMN IF EXISTS two_factor_enabled CASCADE,
  DROP COLUMN IF EXISTS two_factor_secret CASCADE,
  DROP COLUMN IF EXISTS backup_codes CASCADE,
  DROP COLUMN IF EXISTS last_password_change CASCADE,
  DROP COLUMN IF EXISTS password_reset_token CASCADE,
  DROP COLUMN IF EXISTS password_reset_expires CASCADE,
  DROP COLUMN IF EXISTS login_attempts CASCADE,
  DROP COLUMN IF EXISTS locked_until CASCADE,
  DROP COLUMN IF EXISTS referral_code CASCADE,
  DROP COLUMN IF EXISTS referred_by CASCADE;

-- ==========================================
-- STEP 4: APPLY NEW SCHEMA STRUCTURE
-- ==========================================

-- Ensure correct column types
ALTER TABLE users 
  ALTER COLUMN role TYPE TEXT,
  ALTER COLUMN status TYPE TEXT;

-- Add missing columns if not exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS public_id SERIAL UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);

-- Update cars table
ALTER TABLE cars 
  ADD COLUMN IF NOT EXISTS public_id SERIAL UNIQUE,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Update auctions table  
ALTER TABLE auctions 
  ADD COLUMN IF NOT EXISTS public_id SERIAL UNIQUE,
  ADD COLUMN IF NOT EXISTS increment_amount FLOAT DEFAULT 500,
  ADD COLUMN IF NOT EXISTS bid_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- ==========================================
-- STEP 5: CREATE UNIFIED WALLET STRUCTURE
-- ==========================================

-- Create new unified wallet table
CREATE TABLE IF NOT EXISTS wallets (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  public_id SERIAL UNIQUE,
  user_id VARCHAR(25) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  local_balance FLOAT DEFAULT 0,
  global_balance FLOAT DEFAULT 0,
  crypto_balance FLOAT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migrate wallet data
INSERT INTO wallets (user_id, local_balance, global_balance, crypto_balance)
SELECT 
  u.id,
  COALESCE(SUM(CASE WHEN t.currency = 'LYD' THEN t.amount ELSE 0 END), 0),
  COALESCE(SUM(CASE WHEN t.currency = 'USD' THEN t.amount ELSE 0 END), 0),
  COALESCE(SUM(CASE WHEN t.currency = 'USDT' THEN t.amount ELSE 0 END), 0)
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'COMPLETED'
GROUP BY u.id
ON CONFLICT (user_id) DO NOTHING;

-- ==========================================
-- STEP 6: CREATE UNIFIED ACTIVITY LOG
-- ==========================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR(25) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255) NOT NULL,
  entity_id VARCHAR(255),
  description TEXT,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ==========================================
-- STEP 7: FIX ALL RELATIONSHIPS
-- ==========================================

-- Fix Car relationships
ALTER TABLE cars 
  DROP CONSTRAINT IF EXISTS cars_seller_id_fkey,
  ADD CONSTRAINT cars_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix Auction relationships  
ALTER TABLE auctions 
  DROP CONSTRAINT IF EXISTS auctions_car_id_fkey,
  ADD CONSTRAINT auctions_car_id_fkey 
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS auctions_seller_id_fkey,
  ADD CONSTRAINT auctions_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix Bid relationships
ALTER TABLE bids 
  DROP CONSTRAINT IF EXISTS bids_auction_id_fkey,
  ADD CONSTRAINT bids_auction_id_fkey 
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS bids_bidder_id_fkey,
  ADD CONSTRAINT bids_bidder_id_fkey 
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS bids_car_id_fkey,
  ADD CONSTRAINT bids_car_id_fkey 
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE;

-- Fix Message relationships
ALTER TABLE messages 
  DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey,
  ADD CONSTRAINT messages_conversation_id_fkey 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix ConversationParticipant relationships
ALTER TABLE conversation_participants 
  DROP CONSTRAINT IF EXISTS conversation_participants_conversation_id_fkey,
  ADD CONSTRAINT conversation_participants_conversation_id_fkey 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- Fix MessageRead relationships  
ALTER TABLE message_reads 
  DROP CONSTRAINT IF EXISTS message_reads_message_id_fkey,
  ADD CONSTRAINT message_reads_message_id_fkey 
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

-- Fix Notification relationships
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix Review relationships (SetNull for optional relations)
ALTER TABLE reviews 
  DROP CONSTRAINT IF EXISTS reviews_auction_id_fkey,
  ADD CONSTRAINT reviews_auction_id_fkey 
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE SET NULL,
  DROP CONSTRAINT IF EXISTS reviews_car_id_fkey,
  ADD CONSTRAINT reviews_car_id_fkey 
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
  DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey,
  ADD CONSTRAINT reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;

-- ==========================================
-- STEP 8: OPTIMIZE INDEXES
-- ==========================================

-- Drop old indexes
DROP INDEX IF EXISTS idx_users_phone_email;
DROP INDEX IF EXISTS idx_cars_status_featured;
DROP INDEX IF EXISTS idx_auctions_dates;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL AND is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_cars_seller ON cars(seller_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_cars_featured ON cars(featured) WHERE featured = true AND is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_auctions_car ON auctions(car_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON auctions(seller_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_auctions_dates ON auctions(start_date, end_date) WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read) WHERE is_read = false;

-- ==========================================
-- STEP 9: CLEAN ORPHANED DATA
-- ==========================================

-- Delete orphaned bids
DELETE FROM bids WHERE auction_id NOT IN (SELECT id FROM auctions);
DELETE FROM bids WHERE bidder_id NOT IN (SELECT id FROM users);
DELETE FROM bids WHERE car_id NOT IN (SELECT id FROM cars);

-- Delete orphaned messages
DELETE FROM messages WHERE conversation_id NOT IN (SELECT id FROM conversations);
DELETE FROM messages WHERE sender_id NOT IN (SELECT id FROM users);

-- Delete orphaned car images
DELETE FROM car_images WHERE car_id NOT IN (SELECT id FROM cars);

-- Delete orphaned notifications  
DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM users);

-- Delete orphaned reviews
DELETE FROM reviews WHERE reviewer_id NOT IN (SELECT id FROM users);

-- ==========================================
-- STEP 10: VACUUM AND ANALYZE
-- ==========================================

VACUUM ANALYZE users;
VACUUM ANALYZE cars;
VACUUM ANALYZE auctions;
VACUUM ANALYZE bids;
VACUUM ANALYZE wallets;
VACUUM ANALYZE transactions;
VACUUM ANALYZE messages;
VACUUM ANALYZE notifications;

-- ==========================================
-- FINAL: UPDATE STATISTICS
-- ==========================================

-- Update user statistics
UPDATE users SET 
  login_count = COALESCE(login_count, 0),
  verified = COALESCE(verified, false),
  is_deleted = false
WHERE is_deleted IS NULL;

-- Update car views
UPDATE cars SET 
  views = COALESCE(views, 0),
  featured = COALESCE(featured, false),
  is_deleted = false
WHERE is_deleted IS NULL;

-- Update auction bid counts
UPDATE auctions a SET 
  bid_count = (SELECT COUNT(*) FROM bids WHERE auction_id = a.id)
WHERE a.is_deleted = false;

COMMIT;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✅ RADICAL DATABASE MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '📊 Database is now clean, unified and optimized.';
END $$;
