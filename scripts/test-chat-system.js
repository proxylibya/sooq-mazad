/**
 * سكريبت اختبار شامل لنظام الدردشة
 * يختبر:
 * 1. إرسال رسائل نصية بين مستخدمين
 * 2. إرسال صور وملفات
 * 3. التحقق من وصول الرسائل للطرفين
 * 4. اختبار أنواع حسابات مختلفة
 */

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const API_BASE = 'http://localhost:3021';

// طباعة للتشخيص
console.log(
  '[Config] JWT_SECRET loaded:',
  JWT_SECRET ? `${JWT_SECRET.substring(0, 15)}...` : 'NOT SET',
);

// ألوان للـ console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

// إنشاء توكن للمستخدم
function createToken(user) {
  return jwt.sign({ userId: user.id, phone: user.phone, role: user.role }, JWT_SECRET, {
    expiresIn: '1h',
  });
}

// استدعاء API
async function callAPI(endpoint, method, token, body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// اختبار 1: جلب مستخدمين للاختبار
async function getTestUsers() {
  logSection('1. جلب مستخدمين للاختبار');

  // جلب مستخدمين لديهم كلمات مرور
  const passwordUserIds = await prisma.user_passwords.findMany({
    take: 5,
    select: { userId: true },
  });

  const userIds = passwordUserIds.map((p) => p.userId);

  const usersWithPasswords = await prisma.users.findMany({
    where: {
      id: { in: userIds },
      status: 'ACTIVE',
    },
    take: 3,
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      accountType: true,
      status: true,
    },
  });

  if (usersWithPasswords.length < 2) {
    logError('لا يوجد مستخدمين كافيين للاختبار (نحتاج 2 على الأقل)');

    // محاولة جلب أي مستخدمين
    logInfo('محاولة جلب أي مستخدمين نشطين...');
    const anyUsers = await prisma.users.findMany({
      where: { status: 'ACTIVE' },
      take: 3,
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        accountType: true,
        status: true,
      },
    });

    if (anyUsers.length >= 2) {
      logSuccess(`وجدنا ${anyUsers.length} مستخدمين نشطين:`);
      anyUsers.forEach((u, i) => {
        logInfo(`  ${i + 1}. ${u.name} (${u.accountType || 'REGULAR'}) - ${u.role}`);
      });
      return anyUsers;
    }

    return null;
  }

  logSuccess(`وجدنا ${usersWithPasswords.length} مستخدمين للاختبار:`);
  usersWithPasswords.forEach((u, i) => {
    logInfo(`  ${i + 1}. ${u.name} (${u.accountType || 'REGULAR'}) - ${u.role}`);
  });

  return usersWithPasswords;
}

// اختبار 2: إنشاء أو جلب محادثة بين مستخدمين
async function getOrCreateConversation(user1, user2, token1) {
  logSection('2. إنشاء/جلب محادثة بين المستخدمين');

  // البحث عن محادثة موجودة
  const existingConv = await prisma.conversations.findFirst({
    where: {
      type: 'DIRECT',
      AND: [
        { conversation_participants: { some: { userId: user1.id } } },
        { conversation_participants: { some: { userId: user2.id } } },
      ],
    },
    include: {
      conversation_participants: true,
    },
  });

  if (existingConv) {
    logSuccess(`وجدنا محادثة موجودة: ${existingConv.id}`);
    return existingConv;
  }

  // إنشاء محادثة جديدة
  logInfo('إنشاء محادثة جديدة...');

  const result = await callAPI('/api/conversations', 'POST', token1, {
    otherUserId: user2.id,
    type: 'DIRECT',
  });

  if (result.data?.success) {
    logSuccess(`تم إنشاء محادثة جديدة: ${result.data.data?.id}`);
    return result.data.data;
  } else {
    logError(`فشل إنشاء المحادثة: ${result.data?.error || 'خطأ غير معروف'}`);

    // محاولة إنشاء مباشرة في قاعدة البيانات
    logInfo('محاولة إنشاء المحادثة مباشرة في قاعدة البيانات...');

    const convId = `conv_${Date.now()}_test`;
    const newConv = await prisma.conversations.create({
      data: {
        id: convId,
        type: 'DIRECT',
        conversation_participants: {
          create: [{ userId: user1.id }, { userId: user2.id }],
        },
      },
      include: { conversation_participants: true },
    });

    logSuccess(`تم إنشاء المحادثة: ${newConv.id}`);
    return newConv;
  }
}

// اختبار 3: إرسال رسالة نصية
async function testSendTextMessage(sender, receiver, conversation, token) {
  logSection('3. اختبار إرسال رسالة نصية');

  const testMessage = `رسالة اختبار من ${sender.name} إلى ${receiver.name} - ${new Date().toLocaleTimeString('ar-LY')}`;

  logInfo(`إرسال رسالة من ${sender.name}...`);
  logInfo(`المحتوى: "${testMessage}"`);

  const result = await callAPI('/api/messages', 'POST', token, {
    senderId: sender.id,
    conversationId: conversation.id,
    content: testMessage,
    type: 'TEXT',
  });

  if (result.data?.success) {
    logSuccess('تم إرسال الرسالة بنجاح!');
    logInfo(`  معرف الرسالة: ${result.data.data?.id || result.data.message?.id}`);
    return result.data;
  } else {
    logError(`فشل إرسال الرسالة: ${result.data?.error || result.error || 'خطأ غير معروف'}`);
    logInfo(`  الحالة: ${result.status}`);
    logInfo(`  التفاصيل: ${JSON.stringify(result.data)}`);
    return null;
  }
}

// اختبار 4: إرسال رسالة صورة
async function testSendImageMessage(sender, receiver, conversation, token) {
  logSection('4. اختبار إرسال رسالة صورة');

  const testImageUrl = '/uploads/test/sample-image.jpg';

  logInfo(`إرسال صورة من ${sender.name}...`);

  const result = await callAPI('/api/messages', 'POST', token, {
    senderId: sender.id,
    conversationId: conversation.id,
    content: testImageUrl,
    type: 'IMAGE',
  });

  if (result.data?.success) {
    logSuccess('تم إرسال الصورة بنجاح!');
    return result.data;
  } else {
    logError(`فشل إرسال الصورة: ${result.data?.error || 'خطأ غير معروف'}`);
    return null;
  }
}

// اختبار 5: التحقق من استلام الرسائل
async function testReceiveMessages(user, conversation, token) {
  logSection('5. التحقق من استلام الرسائل');

  logInfo(`جلب رسائل المحادثة للمستخدم ${user.name}...`);

  const result = await callAPI(
    `/api/messages?conversationId=${conversation.id}&userId=${user.id}`,
    'GET',
    token,
  );

  if (result.data?.success) {
    const messages = result.data.messages || [];
    logSuccess(`تم جلب ${messages.length} رسالة`);

    if (messages.length > 0) {
      logInfo('آخر الرسائل:');
      messages.slice(-3).forEach((m, i) => {
        const preview = m.content?.substring(0, 50) || '';
        log(`  ${i + 1}. [${m.type}] ${preview}${m.content?.length > 50 ? '...' : ''}`, 'magenta');
      });
    }

    return messages;
  } else {
    logError(`فشل جلب الرسائل: ${result.data?.error || 'خطأ غير معروف'}`);
    logInfo(`  الحالة: ${result.status}`);
    return null;
  }
}

// اختبار 6: محادثة ثنائية الاتجاه
async function testBidirectionalChat(user1, user2, conversation, token1, token2) {
  logSection('6. اختبار محادثة ثنائية الاتجاه');

  // المستخدم 1 يرسل رسالة
  logInfo(`\n--- ${user1.name} يرسل رسالة ---`);
  const msg1 = await callAPI('/api/messages', 'POST', token1, {
    senderId: user1.id,
    conversationId: conversation.id,
    content: `مرحباً ${user2.name}! كيف حالك؟`,
    type: 'TEXT',
  });

  if (msg1.data?.success) {
    logSuccess(`${user1.name}: أرسل الرسالة بنجاح`);
  } else {
    logError(`${user1.name}: فشل إرسال الرسالة - ${msg1.data?.error}`);
  }

  // انتظار قصير
  await new Promise((r) => setTimeout(r, 500));

  // المستخدم 2 يرسل رد
  logInfo(`\n--- ${user2.name} يرد ---`);
  const msg2 = await callAPI('/api/messages', 'POST', token2, {
    senderId: user2.id,
    conversationId: conversation.id,
    content: `أهلاً ${user1.name}! الحمد لله بخير، وأنت؟`,
    type: 'TEXT',
  });

  if (msg2.data?.success) {
    logSuccess(`${user2.name}: أرسل الرد بنجاح`);
  } else {
    logError(`${user2.name}: فشل إرسال الرد - ${msg2.data?.error}`);
  }

  // انتظار قصير
  await new Promise((r) => setTimeout(r, 500));

  // المستخدم 1 يرسل رسالة أخرى
  logInfo(`\n--- ${user1.name} يتابع ---`);
  const msg3 = await callAPI('/api/messages', 'POST', token1, {
    senderId: user1.id,
    conversationId: conversation.id,
    content: `ممتاز! هل شفت الإعلان الجديد؟`,
    type: 'TEXT',
  });

  if (msg3.data?.success) {
    logSuccess(`${user1.name}: أرسل الرسالة بنجاح`);
  } else {
    logError(`${user1.name}: فشل إرسال الرسالة - ${msg3.data?.error}`);
  }

  return { msg1, msg2, msg3 };
}

// اختبار 7: التحقق من وصول الرسائل للطرفين
async function verifyMessagesForBothUsers(user1, user2, conversation, token1, token2) {
  logSection('7. التحقق من وصول الرسائل للطرفين');

  // جلب رسائل المستخدم 1
  logInfo(`\nرسائل المحادثة من وجهة نظر ${user1.name}:`);
  const msgs1 = await callAPI(
    `/api/messages?conversationId=${conversation.id}&userId=${user1.id}`,
    'GET',
    token1,
  );

  if (msgs1.data?.success) {
    const count1 = msgs1.data.messages?.length || 0;
    logSuccess(`${user1.name} يرى ${count1} رسالة`);
  }

  // جلب رسائل المستخدم 2
  logInfo(`\nرسائل المحادثة من وجهة نظر ${user2.name}:`);
  const msgs2 = await callAPI(
    `/api/messages?conversationId=${conversation.id}&userId=${user2.id}`,
    'GET',
    token2,
  );

  if (msgs2.data?.success) {
    const count2 = msgs2.data.messages?.length || 0;
    logSuccess(`${user2.name} يرى ${count2} رسالة`);
  }

  // مقارنة
  const count1 = msgs1.data?.messages?.length || 0;
  const count2 = msgs2.data?.messages?.length || 0;

  if (count1 === count2 && count1 > 0) {
    logSuccess(`✅ كلا المستخدمين يريان نفس عدد الرسائل (${count1})`);
    return true;
  } else if (count1 !== count2) {
    logWarning(`⚠️ عدد الرسائل مختلف: ${user1.name}=${count1}, ${user2.name}=${count2}`);
    return false;
  } else {
    logWarning('⚠️ لا توجد رسائل في المحادثة');
    return false;
  }
}

// التشغيل الرئيسي
async function runTests() {
  logSection('🧪 بدء اختبار نظام الدردشة');

  const results = {
    users: false,
    conversation: false,
    textMessage: false,
    imageMessage: false,
    receiveMessages: false,
    bidirectional: false,
    bothUsersReceive: false,
  };

  try {
    // 1. جلب المستخدمين
    const users = await getTestUsers();
    if (!users || users.length < 2) {
      logError('فشل الاختبار: لا يوجد مستخدمين كافيين');
      return results;
    }
    results.users = true;

    const user1 = users[0];
    const user2 = users[1];

    // إنشاء توكنات
    const token1 = createToken(user1);
    const token2 = createToken(user2);

    logInfo(`\n🔑 تم إنشاء توكنات للمستخدمين`);

    // 2. إنشاء/جلب محادثة
    const conversation = await getOrCreateConversation(user1, user2, token1);
    if (!conversation) {
      logError('فشل الاختبار: لم نتمكن من إنشاء محادثة');
      return results;
    }
    results.conversation = true;

    // 3. اختبار إرسال رسالة نصية
    const textResult = await testSendTextMessage(user1, user2, conversation, token1);
    results.textMessage = !!textResult;

    // 4. اختبار إرسال صورة
    const imageResult = await testSendImageMessage(user1, user2, conversation, token1);
    results.imageMessage = !!imageResult;

    // 5. التحقق من استلام الرسائل
    const receivedMsgs = await testReceiveMessages(user2, conversation, token2);
    results.receiveMessages = receivedMsgs && receivedMsgs.length > 0;

    // 6. محادثة ثنائية الاتجاه
    const bidirectionalResult = await testBidirectionalChat(
      user1,
      user2,
      conversation,
      token1,
      token2,
    );
    results.bidirectional = !!(
      bidirectionalResult?.msg1?.data?.success && bidirectionalResult?.msg2?.data?.success
    );

    // 7. التحقق من وصول الرسائل للطرفين
    results.bothUsersReceive = await verifyMessagesForBothUsers(
      user1,
      user2,
      conversation,
      token1,
      token2,
    );
  } catch (error) {
    logError(`خطأ غير متوقع: ${error.message}`);
    console.error(error);
  }

  // ملخص النتائج
  logSection('📊 ملخص نتائج الاختبار');

  let passed = 0;
  let failed = 0;

  const testNames = {
    users: 'جلب المستخدمين',
    conversation: 'إنشاء المحادثة',
    textMessage: 'إرسال رسالة نصية',
    imageMessage: 'إرسال صورة',
    receiveMessages: 'استلام الرسائل',
    bidirectional: 'محادثة ثنائية الاتجاه',
    bothUsersReceive: 'وصول الرسائل للطرفين',
  };

  for (const [key, result] of Object.entries(results)) {
    if (result) {
      logSuccess(`${testNames[key]}: نجح`);
      passed++;
    } else {
      logError(`${testNames[key]}: فشل`);
      failed++;
    }
  }

  console.log('');
  if (failed === 0) {
    logSuccess(`🎉 جميع الاختبارات نجحت! (${passed}/${passed + failed})`);
  } else {
    logWarning(`⚠️ بعض الاختبارات فشلت (${passed}/${passed + failed})`);
  }

  return results;
}

// تشغيل الاختبارات
runTests()
  .then(() => {
    console.log('\n');
    logInfo('انتهى الاختبار');
    process.exit(0);
  })
  .catch((error) => {
    logError(`خطأ: ${error.message}`);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
