-- Migration: إضافة publicId للجداول الحرجة
-- تاريخ: 2025-11-09
-- الهدف: إضافة معرفات عامة قصيرة للمحافظ والمعاملات

-- 1. إضافة publicId لجدول Wallet
ALTER TABLE "wallets" 
ADD COLUMN "publicId" SERIAL UNIQUE;

-- إنشاء index للبحث السريع
CREATE INDEX "wallets_publicId_idx" ON "wallets"("publicId");

-- تعليق توضيحي
COMMENT ON COLUMN "wallets"."publicId" IS 'معرف المحفظة العام للعرض والتحويلات (مثال: 603225)';

-- ====================================

-- 2. إضافة publicId لجدول Transaction
ALTER TABLE "transactions" 
ADD COLUMN "publicId" SERIAL UNIQUE;

-- إنشاء index للبحث السريع
CREATE INDEX "transactions_publicId_idx" ON "transactions"("publicId");

-- تعليق توضيحي
COMMENT ON COLUMN "transactions"."publicId" IS 'رقم المعاملة للعرض والتتبع (مثال: 54782)';

-- ====================================

-- 3. إضافة publicId لجدول CryptoWallet
ALTER TABLE "crypto_wallets" 
ADD COLUMN "publicId" SERIAL UNIQUE;

-- إنشاء index للبحث السريع
CREATE INDEX "crypto_wallets_publicId_idx" ON "crypto_wallets"("publicId");

-- تعليق توضيحي
COMMENT ON COLUMN "crypto_wallets"."publicId" IS 'رقم المحفظة الرقمية (مثال: 8542)';

-- ====================================

-- 4. إضافة publicId لجدول deposits
ALTER TABLE "deposits" 
ADD COLUMN "publicId" SERIAL UNIQUE;

-- إنشاء index للبحث السريع
CREATE INDEX "deposits_publicId_idx" ON "deposits"("publicId");

-- تعليق توضيحي
COMMENT ON COLUMN "deposits"."publicId" IS 'رقم الإيداع للتتبع (مثال: 12345)';

-- ====================================

-- 5. (اختياري) إضافة publicId لجدول Car
ALTER TABLE "cars" 
ADD COLUMN "publicId" SERIAL UNIQUE;

-- إنشاء index للبحث السريع
CREATE INDEX "cars_publicId_idx" ON "cars"("publicId");

-- تعليق توضيحي
COMMENT ON COLUMN "cars"."publicId" IS 'رقم الإعلان (مثال: 254789)';

-- ====================================

-- 6. (اختياري) إضافة publicId لجدول Auction
ALTER TABLE "auctions" 
ADD COLUMN "publicId" SERIAL UNIQUE;

-- إنشاء index للبحث السريع
CREATE INDEX "auctions_publicId_idx" ON "auctions"("publicId");

-- تعليق توضيحي
COMMENT ON COLUMN "auctions"."publicId" IS 'رقم المزاد (مثال: 98765)';

-- ====================================

-- ملاحظات:
-- 1. SERIAL يعني auto-increment في PostgreSQL
-- 2. UNIQUE يضمن عدم تكرار الأرقام
-- 3. الـ indexes تسرع البحث بـ publicId
-- 4. البيانات الموجودة ستحصل على أرقام تلقائياً
