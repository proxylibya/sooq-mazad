const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('=== فحص وإنشاء Admin (بنظام username) ===\n');

  try {
    // التحقق من وجود أي admin
    const admins = await prisma.admins.findMany({
      select: { id: true, username: true, name: true, role: true, is_active: true },
    });

    console.log('عدد المديرين:', admins.length);
    admins.forEach((a) => {
      console.log(
        `  - username: ${a.username || 'غير محدد'} | name: ${a.name} | ${a.role} | ${a.is_active ? 'نشط' : 'معطل'}`,
      );
    });

    // البحث عن admin بـ username = 'admin'
    const adminUser = await prisma.admins.findFirst({ where: { username: 'admin' } });

    if (adminUser) {
      console.log('\n✅ المدير "admin" موجود');
      // تحديث كلمة المرور
      const hashedPassword = await bcrypt.hash('123456', 12);
      await prisma.admins.update({
        where: { id: adminUser.id },
        data: {
          password_hash: hashedPassword,
          is_active: true,
        },
      });
      console.log('   ✅ تم تحديث كلمة المرور إلى: 123456');
    } else {
      console.log('\n⚠️ لا يوجد مدير بـ username = "admin"! جاري إنشاء...');

      const hashedPassword = await bcrypt.hash('123456', 12);

      await prisma.admins.create({
        data: {
          id: 'adm_admin_' + Date.now(),
          username: 'admin',
          name: 'مدير النظام',
          password_hash: hashedPassword,
          role: 'SUPER_ADMIN',
          is_active: true,
          updated_at: new Date(),
        },
      });

      console.log('\n✅ تم إنشاء المدير بنجاح!');
    }

    console.log('\n══════════════════════════════════════');
    console.log('📝 بيانات تسجيل الدخول:');
    console.log('   اسم المستخدم: admin');
    console.log('   كلمة المرور: 123456');
    console.log('══════════════════════════════════════');
  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
