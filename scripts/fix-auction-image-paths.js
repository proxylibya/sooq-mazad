/**
 * سكريبت إصلاح مسارات صور المزادات
 * يحوّل المسارات من admin-auctions إلى auctions
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAuctionImagePaths() {
  console.log('🔧 بدء إصلاح مسارات صور المزادات...\n');

  try {
    // جلب جميع السيارات
    const cars = await prisma.cars.findMany({
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    console.log(`📊 إجمالي السيارات مع صور: ${cars.length}`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const car of cars) {
      try {
        let images = car.images;
        let needsUpdate = false;

        // تحويل الصور إلى مصفوفة إذا كانت نص JSON
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch {
            images = [images];
          }
        }

        if (!Array.isArray(images)) {
          continue;
        }

        // فحص وإصلاح كل مسار
        const fixedImages = images.map((img) => {
          if (typeof img !== 'string') return img;

          // تحويل admin-auctions إلى auctions
          if (img.includes('admin-auctions')) {
            needsUpdate = true;
            return img.replace('admin-auctions', 'auctions');
          }

          return img;
        });

        // تحديث إذا كان هناك تغييرات
        if (needsUpdate) {
          // تحويل المصفوفة إلى JSON string لأن الحقل من نوع String
          const imagesJson = JSON.stringify(fixedImages);
          await prisma.cars.update({
            where: { id: car.id },
            data: { images: imagesJson },
          });

          console.log(`✅ تم إصلاح: ${car.title || car.id}`);
          console.log(`   من: ${JSON.stringify(images).substring(0, 100)}...`);
          console.log(`   إلى: ${JSON.stringify(fixedImages).substring(0, 100)}...`);
          fixedCount++;
        }
      } catch (err) {
        console.error(`❌ خطأ في السيارة ${car.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 ملخص الإصلاح:');
    console.log(`   ✅ تم إصلاح: ${fixedCount} سجل`);
    console.log(`   ❌ أخطاء: ${errorCount} سجل`);
    console.log(`   📦 إجمالي: ${cars.length} سجل`);
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
fixAuctionImagePaths();
