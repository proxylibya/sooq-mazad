const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== فحص المستخدمين ===\n');

  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        accountType: true,
        isDeleted: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    console.log('عدد المستخدمين:', users.length);
    users.forEach((u) => {
      console.log(
        `  - ${u.name} | ${u.phone} | ${u.status} | ${u.accountType} | ${u.isDeleted ? 'محذوف' : 'نشط'}`,
      );
    });
  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
