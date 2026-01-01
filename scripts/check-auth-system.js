/**
 * سكريبت فحص شامل لنظام المصادقة وقاعدة البيانات
 * يتحقق من:
 * 1. اتصال قاعدة البيانات
 * 2. وجود المستخدمين
 * 3. توحيد JWT_SECRET
 * 4. صحة التوكنات
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ألوان للـ console
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

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}
function logError(message) {
  log(`❌ ${message}`, 'red');
}
function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}
function logInfo(message) {
  log(`📋 ${message}`, 'blue');
}
function logSection(message) {
  log(`\n${'='.repeat(60)}\n${message}\n${'='.repeat(60)}`, 'cyan');
}

async function checkDatabaseConnection() {
  logSection('1. فحص اتصال قاعدة البيانات');

  try {
    await prisma.$queryRaw`SELECT 1`;
    logSuccess('قاعدة البيانات متصلة بنجاح');

    // فحص الجداول الأساسية
    const tables = ['users', 'conversations', 'messages', 'user_passwords'];
    for (const table of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
        logInfo(`جدول ${table}: ${count[0].count} سجل`);
      } catch (e) {
        logError(`جدول ${table}: غير موجود أو خطأ`);
      }
    }

    return true;
  } catch (error) {
    logError(`فشل الاتصال بقاعدة البيانات: ${error.message}`);
    return false;
  }
}

async function checkUsers() {
  logSection('2. فحص المستخدمين');

  try {
    // جلب آخر 5 مستخدمين
    const users = await prisma.users.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      logWarning('لا يوجد مستخدمين في قاعدة البيانات');
      return false;
    }

    logSuccess(`عدد المستخدمين الأخيرين: ${users.length}`);

    for (const user of users) {
      logInfo(`  - ${user.name} (${user.id.substring(0, 20)}...) - ${user.role} - ${user.status}`);

      // التحقق من وجود كلمة مرور
      const hasPassword = await prisma.user_passwords.findFirst({
        where: { userId: user.id },
      });

      if (hasPassword) {
        logSuccess(`    كلمة مرور: موجودة`);
      } else {
        logWarning(`    كلمة مرور: غير موجودة`);
      }
    }

    return true;
  } catch (error) {
    logError(`خطأ في فحص المستخدمين: ${error.message}`);
    return false;
  }
}

async function checkJwtSecrets() {
  logSection('3. فحص JWT_SECRET في الملفات');

  const filesToCheck = [
    'apps/web/middleware/auth.ts',
    'apps/web/pages/api/auth/login.ts',
    'apps/web/pages/api/auth/register.ts',
    'apps/web/pages/api/auth/session.ts',
    'apps/web/pages/api/auth/verify-code.ts',
    'apps/web/pages/api/auth/refresh.ts',
    'apps/web/pages/api/auth/reset-password.ts',
  ];

  const secrets = new Map();
  const baseDir = path.join(__dirname, '..');

  for (const file of filesToCheck) {
    const filePath = path.join(baseDir, file);

    if (!fs.existsSync(filePath)) {
      logWarning(`الملف غير موجود: ${file}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // البحث عن JWT_SECRET
    const patterns = [
      /JWT_SECRET\s*=\s*process\.env\.JWT_SECRET\s*\|\|\s*['"`]([^'"`]+)['"`]/g,
      /const\s+JWT_SECRET\s*=\s*['"`]([^'"`]+)['"`]/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const secret = match[1] || 'process.env';
        if (!secrets.has(secret)) {
          secrets.set(secret, []);
        }
        secrets.get(secret).push(file);
      }
    }
  }

  if (secrets.size === 0) {
    logWarning('لم يتم العثور على JWT_SECRET في الملفات');
  } else if (secrets.size === 1) {
    logSuccess('JWT_SECRET موحد في جميع الملفات');
    for (const [secret, files] of secrets) {
      logInfo(`  القيمة الافتراضية: ${secret.substring(0, 20)}...`);
      logInfo(`  الملفات: ${files.length}`);
    }
  } else {
    logError('تحذير: JWT_SECRET غير موحد!');
    for (const [secret, files] of secrets) {
      logWarning(`  القيمة: ${secret.substring(0, 20)}...`);
      for (const file of files) {
        logInfo(`    - ${file}`);
      }
    }
  }

  return secrets.size <= 1;
}

async function checkConversationsAndMessages() {
  logSection('4. فحص المحادثات والرسائل');

  try {
    // عدد المحادثات
    const convCount = await prisma.conversations.count();
    logInfo(`عدد المحادثات: ${convCount}`);

    // عدد الرسائل
    const msgCount = await prisma.messages.count();
    logInfo(`عدد الرسائل: ${msgCount}`);

    // التحقق من conversation_participants
    try {
      const partCount = await prisma.conversation_participants.count();
      logInfo(`عدد المشاركين في المحادثات: ${partCount}`);
    } catch (e) {
      logWarning('جدول conversation_participants قد لا يكون موجوداً');
    }

    // آخر محادثة
    if (convCount > 0) {
      const lastConv = await prisma.conversations.findFirst({
        orderBy: { updatedAt: 'desc' },
        include: {
          conversation_participants: {
            include: { users: { select: { name: true } } },
          },
          _count: { select: { messages: true } },
        },
      });

      if (lastConv) {
        logSuccess('آخر محادثة:');
        logInfo(`  ID: ${lastConv.id}`);
        logInfo(
          `  المشاركين: ${lastConv.conversation_participants?.map((p) => p.users?.name).join(', ') || 'غير معروف'}`,
        );
        logInfo(`  عدد الرسائل: ${lastConv._count?.messages || 0}`);
        logInfo(`  آخر تحديث: ${lastConv.updatedAt}`);
      }
    }

    return true;
  } catch (error) {
    logError(`خطأ في فحص المحادثات: ${error.message}`);
    return false;
  }
}

async function checkEnvVariables() {
  logSection('5. فحص متغيرات البيئة');

  const envVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXT_PUBLIC_API_URL', 'NODE_ENV'];

  for (const varName of envVars) {
    const value = process.env[varName];
    if (value) {
      if (varName.includes('SECRET') || varName.includes('URL')) {
        logSuccess(`${varName}: موجود (${value.substring(0, 15)}...)`);
      } else {
        logSuccess(`${varName}: ${value}`);
      }
    } else {
      logWarning(`${varName}: غير موجود`);
    }
  }
}

async function testTokenVerification() {
  logSection('6. اختبار التحقق من التوكن');

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  try {
    // إنشاء توكن اختباري
    const testUser = await prisma.users.findFirst({
      select: { id: true, phone: true, role: true },
    });

    if (!testUser) {
      logWarning('لا يوجد مستخدم للاختبار');
      return false;
    }

    const token = jwt.sign(
      { userId: testUser.id, phone: testUser.phone, role: testUser.role },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    logSuccess('تم إنشاء توكن اختباري');
    logInfo(`  طول التوكن: ${token.length} حرف`);

    // التحقق من التوكن
    const decoded = jwt.verify(token, JWT_SECRET);
    logSuccess('تم التحقق من التوكن بنجاح');
    logInfo(`  userId: ${decoded.userId}`);
    logInfo(`  phone: ${decoded.phone}`);
    logInfo(`  role: ${decoded.role}`);
    logInfo(`  انتهاء الصلاحية: ${new Date(decoded.exp * 1000).toISOString()}`);

    // التحقق من أن المستخدم موجود في قاعدة البيانات
    const userExists = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });

    if (userExists) {
      logSuccess('المستخدم موجود في قاعدة البيانات');
    } else {
      logError('المستخدم غير موجود في قاعدة البيانات!');
    }

    return true;
  } catch (error) {
    logError(`خطأ في اختبار التوكن: ${error.message}`);
    return false;
  }
}

async function generateReport() {
  logSection('📊 تقرير الفحص النهائي');

  const results = {
    database: await checkDatabaseConnection(),
    users: await checkUsers(),
    jwtSecrets: await checkJwtSecrets(),
    conversations: await checkConversationsAndMessages(),
    tokenTest: await testTokenVerification(),
  };

  await checkEnvVariables();

  logSection('📋 ملخص النتائج');

  let passed = 0;
  let failed = 0;

  for (const [name, result] of Object.entries(results)) {
    if (result) {
      logSuccess(`${name}: نجح`);
      passed++;
    } else {
      logError(`${name}: فشل`);
      failed++;
    }
  }

  console.log('');
  if (failed === 0) {
    logSuccess(`✅ جميع الفحوصات نجحت (${passed}/${passed + failed})`);
  } else {
    logWarning(`⚠️ بعض الفحوصات فشلت (${passed}/${passed + failed})`);
  }

  return results;
}

// تشغيل الفحص
generateReport()
  .then(() => {
    console.log('\n');
    logInfo('انتهى الفحص');
    process.exit(0);
  })
  .catch((error) => {
    logError(`خطأ غير متوقع: ${error.message}`);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
