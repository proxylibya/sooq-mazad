/**
 * فحص عضوية المستخدم في المحادثة المحددة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMembership() {
  // المحادثة التي تُرجع 401
  const conversationId = 'conv_1765075410549_fory05yt4';

  // المستخدم من الـ logs
  const userId = 'usr_1764568003400_yz5vyms2o';

  console.log('='.repeat(60));
  console.log('فحص عضوية المستخدم في المحادثة');
  console.log('='.repeat(60));

  console.log(`\nالمحادثة: ${conversationId}`);
  console.log(`المستخدم: ${userId}`);

  // 1. التحقق من وجود المحادثة
  console.log('\n--- فحص المحادثة ---');
  const conversation = await prisma.conversations.findUnique({
    where: { id: conversationId },
    include: {
      conversation_participants: {
        include: {
          users: { select: { id: true, name: true, phone: true } },
        },
      },
    },
  });

  if (!conversation) {
    console.log('❌ المحادثة غير موجودة في قاعدة البيانات!');
  } else {
    console.log('✅ المحادثة موجودة');
    console.log(`   نوع: ${conversation.type}`);
    console.log(`   عنوان: ${conversation.title || 'بدون عنوان'}`);
    console.log(`   المشاركين:`);

    for (const p of conversation.conversation_participants) {
      const isTargetUser = p.userId === userId;
      console.log(
        `   ${isTargetUser ? '👉' : '  '} ${p.users?.name} (${p.userId}) ${isTargetUser ? '← المستخدم المطلوب' : ''}`,
      );
    }

    // التحقق من العضوية
    const isMember = conversation.conversation_participants.some((p) => p.userId === userId);
    if (isMember) {
      console.log('\n✅ المستخدم عضو في هذه المحادثة');
    } else {
      console.log('\n❌ المستخدم ليس عضواً في هذه المحادثة!');
    }
  }

  // 2. التحقق من وجود المستخدم
  console.log('\n--- فحص المستخدم ---');
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, name: true, phone: true, status: true, role: true },
  });

  if (!user) {
    console.log('❌ المستخدم غير موجود في قاعدة البيانات!');

    // البحث عن مستخدمين مشابهين
    console.log('\n   البحث عن مستخدمين بأرقام مشابهة...');
    const similarUsers = await prisma.users.findMany({
      where: {
        id: { startsWith: 'usr_1764' },
      },
      take: 5,
      select: { id: true, name: true, phone: true },
    });

    if (similarUsers.length > 0) {
      console.log('   مستخدمين بـ ID مشابه:');
      for (const u of similarUsers) {
        console.log(`   - ${u.name} (${u.id})`);
      }
    }
  } else {
    console.log('✅ المستخدم موجود');
    console.log(`   الاسم: ${user.name}`);
    console.log(`   الهاتف: ${user.phone}`);
    console.log(`   الحالة: ${user.status}`);
    console.log(`   الدور: ${user.role}`);

    // التحقق من كلمة المرور
    const hasPassword = await prisma.user_passwords.findFirst({
      where: { userId: userId },
    });

    if (hasPassword) {
      console.log('   ✅ لديه كلمة مرور');
    } else {
      console.log('   ⚠️ ليس لديه كلمة مرور');
    }
  }

  // 3. جلب جميع المحادثات التي يشارك فيها المستخدم
  console.log('\n--- محادثات المستخدم ---');
  const userConversations = await prisma.conversation_participants.findMany({
    where: { userId: userId },
    include: {
      conversations: { select: { id: true, title: true, type: true } },
    },
  });

  if (userConversations.length === 0) {
    console.log('⚠️ المستخدم ليس عضواً في أي محادثة');
  } else {
    console.log(`✅ المستخدم عضو في ${userConversations.length} محادثة:`);
    for (const uc of userConversations) {
      const isTarget = uc.conversationId === conversationId;
      console.log(
        `   ${isTarget ? '👉' : '  '} ${uc.conversationId} ${isTarget ? '← المحادثة المطلوبة' : ''}`,
      );
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('انتهى الفحص');
}

checkMembership()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
