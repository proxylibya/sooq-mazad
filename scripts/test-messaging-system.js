/**
 * اختبار شامل لنظام الرسائل
 * يفحص جميع APIs والوظائف الأساسية
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3021';
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors = [];

// ألوان للطباعة
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`  ✅ ${testName}`, 'green');
  } else {
    failedTests++;
    log(`  ❌ ${testName}`, 'red');
    if (details) log(`     ${details}`, 'yellow');
    errors.push({ test: testName, error: details });
  }
}

// دالة لإرسال طلب HTTP
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// ============================================
// اختبار 1: فحص APIs الأساسية
// ============================================
async function testMessagesAPIs() {
  log('\n📡 فحص APIs الرسائل:', 'bold');

  // فحص GET /api/messages (بدون مصادقة - يجب أن يرجع 401)
  try {
    const res = await makeRequest('/api/messages');
    logTest('GET /api/messages (بدون مصادقة)', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    logTest('GET /api/messages (بدون مصادقة)', false, e.message);
  }

  // فحص GET /api/conversations
  try {
    const res = await makeRequest('/api/conversations');
    logTest(
      'GET /api/conversations (بدون مصادقة)',
      res.status === 401 || res.status === 400,
      `Status: ${res.status}`,
    );
  } catch (e) {
    logTest('GET /api/conversations', false, e.message);
  }

  // فحص GET /api/messages/unread-count
  try {
    const res = await makeRequest('/api/messages/unread-count');
    logTest(
      'GET /api/messages/unread-count',
      res.status === 401 || res.status === 400,
      `Status: ${res.status}`,
    );
  } catch (e) {
    logTest('GET /api/messages/unread-count', false, e.message);
  }

  // فحص POST /api/messages (بدون مصادقة)
  try {
    const res = await makeRequest('/api/messages', {
      method: 'POST',
      body: { content: 'test' },
    });
    logTest('POST /api/messages (بدون مصادقة)', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    logTest('POST /api/messages (بدون مصادقة)', false, e.message);
  }
}

// ============================================
// اختبار 2: فحص APIs المحادثات
// ============================================
async function testConversationsAPIs() {
  log('\n💬 فحص APIs المحادثات:', 'bold');

  // فحص POST /api/conversations
  try {
    const res = await makeRequest('/api/conversations', {
      method: 'POST',
      body: { participantId: 'test_user' },
    });
    logTest('POST /api/conversations (بدون مصادقة)', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    logTest('POST /api/conversations', false, e.message);
  }
}

// ============================================
// اختبار 3: فحص ملفات الصفحات
// ============================================
async function testPagesExist() {
  log('\n📄 فحص صفحات الرسائل:', 'bold');

  // فحص صفحة الرسائل الرئيسية
  try {
    const res = await makeRequest('/messages');
    logTest(
      'GET /messages (الصفحة)',
      res.status === 200 || res.status === 302 || res.status === 307,
      `Status: ${res.status}`,
    );
  } catch (e) {
    logTest('GET /messages', false, e.message);
  }
}

// ============================================
// اختبار 4: فحص البنية والملفات
// ============================================
async function testFileStructure() {
  log('\n📁 فحص بنية الملفات:', 'bold');

  const fs = require('fs');
  const path = require('path');
  const baseDir = path.join(__dirname, '..', 'apps', 'web');

  const requiredFiles = [
    'pages/messages.tsx',
    'pages/api/messages.ts',
    'pages/api/messages/[id].ts',
    'pages/api/messages/unread-count.ts',
    'pages/api/messages/upload-image.ts',
    'pages/api/messages/upload-file.ts',
    'pages/api/conversations.ts',
    'components/messages/MessageComposer.tsx',
    'components/messages/VirtualizedMessagesList.tsx',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(baseDir, file);
    const exists = fs.existsSync(filePath);
    logTest(`${file}`, exists, exists ? '' : 'الملف غير موجود');
  }
}

// ============================================
// اختبار 5: فحص Prisma dbHelpers
// ============================================
async function testPrismaHelpers() {
  log('\n🔧 فحص دوال قاعدة البيانات:', 'bold');

  const fs = require('fs');
  const path = require('path');
  const prismaPath = path.join(__dirname, '..', 'apps', 'web', 'lib', 'prisma.ts');

  if (!fs.existsSync(prismaPath)) {
    logTest('ملف prisma.ts', false, 'الملف غير موجود');
    return;
  }

  const content = fs.readFileSync(prismaPath, 'utf-8');

  const requiredFunctions = [
    'createMessage',
    'getConversationMessages',
    'getUserConversations',
    'getOrCreateDirectConversation',
    'markMessagesAsRead',
    'deleteMessage',
    'isUserInConversation',
  ];

  for (const func of requiredFunctions) {
    const exists = content.includes(`async ${func}`) || content.includes(`${func}(`);
    logTest(`دالة ${func}`, exists, exists ? '' : 'الدالة غير موجودة');
  }

  // فحص أن createMessage تحتوي على توليد id
  const hasIdGeneration =
    content.includes('msg_${Date.now()}') || content.includes('messageId = `msg_');
  logTest(
    'createMessage تُولّد id',
    hasIdGeneration,
    hasIdGeneration ? '' : 'يجب إضافة توليد id للرسائل',
  );
}

// ============================================
// اختبار 6: فحص APIs الإشعارات
// ============================================
async function testNotificationAPIs() {
  log('\n🔔 فحص APIs الإشعارات:', 'bold');

  // فحص /api/notifications
  try {
    const res = await makeRequest('/api/notifications');
    logTest('GET /api/notifications', res.status !== 404, `Status: ${res.status}`);
  } catch (e) {
    logTest('GET /api/notifications', false, e.message);
  }

  // فحص /api/notifications/read-all
  try {
    const res = await makeRequest('/api/notifications/read-all', { method: 'POST' });
    const exists = res.status !== 404;
    logTest('POST /api/notifications/read-all', exists, `Status: ${res.status}`);
    if (!exists) {
      errors.push({
        test: 'API /api/notifications/read-all',
        error: 'API غير موجود - يجب إنشاؤه',
        fix: 'إنشاء ملف pages/api/notifications/read-all.ts',
      });
    }
  } catch (e) {
    logTest('POST /api/notifications/read-all', false, e.message);
  }
}

// ============================================
// اختبار 7: فحص schema messages
// ============================================
async function testMessagesSchema() {
  log('\n📊 فحص schema الرسائل:', 'bold');

  const fs = require('fs');
  const path = require('path');
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

  if (!fs.existsSync(schemaPath)) {
    logTest('ملف schema.prisma', false, 'الملف غير موجود');
    return;
  }

  const content = fs.readFileSync(schemaPath, 'utf-8');

  // فحص وجود model messages
  logTest('model messages', content.includes('model messages'), '');

  // فحص الحقول المطلوبة
  const requiredFields = [
    'id',
    'content',
    'senderId',
    'conversationId',
    'type',
    'status',
    'createdAt',
  ];
  for (const field of requiredFields) {
    const regex = new RegExp(`^\\s*${field}\\s+`, 'm');
    logTest(
      `حقل ${field} في messages`,
      regex.test(content.split('model messages')[1]?.split('model ')[0] || ''),
      '',
    );
  }
}

// ============================================
// التقرير النهائي
// ============================================
function printReport() {
  log('\n' + '='.repeat(60), 'blue');
  log('📊 التقرير النهائي', 'bold');
  log('='.repeat(60), 'blue');

  log(`\n  إجمالي الاختبارات: ${totalTests}`, 'reset');
  log(`  ✅ نجح: ${passedTests}`, 'green');
  log(`  ❌ فشل: ${failedTests}`, 'red');
  log(`  📈 نسبة النجاح: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'yellow');

  if (errors.length > 0) {
    log('\n⚠️ الأخطاء التي تحتاج إصلاح:', 'yellow');
    errors.forEach((e, i) => {
      log(`\n  ${i + 1}. ${e.test}`, 'red');
      log(`     السبب: ${e.error}`, 'yellow');
      if (e.fix) log(`     الحل: ${e.fix}`, 'green');
    });
  }

  log('\n' + '='.repeat(60), 'blue');
}

// ============================================
// تشغيل الاختبارات
// ============================================
async function runAllTests() {
  log('🚀 بدء اختبار نظام الرسائل الشامل', 'bold');
  log('='.repeat(60), 'blue');

  await testFileStructure();
  await testMessagesSchema();
  await testPrismaHelpers();
  await testMessagesAPIs();
  await testConversationsAPIs();
  await testNotificationAPIs();
  await testPagesExist();

  printReport();

  // خروج مع كود خطأ إذا فشلت اختبارات
  process.exit(failedTests > 0 ? 1 : 0);
}

// تشغيل
runAllTests().catch((e) => {
  console.error('خطأ في تشغيل الاختبارات:', e);
  process.exit(1);
});
