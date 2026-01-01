const { PrismaClient } = require('@prisma/client');

// الحصول على آخر 3 سيارات
const carId = 'car_6baqh499ve4mimkb5a1';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('البحث عن السيارة:', carId);

    // جلب بيانات السيارة
    const car = await prisma.cars.findUnique({
      where: { id: carId },
      select: {
        id: true,
        title: true,
        images: true,
        status: true,
        featured: true,
      },
    });

    if (!car) {
      console.log('❌ السيارة غير موجودة');
      return;
    }

    console.log('\n✅ بيانات السيارة:');
    console.log('  - المعرف:', car.id);
    console.log('  - العنوان:', car.title);
    console.log('  - الحالة:', car.status);
    console.log('  - مميز:', car.featured);
    console.log('  - حقل الصور:', car.images);

    // جلب صور السيارة من جدول car_images
    const carImages = await prisma.car_images.findMany({
      where: { carId: carId },
      orderBy: { createdAt: 'asc' },
    });

    console.log('\n📷 صور السيارة من جدول car_images:');
    console.log('  - العدد:', carImages.length);
    if (carImages.length > 0) {
      carImages.forEach((img, i) => {
        console.log(`  ${i + 1}. ${img.fileUrl}`);
      });
    }

    // أيضاً جلب آخر 3 سيارات
    console.log('\n📋 آخر 3 سيارات في قاعدة البيانات:');
    const lastCars = await prisma.cars.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, images: true },
    });
    lastCars.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.id}: ${c.title}`);
      console.log(`     images: ${c.images}`);
    });
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
