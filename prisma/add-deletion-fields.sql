-- إضافة حقول حذف الحساب المجدول للمستخدمين
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "scheduledDeletionAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "deletionRequestedAt" TIMESTAMP;

-- إضافة فهرس للبحث عن المستخدمين المجدولين للحذف
CREATE INDEX IF NOT EXISTS "users_scheduledDeletionAt_idx" ON users ("scheduledDeletionAt");
