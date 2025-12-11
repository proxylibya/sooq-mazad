-- Migration: إضافة نظام حجوزات خدمات النقل
-- Date: 2025-12-03

-- إضافة حقول التوفر لجدول خدمات النقل
ALTER TABLE "transport_services" ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN DEFAULT true;
ALTER TABLE "transport_services" ADD COLUMN IF NOT EXISTS "availabilityNote" TEXT;

-- إنشاء index للتوفر
CREATE INDEX IF NOT EXISTS "transport_services_isAvailable_idx" ON "transport_services"("isAvailable");

-- إنشاء جدول حجوزات خدمات النقل
CREATE TABLE IF NOT EXISTS "transport_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    
    -- معلومات العميل
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    
    -- معلومات النقل
    "fromCity" TEXT NOT NULL,
    "toCity" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    
    -- معلومات السيارة
    "carMake" TEXT,
    "carModel" TEXT,
    "carYear" TEXT,
    "carColor" TEXT,
    "carPlateNumber" TEXT,
    
    -- تفاصيل الخدمة
    "serviceType" TEXT NOT NULL DEFAULT 'standard',
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT,
    "specialInstructions" TEXT,
    
    -- الحالة والأسعار
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "estimatedPrice" DOUBLE PRECISION,
    "finalPrice" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    
    -- خيارات إضافية
    "insurance" BOOLEAN NOT NULL DEFAULT false,
    "tracking" BOOLEAN NOT NULL DEFAULT false,
    "expressService" BOOLEAN NOT NULL DEFAULT false,
    
    -- ملاحظات
    "providerNotes" TEXT,
    "customerNotes" TEXT,
    "cancellationReason" TEXT,
    
    -- التواريخ
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    -- العلاقات
    CONSTRAINT "transport_bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "transport_services"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_bookings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- إنشاء الفهارس للأداء
CREATE INDEX IF NOT EXISTS "transport_bookings_serviceId_idx" ON "transport_bookings"("serviceId");
CREATE INDEX IF NOT EXISTS "transport_bookings_customerId_idx" ON "transport_bookings"("customerId");
CREATE INDEX IF NOT EXISTS "transport_bookings_providerId_idx" ON "transport_bookings"("providerId");
CREATE INDEX IF NOT EXISTS "transport_bookings_status_idx" ON "transport_bookings"("status");
CREATE INDEX IF NOT EXISTS "transport_bookings_preferredDate_idx" ON "transport_bookings"("preferredDate");
CREATE INDEX IF NOT EXISTS "transport_bookings_createdAt_idx" ON "transport_bookings"("createdAt");

-- تحديث الحقول الموجودة
UPDATE "transport_services" SET "isAvailable" = true WHERE "isAvailable" IS NULL;
