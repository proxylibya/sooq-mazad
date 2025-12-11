-- إضافة PENDING إلى CarStatus enum
ALTER TYPE "CarStatus" ADD VALUE IF NOT EXISTS 'PENDING';
