-- إضافات PostgreSQL الضرورية لمشروع مزاد السيارات
-- Required PostgreSQL Extensions for Car Auction Project

-- إضافة UUID للمعرفات الفريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- إضافة البحث النصي المتقدم
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- إضافة إزالة علامات التشكيل
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- إضافة تحسين الفهارس
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- إضافة مراقبة الأداء
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- فحص الإضافات المثبتة
SELECT extname as "Extension Name", extversion as "Version" 
FROM pg_extension 
ORDER BY extname;
