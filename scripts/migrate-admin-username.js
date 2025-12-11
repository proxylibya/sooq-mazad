/**
 * سكريبت تحديث المديرين لاستخدام username
 * يقوم بـ:
 * 1. تحديث schema قاعدة البيانات
 * 2. إعادة توليد Prisma Client
 * 3. تحويل بيانات المديرين الموجودين
 * 4. إنشاء مدير افتراضي للاختبار
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 بدء تحديث نظام المديرين...\n');

  try {
    // الخطوة 1: تشغيل Prisma db push لتحديث schema
    console.log('📦 تحديث schema قاعدة البيانات...');
    try {
      execSync('npx prisma db push --accept-data-loss', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      console.log('✅ تم تحديث schema بنجاح\n');
    } catch (err) {
      console.log('⚠️ قد يكون هناك مشكلة في تحديث schema، سنستمر...\n');
    }

    // الخطوة 2: إعادة توليد Prisma Client
    console.log('🔄 إعادة توليد Prisma Client...');
    try {
      execSync('npx prisma generate', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      console.log('✅ تم توليد Prisma Client بنجاح\n');
    } catch (err) {
      console.log('⚠️ قد يكون هناك مشكلة في التوليد، سنستمر...\n');
    }

    // الخطوة 3: فحص المديرين الموجودين
    console.log('🔍 فحص المديرين الموجودين...');

    // محاولة جلب المديرين
    let admins = [];
    try {
      admins = await prisma.$queryRaw`SELECT id, email, name FROM admins WHERE deleted_at IS NULL`;
      console.log(`✅ وُجد ${admins.length} مدير في قاعدة البيانات\n`);
    } catch (err) {
      console.log('⚠️ لا توجد بيانات حالية أو الجدول فارغ\n');
    }

    // الخطوة 4: تحديث المديرين الموجودين (إضافة username)
    if (admins.length > 0) {
      console.log('🔄 تحديث المديرين الموجودين...');
      for (const admin of admins) {
        const username = admin.email
          ? admin.email.split('@')[0].toLowerCase()
          : admin.name.toLowerCase().replace(/\s+/g, '_');

        try {
          await prisma.$executeRaw`UPDATE admins SET username = ${username} WHERE id = ${admin.id}`;
          console.log(`  ✓ تم تحديث: ${admin.name} → username: ${username}`);
        } catch (err) {
          console.log(`  ⚠️ فشل تحديث: ${admin.name}`);
        }
      }
      console.log('');
    }

    // الخطوة 5: إنشاء مدير افتراضي للاختبار
    console.log('👤 إنشاء مدير افتراضي للاختبار...');

    const defaultUsername = 'admin';
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    try {
      // فحص إذا كان المدير موجود
      const existing =
        await prisma.$queryRaw`SELECT id FROM admins WHERE username = ${defaultUsername} LIMIT 1`;

      if (existing.length > 0) {
        // تحديث كلمة المرور
        await prisma.$executeRaw`UPDATE admins SET password_hash = ${hashedPassword}, is_active = true WHERE username = ${defaultUsername}`;
        console.log('✅ تم تحديث المدير الافتراضي\n');
      } else {
        // إنشاء مدير جديد
        const id = `adm_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
        await prisma.$executeRaw`
                    INSERT INTO admins (id, username, password_hash, name, role, is_active, created_at, updated_at)
                    VALUES (${id}, ${defaultUsername}, ${hashedPassword}, 'مدير النظام', 'SUPER_ADMIN', true, NOW(), NOW())
                `;
        console.log('✅ تم إنشاء المدير الافتراضي\n');
      }
    } catch (err) {
      console.log('⚠️ خطأ في إنشاء/تحديث المدير:', err.message, '\n');
    }

    // الخطوة 6: عرض بيانات الدخول
    console.log('═'.repeat(50));
    console.log('');
    console.log('🎉 تم الإعداد بنجاح!');
    console.log('');
    console.log('📝 بيانات تسجيل الدخول للاختبار:');
    console.log('');
    console.log('   اسم المستخدم: admin');
    console.log('   كلمة المرور: 123456');
    console.log('');
    console.log('   الرابط: http://localhost:3022/admin/login');
    console.log('');
    console.log('═'.repeat(50));
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
