-- Migration: إضافة معرف عام (publicId) للمستخدمين
-- يبدأ من 100000 ويزيد تلقائياً (أكثر واقعية واحترافية)

-- الخطوة 1: إنشاء sequence يبدأ من 100000
CREATE SEQUENCE IF NOT EXISTS user_public_id_seq START WITH 100000 INCREMENT BY 1;

-- الخطوة 2: إضافة عمود publicId
ALTER TABLE users ADD COLUMN IF NOT EXISTS "publicId" INTEGER;

-- الخطوة 3: تحديث القيم الحالية للمستخدمين الموجودين
UPDATE users 
SET "publicId" = nextval('user_public_id_seq') 
WHERE "publicId" IS NULL;

-- الخطوة 4: جعل الحقل NOT NULL و UNIQUE
ALTER TABLE users 
  ALTER COLUMN "publicId" SET NOT NULL,
  ALTER COLUMN "publicId" SET DEFAULT nextval('user_public_id_seq'),
  ADD CONSTRAINT users_publicId_unique UNIQUE ("publicId");

-- الخطوة 5: إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_publicId ON users("publicId");

-- الخطوة 6: ربط sequence مع العمود
ALTER SEQUENCE user_public_id_seq OWNED BY users."publicId";

-- ✅ تم! الآن كل مستخدم جديد سيحصل على publicId يبدأ من 600000
