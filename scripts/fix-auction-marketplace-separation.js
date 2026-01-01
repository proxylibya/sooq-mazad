/**
 * سكريبت إصلاح وتوحيد الفصل بين المزادات والسوق الفوري
 * ===================================================
 *
 * هذا السكريبت يقوم بـ:
 * 1. فحص السيارات التي لها مزادات مرتبطة وتحديث isAuction = true
 * 2. فحص السيارات بدون مزادات والتأكد من isAuction = false
 * 3. تنظيف أي تضارب في البيانات
 * 4. إنشاء تقرير بالتغييرات
 *
 * @author Cascade AI
 * @date 2025-11-29
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 سكريبت إصلاح الفصل بين المزادات والسوق الفوري');
  console.log('='.repeat(60) + '\n');

  const stats = {
    totalCars: 0,
    auctionCars: 0,
    marketplaceCars: 0,
    fixedToAuction: 0,
    fixedToMarketplace: 0,
    orphanedAuctions: 0,
    errors: [],
  };

  try {
    // 1. جلب إحصائيات أولية
    console.log('📊 جلب الإحصائيات الأولية...\n');

    stats.totalCars = await prisma.cars.count();
    stats.auctionCars = await prisma.cars.count({ where: { isAuction: true } });
    stats.marketplaceCars = await prisma.cars.count({ where: { isAuction: false } });

    const auctionsCount = await prisma.auctions.count();
    const carsWithAuctions = await prisma.cars.count({
      where: {
        auctions: {
          some: {},
        },
      },
    });

    console.log('📈 الإحصائيات الحالية:');
    console.log(`   - إجمالي السيارات: ${stats.totalCars}`);
    console.log(`   - سيارات المزاد (isAuction=true): ${stats.auctionCars}`);
    console.log(`   - سيارات السوق الفوري (isAuction=false): ${stats.marketplaceCars}`);
    console.log(`   - إجمالي المزادات: ${auctionsCount}`);
    console.log(`   - سيارات لها مزادات مرتبطة: ${carsWithAuctions}`);
    console.log('');

    // 2. إصلاح السيارات التي لها مزادات ولكن isAuction = false
    console.log('🔍 البحث عن سيارات تحتاج إصلاح (لها مزاد لكن isAuction=false)...');

    const carsWithAuctionsButNotMarked = await prisma.cars.findMany({
      where: {
        isAuction: false,
        auctions: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        auctions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (carsWithAuctionsButNotMarked.length > 0) {
      console.log(`   ⚠️ وجدت ${carsWithAuctionsButNotMarked.length} سيارة تحتاج إصلاح\n`);

      for (const car of carsWithAuctionsButNotMarked) {
        try {
          await prisma.cars.update({
            where: { id: car.id },
            data: { isAuction: true },
          });
          console.log(`   ✅ تم إصلاح: ${car.title.substring(0, 40)}... → isAuction=true`);
          stats.fixedToAuction++;
        } catch (err) {
          console.log(`   ❌ فشل إصلاح: ${car.id} - ${err.message}`);
          stats.errors.push({ carId: car.id, error: err.message });
        }
      }
    } else {
      console.log('   ✅ لا توجد سيارات تحتاج إصلاح في هذه الفئة');
    }
    console.log('');

    // 3. إصلاح السيارات التي ليس لها مزادات ولكن isAuction = true
    console.log('🔍 البحث عن سيارات تحتاج إصلاح (بدون مزاد لكن isAuction=true)...');

    const carsMarkedAuctionButNoAuction = await prisma.cars.findMany({
      where: {
        isAuction: true,
        auctions: {
          none: {},
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (carsMarkedAuctionButNoAuction.length > 0) {
      console.log(`   ⚠️ وجدت ${carsMarkedAuctionButNoAuction.length} سيارة تحتاج إصلاح\n`);

      for (const car of carsMarkedAuctionButNoAuction) {
        try {
          await prisma.cars.update({
            where: { id: car.id },
            data: { isAuction: false },
          });
          console.log(`   ✅ تم إصلاح: ${car.title.substring(0, 40)}... → isAuction=false`);
          stats.fixedToMarketplace++;
        } catch (err) {
          console.log(`   ❌ فشل إصلاح: ${car.id} - ${err.message}`);
          stats.errors.push({ carId: car.id, error: err.message });
        }
      }
    } else {
      console.log('   ✅ لا توجد سيارات تحتاج إصلاح في هذه الفئة');
    }
    console.log('');

    // 4. فحص المزادات اليتيمة (بدون سيارة مرتبطة)
    console.log('🔍 البحث عن مزادات يتيمة (بدون سيارة)...');

    const orphanedAuctions = await prisma.auctions.findMany({
      where: {
        carId: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (orphanedAuctions.length > 0) {
      console.log(`   ⚠️ وجدت ${orphanedAuctions.length} مزاد يتيم\n`);
      stats.orphanedAuctions = orphanedAuctions.length;

      for (const auction of orphanedAuctions) {
        console.log(`   📋 المزاد: ${auction.id} - ${auction.title} (${auction.status})`);
      }
    } else {
      console.log('   ✅ لا توجد مزادات يتيمة');
    }
    console.log('');

    // 5. إحصائيات نهائية
    console.log('📊 الإحصائيات النهائية بعد الإصلاح:');

    const finalAuctionCars = await prisma.cars.count({ where: { isAuction: true } });
    const finalMarketplaceCars = await prisma.cars.count({ where: { isAuction: false } });

    console.log(`   - سيارات المزاد: ${finalAuctionCars}`);
    console.log(`   - سيارات السوق الفوري: ${finalMarketplaceCars}`);
    console.log(`   - تم إصلاح → مزاد: ${stats.fixedToAuction}`);
    console.log(`   - تم إصلاح → سوق فوري: ${stats.fixedToMarketplace}`);
    console.log(`   - مزادات يتيمة: ${stats.orphanedAuctions}`);
    console.log(`   - أخطاء: ${stats.errors.length}`);
    console.log('');

    // 6. ملخص التقرير
    console.log('='.repeat(60));
    console.log('📝 ملخص التقرير:');
    console.log('='.repeat(60));

    if (stats.fixedToAuction + stats.fixedToMarketplace === 0 && stats.orphanedAuctions === 0) {
      console.log('✅ جميع البيانات صحيحة ومفصولة بشكل سليم!');
    } else {
      console.log(`🔧 تم إصلاح ${stats.fixedToAuction + stats.fixedToMarketplace} سيارة`);
      if (stats.orphanedAuctions > 0) {
        console.log(`⚠️ يوجد ${stats.orphanedAuctions} مزاد يتيم يحتاج مراجعة يدوية`);
      }
    }
    console.log('');
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
