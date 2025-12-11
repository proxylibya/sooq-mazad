-- ======================================================
-- إصلاح ترميز قاعدة البيانات لدعم النصوص العربية
-- تاريخ: 2025-11-28
-- ======================================================

-- تعيين ترميز الاتصال الحالي إلى UTF8
SET client_encoding TO 'UTF8';

-- التحقق من إعدادات الترميز الحالية
SELECT 
    'server_encoding' as setting,
    current_setting('server_encoding') as value
UNION ALL
SELECT 
    'client_encoding',
    current_setting('client_encoding')
UNION ALL
SELECT 
    'lc_collate',
    current_setting('lc_collate')
UNION ALL
SELECT 
    'lc_ctype',
    current_setting('lc_ctype');

-- ملاحظة مهمة:
-- إذا كان server_encoding = WIN1252، يجب إعادة إنشاء قاعدة البيانات بترميز UTF8
-- قم بتنفيذ الأوامر التالية في psql كمستخدم postgres:
--
-- 1. إنشاء نسخة احتياطية:
-- pg_dump -U postgres sooq_mazad > sooq_mazad_backup.sql
--
-- 2. حذف قاعدة البيانات القديمة:
-- DROP DATABASE IF EXISTS sooq_mazad;
--
-- 3. إنشاء قاعدة بيانات جديدة بترميز UTF8:
-- CREATE DATABASE sooq_mazad 
--     WITH ENCODING 'UTF8' 
--     LC_COLLATE = 'en_US.UTF-8' 
--     LC_CTYPE = 'en_US.UTF-8' 
--     TEMPLATE = template0;
--
-- 4. استعادة البيانات (بدون أخطاء الترميز):
-- psql -U postgres sooq_mazad < sooq_mazad_backup.sql

-- ======================================================
-- حل بديل: إذا كانت قاعدة البيانات جديدة أو فارغة
-- يمكن تنفيذ هذا الأمر مباشرة:
-- ======================================================

-- تعيين الترميز الافتراضي للجلسات الجديدة
ALTER DATABASE sooq_mazad SET client_encoding TO 'UTF8';

-- تحديث جميع الجداول لاستخدام collation صحيحة
-- (هذا لن يغير البيانات الموجودة، فقط السلوك المستقبلي)

-- تأكيد الإعدادات الجديدة
SHOW client_encoding;
SHOW server_encoding;
