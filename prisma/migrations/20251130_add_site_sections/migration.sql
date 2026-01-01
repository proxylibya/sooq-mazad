-- إنشاء enum SectionStatus إذا لم يكن موجوداً
DO $$ BEGIN
    CREATE TYPE "SectionStatus" AS ENUM ('ACTIVE', 'DISABLED', 'MAINTENANCE', 'COMING_SOON', 'MEMBERS_ONLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء جدول الأقسام
-- CreateTable
CREATE TABLE IF NOT EXISTS "site_sections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "status" "SectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "message" TEXT,
    "showInNavbar" BOOLEAN NOT NULL DEFAULT true,
    "showInMobileMenu" BOOLEAN NOT NULL DEFAULT true,
    "showInFooter" BOOLEAN NOT NULL DEFAULT true,
    "showInHomepage" BOOLEAN NOT NULL DEFAULT true,
    "showHomeButton" BOOLEAN NOT NULL DEFAULT true,
    "showHomeCard" BOOLEAN NOT NULL DEFAULT true,
    "navbarOrder" INTEGER NOT NULL DEFAULT 0,
    "footerOrder" INTEGER NOT NULL DEFAULT 0,
    "homepageOrder" INTEGER NOT NULL DEFAULT 0,
    "pageUrl" TEXT NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "site_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "site_elements" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pageType" TEXT NOT NULL,
    "elementType" TEXT NOT NULL,
    "category" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isInteractive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "site_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "site_sections_slug_key" ON "site_sections"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "site_sections_status_idx" ON "site_sections"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "site_sections_slug_idx" ON "site_sections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "site_elements_key_key" ON "site_elements"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "site_elements_pageType_idx" ON "site_elements"("pageType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "site_elements_key_idx" ON "site_elements"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "site_elements_sectionId_idx" ON "site_elements"("sectionId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "site_elements" ADD CONSTRAINT "site_elements_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "site_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert default sections if table is empty
INSERT INTO "site_sections" ("id", "slug", "name", "description", "icon", "status", "showInNavbar", "showInMobileMenu", "showInFooter", "showInHomepage", "showHomeButton", "showHomeCard", "navbarOrder", "footerOrder", "homepageOrder", "pageUrl", "primaryColor", "secondaryColor", "createdAt", "updatedAt")
SELECT 'section-1', 'auctions', 'سوق المزاد', 'مزادات السيارات المباشرة', 'ScaleIcon', 'ACTIVE', true, true, true, true, true, true, 1, 1, 1, '/auctions', '#f59e0b', '#d97706', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "site_sections" WHERE slug = 'auctions');

INSERT INTO "site_sections" ("id", "slug", "name", "description", "icon", "status", "showInNavbar", "showInMobileMenu", "showInFooter", "showInHomepage", "showHomeButton", "showHomeCard", "navbarOrder", "footerOrder", "homepageOrder", "pageUrl", "primaryColor", "secondaryColor", "createdAt", "updatedAt")
SELECT 'section-2', 'marketplace', 'السوق الفوري', 'بيع وشراء السيارات مباشرة', 'ShoppingBagIcon', 'ACTIVE', true, true, true, true, true, true, 2, 2, 2, '/marketplace', '#3b82f6', '#2563eb', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "site_sections" WHERE slug = 'marketplace');

INSERT INTO "site_sections" ("id", "slug", "name", "description", "icon", "status", "showInNavbar", "showInMobileMenu", "showInFooter", "showInHomepage", "showHomeButton", "showHomeCard", "navbarOrder", "footerOrder", "homepageOrder", "pageUrl", "primaryColor", "secondaryColor", "createdAt", "updatedAt")
SELECT 'section-3', 'yards', 'الساحات', 'ساحات عرض السيارات', 'MapPinIcon', 'ACTIVE', true, true, true, true, true, true, 3, 3, 3, '/yards', '#10b981', '#059669', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "site_sections" WHERE slug = 'yards');

INSERT INTO "site_sections" ("id", "slug", "name", "description", "icon", "status", "showInNavbar", "showInMobileMenu", "showInFooter", "showInHomepage", "showHomeButton", "showHomeCard", "navbarOrder", "footerOrder", "homepageOrder", "pageUrl", "primaryColor", "secondaryColor", "createdAt", "updatedAt")
SELECT 'section-4', 'showrooms', 'المعارض', 'معارض السيارات', 'BuildingStorefrontIcon', 'ACTIVE', true, true, true, true, true, true, 4, 4, 4, '/showrooms', '#14b8a6', '#0d9488', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "site_sections" WHERE slug = 'showrooms');

INSERT INTO "site_sections" ("id", "slug", "name", "description", "icon", "status", "showInNavbar", "showInMobileMenu", "showInFooter", "showInHomepage", "showHomeButton", "showHomeCard", "navbarOrder", "footerOrder", "homepageOrder", "pageUrl", "primaryColor", "secondaryColor", "createdAt", "updatedAt")
SELECT 'section-5', 'transport', 'خدمات النقل', 'خدمات نقل السيارات', 'TruckIcon', 'ACTIVE', true, true, true, true, true, true, 5, 5, 5, '/transport', '#f97316', '#ea580c', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "site_sections" WHERE slug = 'transport');

INSERT INTO "site_sections" ("id", "slug", "name", "description", "icon", "status", "showInNavbar", "showInMobileMenu", "showInFooter", "showInHomepage", "showHomeButton", "showHomeCard", "navbarOrder", "footerOrder", "homepageOrder", "pageUrl", "primaryColor", "secondaryColor", "createdAt", "updatedAt")
SELECT 'section-6', 'companies', 'الشركات', 'شركات السيارات', 'BuildingOfficeIcon', 'ACTIVE', false, false, false, false, false, false, 6, 6, 6, '/companies', '#8b5cf6', '#7c3aed', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "site_sections" WHERE slug = 'companies');

INSERT INTO "site_sections" ("id", "slug", "name", "description", "icon", "status", "showInNavbar", "showInMobileMenu", "showInFooter", "showInHomepage", "showHomeButton", "showHomeCard", "navbarOrder", "footerOrder", "homepageOrder", "pageUrl", "primaryColor", "secondaryColor", "createdAt", "updatedAt")
SELECT 'section-7', 'premium-cars', 'السيارات المميزة', 'سيارات VIP', 'SparklesIcon', 'ACTIVE', false, false, false, false, false, false, 7, 7, 7, '/premium-cars', '#eab308', '#ca8a04', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "site_sections" WHERE slug = 'premium-cars');
