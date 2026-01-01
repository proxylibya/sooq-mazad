/**
 * سكريبت تنظيف قاعدة البيانات الشامل
 * Database Cleanup Script
 *
 * يقوم بـ:
 * 1. إصلاح أرقام الهواتف التالفة (إزالة undefined)
 * 2. حذف البيانات التجريبية
 * 3. تنظيف السجلات اليتيمة
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function cleanupPhoneNumbers() {
  log('\n=== تنظيف أرقام الهواتف ===', 'cyan');

  try {
    // البحث عن أرقام تحتوي على undefined
    const usersWithBadPhones = await prisma.users.findMany({
      where: {
        phone: {
          contains: 'undefined',
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    log(`وجدت ${usersWithBadPhones.length} رقم هاتف تالف`, 'yellow');

    let fixed = 0;
    for (const user of usersWithBadPhones) {
      // إصلاح الرقم
      let cleanPhone = user.phone
        .replace(/undefined/gi, '')
        .replace(/\++/g, '+')
        .replace(/^\+2180+/, '+218');

      // إذا أصبح الرقم فارغاً أو غير صالح
      if (!cleanPhone || cleanPhone === '+' || cleanPhone === '+218' || cleanPhone.length < 10) {
        log(`  - حذف مستخدم برقم تالف: ${user.name} (${user.phone})`, 'red');
        await prisma.users.delete({ where: { id: user.id } });
      } else {
        log(`  - إصلاح: ${user.phone} → ${cleanPhone}`, 'green');
        await prisma.users.update({
          where: { id: user.id },
          data: { phone: cleanPhone },
        });
        fixed++;
      }
    }

    log(`تم إصلاح ${fixed} رقم هاتف`, 'green');

    // البحث عن أرقام بتنسيق +2180 (صفر زائد)
    const usersWithExtraZero = await prisma.users.findMany({
      where: {
        phone: {
          startsWith: '+2180',
        },
      },
      select: {
        id: true,
        phone: true,
      },
    });

    log(`وجدت ${usersWithExtraZero.length} رقم بصفر زائد`, 'yellow');

    for (const user of usersWithExtraZero) {
      const cleanPhone = user.phone.replace(/^\+2180+/, '+218');
      if (cleanPhone !== user.phone) {
        await prisma.users.update({
          where: { id: user.id },
          data: { phone: cleanPhone },
        });
        log(`  - إصلاح: ${user.phone} → ${cleanPhone}`, 'green');
      }
    }
  } catch (error) {
    log(`خطأ في تنظيف الهواتف: ${error.message}`, 'red');
  }
}

async function cleanupTestData() {
  log('\n=== تنظيف البيانات التجريبية ===', 'cyan');

  try {
    // أنماط الأسماء التجريبية
    const testPatterns = [
      'test',
      'Test',
      'TEST',
      'بيبيس',
      'لبيل',
      'تجريب',
      'تجربة',
      'اختبار',
      'demo',
      'Demo',
      'DEMO',
      'fake',
      'Fake',
      'FAKE',
      'sample',
      'Sample',
      'asdf',
      'qwerty',
      'aaaa',
      'bbbb',
      '123',
      'xxx',
      'yyy',
      'zzz',
    ];

    let deleted = 0;

    for (const pattern of testPatterns) {
      const testUsers = await prisma.users.findMany({
        where: {
          name: {
            contains: pattern,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      });

      for (const user of testUsers) {
        // تخطي المستخدمين القدامى (أكثر من 30 يوم)
        const daysSinceCreation =
          (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation > 30) continue;

        log(`  - حذف: ${user.name} (${user.phone})`, 'yellow');
        try {
          await prisma.users.delete({ where: { id: user.id } });
          deleted++;
        } catch (e) {
          log(`    فشل الحذف: ${e.message}`, 'red');
        }
      }
    }

    log(`تم حذف ${deleted} حساب تجريبي`, 'green');
  } catch (error) {
    log(`خطأ في تنظيف البيانات التجريبية: ${error.message}`, 'red');
  }
}

async function cleanupOrphanedRecords() {
  log('\n=== تنظيف السجلات اليتيمة ===', 'cyan');

  try {
    // تنظيف كلمات المرور اليتيمة
    const orphanedPasswords = await prisma.$executeRaw`
      DELETE FROM user_passwords 
      WHERE "userId" NOT IN (SELECT id FROM users)
    `;
    log(`حذف ${orphanedPasswords} كلمة مرور يتيمة`, 'green');
  } catch (error) {
    log(`خطأ في تنظيف السجلات اليتيمة: ${error.message}`, 'red');
  }
}

async function cleanupDuplicatePhones() {
  log('\n=== تنظيف الأرقام المكررة ===', 'cyan');

  try {
    // البحث عن أرقام مكررة
    const duplicates = await prisma.$queryRaw`
      SELECT phone, COUNT(*) as count 
      FROM users 
      WHERE phone IS NOT NULL AND phone != ''
      GROUP BY phone 
      HAVING COUNT(*) > 1
    `;

    log(`وجدت ${duplicates.length} رقم مكرر`, 'yellow');

    for (const dup of duplicates) {
      // الاحتفاظ بأقدم حساب وحذف الباقي
      const users = await prisma.users.findMany({
        where: { phone: dup.phone },
        orderBy: { createdAt: 'asc' },
      });

      // حذف جميع الحسابات عدا الأول
      for (let i = 1; i < users.length; i++) {
        log(`  - حذف مكرر: ${users[i].name} (${dup.phone})`, 'yellow');
        try {
          await prisma.users.delete({ where: { id: users[i].id } });
        } catch (e) {
          log(`    فشل: ${e.message}`, 'red');
        }
      }
    }
  } catch (error) {
    log(`خطأ في تنظيف الأرقام المكررة: ${error.message}`, 'red');
  }
}

async function showStatistics() {
  log('\n=== إحصائيات قاعدة البيانات ===', 'cyan');

  try {
    const totalUsers = await prisma.users.count();
    const activeUsers = await prisma.users.count({ where: { status: 'ACTIVE' } });
    const blockedUsers = await prisma.users.count({ where: { status: 'BLOCKED' } });
    const suspendedUsers = await prisma.users.count({ where: { status: 'SUSPENDED' } });

    log(`إجمالي المستخدمين: ${totalUsers}`, 'blue');
    log(`  - نشط: ${activeUsers}`, 'green');
    log(`  - محظور: ${blockedUsers}`, 'red');
    log(`  - موقوف: ${suspendedUsers}`, 'yellow');
  } catch (error) {
    log(`خطأ في جلب الإحصائيات: ${error.message}`, 'red');
  }
}

async function main() {
  log('========================================', 'cyan');
  log('   سكريبت تنظيف قاعدة البيانات الشامل   ', 'cyan');
  log('========================================', 'cyan');

  try {
    await cleanupPhoneNumbers();
    await cleanupDuplicatePhones();
    await cleanupTestData();
    await cleanupOrphanedRecords();
    await showStatistics();

    log('\n✅ اكتمل التنظيف بنجاح!', 'green');
  } catch (error) {
    log(`\n❌ خطأ عام: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
