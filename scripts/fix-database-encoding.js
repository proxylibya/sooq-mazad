/**
 * سكريبت إصلاح ترميز قاعدة البيانات
 * يقوم بتعيين client_encoding إلى UTF8
 */

const { PrismaClient } = require('@prisma/client');

async function fixEncoding() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 جاري إصلاح ترميز قاعدة البيانات...\n');

    // فحص الترميز الحالي
    const encodingCheck = await prisma.$queryRaw`SHOW client_encoding`;
    console.log('📊 الترميز الحالي للعميل:', encodingCheck);

    const serverEncoding = await prisma.$queryRaw`SHOW server_encoding`;
    console.log('📊 ترميز الخادم:', serverEncoding);

    // تعيين الترميز إلى UTF8
    await prisma.$executeRaw`SET client_encoding TO 'UTF8'`;
    console.log('✅ تم تعيين client_encoding إلى UTF8');

    // التحقق من النتيجة
    const newEncoding = await prisma.$queryRaw`SHOW client_encoding`;
    console.log('📊 الترميز الجديد:', newEncoding);

    // اختبار بسيط مع نص عربي
    console.log('\n🧪 اختبار إدخال نص عربي...');
    try {
      // حاول إنشاء مستخدم اختباري
      const testUser = await prisma.users.create({
        data: {
          id: `test_${Date.now()}`,
          name: 'اختبار عربي',
          phone: `+218900000${Date.now() % 1000}`,
          role: 'USER',
          accountType: 'REGULAR_USER',
          updatedAt: new Date(),
        },
      });
      console.log('✅ نجح إدخال النص العربي!');
      console.log('   المستخدم:', testUser.name);

      // حذف المستخدم الاختباري
      await prisma.users.delete({ where: { id: testUser.id } });
      console.log('🗑️ تم حذف المستخدم الاختباري');
    } catch (testError) {
      console.log('❌ فشل اختبار النص العربي:', testError.message);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixEncoding();
