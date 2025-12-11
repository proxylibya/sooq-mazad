/**
 * سكريبت فحص شامل لقاعدة البيانات
 * يعرض إحصائيات جميع الجداول الرئيسية
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           فحص شامل لقاعدة البيانات - سوق مزاد              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. إحصائيات المستخدمين
    console.log('📊 المستخدمين:');
    const totalUsers = await prisma.users.count();
    const activeUsers = await prisma.users.count({ where: { status: 'ACTIVE', isDeleted: false } });
    const deletedUsers = await prisma.users.count({ where: { isDeleted: true } });
    const verifiedUsers = await prisma.users.count({ where: { verified: true } });
    console.log(`   - إجمالي المستخدمين: ${totalUsers}`);
    console.log(`   - المستخدمين النشطين: ${activeUsers}`);
    console.log(`   - المستخدمين المحذوفين: ${deletedUsers}`);
    console.log(`   - المستخدمين الموثقين: ${verifiedUsers}\n`);

    // 2. إحصائيات المديرين
    console.log('👤 المديرين:');
    const totalAdmins = await prisma.admins.count();
    const activeAdmins = await prisma.admins.count({
      where: { is_active: true, deleted_at: null },
    });
    console.log(`   - إجمالي المديرين: ${totalAdmins}`);
    console.log(`   - المديرين النشطين: ${activeAdmins}\n`);

    // 3. إحصائيات السيارات
    console.log('🚗 السيارات:');
    const totalCars = await prisma.cars.count();
    const availableCars = await prisma.cars.count({ where: { status: 'AVAILABLE' } });
    const soldCars = await prisma.cars.count({ where: { status: 'SOLD' } });
    const featuredCars = await prisma.cars.count({ where: { featured: true } });
    console.log(`   - إجمالي السيارات: ${totalCars}`);
    console.log(`   - السيارات المتاحة: ${availableCars}`);
    console.log(`   - السيارات المباعة: ${soldCars}`);
    console.log(`   - السيارات المميزة: ${featuredCars}\n`);

    // 4. إحصائيات المزادات
    console.log('🔨 المزادات:');
    const totalAuctions = await prisma.auctions.count();
    const activeAuctions = await prisma.auctions.count({ where: { status: 'ACTIVE' } });
    const pendingAuctions = await prisma.auctions.count({ where: { status: 'PENDING' } });
    const endedAuctions = await prisma.auctions.count({ where: { status: 'ENDED' } });
    console.log(`   - إجمالي المزادات: ${totalAuctions}`);
    console.log(`   - المزادات النشطة: ${activeAuctions}`);
    console.log(`   - المزادات المعلقة: ${pendingAuctions}`);
    console.log(`   - المزادات المنتهية: ${endedAuctions}\n`);

    // 5. إحصائيات المزايدات
    console.log('💰 المزايدات:');
    const totalBids = await prisma.bids.count();
    console.log(`   - إجمالي المزايدات: ${totalBids}\n`);

    // 6. إحصائيات المعارض
    console.log('🏪 المعارض:');
    const totalShowrooms = await prisma.showrooms.count();
    const activeShowrooms = await prisma.showrooms.count({ where: { status: 'ACTIVE' } });
    const verifiedShowrooms = await prisma.showrooms.count({ where: { verified: true } });
    console.log(`   - إجمالي المعارض: ${totalShowrooms}`);
    console.log(`   - المعارض النشطة: ${activeShowrooms}`);
    console.log(`   - المعارض الموثقة: ${verifiedShowrooms}\n`);

    // 7. إحصائيات المحافظ
    console.log('💳 المحافظ:');
    const totalWallets = await prisma.wallets.count();
    const activeWallets = await prisma.wallets.count({ where: { isActive: true } });
    console.log(`   - إجمالي المحافظ: ${totalWallets}`);
    console.log(`   - المحافظ النشطة: ${activeWallets}\n`);

    // 8. إحصائيات المعاملات
    console.log('📝 المعاملات:');
    const totalTransactions = await prisma.transactions.count();
    const completedTransactions = await prisma.transactions.count({
      where: { status: 'COMPLETED' },
    });
    const pendingTransactions = await prisma.transactions.count({ where: { status: 'PENDING' } });
    console.log(`   - إجمالي المعاملات: ${totalTransactions}`);
    console.log(`   - المعاملات المكتملة: ${completedTransactions}`);
    console.log(`   - المعاملات المعلقة: ${pendingTransactions}\n`);

    // 9. إحصائيات خدمات النقل
    console.log('🚚 خدمات النقل:');
    const totalTransport = await prisma.transport_services.count();
    const activeTransport = await prisma.transport_services.count({ where: { status: 'ACTIVE' } });
    console.log(`   - إجمالي خدمات النقل: ${totalTransport}`);
    console.log(`   - الخدمات النشطة: ${activeTransport}\n`);

    // 10. إحصائيات الرسائل
    console.log('💬 الرسائل:');
    const totalConversations = await prisma.conversations.count();
    const totalMessages = await prisma.messages.count();
    console.log(`   - إجمالي المحادثات: ${totalConversations}`);
    console.log(`   - إجمالي الرسائل: ${totalMessages}\n`);

    // 11. إحصائيات الإشعارات
    console.log('الإشعارات:');
    const totalNotifications = await prisma.notifications.count();
    const unreadNotifications = await prisma.notifications.count({ where: { isRead: false } });
    console.log(`   - إجمالي الإشعارات: ${totalNotifications}`);
    console.log(`   - الإشعارات غير المقروءة: ${unreadNotifications}\n`);

    // 12. عرض آخر 5 مستخدمين
    console.log('📋 آخر 5 مستخدمين مسجلين:');
    const recentUsers = await prisma.users.findMany({
      select: { name: true, phone: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    recentUsers.forEach((u, i) => {
      const date = new Date(u.createdAt).toLocaleDateString('ar-LY');
      console.log(`   ${i + 1}. ${u.name} | ${u.phone} | ${u.status} | ${date}`);
    });

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                  فحص قاعدة البيانات مكتمل                    ║');
    console.log('║                     جميع الجداول تعمل                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
