/**
 * سكريبت إصلاح صور المزادات
 * يقوم بنقل الصور من حقل cars.images إلى جدول car_images
 *
 * الاستخدام: node scripts/fix-auction-images.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAuctionImages() {
  console.log('='.repeat(60));
  console.log('🔧 بدء إصلاح صور المزادات');
  console.log('='.repeat(60));

  try {
    // جلب جميع السيارات المرتبطة بمزادات والتي لديها صور في حقل images
    const carsWithAuctions = await prisma.cars.findMany({
      where: {
        isAuction: true,
        images: {
          not: '',
        },
      },
      include: {
        car_images: true,
        auctions: true,
      },
    });

    console.log(`📊 وجد ${carsWithAuctions.length} سيارة مزاد للفحص`);

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const car of carsWithAuctions) {
      try {
        // تخطي السيارات التي لديها صور في car_images
        if (car.car_images && car.car_images.length > 0) {
          console.log(`⏭️  تخطي ${car.id} - لديه ${car.car_images.length} صورة في car_images`);
          skippedCount++;
          continue;
        }

        // محاولة استخراج الصور من حقل images
        let imageUrls = [];

        if (car.images && car.images.trim()) {
          try {
            const trimmed = car.images.trim();

            // محاولة تحليل JSON
            if (trimmed.startsWith('[')) {
              imageUrls = JSON.parse(trimmed);
            } else if (trimmed.startsWith('"')) {
              // JSON string مكرر التشفير
              try {
                imageUrls = JSON.parse(JSON.parse(trimmed));
              } catch {
                imageUrls = [JSON.parse(trimmed)];
              }
            } else if (trimmed.includes(',')) {
              // قائمة مفصولة بفواصل
              imageUrls = trimmed
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            } else if (trimmed.startsWith('/') || trimmed.startsWith('http')) {
              // URL واحد
              imageUrls = [trimmed];
            }
          } catch (e) {
            console.error(`❌ خطأ في تحليل صور ${car.id}:`, e.message);
            errorCount++;
            continue;
          }
        }

        // تصفية URLs الصالحة
        imageUrls = imageUrls
          .filter((url) => url && typeof url === 'string')
          .filter((url) => !url.includes('placeholder.com') && !url.includes('via.placeholder'));

        if (imageUrls.length === 0) {
          console.log(`⚠️  ${car.id} - لا توجد صور صالحة للنقل`);
          skippedCount++;
          continue;
        }

        console.log(`🖼️  ${car.id} - وجد ${imageUrls.length} صورة للنقل`);

        // البحث عن مستخدم admin
        let uploaderId = car.sellerId;
        if (!uploaderId) {
          const adminUser = await prisma.users.findFirst({
            where: { role: 'ADMIN' },
          });
          uploaderId = adminUser?.id || 'system';
        }

        // إنشاء سجلات في car_images
        const carImagesData = imageUrls.map((url, index) => {
          const fileName = url.split('/').pop() || `image_${index}.jpg`;
          return {
            id: `img_fix_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}_${index}`,
            carId: car.id,
            fileName: fileName,
            fileUrl: url,
            fileSize: 0,
            isPrimary: index === 0,
            uploadedBy: uploaderId,
            category: 'auctions',
            updatedAt: new Date(),
          };
        });

        await prisma.car_images.createMany({
          data: carImagesData,
        });

        console.log(`✅ ${car.id} - تم نقل ${carImagesData.length} صورة بنجاح`);
        fixedCount++;
      } catch (carError) {
        console.error(`❌ خطأ في معالجة ${car.id}:`, carError.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 ملخص الإصلاح:');
    console.log('='.repeat(60));
    console.log(`✅ تم إصلاح: ${fixedCount} سيارة`);
    console.log(`⏭️  تم تخطي: ${skippedCount} سيارة`);
    console.log(`❌ أخطاء: ${errorCount} سيارة`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
fixAuctionImages();
