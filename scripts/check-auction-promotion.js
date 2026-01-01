const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAuction(auctionId) {
  try {
    const auction = await prisma.auctions.findFirst({
      where: { id: auctionId },
      select: {
        id: true,
        featured: true,
        promotionPackage: true,
        promotionDays: true,
        promotionPriority: true,
        promotionStartDate: true,
        promotionEndDate: true,
      },
    });

    console.log('🔍 بيانات ترويج المزاد:');
    console.log(JSON.stringify(auction, null, 2));

    if (auction) {
      console.log('\n📊 الحالة:');
      console.log('- مميز:', auction.featured ? '✅ نعم' : '❌ لا');
      console.log('- الباقة:', auction.promotionPackage || 'غير محدد');
      console.log('- الأولوية:', auction.promotionPriority || 0);
    } else {
      console.log('❌ المزاد غير موجود');
    }
  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const auctionId = process.argv[2] || 'auction_1764470702898_sq9x14fie';
checkAuction(auctionId);
