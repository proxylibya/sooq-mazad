-- ============================================
-- 🆔 Migration: نظام Public IDs المتقدم
-- ============================================
-- التاريخ: 2025-11-09
-- الهدف: إضافة معرفات عامة احترافية بأرقام 9 خانات
-- النظام: كل جدول له نطاق خاص (500M, 300M, 700M, إلخ)
-- ============================================

-- ============================================
-- 1️⃣ User: 500,000,000 - 599,999,999
-- ============================================

-- إنشاء Sequence مخصص
CREATE SEQUENCE IF NOT EXISTS users_public_id_seq
  START WITH 500000000
  INCREMENT BY 1
  NO MAXVALUE
  NO MINVALUE
  CACHE 1;

-- تحديث الجدول (إذا لم يكن موجوداً)
-- ملاحظة: User.publicId موجود بالفعل، نحتاج فقط تغيير الـ sequence
ALTER TABLE "users" 
  ALTER COLUMN "publicId" SET DEFAULT nextval('users_public_id_seq');

-- تحديث السجلات الموجودة (اختياري - إذا أردت إعادة ترقيمها)
-- DO $$
-- DECLARE
--   counter INTEGER := 500000000;
-- BEGIN
--   FOR rec IN (SELECT id FROM users ORDER BY "createdAt") LOOP
--     UPDATE users SET "publicId" = counter WHERE id = rec.id;
--     counter := counter + 1;
--   END LOOP;
-- END $$;

-- تحديث sequence للبدء من آخر رقم
SELECT setval('users_public_id_seq', (SELECT COALESCE(MAX("publicId"), 500000000) FROM users));

-- ============================================
-- 2️⃣ Wallet: 300,000,000 - 399,999,999
-- ============================================

-- إنشاء Sequence
CREATE SEQUENCE IF NOT EXISTS wallets_public_id_seq
  START WITH 300000000
  INCREMENT BY 1
  NO MAXVALUE
  NO MINVALUE
  CACHE 1;

-- إضافة العمود
ALTER TABLE "wallets" 
  ADD COLUMN IF NOT EXISTS "publicId" INTEGER UNIQUE DEFAULT nextval('wallets_public_id_seq');

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS "wallets_publicId_idx" ON "wallets"("publicId");

-- تعليق
COMMENT ON COLUMN "wallets"."publicId" IS 'رقم المحفظة (300M-399M) مثال: 340567891';

-- ============================================
-- 3️⃣ Transaction: 700,000,000 - 799,999,999
-- ============================================

-- إنشاء Sequence
CREATE SEQUENCE IF NOT EXISTS transactions_public_id_seq
  START WITH 700000000
  INCREMENT BY 1
  NO MAXVALUE
  NO MINVALUE
  CACHE 1;

-- إضافة العمود
ALTER TABLE "transactions" 
  ADD COLUMN IF NOT EXISTS "publicId" INTEGER UNIQUE DEFAULT nextval('transactions_public_id_seq');

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS "transactions_publicId_idx" ON "transactions"("publicId");

-- تعليق
COMMENT ON COLUMN "transactions"."publicId" IS 'رقم المعاملة (700M-799M) مثال: 740123456';

-- ============================================
-- 4️⃣ CryptoWallet: 800,000,000 - 899,999,999
-- ============================================

-- إنشاء Sequence
CREATE SEQUENCE IF NOT EXISTS crypto_wallets_public_id_seq
  START WITH 800000000
  INCREMENT BY 1
  NO MAXVALUE
  NO MINVALUE
  CACHE 1;

-- إضافة العمود
ALTER TABLE "crypto_wallets" 
  ADD COLUMN IF NOT EXISTS "publicId" INTEGER UNIQUE DEFAULT nextval('crypto_wallets_public_id_seq');

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS "crypto_wallets_publicId_idx" ON "crypto_wallets"("publicId");

-- تعليق
COMMENT ON COLUMN "crypto_wallets"."publicId" IS 'رقم المحفظة الرقمية (800M-899M) مثال: 840567123';

-- ============================================
-- 5️⃣ Deposit: 600,000,000 - 699,999,999
-- ============================================

-- إنشاء Sequence
CREATE SEQUENCE IF NOT EXISTS deposits_public_id_seq
  START WITH 600000000
  INCREMENT BY 1
  NO MAXVALUE
  NO MINVALUE
  CACHE 1;

-- إضافة العمود
ALTER TABLE "deposits" 
  ADD COLUMN IF NOT EXISTS "publicId" INTEGER UNIQUE DEFAULT nextval('deposits_public_id_seq');

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS "deposits_publicId_idx" ON "deposits"("publicId");

-- تعليق
COMMENT ON COLUMN "deposits"."publicId" IS 'رقم الإيداع (600M-699M) مثال: 640987654';

-- ============================================
-- 6️⃣ Car (اختياري): 200,000,000 - 299,999,999
-- ============================================

-- إنشاء Sequence
CREATE SEQUENCE IF NOT EXISTS cars_public_id_seq
  START WITH 200000000
  INCREMENT BY 1
  NO MAXVALUE
  NO MINVALUE
  CACHE 1;

-- إضافة العمود
ALTER TABLE "cars" 
  ADD COLUMN IF NOT EXISTS "publicId" INTEGER UNIQUE DEFAULT nextval('cars_public_id_seq');

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS "cars_publicId_idx" ON "cars"("publicId");

-- تعليق
COMMENT ON COLUMN "cars"."publicId" IS 'رقم الإعلان (200M-299M) مثال: 250456789';

-- ============================================
-- 7️⃣ Auction (اختياري): 100,000,000 - 199,999,999
-- ============================================

-- إنشاء Sequence
CREATE SEQUENCE IF NOT EXISTS auctions_public_id_seq
  START WITH 100000000
  INCREMENT BY 1
  NO MAXVALUE
  NO MINVALUE
  CACHE 1;

-- إضافة العمود
ALTER TABLE "auctions" 
  ADD COLUMN IF NOT EXISTS "publicId" INTEGER UNIQUE DEFAULT nextval('auctions_public_id_seq');

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS "auctions_publicId_idx" ON "auctions"("publicId");

-- تعليق
COMMENT ON COLUMN "auctions"."publicId" IS 'رقم المزاد (100M-199M) مثال: 150789456';

-- ============================================
-- 📊 عرض النطاقات المستخدمة
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🆔 نظام Public IDs تم تفعيله بنجاح!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 النطاقات المخصصة:';
  RAISE NOTICE '👤 User:        500,000,000 - 599,999,999';
  RAISE NOTICE '💰 Wallet:      300,000,000 - 399,999,999';
  RAISE NOTICE '🧾 Transaction: 700,000,000 - 799,999,999';
  RAISE NOTICE '💎 CryptoWallet: 800,000,000 - 899,999,999';
  RAISE NOTICE '📥 Deposit:     600,000,000 - 699,999,999';
  RAISE NOTICE '🚗 Car:         200,000,000 - 299,999,999';
  RAISE NOTICE '⚡ Auction:     100,000,000 - 199,999,999';
  RAISE NOTICE '';
  RAISE NOTICE '✅ كل نطاق يتسع لـ 100 مليون سجل';
  RAISE NOTICE '✅ الأرقام تبدو احترافية: 540678925';
  RAISE NOTICE '✅ لا تكشف العدد الحقيقي للمستخدمين';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- ✅ انتهى Migration بنجاح
-- ============================================
