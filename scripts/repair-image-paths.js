/**
 * سكريبت إصلاح مسارات الصور في قاعدة البيانات
 * يقوم بتحديث السجلات التي تحتوي على صور مفقودة
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// الصور الافتراضية حسب النوع
const DEFAULT_IMAGES = {
  transport: '/images/transport/default-truck.jpg',
  car: '/images/cars/default-car.svg',
  auction: '/images/cars/default-car.svg',
};

// فحص وجود ملف
function fileExists(imagePath) {
  if (!imagePath || imagePath.includes('default') || imagePath.includes('placeholder')) {
    return true; // نعتبر الافتراضية موجودة دائماً
  }

  // تنظيف المسار
  let cleanPath = imagePath.trim().replace(/^["']+|["']+$/g, '');

  if (cleanPath.startsWith('/uploads/')) {
    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    return fs.existsSync(fullPath);
  }

  if (cleanPath.startsWith('/images/')) {
    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    return fs.existsSync(fullPath);
  }

  return true; // نعتبر الروابط الخارجية موجودة
}

// تحليل مصفوفة الصور
function parseImages(imagesData) {
  if (!imagesData) return [];

  if (Array.isArray(imagesData)) {
    return imagesData.flat().filter(Boolean);
  }

  if (typeof imagesData === 'string') {
    const trimmed = imagesData.trim();

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // متابعة
      }
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
}

// تصفية الصور الموجودة فقط
function filterExistingImages(images, defaultImage) {
  const existing = images.filter((img) => {
    if (!img) return false;
    return fileExists(img);
  });

  return existing.length > 0 ? existing : [defaultImage];
}

async function main() {
  console.log('🔧 بدء إصلاح مسارات الصور...\n');

  let fixedCount = 0;

  // 1. إصلاح خدمات النقل
  console.log('🚚 إصلاح خدمات النقل...');
  const transportServices = await prisma.transport_services.findMany({
    select: { id: true, title: true, images: true },
  });

  for (const service of transportServices) {
    const images = parseImages(service.images);
    if (images.length === 0) continue;

    const validImages = filterExistingImages(images, DEFAULT_IMAGES.transport);
    const originalStr = service.images;
    const newStr = validImages.join(',');

    // فحص إذا تغيرت الصور
    const originalImages = parseImages(originalStr);
    const hasChanges =
      originalImages.length !== validImages.length ||
      originalImages.some((img, i) => img !== validImages[i]);

    if (hasChanges) {
      await prisma.transport_services.update({
        where: { id: service.id },
        data: { images: newStr },
      });
      console.log(
        `  ✅ ${service.id}: تم تحديث ${originalImages.length} → ${validImages.length} صورة`,
      );
      fixedCount++;
    }
  }

  // 2. إصلاح السيارات
  console.log('\n🚗 إصلاح السيارات...');
  const cars = await prisma.cars.findMany({
    select: { id: true, brand: true, model: true, images: true },
  });

  for (const car of cars) {
    const images = parseImages(car.images);
    if (images.length === 0) continue;

    // محاولة إصلاح مسارات auctions → admin-auctions
    const fixedImages = images.map((img) => {
      if (img && img.includes('/uploads/auctions/')) {
        const fixedPath = img.replace('/uploads/auctions/', '/uploads/admin-auctions/');
        if (fileExists(fixedPath)) {
          return fixedPath;
        }
      }
      return img;
    });

    const validImages = filterExistingImages(fixedImages, DEFAULT_IMAGES.car);
    const originalStr = car.images;
    const newStr = validImages.join(',');

    const originalImages = parseImages(originalStr);
    const hasChanges =
      originalImages.length !== validImages.length ||
      originalImages.some((img, i) => img !== validImages[i]);

    if (hasChanges) {
      await prisma.cars.update({
        where: { id: car.id },
        data: { images: newStr },
      });
      console.log(`  ✅ ${car.id} (${car.brand} ${car.model}): تم تحديث الصور`);
      fixedCount++;
    }
  }

  console.log(`\n✅ تم إصلاح ${fixedCount} سجل`);

  await prisma.$disconnect();
}

main().catch(console.error);
