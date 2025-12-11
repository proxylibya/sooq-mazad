/**
 * سكريبت فحص صور المنشور في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CAR_ID = 'car_1764393271131_tafnptrq1';

async function checkCarImages() {
  console.log('\n========================================');
  console.log(`فحص المنشور: ${CAR_ID}`);
  console.log('========================================\n');

  try {
    // 1. فحص السيارة في جدول cars
    console.log('1. فحص جدول cars...');
    const car = await prisma.cars.findUnique({
      where: { id: CAR_ID },
      select: {
        id: true,
        title: true,
        images: true,
        status: true,
        sellerId: true,
        createdAt: true,
      },
    });

    if (!car) {
      console.log(`❌ السيارة ${CAR_ID} غير موجودة في قاعدة البيانات!`);

      // البحث عن سيارات مشابهة
      console.log('\n🔍 البحث عن سيارات بمعرفات مشابهة...');
      const similarCars = await prisma.cars.findMany({
        where: {
          id: {
            contains: 'car_1764393271131',
          },
        },
        select: {
          id: true,
          title: true,
        },
        take: 5,
      });

      if (similarCars.length > 0) {
        console.log('السيارات المشابهة:');
        similarCars.forEach((c) => console.log(`  - ${c.id}: ${c.title}`));
      } else {
        console.log('لم يتم العثور على سيارات مشابهة');
      }

      // عرض آخر 5 سيارات
      console.log('\n📋 آخر 5 سيارات في قاعدة البيانات:');
      const recentCars = await prisma.cars.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      });
      recentCars.forEach((c) => console.log(`  - ${c.id}: ${c.title} (${c.createdAt})`));

      return;
    }

    console.log(`✅ تم العثور على السيارة: ${car.title}`);
    console.log(`   - الحالة: ${car.status}`);
    console.log(`   - حقل images: ${car.images || '(فارغ)'}`);
    console.log(`   - sellerId: ${car.sellerId}`);
    console.log(`   - تاريخ الإنشاء: ${car.createdAt}`);

    // 2. فحص الصور في جدول car_images
    console.log('\n2. فحص جدول car_images...');
    const carImages = await prisma.car_images.findMany({
      where: { carId: CAR_ID },
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
        isPrimary: true,
        category: true,
        createdAt: true,
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    if (carImages.length === 0) {
      console.log(`❌ لا توجد صور في جدول car_images للسيارة ${CAR_ID}`);
    } else {
      console.log(`✅ تم العثور على ${carImages.length} صورة:`);
      carImages.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img.fileUrl}`);
        console.log(`      - fileName: ${img.fileName || '(فارغ)'}`);
        console.log(`      - isPrimary: ${img.isPrimary}`);
        console.log(`      - category: ${img.category || '(فارغ)'}`);
      });
    }

    // 3. تحليل حقل images القديم
    console.log('\n3. تحليل حقل images القديم...');
    if (car.images) {
      try {
        // محاولة تحليل JSON
        if (car.images.startsWith('[') || car.images.startsWith('{')) {
          const parsed = JSON.parse(car.images);
          console.log('   نوع البيانات: JSON');
          console.log('   المحتوى:', JSON.stringify(parsed, null, 2));
        } else if (car.images.includes(',')) {
          console.log('   نوع البيانات: نص مفصول بفواصل');
          console.log('   الصور:', car.images.split(','));
        } else {
          console.log('   نوع البيانات: رابط واحد');
          console.log('   الرابط:', car.images);
        }
      } catch (e) {
        console.log('   نوع البيانات: نص عادي');
        console.log('   المحتوى:', car.images);
      }
    } else {
      console.log('   حقل images فارغ');
    }

    // 4. ملخص المشكلة والحل
    console.log('\n========================================');
    console.log('📊 ملخص الفحص:');
    console.log('========================================');

    const hasImagesField = car.images && car.images.trim() !== '';
    const hasCarImages = carImages.length > 0;

    if (!hasImagesField && !hasCarImages) {
      console.log('❌ المشكلة: لا توجد صور محفوظة للسيارة في أي مكان!');
      console.log('   الحل: يجب رفع صور جديدة للسيارة');
    } else if (hasCarImages) {
      console.log('✅ الصور موجودة في جدول car_images');
      console.log('   تحقق من صحة روابط الصور وأنها موجودة في المجلد');
    } else if (hasImagesField) {
      console.log('⚠️ الصور موجودة في الحقل القديم فقط');
      console.log('   قد تكون المشكلة في طريقة قراءة الصور من الحقل القديم');
    }
  } catch (error) {
    console.error('❌ خطأ في الفحص:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCarImages();
