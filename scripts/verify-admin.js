const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const admins = await prisma.admins.findMany({
      select: { id: true, username: true, name: true, is_active: true, password_hash: true },
    });

    console.log('المديرون في قاعدة البيانات:');
    console.log(
      JSON.stringify(
        admins.map((a) => ({
          id: a.id,
          username: a.username,
          name: a.name,
          is_active: a.is_active,
          has_password: !!a.password_hash,
        })),
        null,
        2,
      ),
    );

    // اختبار البحث
    const testUsername = 'admin';
    console.log(`\nاختبار البحث عن: "${testUsername}"`);

    const found = await prisma.admins.findFirst({
      where: {
        username: testUsername.toLowerCase().trim(),
        deleted_at: null,
      },
    });

    if (found) {
      console.log('✅ تم العثور على المدير:', found.username);
    } else {
      console.log('❌ لم يتم العثور على المدير');
    }
  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
