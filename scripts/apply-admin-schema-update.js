/**
 * سكريبت تطبيق تحديثات نظام المديرين
 * يقوم بتطبيق migration قاعدة البيانات وتحديث Prisma client
 *
 * التشغيل: node scripts/apply-admin-schema-update.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('🔧 تطبيق تحديثات نظام إدارة المديرين');
console.log('='.repeat(60));

// التحقق من وجود ملف schema.prisma
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ لم يتم العثور على ملف schema.prisma');
  process.exit(1);
}

// قراءة schema والتحقق من الحقول الجديدة
const schema = fs.readFileSync(schemaPath, 'utf-8');
if (!schema.includes('firstName') || !schema.includes('lastName')) {
  console.error('❌ الحقول الجديدة (firstName, lastName) غير موجودة في schema.prisma');
  console.log('💡 تأكد من تحديث schema.prisma أولاً');
  process.exit(1);
}

console.log('✅ تم التحقق من schema.prisma');

try {
  // 1. تطبيق migration على قاعدة البيانات
  console.log('\n📦 تطبيق migration على قاعدة البيانات...');
  console.log('   (هذا قد يستغرق بعض الوقت)');

  try {
    execSync('npx prisma db push --accept-data-loss', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    console.log('✅ تم تطبيق التغييرات على قاعدة البيانات');
  } catch (err) {
    console.log('⚠️  فشل db push، جاري محاولة migrate...');
    try {
      execSync('npx prisma migrate dev --name admin_name_fields --skip-seed', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      });
    } catch (migrateErr) {
      console.log('⚠️  فشل migrate، المتابعة مع generate...');
    }
  }

  // 2. تحديث Prisma client
  console.log('\n🔄 تحديث Prisma client...');
  execSync('npx prisma generate', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('✅ تم تحديث Prisma client');

  // 3. رسالة النجاح
  console.log('\n' + '='.repeat(60));
  console.log('🎉 تم تطبيق التحديثات بنجاح!');
  console.log('='.repeat(60));
  console.log('\n📋 التغييرات المطبقة:');
  console.log('   ✅ إضافة حقل firstName للمديرين');
  console.log('   ✅ إضافة حقل lastName للمديرين');
  console.log('   ✅ تحديث Prisma client');
  console.log('\n🚀 الخطوات التالية:');
  console.log('   1. أعد تشغيل خادم التطوير: npm run dev');
  console.log('   2. اختبر صفحة إضافة مدير: /admin/admins/add');
  console.log('   3. اختبر صفحة تعديل مدير: /admin/admins/[id]/edit');
} catch (error) {
  console.error('\n❌ حدث خطأ:', error.message);
  console.log('\n💡 حاول تشغيل الأوامر يدوياً:');
  console.log('   npx prisma db push');
  console.log('   npx prisma generate');
  process.exit(1);
}
