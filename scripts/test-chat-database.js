/**
 * اختبار نظام الدردشة مباشرة على قاعدة البيانات
 * بدون الحاجة للخادم
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
function logInfo(message) {
  log(`📋 ${message}`, 'blue');
}
function logSection(message) {
  log(`\n${'='.repeat(60)}\n${message}\n${'='.repeat(60)}`, 'cyan');
}

async function runTest() {
  logSection('🧪 اختبار نظام الدردشة - مباشرة على قاعدة البيانات');

  try {
    // 1. جلب مستخدمين
    logSection('1. جلب مستخدمين للاختبار');

    const users = await prisma.users.findMany({
      where: { status: 'ACTIVE' },
      take: 3,
      select: {
        id: true,
        name: true,
        phone: true,
        accountType: true,
        role: true,
      },
    });

    if (users.length < 2) {
      logError('لا يوجد مستخدمين كافيين');
      return;
    }

    logSuccess(`وجدنا ${users.length} مستخدمين:`);
    users.forEach((u, i) => {
      logInfo(
        `  ${i + 1}. ${u.name} (${u.accountType || 'REGULAR'}) - ${u.id.substring(0, 25)}...`,
      );
    });

    const user1 = users[0];
    const user2 = users[1];

    // 2. إنشاء/جلب محادثة
    logSection('2. إنشاء/جلب محادثة');

    let conversation = await prisma.conversations.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { conversation_participants: { some: { userId: user1.id } } },
          { conversation_participants: { some: { userId: user2.id } } },
        ],
      },
      include: { conversation_participants: true },
    });

    if (conversation) {
      logSuccess(`محادثة موجودة: ${conversation.id}`);
    } else {
      const convId = `conv_${Date.now()}_test`;
      const now = new Date();
      const timestamp = Date.now();
      conversation = await prisma.conversations.create({
        data: {
          id: convId,
          type: 'DIRECT',
          createdAt: now,
          updatedAt: now,
          conversation_participants: {
            create: [
              { id: `cp_${timestamp}_1`, userId: user1.id },
              { id: `cp_${timestamp}_2`, userId: user2.id },
            ],
          },
        },
        include: { conversation_participants: true },
      });
      logSuccess(`تم إنشاء محادثة جديدة: ${conversation.id}`);
    }

    // 3. إرسال رسالة نصية من user1
    logSection('3. إرسال رسالة نصية');

    const msgId1 = `msg_${Date.now()}_1`;
    const textMessage = await prisma.messages.create({
      data: {
        id: msgId1,
        conversationId: conversation.id,
        senderId: user1.id,
        content: `رسالة اختبار من ${user1.name} - ${new Date().toLocaleTimeString('ar-LY')}`,
        type: 'TEXT',
        status: 'SENT',
      },
    });

    logSuccess(`تم إرسال رسالة نصية: ${textMessage.id}`);
    logInfo(`  المحتوى: "${textMessage.content}"`);
    logInfo(`  المرسل: ${user1.name}`);

    // 4. إرسال رد من user2
    logSection('4. إرسال رد');

    const msgId2 = `msg_${Date.now()}_2`;
    const replyMessage = await prisma.messages.create({
      data: {
        id: msgId2,
        conversationId: conversation.id,
        senderId: user2.id,
        content: `رد من ${user2.name} - شكراً على رسالتك!`,
        type: 'TEXT',
        status: 'SENT',
      },
    });

    logSuccess(`تم إرسال الرد: ${replyMessage.id}`);
    logInfo(`  المحتوى: "${replyMessage.content}"`);
    logInfo(`  المرسل: ${user2.name}`);

    // 5. إرسال رسالة صورة
    logSection('5. إرسال رسالة صورة');

    const msgId3 = `msg_${Date.now()}_3`;
    const imageMessage = await prisma.messages.create({
      data: {
        id: msgId3,
        conversationId: conversation.id,
        senderId: user1.id,
        content: '/uploads/test/sample-image.jpg',
        type: 'IMAGE',
        status: 'SENT',
      },
    });

    logSuccess(`تم إرسال صورة: ${imageMessage.id}`);
    logInfo(`  رابط الصورة: ${imageMessage.content}`);

    // 6. جلب جميع رسائل المحادثة
    logSection('6. جلب رسائل المحادثة');

    const allMessages = await prisma.messages.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      include: {
        users: { select: { name: true } },
      },
    });

    logSuccess(`إجمالي الرسائل في المحادثة: ${allMessages.length}`);

    allMessages.forEach((m, i) => {
      const sender = m.users?.name || 'مجهول';
      const preview = m.content?.substring(0, 40) || '';
      log(
        `  ${i + 1}. [${m.type}] ${sender}: ${preview}${m.content?.length > 40 ? '...' : ''}`,
        'magenta',
      );
    });

    // 7. التحقق من أنواع الرسائل
    logSection('7. إحصائيات أنواع الرسائل');

    const messageTypes = await prisma.messages.groupBy({
      by: ['type'],
      where: { conversationId: conversation.id },
      _count: true,
    });

    messageTypes.forEach((t) => {
      logInfo(`  ${t.type}: ${t._count} رسالة`);
    });

    // 8. التحقق من المشاركين
    logSection('8. المشاركين في المحادثة');

    const participants = await prisma.conversation_participants.findMany({
      where: { conversationId: conversation.id },
      include: {
        users: { select: { name: true, accountType: true } },
      },
    });

    participants.forEach((p, i) => {
      logSuccess(`  ${i + 1}. ${p.users?.name} (${p.users?.accountType || 'REGULAR'})`);
    });

    // ملخص
    logSection('📊 ملخص الاختبار');

    logSuccess('✅ جلب المستخدمين: نجح');
    logSuccess('✅ إنشاء/جلب المحادثة: نجح');
    logSuccess('✅ إرسال رسالة نصية: نجح');
    logSuccess('✅ إرسال رد: نجح');
    logSuccess('✅ إرسال صورة: نجح');
    logSuccess('✅ جلب الرسائل: نجح');
    logSuccess('✅ التحقق من المشاركين: نجح');

    console.log('');
    logSuccess('🎉 جميع اختبارات قاعدة البيانات نجحت!');

    console.log('');
    logInfo('💡 لاختبار API، تأكد من أن الخادم يعمل على http://localhost:3021');
    logInfo('   شغّل: npm run dev');
    logInfo('   ثم شغّل: node scripts/test-chat-system.js');
  } catch (error) {
    logError(`خطأ: ${error.message}`);
    console.error(error);
  }
}

runTest().finally(() => prisma.$disconnect());
