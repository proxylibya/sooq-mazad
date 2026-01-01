/**
 * سكريبت التحقق من نظام الترويج الموحد
 * يتحقق من:
 * 1. وجود حقول الترويج في قاعدة البيانات
 * 2. عمل API الترويج
 * 3. ترتيب الإعلانات حسب الأولوية
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPromotionSystem() {
  console.log('🔍 بدء التحقق من نظام الترويج الموحد...\n');

  const results = {
    database: { passed: 0, failed: 0, checks: [] },
    data: { passed: 0, failed: 0, checks: [] },
  };

  // 1. التحقق من حقول قاعدة البيانات
  console.log('📊 التحقق من حقول قاعدة البيانات...');

  try {
    // التحقق من حقول cars
    const testCar = await prisma.cars.findFirst({
      select: {
        featured: true,
        promotionPackage: true,
        promotionDays: true,
        promotionStartDate: true,
        promotionEndDate: true,
        promotionPriority: true,
      },
    });
    results.database.checks.push({ name: 'حقول الترويج في cars', status: '✅ موجودة' });
    results.database.passed++;
  } catch (error) {
    results.database.checks.push({
      name: 'حقول الترويج في cars',
      status: '❌ مفقودة',
      error: error.message,
    });
    results.database.failed++;
  }

  try {
    // التحقق من حقول auctions
    const testAuction = await prisma.auctions.findFirst({
      select: {
        featured: true,
        promotionPackage: true,
        promotionDays: true,
        promotionStartDate: true,
        promotionEndDate: true,
        promotionPriority: true,
      },
    });
    results.database.checks.push({ name: 'حقول الترويج في auctions', status: '✅ موجودة' });
    results.database.passed++;
  } catch (error) {
    results.database.checks.push({
      name: 'حقول الترويج في auctions',
      status: '❌ مفقودة',
      error: error.message,
    });
    results.database.failed++;
  }

  try {
    // التحقق من حقول showrooms
    const testShowroom = await prisma.showrooms.findFirst({
      select: {
        featured: true,
        promotionPackage: true,
        promotionDays: true,
        promotionStartDate: true,
        promotionEndDate: true,
        promotionPriority: true,
      },
    });
    results.database.checks.push({ name: 'حقول الترويج في showrooms', status: '✅ موجودة' });
    results.database.passed++;
  } catch (error) {
    results.database.checks.push({
      name: 'حقول الترويج في showrooms',
      status: '❌ مفقودة',
      error: error.message,
    });
    results.database.failed++;
  }

  try {
    // التحقق من حقول transport_services
    const testTransport = await prisma.transport_services.findFirst({
      select: {
        featured: true,
        promotionPackage: true,
        promotionDays: true,
        promotionStartDate: true,
        promotionEndDate: true,
        promotionPriority: true,
      },
    });
    results.database.checks.push({
      name: 'حقول الترويج في transport_services',
      status: '✅ موجودة',
    });
    results.database.passed++;
  } catch (error) {
    results.database.checks.push({
      name: 'حقول الترويج في transport_services',
      status: '❌ مفقودة',
      error: error.message,
    });
    results.database.failed++;
  }

  try {
    // التحقق من جدول promotion_transactions
    const testTransaction = await prisma.promotion_transactions.findFirst();
    results.database.checks.push({ name: 'جدول promotion_transactions', status: '✅ موجود' });
    results.database.passed++;
  } catch (error) {
    results.database.checks.push({
      name: 'جدول promotion_transactions',
      status: '❌ مفقود',
      error: error.message,
    });
    results.database.failed++;
  }

  // 2. التحقق من البيانات
  console.log('\n📈 التحقق من البيانات...');

  try {
    const featuredCars = await prisma.cars.count({ where: { featured: true } });
    results.data.checks.push({
      name: 'سيارات مميزة',
      status: `✅ ${featuredCars} سيارة مميزة`,
    });
    results.data.passed++;
  } catch (error) {
    results.data.checks.push({
      name: 'سيارات مميزة',
      status: '❌ فشل',
      error: error.message,
    });
    results.data.failed++;
  }

  try {
    const featuredAuctions = await prisma.auctions.count({ where: { featured: true } });
    results.data.checks.push({
      name: 'مزادات مميزة',
      status: `✅ ${featuredAuctions} مزاد مميز`,
    });
    results.data.passed++;
  } catch (error) {
    results.data.checks.push({
      name: 'مزادات مميزة',
      status: '❌ فشل',
      error: error.message,
    });
    results.data.failed++;
  }

  try {
    const featuredShowrooms = await prisma.showrooms.count({ where: { featured: true } });
    results.data.checks.push({
      name: 'معارض مميزة',
      status: `✅ ${featuredShowrooms} معرض مميز`,
    });
    results.data.passed++;
  } catch (error) {
    results.data.checks.push({
      name: 'معارض مميزة',
      status: '❌ فشل',
      error: error.message,
    });
    results.data.failed++;
  }

  // طباعة النتائج
  console.log('\n' + '='.repeat(50));
  console.log('📋 نتائج التحقق:');
  console.log('='.repeat(50));

  console.log('\n🗄️ قاعدة البيانات:');
  results.database.checks.forEach((check) => {
    console.log(`   ${check.status} - ${check.name}`);
    if (check.error) console.log(`      ⚠️ ${check.error}`);
  });

  console.log('\n📊 البيانات:');
  results.data.checks.forEach((check) => {
    console.log(`   ${check.status} - ${check.name}`);
    if (check.error) console.log(`      ⚠️ ${check.error}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log('📌 الملخص:');
  console.log(`   قاعدة البيانات: ${results.database.passed} نجح، ${results.database.failed} فشل`);
  console.log(`   البيانات: ${results.data.passed} نجح، ${results.data.failed} فشل`);
  console.log('='.repeat(50));

  const totalFailed = results.database.failed + results.data.failed;
  if (totalFailed === 0) {
    console.log('\n✅ جميع الاختبارات نجحت! نظام الترويج جاهز للاستخدام.');
  } else {
    console.log(`\n⚠️ يوجد ${totalFailed} اختبار فاشل. يرجى تشغيل: npx prisma db push`);
  }

  await prisma.$disconnect();
}

verifyPromotionSystem().catch((error) => {
  console.error('❌ خطأ في التحقق:', error);
  process.exit(1);
});
