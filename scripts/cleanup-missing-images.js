/**
 * سكريبت تنظيف الصور المفقودة
 * يفحص قاعدة البيانات ويحذف مسارات الصور غير الموجودة
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkImageExists(imagePath) {
  if (!imagePath) return false;

  // تحويل المسار النسبي إلى مطلق
  let absolutePath = imagePath;
  if (imagePath.startsWith('/')) {
    absolutePath = path.join(process.cwd(), 'public', imagePath);
  }

  try {
    await fs.promises.access(absolutePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function cleanupCarImages() {
  console.log('🔍 فحص جدول car_images...');

  const carImages = await prisma.car_images.findMany({
    select: { id: true, fileUrl: true, carId: true },
  });

  let deleted = 0;
  let checked = 0;

  for (const img of carImages) {
    checked++;
    const exists = await checkImageExists(img.fileUrl);

    if (!exists) {
      console.log(`❌ صورة مفقودة: ${img.fileUrl} (ID: ${img.id})`);

      // حذف السجل
      await prisma.car_images.delete({ where: { id: img.id } });
      deleted++;
    }
  }

  console.log(`✅ تم فحص ${checked} صورة، حذف ${deleted} سجل`);
  return deleted;
}

async function cleanupCarImagesField() {
  console.log('🔍 فحص حقل images في جدول Car...');

  const cars = await prisma.cars.findMany({
    select: { id: true, images: true, title: true },
  });

  let updated = 0;

  for (const car of cars) {
    if (!car.images) continue;

    let imageList = [];

    // محاولة تحليل JSON
    try {
      if (typeof car.images === 'string') {
        imageList = JSON.parse(car.images);
      } else if (Array.isArray(car.images)) {
        imageList = car.images;
      }
    } catch {
      // إذا كانت قائمة مفصولة بفواصل
      if (typeof car.images === 'string') {
        imageList = car.images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(imageList)) continue;

    // فحص كل صورة
    const validImages = [];
    let hasInvalid = false;

    for (const imgPath of imageList) {
      const exists = await checkImageExists(imgPath);
      if (exists) {
        validImages.push(imgPath);
      } else {
        console.log(`❌ صورة مفقودة في Car ${car.id}: ${imgPath}`);
        hasInvalid = true;
      }
    }

    // تحديث إذا تم حذف صور
    if (hasInvalid) {
      // استخدام قيمة فارغة بدلاً من null لأن الحقل قد لا يقبل null
      const newImages = validImages.length > 0 ? JSON.stringify(validImages) : '[]';
      await prisma.cars.update({
        where: { id: car.id },
        data: { images: newImages },
      });
      console.log(`📝 تم تحديث Car ${car.id}: ${imageList.length} -> ${validImages.length} صور`);
      updated++;
    }
  }

  console.log(`✅ تم تحديث ${updated} سيارة`);
  return updated;
}

async function cleanupAuctionImages() {
  console.log('🔍 فحص حقل images في جدول Auction...');

  const auctions = await prisma.auctions.findMany({
    select: { id: true, images: true, title: true },
  });

  let updated = 0;

  for (const auction of auctions) {
    if (!auction.images) continue;

    let imageList = [];

    try {
      if (typeof auction.images === 'string') {
        imageList = JSON.parse(auction.images);
      } else if (Array.isArray(auction.images)) {
        imageList = auction.images;
      }
    } catch {
      if (typeof auction.images === 'string') {
        imageList = auction.images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(imageList)) continue;

    const validImages = [];
    let hasInvalid = false;

    for (const imgPath of imageList) {
      const exists = await checkImageExists(imgPath);
      if (exists) {
        validImages.push(imgPath);
      } else {
        console.log(`❌ صورة مفقودة في Auction ${auction.id}: ${imgPath}`);
        hasInvalid = true;
      }
    }

    if (hasInvalid) {
      // استخدام قيمة فارغة بدلاً من null لأن الحقل قد لا يقبل null
      const newImages = validImages.length > 0 ? JSON.stringify(validImages) : '[]';
      await prisma.auctions.update({
        where: { id: auction.id },
        data: { images: newImages },
      });
      console.log(
        `📝 تم تحديث Auction ${auction.id}: ${imageList.length} -> ${validImages.length} صور`,
      );
      updated++;
    }
  }

  console.log(`✅ تم تحديث ${updated} مزاد`);
  return updated;
}

async function main() {
  console.log('🧹 بدء تنظيف الصور المفقودة...\n');

  try {
    const carImagesDeleted = await cleanupCarImages();
    console.log('');

    const carsUpdated = await cleanupCarImagesField();
    console.log('');

    const auctionsUpdated = await cleanupAuctionImages();

    console.log('\n' + '='.repeat(50));
    console.log('📊 ملخص التنظيف:');
    console.log(`  - سجلات CarImage المحذوفة: ${carImagesDeleted}`);
    console.log(`  - سيارات محدثة: ${carsUpdated}`);
    console.log(`  - مزادات محدثة: ${auctionsUpdated}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
