/**
 * سكريبت فحص صور المزاد
 * الاستخدام: node scripts/check-auction-images.js <auction_id>
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkAuctionImages(auctionId) {
  console.log('\n========================================');
  console.log(`فحص المزاد: ${auctionId}`);
  console.log('========================================\n');

  try {
    // 1. جلب بيانات المزاد مع السيارة والصور
    const auction = await prisma.auctions.findFirst({
      where: { id: auctionId },
      include: {
        cars: {
          include: {
            car_images: true,
          },
        },
        users: {
          select: { id: true, name: true },
        },
      },
    });

    if (!auction) {
      console.log('❌ لم يتم العثور على المزاد!');
      return;
    }

    console.log('=== بيانات المزاد ===');
    console.log(`   - ID: ${auction.id}`);
    console.log(`   - الحالة: ${auction.status}`);
    console.log(`   - السعر الحالي: ${auction.currentPrice}`);
    console.log(`   - سعر البداية: ${auction.startPrice}`);
    console.log(`   - البائع: ${auction.users?.name || 'غير محدد'}`);
    console.log(`   - تاريخ البدء: ${auction.startDate}`);
    console.log(`   - تاريخ الانتهاء: ${auction.endDate}`);
    console.log(`   - مميز: ${auction.featured ? 'نعم' : 'لا'}`);

    if (!auction.cars) {
      console.log('\n❌ لا توجد سيارة مرتبطة بهذا المزاد!');
      return;
    }

    const car = auction.cars;
    console.log('\n=== بيانات السيارة ===');
    console.log(`   - ID: ${car.id}`);
    console.log(`   - العنوان: ${car.title || 'بدون عنوان'}`);
    console.log(`   - الماركة: ${car.brand}`);
    console.log(`   - الموديل: ${car.model}`);
    console.log(`   - السنة: ${car.year}`);

    // 2. فحص الصور من جدول car_images
    console.log('\n=== صور من جدول car_images ===');
    if (car.car_images && car.car_images.length > 0) {
      console.log(`✅ عدد الصور: ${car.car_images.length}`);
      car.car_images.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.fileUrl} ${img.isPrimary ? '(رئيسية)' : ''}`);
        // فحص وجود الملف
        const filePath = path.join(process.cwd(), 'public', img.fileUrl);
        const exists = fs.existsSync(filePath);
        console.log(`      ${exists ? '✅ الملف موجود' : '❌ الملف غير موجود'}`);
      });
    } else {
      console.log('❌ لا توجد صور في جدول car_images');
    }

    // 3. فحص حقل images القديم
    console.log('\n=== حقل images القديم ===');
    if (car.images) {
      let parsedImages = [];
      try {
        if (typeof car.images === 'string') {
          parsedImages = JSON.parse(car.images);
        } else if (Array.isArray(car.images)) {
          parsedImages = car.images;
        }
      } catch (e) {
        console.log(`⚠️ خطأ في تحليل حقل images: ${e.message}`);
        console.log(`   القيمة الخام: ${car.images}`);
      }

      if (parsedImages.length > 0) {
        console.log(`✅ عدد الصور: ${parsedImages.length}`);
        parsedImages.forEach((img, i) => {
          console.log(`   ${i + 1}. ${img}`);
          // فحص وجود الملف
          const filePath = path.join(process.cwd(), 'public', img);
          const exists = fs.existsSync(filePath);
          console.log(`      ${exists ? '✅ الملف موجود' : '❌ الملف غير موجود'}`);
        });
      } else {
        console.log('❌ حقل images فارغ');
      }
    } else {
      console.log('❌ حقل images غير موجود');
    }

    // 4. فحص مجلد الصور
    console.log('\n=== فحص مجلدات الصور ===');
    const uploadDirs = [
      'public/uploads/cars',
      'public/images/cars',
      'public/images/cars/listings',
      'apps/admin/public/uploads/admin-auctions',
    ];

    for (const dir of uploadDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).slice(0, 5);
        console.log(`✅ ${dir} (${files.length}+ ملفات)`);
        if (files.length > 0) {
          console.log(`   عينة: ${files.join(', ')}`);
        }
      } else {
        console.log(`❌ ${dir} غير موجود`);
      }
    }

    console.log('\n========================================');
    console.log('📊 ملخص:');
    console.log('========================================');

    const hasCarImages = car.car_images && car.car_images.length > 0;
    const hasOldImages =
      car.images &&
      (typeof car.images === 'string' ? car.images.length > 2 : car.images.length > 0);

    if (hasCarImages) {
      console.log('✅ الصور متوفرة في جدول car_images');
    } else if (hasOldImages) {
      console.log('⚠️ الصور في الحقل القديم فقط - يجب ترحيلها');
    } else {
      console.log('❌ لا توجد صور للسيارة!');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
const auctionId = process.argv[2] || 'auc_mh9sla1xy2hmikpj0ny';
checkAuctionImages(auctionId);
