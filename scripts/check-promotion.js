const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // البحث عن المزاد المحدد الجديد
  const targetAuction = await prisma.auctions.findFirst({
    where: {
      id: { contains: '1764476183220' },
    },
    select: {
      id: true,
      title: true,
      featured: true,
      promotionPackage: true,
      promotionDays: true,
      promotionPriority: true,
      status: true,
    },
  });

  console.log('=== المزاد المستهدف ===');
  if (targetAuction) {
    console.log(JSON.stringify(targetAuction, null, 2));
  } else {
    console.log('لم يتم العثور على المزاد');
  }

  console.log('\n=== المزادات المميزة (featured: true) ===');
  const featuredAuctions = await prisma.auctions.findMany({
    where: { featured: true },
    select: { id: true, title: true, featured: true, promotionPackage: true },
    take: 5,
  });
  console.log(`عدد المزادات المميزة: ${featuredAuctions.length}`);
  featuredAuctions.forEach((a) =>
    console.log(`  - ${a.id}: ${a.title?.substring(0, 30) || 'بدون عنوان'}`),
  );

  console.log('\n=== المزادات المدفوعة (promotionPackage != free) ===');
  const paidAuctions = await prisma.auctions.findMany({
    where: {
      promotionPackage: { not: 'free' },
    },
    select: { id: true, title: true, featured: true, promotionPackage: true },
    take: 5,
  });
  console.log(`عدد المزادات المدفوعة: ${paidAuctions.length}`);
  paidAuctions.forEach((a) => console.log(`  - ${a.id}: باقة ${a.promotionPackage}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
