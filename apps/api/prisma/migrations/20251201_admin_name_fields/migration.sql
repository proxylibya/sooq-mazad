-- إضافة حقول الاسم الأول واللقب للمديرين
-- وإزالة الحقول غير المستخدمة (email, phone, name)

-- إضافة الحقول الجديدة
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(100);
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(100);

-- نقل البيانات من name إلى firstName (اختياري - للبيانات الموجودة)
UPDATE "admins" 
SET "firstName" = SPLIT_PART("name", ' ', 1),
    "lastName" = COALESCE(NULLIF(TRIM(SUBSTRING("name" FROM POSITION(' ' IN "name"))), ''), '-')
WHERE "firstName" IS NULL AND "name" IS NOT NULL;

-- تعيين قيم افتراضية للحقول الجديدة
UPDATE "admins" SET "firstName" = 'Admin' WHERE "firstName" IS NULL;
UPDATE "admins" SET "lastName" = '-' WHERE "lastName" IS NULL;

-- جعل الحقول مطلوبة
ALTER TABLE "admins" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "admins" ALTER COLUMN "lastName" SET NOT NULL;

-- إزالة الحقول القديمة غير المستخدمة (اختياري)
-- ALTER TABLE "admins" DROP COLUMN IF EXISTS "name";
-- ALTER TABLE "admins" DROP COLUMN IF EXISTS "phone";
-- ALTER TABLE "admins" DROP COLUMN IF EXISTS "email";
