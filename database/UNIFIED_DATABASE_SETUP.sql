-- ============================================
-- 🗄️ ملف إعداد قاعدة البيانات الشامل الموحد
-- Unified Database Setup Script
-- سوق مزاد - Sooq Mazad
-- ============================================

-- ============================================
-- 📦 1. الإضافات المطلوبة
-- ============================================

-- تفعيل الإضافات الأساسية
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================
-- 🔧 2. إعدادات الترميز العربي
-- ============================================

-- التأكد من دعم UTF-8 الكامل
SET client_encoding = 'UTF8';

-- إنشاء دالة لتنظيف النصوص العربية
CREATE OR REPLACE FUNCTION clean_arabic_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    -- إزالة المسافات الزائدة وتنظيف النص
    RETURN TRIM(REGEXP_REPLACE(input_text, '\s+', ' ', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 📊 3. فهارس الأداء الأساسية
-- ============================================

-- فهارس جدول المستخدمين
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_account_type ON users("accountType");

-- فهارس جدول السيارات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_model ON cars(model);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_year ON cars(year DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_location ON cars(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_featured ON cars(featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_seller_id ON cars("sellerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_created_at ON cars("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_is_auction ON cars("isAuction");

-- فهارس مركبة للسيارات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_status_created ON cars(status, "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_brand_model ON cars(brand, model);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_search ON cars(status, brand, model, year, price);

-- فهارس جدول المزادات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_car_id ON auctions("carId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_seller_id ON auctions("sellerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_start_date ON auctions("startDate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_end_date ON auctions("endDate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_featured ON auctions(featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_created_at ON auctions("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_current_price ON auctions("currentPrice" DESC);

-- فهارس مركبة للمزادات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status_end ON auctions(status, "endDate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_active ON auctions(status, "startDate", "endDate") WHERE status IN ('ACTIVE', 'PENDING');

-- فهارس جدول المزايدات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_id ON bids("auctionId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_bidder_id ON bids("bidderId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_amount ON bids(amount DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_created_at ON bids("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_amount ON bids("auctionId", amount DESC);

-- فهارس جدول الرسائل
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender ON messages("senderId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation ON messages("conversationId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages("createdAt" DESC);

-- فهارس جدول المحادثات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_updated ON conversations("updatedAt" DESC);

-- فهارس جدول خدمات النقل
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_user_id ON transport_services("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_status ON transport_services(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_verified ON transport_services(verified);

-- فهارس جدول الإشعارات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications("isRead");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created ON notifications("createdAt" DESC);

-- فهارس جدول المفضلة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user ON favorites("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_car ON favorites("carId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_auction ON favorites("auctionId");

-- فهارس جدول المعاملات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_wallet ON transactions("walletId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created ON transactions("createdAt" DESC);

-- ============================================
-- 🔍 4. فهارس البحث النصي الكامل (Full Text Search)
-- ============================================

-- فهرس البحث النصي للسيارات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_fts 
ON cars USING gin(to_tsvector('simple', 
    COALESCE(title, '') || ' ' || 
    COALESCE(brand, '') || ' ' || 
    COALESCE(model, '') || ' ' || 
    COALESCE(description, '')
));

-- فهرس البحث النصي للمزادات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_fts 
ON auctions USING gin(to_tsvector('simple', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '')
));

-- فهرس البحث النصي للمستخدمين
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_fts 
ON users USING gin(to_tsvector('simple', 
    COALESCE(name, '') || ' ' || 
    COALESCE(phone, '')
));

-- ============================================
-- 📈 5. Materialized Views للإحصائيات
-- ============================================

-- عرض إحصائيات المزادات
DROP MATERIALIZED VIEW IF EXISTS mv_auction_stats;
CREATE MATERIALIZED VIEW mv_auction_stats AS
SELECT 
    a.id,
    a.status,
    a."startPrice",
    a."currentPrice",
    COUNT(DISTINCT b."bidderId") as unique_bidders,
    COUNT(b.id) as total_bids,
    MAX(b.amount) as highest_bid,
    a."endDate"
FROM auctions a
LEFT JOIN bids b ON a.id = b."auctionId"
GROUP BY a.id, a.status, a."startPrice", a."currentPrice", a."endDate";

CREATE UNIQUE INDEX ON mv_auction_stats(id);

-- عرض إحصائيات يومية
DROP MATERIALIZED VIEW IF EXISTS mv_daily_summary;
CREATE MATERIALIZED VIEW mv_daily_summary AS
SELECT 
    DATE_TRUNC('day', "createdAt") as date,
    COUNT(DISTINCT CASE WHEN "createdAt" >= CURRENT_DATE THEN id END) as new_users_today,
    COUNT(*) as total_users
FROM users
GROUP BY DATE_TRUNC('day', "createdAt");

CREATE UNIQUE INDEX ON mv_daily_summary(date);

-- ============================================
-- 🔄 6. دوال تحديث الـ Materialized Views
-- ============================================

CREATE OR REPLACE FUNCTION refresh_auction_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_auction_stats;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_daily_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ⚙️ 7. إعدادات الأداء الموصى بها
-- ============================================

-- هذه الإعدادات يجب تطبيقها في postgresql.conf

/*
# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 64MB
maintenance_work_mem = 256MB

# Write Ahead Log
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planner
random_page_cost = 1.1
effective_io_concurrency = 200

# Parallel Query
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4

# Autovacuum
autovacuum_vacuum_scale_factor = 0.05
autovacuum_analyze_scale_factor = 0.02
*/

-- ============================================
-- 🧹 8. صيانة قاعدة البيانات
-- ============================================

-- تحليل جميع الجداول
ANALYZE users;
ANALYZE cars;
ANALYZE auctions;
ANALYZE bids;
ANALYZE messages;
ANALYZE notifications;
ANALYZE transactions;
ANALYZE favorites;

-- ============================================
-- ✅ النهاية
-- ============================================

-- عرض رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE '✅ تم إعداد قاعدة البيانات بنجاح!';
    RAISE NOTICE '📊 تم إنشاء جميع الفهارس والـ Views';
END $$;
