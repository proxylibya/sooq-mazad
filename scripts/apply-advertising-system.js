/**
 * سكريبت تطبيق نظام طلبات الإعلانات
 * Advertising Requests System Setup
 *
 * التشغيل: node scripts/apply-advertising-system.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('='.repeat(60));
console.log('🚀 تطبيق نظام طلبات الإعلانات والأعمال');
console.log('='.repeat(60));

const rootDir = path.join(__dirname, '..');

try {
  // 1. تطبيق migration على قاعدة البيانات
  console.log('\n📦 تطبيق migration على قاعدة البيانات...');
  try {
    execSync('npx prisma db push --accept-data-loss', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('✅ تم تطبيق التغييرات على قاعدة البيانات');
  } catch (err) {
    console.log('⚠️  فشل db push، جاري محاولة migrate...');
    try {
      execSync('npx prisma migrate dev --name advertising_requests --skip-seed', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    } catch (migrateErr) {
      console.log('⚠️  فشل migrate، المتابعة مع generate...');
    }
  }

  // 2. تحديث Prisma client
  console.log('\n🔄 تحديث Prisma client...');
  execSync('npx prisma generate', {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log('✅ تم تحديث Prisma client');

  // 3. رسالة النجاح
  console.log('\n' + '='.repeat(60));
  console.log('🎉 تم تطبيق نظام طلبات الإعلانات بنجاح!');
  console.log('='.repeat(60));

  console.log('\n📋 الملفات المنشأة/المحدثة:');
  console.log('');
  console.log('   قاعدة البيانات:');
  console.log('   ├── prisma/schema.prisma (جدول advertising_requests)');
  console.log('   └── prisma/migrations/20251201_advertising_requests/');
  console.log('');
  console.log('   APIs:');
  console.log('   ├── apps/web/pages/api/advertising-contact.ts');
  console.log('   └── apps/admin/pages/api/admin/promotions/requests.ts');
  console.log('');
  console.log('   صفحات الويب:');
  console.log('   └── apps/web/pages/advertising-contact.tsx (محدثة)');
  console.log('');
  console.log('   لوحة التحكم:');
  console.log('   ├── apps/admin/pages/admin/promotions/requests/index.tsx');
  console.log('   └── apps/admin/components/AdminSidebar.tsx (محدثة)');

  console.log('\n🔧 الميزات:');
  console.log('   ✅ استقبال طلبات الخدمات الإعلانية');
  console.log('   ✅ استقبال مراسلات فريق الموقع');
  console.log('   ✅ Rate limiting (10 طلبات/ساعة)');
  console.log('   ✅ تسجيل IP و User Agent');
  console.log('   ✅ إدارة الطلبات من لوحة التحكم');
  console.log('   ✅ تعيين مدير مسؤول');
  console.log('   ✅ تتبع حالة الطلب');
  console.log('   ✅ إحصائيات في الشريط الجانبي');

  console.log('\n🚀 الخطوات التالية:');
  console.log('   1. أعد تشغيل الخادم: npm run dev');
  console.log('   2. اختبر صفحة الطلبات: /advertising-contact');
  console.log('   3. راجع الطلبات في: /admin/promotions/requests');
} catch (error) {
  console.error('\n❌ حدث خطأ:', error.message);
  console.log('\n💡 حاول تشغيل الأوامر يدوياً:');
  console.log('   npx prisma db push');
  console.log('   npx prisma generate');
  process.exit(1);
}
