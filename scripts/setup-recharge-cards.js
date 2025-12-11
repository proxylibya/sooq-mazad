/**
 * سكريبت إعداد نظام كروت الشحن
 * يقوم بـ:
 * 1. تطبيق الـ migration
 * 2. إضافة كروت اختبار
 *
 * استخدام: node scripts/setup-recharge-cards.js
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const ENCRYPTION_KEY = process.env.CARD_ENCRYPTION_KEY || 'sooq-mazad-card-encryption-32ch';

// تشفير رقم الكرت
function encryptCardNumber(cardNumber) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv,
  );
  let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// إنشاء hash للكرت
function hashCardNumber(cardNumber) {
  return crypto.createHash('sha256').update(cardNumber).digest('hex');
}

// كروت اختبار ليبيانا
const libyanaTestCards = [
  { cardNumber: '1234567890123456', denomination: 10, value: 10 },
  { cardNumber: '2345678901234567', denomination: 20, value: 20 },
  { cardNumber: '3456789012345678', denomination: 30, value: 30 },
  { cardNumber: '4567890123456789', denomination: 50, value: 50 },
  { cardNumber: '5678901234567890', denomination: 100, value: 100 },
  { cardNumber: '6789012345678901', denomination: 10, value: 10 },
  { cardNumber: '7890123456789012', denomination: 20, value: 20 },
  { cardNumber: '8901234567890123', denomination: 30, value: 30 },
  { cardNumber: '9012345678901234', denomination: 50, value: 50 },
  { cardNumber: '0123456789012345', denomination: 100, value: 100 },
];

// كروت اختبار مدار
const madarTestCards = [
  { cardNumber: '1111222233334444', denomination: 10, value: 10 },
  { cardNumber: '2222333344445555', denomination: 20, value: 20 },
  { cardNumber: '3333444455556666', denomination: 30, value: 30 },
  { cardNumber: '4444555566667777', denomination: 50, value: 50 },
  { cardNumber: '5555666677778888', denomination: 100, value: 100 },
  { cardNumber: '6666777788889999', denomination: 10, value: 10 },
  { cardNumber: '7777888899990000', denomination: 20, value: 20 },
  { cardNumber: '8888999900001111', denomination: 30, value: 30 },
  { cardNumber: '9999000011112222', denomination: 50, value: 50 },
  { cardNumber: '0000111122223333', denomination: 100, value: 100 },
];

async function main() {
  console.log('🚀 بدء إعداد نظام كروت الشحن...\n');

  try {
    // التحقق من وجود الجداول
    console.log('📋 التحقق من وجود الجداول...');

    try {
      await prisma.$queryRaw`SELECT 1 FROM recharge_cards LIMIT 1`;
      console.log('✅ جدول recharge_cards موجود');
    } catch (e) {
      console.log('❌ جدول recharge_cards غير موجود - يرجى تشغيل prisma migrate deploy أولاً');
      console.log('\n💡 الخطوات:');
      console.log('   1. npx prisma generate');
      console.log('   2. npx prisma migrate deploy');
      console.log('   3. node scripts/setup-recharge-cards.js');
      return;
    }

    // إنشاء دفعة ليبيانا
    console.log('\n📦 إنشاء دفعة كروت ليبيانا...');
    const libyanaBatch = await prisma.card_batches.create({
      data: {
        batchNumber: `LIBYANA-TEST-${Date.now()}`,
        provider: 'LIBYANA',
        totalCards: libyanaTestCards.length,
        totalValue: libyanaTestCards.reduce((sum, c) => sum + c.value, 0),
        addedBy: 'system',
        notes: 'كروت اختبار ليبيانا',
      },
    });
    console.log(`   ✅ تم إنشاء الدفعة: ${libyanaBatch.batchNumber}`);

    // إضافة كروت ليبيانا
    for (const card of libyanaTestCards) {
      try {
        await prisma.recharge_cards.create({
          data: {
            cardNumber: encryptCardNumber(card.cardNumber),
            cardHash: hashCardNumber(card.cardNumber),
            provider: 'LIBYANA',
            denomination: card.denomination,
            value: card.value,
            batchId: libyanaBatch.id,
            addedBy: 'system',
          },
        });
        console.log(`   ✅ كرت ****${card.cardNumber.slice(-4)} - ${card.value} د.ل`);
      } catch (e) {
        console.log(`   ⚠️ كرت ****${card.cardNumber.slice(-4)} موجود مسبقاً`);
      }
    }

    // إنشاء دفعة مدار
    console.log('\n📦 إنشاء دفعة كروت مدار...');
    const madarBatch = await prisma.card_batches.create({
      data: {
        batchNumber: `MADAR-TEST-${Date.now()}`,
        provider: 'MADAR',
        totalCards: madarTestCards.length,
        totalValue: madarTestCards.reduce((sum, c) => sum + c.value, 0),
        addedBy: 'system',
        notes: 'كروت اختبار مدار',
      },
    });
    console.log(`   ✅ تم إنشاء الدفعة: ${madarBatch.batchNumber}`);

    // إضافة كروت مدار
    for (const card of madarTestCards) {
      try {
        await prisma.recharge_cards.create({
          data: {
            cardNumber: encryptCardNumber(card.cardNumber),
            cardHash: hashCardNumber(card.cardNumber),
            provider: 'MADAR',
            denomination: card.denomination,
            value: card.value,
            batchId: madarBatch.id,
            addedBy: 'system',
          },
        });
        console.log(`   ✅ كرت ****${card.cardNumber.slice(-4)} - ${card.value} د.ل`);
      } catch (e) {
        console.log(`   ⚠️ كرت ****${card.cardNumber.slice(-4)} موجود مسبقاً`);
      }
    }

    // عرض الإحصائيات
    console.log('\n📊 إحصائيات النظام:');
    const stats = await prisma.recharge_cards.groupBy({
      by: ['provider', 'status'],
      _count: true,
      _sum: { value: true },
    });

    for (const stat of stats) {
      console.log(
        `   ${stat.provider} - ${stat.status}: ${stat._count} كرت (${stat._sum.value || 0} د.ل)`,
      );
    }

    console.log('\n✅ تم إعداد نظام كروت الشحن بنجاح!');
    console.log('\n📝 كروت الاختبار المتاحة:');
    console.log('\n   ليبيانا:');
    libyanaTestCards.forEach((c) => console.log(`     ${c.cardNumber} = ${c.value} د.ل`));
    console.log('\n   مدار:');
    madarTestCards.forEach((c) => console.log(`     ${c.cardNumber} = ${c.value} د.ل`));
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
