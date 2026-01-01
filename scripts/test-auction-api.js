/**
 * Test Auction API Script
 * تجربة API المزادات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAuctions() {
  console.log('=== فحص قاعدة بيانات المزادات ===\n');

  try {
    // 1. عدد المزادات
    const count = await prisma.auctions.count();
    console.log(`إجمالي المزادات: ${count}\n`);

    if (count === 0) {
      console.log('لا توجد مزادات في قاعدة البيانات!');
      return;
    }

    // 2. جلب أول 5 مزادات
    const auctions = await prisma.auctions.findMany({
      take: 5,
      include: {
        users: { select: { id: true, name: true } },
        cars: { select: { id: true, title: true } },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('أحدث المزادات:');
    console.log('-'.repeat(80));

    for (const auction of auctions) {
      console.log(`
ID: ${auction.id}
Title: ${auction.title}
Status: ${auction.status}
Seller: ${auction.users?.name || 'غير معروف'}
Car: ${auction.cars?.title || 'غير محدد'}
Bids: ${auction._count.bids}
CurrentPrice: ${auction.currentPrice}
---`);
    }

    // 3. جلب مزاد محدد للاختبار
    const testId = auctions[0]?.id;
    if (testId) {
      console.log(`\n=== اختبار جلب مزاد: ${testId} ===\n`);

      const fullAuction = await prisma.auctions.findUnique({
        where: { id: testId },
        include: {
          cars: { include: { car_images: true } },
          users: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              profileImage: true,
              createdAt: true,
            },
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              users: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
                  profileImage: true,
                  createdAt: true,
                },
              },
            },
          },
          _count: { select: { bids: true } },
        },
      });

      if (fullAuction) {
        console.log('تم جلب المزاد بنجاح!');
        console.log(`- العنوان: ${fullAuction.title}`);
        console.log(`- البائع: ${fullAuction.users?.name || 'غير معروف'}`);
        console.log(`- السيارة: ${fullAuction.cars?.title || 'غير محددة'}`);
        console.log(`- عدد المزايدات: ${fullAuction._count.bids}`);
        console.log(`- السعر الحالي: ${fullAuction.currentPrice}`);

        if (fullAuction.bids.length > 0) {
          console.log('\nآخر المزايدات:');
          for (const bid of fullAuction.bids) {
            console.log(`  - ${bid.users?.name || 'مجهول'}: ${bid.amount} د.ل`);
          }
        }
      } else {
        console.log('فشل في جلب المزاد!');
      }
    }
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuctions();
