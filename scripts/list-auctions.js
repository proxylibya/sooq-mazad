/**
 * سكريبت عرض المزادات الحديثة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAuctions() {
  try {
    const auctions = await prisma.auctions.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        cars: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            images: true,
          },
        },
      },
    });

    console.log('\n=== أحدث 10 مزادات ===\n');

    auctions.forEach((a, i) => {
      console.log(`${i + 1}. ID: ${a.id}`);
      console.log(`   العنوان: ${a.title}`);
      console.log(`   الحالة: ${a.status}`);
      console.log(
        `   السيارة: ${a.cars ? a.cars.title || a.cars.brand + ' ' + a.cars.model : 'غير مرتبط'}`,
      );
      console.log(`   حقل الصور: ${a.cars?.images ? 'موجود' : 'فارغ'}`);
      console.log('');
    });
  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listAuctions();
