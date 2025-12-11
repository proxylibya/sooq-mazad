-- 🚀 Database Performance Optimization Script
-- نظام تحسين أداء قاعدة البيانات PostgreSQL

-- ============================================
-- 1. إضافة الفهارس المفقودة
-- ============================================

-- User indexes for faster lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_status 
ON users(phone, status) 
WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower 
ON users(LOWER(email)) 
WHERE email IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at_desc 
ON users(created_at DESC);

-- Auction indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status_end_time 
ON auctions(status, end_time) 
WHERE status IN ('ACTIVE', 'PENDING');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_seller_status 
ON auctions(seller_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_car_id 
ON auctions(car_id);

-- Car indexes for marketplace
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_status_featured 
ON cars(status, featured) 
WHERE status = 'AVAILABLE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_brand_model 
ON cars(brand, model);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_price_range 
ON cars(price) 
WHERE status = 'AVAILABLE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cars_year_mileage 
ON cars(year DESC, mileage ASC);

-- Bid indexes for auction performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_amount 
ON bids(auction_id, amount DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_user_auction 
ON bids(user_id, auction_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_created_at 
ON bids(created_at DESC);

-- Transport Service indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_status_city 
ON TransportService(status, service_cities) 
WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_user_status 
ON TransportService(userId, status);

-- Message and Conversation indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_created 
ON messages(sender_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_type_updated 
ON conversations(type, updated_at DESC);

-- Activity and Audit logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_created 
ON activity_logs(userId, createdAt DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_action_entity 
ON activity_logs(action, entityType, createdAt DESC);

-- ============================================
-- 2. تحسين الاستعلامات الشائعة
-- ============================================

-- Create materialized view for auction statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS auction_stats AS
SELECT 
    a.id,
    a.status,
    a.starting_price,
    a.current_price,
    COUNT(DISTINCT b.user_id) as unique_bidders,
    COUNT(b.id) as total_bids,
    MAX(b.amount) as highest_bid,
    a.end_time
FROM auctions a
LEFT JOIN bids b ON a.id = b.auction_id
GROUP BY a.id, a.status, a.starting_price, a.current_price, a.end_time;

CREATE UNIQUE INDEX ON auction_stats(id);
CREATE INDEX ON auction_stats(status, end_time);

-- Create materialized view for user statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats AS
SELECT 
    u.id,
    u.name,
    u.role,
    COUNT(DISTINCT a.id) as total_auctions,
    COUNT(DISTINCT b.id) as total_bids,
    COUNT(DISTINCT c.id) as total_cars,
    u.created_at
FROM users u
LEFT JOIN auctions a ON u.id = a.seller_id
LEFT JOIN bids b ON u.id = b.user_id
LEFT JOIN cars c ON u.id = c.seller_id
GROUP BY u.id, u.name, u.role, u.created_at;

CREATE UNIQUE INDEX ON user_stats(id);

-- ============================================
-- 3. تحسين الأداء العام
-- ============================================

-- Update table statistics
ANALYZE users;
ANALYZE auctions;
ANALYZE cars;
ANALYZE bids;
ANALYZE TransportService;
ANALYZE messages;
ANALYZE conversations;

-- Configure autovacuum for high-traffic tables
ALTER TABLE bids SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE messages SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE activity_logs SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

-- ============================================
-- 4. Partitioning for large tables
-- ============================================

-- Partition activity_logs by month (if not already partitioned)
-- Note: This requires recreating the table, so handle with care in production

-- Example partitioning setup (commented for safety):
/*
CREATE TABLE activity_logs_partitioned (
    LIKE activity_logs INCLUDING ALL
) PARTITION BY RANGE (createdAt);

CREATE TABLE activity_logs_2024_01 PARTITION OF activity_logs_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE activity_logs_2024_02 PARTITION OF activity_logs_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
    
-- Continue for other months...
*/

-- ============================================
-- 5. Query optimization functions
-- ============================================

-- Function to get active auctions efficiently
CREATE OR REPLACE FUNCTION get_active_auctions(
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id VARCHAR,
    title VARCHAR,
    current_price DECIMAL,
    end_time TIMESTAMP,
    bid_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.current_price,
        a.end_time,
        COUNT(b.id) as bid_count
    FROM auctions a
    LEFT JOIN bids b ON a.id = b.auction_id
    WHERE a.status = 'ACTIVE' 
    AND a.end_time > NOW()
    GROUP BY a.id, a.title, a.current_price, a.end_time
    ORDER BY a.end_time ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_id_param VARCHAR)
RETURNS TABLE (
    total_auctions BIGINT,
    active_auctions BIGINT,
    total_bids BIGINT,
    won_auctions BIGINT,
    total_cars BIGINT,
    last_activity TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT a.id) FILTER (WHERE a.seller_id = user_id_param) as total_auctions,
        COUNT(DISTINCT a.id) FILTER (WHERE a.seller_id = user_id_param AND a.status = 'ACTIVE') as active_auctions,
        COUNT(DISTINCT b.id) FILTER (WHERE b.user_id = user_id_param) as total_bids,
        COUNT(DISTINCT a2.id) FILTER (WHERE a2.winner_id = user_id_param) as won_auctions,
        COUNT(DISTINCT c.id) FILTER (WHERE c.seller_id = user_id_param) as total_cars,
        MAX(GREATEST(
            COALESCE((SELECT MAX(created_at) FROM bids WHERE user_id = user_id_param), '1970-01-01'::TIMESTAMP),
            COALESCE((SELECT MAX(created_at) FROM auctions WHERE seller_id = user_id_param), '1970-01-01'::TIMESTAMP),
            COALESCE((SELECT MAX(created_at) FROM cars WHERE seller_id = user_id_param), '1970-01-01'::TIMESTAMP)
        )) as last_activity
    FROM users u
    LEFT JOIN auctions a ON u.id = a.seller_id
    LEFT JOIN bids b ON u.id = b.user_id
    LEFT JOIN auctions a2 ON u.id = a2.winner_id
    LEFT JOIN cars c ON u.id = c.seller_id
    WHERE u.id = user_id_param
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Cleanup and maintenance
-- ============================================

-- Remove old activity logs (keep last 6 months)
DELETE FROM activity_logs 
WHERE createdAt < NOW() - INTERVAL '6 months';

-- Remove expired sessions
DELETE FROM admin_sessions 
WHERE expires_at < NOW() AND is_active = false;

DELETE FROM sessions 
WHERE expires_at < NOW();

-- Clean up orphaned records
DELETE FROM bids 
WHERE auction_id NOT IN (SELECT id FROM auctions);

DELETE FROM messages 
WHERE conversation_id NOT IN (SELECT id FROM conversations);

-- ============================================
-- 7. Refresh materialized views
-- ============================================

REFRESH MATERIALIZED VIEW CONCURRENTLY auction_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;

-- ============================================
-- 8. Performance monitoring queries
-- ============================================

-- Check slow queries
/*
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;
*/

-- Check table sizes
/*
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
*/

-- Check index usage
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan
LIMIT 20;
*/

-- ============================================
-- Success message
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Database optimization completed successfully!';
    RAISE NOTICE '📊 Indexes created, views materialized, and statistics updated.';
    RAISE NOTICE '🚀 Your database is now optimized for better performance.';
END $$;
