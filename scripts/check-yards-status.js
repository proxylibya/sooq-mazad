/**
 * سكريبت فحص وإصلاح وتفعيل حالة الساحات
 * يمكن تشغيله بـ: node scripts/check-yards-status.js
 * أو مع تفعيل الكل: node scripts/check-yards-status.js --activate-all
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndFixYards() {
  const activateAll = process.argv.includes('--activate-all');

  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     سكريبت فحص وإصلاح حالة الساحات                 ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  try {
    // جلب جميع الساحات
    const allYards = await prisma.yards.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        city: true,
        verified: true,
        featured: true,
        createdAt: true,
        _count: {
          select: { auctions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 إجمالي الساحات في قاعدة البيانات: ${allYards.length}\n`);

    if (allYards.length === 0) {
      console.log('⚠️  لا توجد ساحات في قاعدة البيانات!');
      console.log('\n💡 يمكنك إضافة ساحات من لوحة التحكم: /admin/yards/add');
      await prisma.$disconnect();
      return;
    }

    console.log('┌────────────────────────────────────────────────────────────────────┐');
    console.log('│                        قائمة الساحات                               │');
    console.log('├────────────────────────────────────────────────────────────────────┤');

    allYards.forEach((yard, i) => {
      const statusEmoji =
        {
          ACTIVE: '✅',
          PENDING: '⏳',
          INACTIVE: '❌',
          SUSPENDED: '🚫',
        }[yard.status] || '❓';

      const verifiedBadge = yard.verified ? '✓موثق' : '';
      const featuredBadge = yard.featured ? '⭐مميز' : '';
      const badges = [verifiedBadge, featuredBadge].filter(Boolean).join(' ');

      console.log(
        `│ ${(i + 1).toString().padStart(2)}. ${statusEmoji} ${yard.name.padEnd(25)} │ ${yard.city.padEnd(12)} │ ${badges.padEnd(15)} │`,
      );
      console.log(`│     └─ المزادات: ${yard._count.auctions} | الحالة: ${yard.status || 'null'}`);
    });

    console.log('└────────────────────────────────────────────────────────────────────┘\n');

    // إحصائيات حسب الحالة
    const stats = {
      ACTIVE: allYards.filter((y) => y.status === 'ACTIVE').length,
      PENDING: allYards.filter((y) => y.status === 'PENDING').length,
      INACTIVE: allYards.filter((y) => y.status === 'INACTIVE').length,
      SUSPENDED: allYards.filter((y) => y.status === 'SUSPENDED').length,
      NULL: allYards.filter((y) => !y.status).length,
    };

    console.log('📈 إحصائيات الحالة:');
    console.log(`   ✅ نشطة (ACTIVE):     ${stats.ACTIVE}`);
    console.log(`   ⏳ معلقة (PENDING):   ${stats.PENDING}`);
    console.log(`   ❌ معطلة (INACTIVE):  ${stats.INACTIVE}`);
    console.log(`   🚫 موقوفة (SUSPENDED): ${stats.SUSPENDED}`);
    console.log(`   ❓ بدون حالة (null):   ${stats.NULL}`);

    // إصلاح الساحات بدون حالة أو PENDING
    const needsActivation = stats.NULL + stats.PENDING;

    if (activateAll || needsActivation > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (activateAll) {
        console.log('🔄 تفعيل جميع الساحات (ما عدا الموقوفة)...');

        const result = await prisma.yards.updateMany({
          where: {
            status: { notIn: ['ACTIVE', 'SUSPENDED'] },
          },
          data: {
            status: 'ACTIVE',
          },
        });

        console.log(`✅ تم تفعيل ${result.count} ساحة!`);
      } else {
        console.log(`🔧 إصلاح ${needsActivation} ساحة بحالة NULL أو PENDING...`);

        const result = await prisma.yards.updateMany({
          where: {
            OR: [{ status: null }, { status: 'PENDING' }],
          },
          data: {
            status: 'ACTIVE',
          },
        });

        console.log(`✅ تم تفعيل ${result.count} ساحة!`);
      }
    }

    // التحقق النهائي
    const finalStats = await prisma.yards.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 الحالة النهائية:');
    finalStats.forEach((stat) => {
      const emoji =
        { ACTIVE: '✅', PENDING: '⏳', INACTIVE: '❌', SUSPENDED: '🚫' }[stat.status] || '❓';
      console.log(`   ${emoji} ${stat.status}: ${stat._count.id}`);
    });

    const activeCount = finalStats.find((s) => s.status === 'ACTIVE')?._count.id || 0;
    console.log(`\n🎯 الساحات التي ستظهر في الموقع: ${activeCount}`);

    if (activeCount === 0) {
      console.log('\n⚠️  تحذير: لا توجد ساحات نشطة! قم بتشغيل السكريبت مع --activate-all');
      console.log('   node scripts/check-yards-status.js --activate-all');
    }
  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.code === 'P2021') {
      console.log('\n💡 تلميح: جدول الساحات غير موجود. قم بتشغيل: npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixYards();
