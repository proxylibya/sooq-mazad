const { PrismaClient } = require('@prisma/client');

async function checkCars() {
  const prisma = new PrismaClient();

  try {
    // عدد السيارات الإجمالي
    const totalCount = await prisma.cars.count();
    console.log('إجمالي السيارات:', totalCount);

    // عدد السيارات المتاحة للسوق الفوري
    const availableCount = await prisma.cars.count({
      where: {
        status: 'AVAILABLE',
        isAuction: false,
      },
    });
    console.log('السيارات المتاحة للسوق الفوري:', availableCount);

    // عدد سيارات المزاد
    const auctionCount = await prisma.cars.count({
      where: {
        isAuction: true,
      },
    });
    console.log('سيارات المزاد:', auctionCount);

    // عينة من السيارات
    const sample = await prisma.cars.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        isAuction: true,
      },
    });
    console.log('عينة من السيارات:', JSON.stringify(sample, null, 2));

    // السيارة المتاحة للسوق الفوري
    const availableCar = await prisma.cars.findFirst({
      where: {
        status: 'AVAILABLE',
        isAuction: false,
      },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        price: true,
        sellerId: true,
      },
    });
    console.log('السيارة المتاحة للسوق الفوري:', JSON.stringify(availableCar, null, 2));
  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCars();
