const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const auctionId = process.argv[2];

  if (!auctionId) {
    console.log('الاستخدام: node scripts/check-auction-status.js <auction_id>');
    console.log('مثال: node scripts/check-auction-status.js auction_1764394956670_v45co305l');
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('فحص المزاد:', auctionId);
  console.log('========================================\n');

  try {
    // البحث عن المزاد
    const auction = await prisma.auctions.findFirst({
      where: {
        OR: [
          { id: auctionId },
          { id: { contains: auctionId.replace('auction_', '').split('_')[0] } },
        ],
      },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        currentPrice: true,
        startPrice: true,
        minimumBid: true,
        totalBids: true,
        sellerId: true,
        carId: true,
      },
    });

    if (!auction) {
      console.log('❌ المزاد غير موجود!');

      // محاولة جلب جميع المزادات
      const allAuctions = await prisma.auctions.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true },
      });

      console.log('\n📋 آخر 5 مزادات:');
      allAuctions.forEach((a) => console.log(`   - ${a.id} (${a.status})`));
      return;
    }

    console.log('✅ تم العثور على المزاد!');
    console.log('   - المعرف:', auction.id);
    console.log('   - الحالة:', auction.status);
    console.log('   - تاريخ البدء:', auction.startDate);
    console.log('   - تاريخ الانتهاء:', auction.endDate);
    console.log('   - السعر الابتدائي:', auction.startPrice);
    console.log('   - السعر الحالي:', auction.currentPrice);
    console.log('   - الحد الأدنى للزيادة:', auction.minimumBid);
    console.log('   - عدد المزايدات:', auction.totalBids);
    console.log('   - معرف البائع:', auction.sellerId);
    console.log('   - معرف السيارة:', auction.carId);

    const now = new Date();
    const startDate = new Date(auction.startDate);
    const endDate = new Date(auction.endDate);

    console.log('\n📊 تحليل التوقيت:');
    console.log('   - الوقت الحالي:', now.toISOString());
    console.log('   - بدأ المزاد؟', now >= startDate ? 'نعم ✅' : 'لا ❌');
    console.log('   - انتهى المزاد؟', now > endDate ? 'نعم ❌' : 'لا ✅');

    // تحديد الحالة المتوقعة
    let expectedStatus;
    if (now > endDate) {
      expectedStatus = 'ENDED';
    } else if (now >= startDate) {
      expectedStatus = 'ACTIVE';
    } else {
      expectedStatus = 'UPCOMING';
    }

    console.log('   - الحالة المتوقعة:', expectedStatus);

    if (auction.status !== expectedStatus) {
      console.log('\n⚠️ الحالة الحالية لا تتطابق مع التوقيت!');

      // السؤال عن التحديث
      if (process.argv[3] === '--fix') {
        console.log('🔧 جاري تحديث الحالة...');

        await prisma.auctions.update({
          where: { id: auction.id },
          data: { status: expectedStatus },
        });

        console.log('✅ تم تحديث الحالة إلى:', expectedStatus);
      } else {
        console.log('💡 لتصحيح الحالة، شغل الأمر مع --fix:');
        console.log(`   node scripts/check-auction-status.js ${auctionId} --fix`);
      }
    } else {
      console.log('\n✅ الحالة متطابقة مع التوقيت!');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
