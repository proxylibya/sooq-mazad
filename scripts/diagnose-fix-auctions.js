/**
 * سكريبت تشخيص وإصلاح المزادات والساحات
 * Diagnose and Fix Auctions & Yards Script
 *
 * يقوم بـ:
 * 1. فحص حالة الساحات والمزادات
 * 2. تصحيح الحالات غير الصحيحة
 * 3. تحديث المزادات المنتهية
 * 4. إصلاح العلاقات المكسورة
 *
 * التشغيل: node scripts/diagnose-fix-auctions.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 بدء تشخيص المزادات والساحات...\n');

  const now = new Date();
  const results = {
    yards: { total: 0, active: 0, pending: 0, inactive: 0, fixed: 0 },
    auctions: { total: 0, active: 0, upcoming: 0, sold: 0, ended: 0, fixed: 0 },
    issues: [],
    fixes: [],
  };

  // ============================================
  // 1. فحص الساحات
  // ============================================
  console.log('📊 فحص الساحات...');

  const allYards = await prisma.yards.findMany({
    include: {
      _count: {
        select: { auctions: true },
      },
    },
  });

  results.yards.total = allYards.length;

  for (const yard of allYards) {
    if (yard.status === 'ACTIVE') results.yards.active++;
    else if (yard.status === 'PENDING') results.yards.pending++;
    else results.yards.inactive++;

    // التحقق من الساحات بدون slug
    if (!yard.slug) {
      results.issues.push(`⚠️ ساحة بدون slug: ${yard.name} (ID: ${yard.id})`);

      // إنشاء slug تلقائي
      const newSlug =
        yard.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u0621-\u064A-]/g, '') +
        '-' +
        yard.id.slice(-6);

      await prisma.yards.update({
        where: { id: yard.id },
        data: { slug: newSlug },
      });

      results.fixes.push(`✅ تم إنشاء slug للساحة: ${yard.name} → ${newSlug}`);
      results.yards.fixed++;
    }
  }

  console.log(`   - إجمالي الساحات: ${results.yards.total}`);
  console.log(`   - نشطة: ${results.yards.active}`);
  console.log(`   - معلقة: ${results.yards.pending}`);
  console.log(`   - غير نشطة: ${results.yards.inactive}\n`);

  // ============================================
  // 2. فحص المزادات
  // ============================================
  console.log('📊 فحص المزادات...');

  const allAuctions = await prisma.auctions.findMany({
    include: {
      cars: { select: { id: true, brand: true, model: true } },
      yard: { select: { id: true, name: true, status: true } },
      _count: { select: { bids: true } },
    },
  });

  results.auctions.total = allAuctions.length;

  // تصنيف المزادات
  const auctionsByStatus = {};
  const issueAuctions = [];

  for (const auction of allAuctions) {
    const status = auction.status || 'UNKNOWN';
    auctionsByStatus[status] = (auctionsByStatus[status] || 0) + 1;

    // فحص المشاكل

    // 1. مزاد بدون سيارة
    if (!auction.cars && !auction.carId) {
      results.issues.push(`⚠️ مزاد بدون سيارة: ${auction.title} (ID: ${auction.id})`);
      issueAuctions.push(auction.id);
    }

    // 2. مزاد في ساحة غير نشطة
    if (auction.yard && auction.yard.status !== 'ACTIVE') {
      results.issues.push(
        `⚠️ مزاد في ساحة غير نشطة: ${auction.title} (ساحة: ${auction.yard.name})`,
      );
    }

    // 3. Handle auction status transitions
    const startDate = auction.startDate ? new Date(auction.startDate) : null;
    const endDate = auction.endDate ? new Date(auction.endDate) : null;
    
    // Active auction that should be ended
    if (auction.status === 'ACTIVE' && endDate && endDate < now) {
      results.issues.push(`⚠️ Active auction past end date: ${auction.title}`);
      
      const hasBids = auction._count.bids > 0;
      const newStatus = hasBids ? 'SOLD' : 'ENDED';
      
      await prisma.auctions.update({
        where: { id: auction.id },
        data: { status: newStatus },
      });
      
      results.fixes.push(`✅ Updated auction status: ${auction.title} → ${newStatus}`);
      results.auctions.fixed++;
    }
    
    // Upcoming auction that should be active
    if ((auction.status === 'UPCOMING' || auction.status === 'PENDING') &&
        startDate && startDate <= now &&
        endDate && endDate > now) {
      results.issues.push(`⚠️ Upcoming auction should be active: ${auction.title}`);
      
      await prisma.auctions.update({
        where: { id: auction.id },
        data: { status: 'ACTIVE' },
      });
      
      results.fixes.push(`✅ Activated auction: ${auction.title}`);
      results.auctions.fixed++;
    }
    
    // Ended auction that should be closed
    if (auction.status === 'ACTIVE' && endDate && endDate < now) {
      results.issues.push(`⚠️ Active auction past end date: ${auction.title}`);
      
      const hasBids = auction._count.bids > 0;
      const newStatus = hasBids ? 'SOLD' : 'ENDED';
      
      await prisma.auctions.update({
        where: { id: auction.id },
        data: { status: newStatus },
      });
      
      results.fixes.push(`✅ Updated auction status: ${auction.title} → ${newStatus}`);
      results.auctions.fixed++;
    }

    // 4. مزاد PENDING/UPCOMING لكن بدأ بالفعل
    if (
      ['PENDING', 'UPCOMING', 'SCHEDULED'].includes(auction.status) &&
      auction.startDate &&
      new Date(auction.startDate) <= now &&
      auction.endDate &&
      new Date(auction.endDate) > now
    ) {
      results.issues.push(`⚠️ مزاد يجب أن يكون ACTIVE: ${auction.title}`);

      await prisma.auctions.update({
        where: { id: auction.id },
        data: { status: 'ACTIVE' },
      });

      results.fixes.push(`✅ تفعيل المزاد: ${auction.title} → ACTIVE`);
      results.auctions.fixed++;
    }

    // 5. تصنيف الحالات للإحصائيات
    if (auction.status === 'ACTIVE') {
      if (
        auction.startDate &&
        new Date(auction.startDate) <= now &&
        auction.endDate &&
        new Date(auction.endDate) > now
      ) {
        results.auctions.active++;
      } else if (auction.startDate && new Date(auction.startDate) > now) {
        results.auctions.upcoming++;
      }
    } else if (['PENDING', 'UPCOMING', 'SCHEDULED'].includes(auction.status)) {
      results.auctions.upcoming++;
    } else if (['SOLD', 'COMPLETED'].includes(auction.status)) {
      results.auctions.sold++;
    } else {
      results.auctions.ended++;
    }
  }

  console.log(`   - إجمالي المزادات: ${results.auctions.total}`);
  console.log(`   - مباشرة: ${results.auctions.active}`);
  console.log(`   - قادمة: ${results.auctions.upcoming}`);
  console.log(`   - مباعة: ${results.auctions.sold}`);
  console.log(`   - منتهية: ${results.auctions.ended}\n`);

  console.log('📈 توزيع الحالات في قاعدة البيانات:');
  for (const [status, count] of Object.entries(auctionsByStatus)) {
    console.log(`   - ${status}: ${count}`);
  }

  // ============================================
  // 3. فحص المزادات حسب الساحة
  // ============================================
  console.log('\n📊 المزادات حسب الساحة:');

  const yardAuctions = await prisma.auctions.groupBy({
    by: ['yardId'],
    _count: { id: true },
  });

  for (const group of yardAuctions) {
    if (group.yardId) {
      const yard = allYards.find((y) => y.id === group.yardId);
      console.log(`   - ${yard?.name || 'ساحة غير معروفة'}: ${group._count.id} مزاد`);
    } else {
      console.log(`   - مزادات أونلاين (بدون ساحة): ${group._count.id}`);
    }
  }

  // ============================================
  // 4. تفعيل الساحات المعلقة إذا لزم
  // ============================================
  console.log('\n🔧 تفعيل الساحات المعلقة...');

  const pendingYardsWithAuctions = allYards.filter(
    (y) => y.status === 'PENDING' && y._count.auctions > 0,
  );

  for (const yard of pendingYardsWithAuctions) {
    results.issues.push(`⚠️ ساحة معلقة بها مزادات: ${yard.name} (${yard._count.auctions} مزاد)`);

    // تفعيل الساحة
    await prisma.yards.update({
      where: { id: yard.id },
      data: { status: 'ACTIVE' },
    });

    results.fixes.push(`✅ تفعيل الساحة: ${yard.name}`);
    results.yards.fixed++;
  }

  // ============================================
  // 5. ملخص النتائج
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('📋 ملخص التشخيص والإصلاح');
  console.log('='.repeat(50));

  if (results.issues.length > 0) {
    console.log('\n⚠️ المشاكل المكتشفة:');
    results.issues.forEach((issue) => console.log(`   ${issue}`));
  } else {
    console.log('\n✅ لا توجد مشاكل مكتشفة!');
  }

  if (results.fixes.length > 0) {
    console.log('\n✅ الإصلاحات المُطبقة:');
    results.fixes.forEach((fix) => console.log(`   ${fix}`));
  }

  console.log('\n📊 الإحصائيات النهائية:');
  console.log(`   - الساحات: ${results.yards.total} (${results.yards.fixed} تم إصلاحها)`);
  console.log(`   - المزادات: ${results.auctions.total} (${results.auctions.fixed} تم إصلاحها)`);

  console.log('\n✅ اكتمل التشخيص والإصلاح!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
