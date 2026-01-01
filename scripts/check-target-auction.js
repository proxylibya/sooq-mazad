/**
 * فحص مزاد محدد
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// المزاد المستهدف
const TARGET_ID = 'auc_mh9sla1xy2hmikpj0ny';

async function checkAuction() {
  console.log('\n========================================');
  console.log('فحص المزاد: ' + TARGET_ID);
  console.log('========================================\n');

  try {
    const auction = await prisma.auctions.findFirst({
      where: { id: TARGET_ID },
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
      console.log('لم يتم العثور على المزاد!');
      return;
    }

    console.log('=== بيانات المزاد ===');
    console.log('   ID:', auction.id);
    console.log('   العنوان:', auction.title);
    console.log('   الحالة:', auction.status);
    console.log('   السعر الحالي:', auction.currentPrice);
    console.log('   سعر البداية:', auction.startPrice);
    console.log('   البائع:', auction.users?.name || 'غير محدد');
    console.log('   مميز:', auction.featured ? 'نعم' : 'لا');

    if (!auction.cars) {
      console.log('\nلا توجد سيارة مرتبطة!');
      return;
    }

    const car = auction.cars;
    console.log('\n=== بيانات السيارة ===');
    console.log('   ID:', car.id);
    console.log('   العنوان:', car.title || 'بدون عنوان');
    console.log('   الماركة:', car.brand);
    console.log('   الموديل:', car.model);

    // فحص صور car_images
    console.log('\n=== صور من جدول car_images ===');
    if (car.car_images && car.car_images.length > 0) {
      console.log('عدد الصور:', car.car_images.length);
      car.car_images.forEach((img, i) => {
        const filePath = path.join(process.cwd(), 'public', img.fileUrl);
        const exists = fs.existsSync(filePath);
        console.log(`   ${i + 1}. ${img.fileUrl}`);
        console.log(`      ${exists ? 'الملف موجود' : 'الملف غير موجود!'}`);
      });
    } else {
      console.log('لا توجد صور في جدول car_images');
    }

    // فحص حقل images القديم
    console.log('\n=== حقل images القديم ===');
    if (car.images) {
      console.log('القيمة الخام:', typeof car.images, car.images);
      let parsedImages = [];
      try {
        if (typeof car.images === 'string') {
          parsedImages = JSON.parse(car.images);
        } else if (Array.isArray(car.images)) {
          parsedImages = car.images;
        }
      } catch (e) {
        console.log('خطأ في التحليل:', e.message);
      }

      if (parsedImages.length > 0) {
        console.log('عدد الصور المُحللة:', parsedImages.length);
        parsedImages.forEach((img, i) => {
          const filePath = path.join(process.cwd(), 'public', img);
          const exists = fs.existsSync(filePath);
          console.log(`   ${i + 1}. ${img}`);
          console.log(`      ${exists ? 'الملف موجود' : 'الملف غير موجود!'}`);
        });
      }
    } else {
      console.log('حقل images فارغ أو null');
    }

    // فحص مجلد admin-auctions
    console.log('\n=== فحص مجلد صور الأدمن ===');
    const adminDir = path.join(process.cwd(), 'apps/admin/public/uploads/admin-auctions');
    if (fs.existsSync(adminDir)) {
      const files = fs.readdirSync(adminDir);
      console.log('عدد الملفات:', files.length);
      console.log('الملفات:', files.join(', '));
    } else {
      console.log('المجلد غير موجود');
    }
  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuction();
