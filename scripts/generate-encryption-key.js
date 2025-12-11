#!/usr/bin/env node

/**
 * سكريبت توليد مفتاح تشفير للمحافظ المشفرة
 *
 * الاستخدام:
 * node scripts/generate-encryption-key.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('=====================================');
console.log('توليد مفتاح تشفير للمحافظ المشفرة');
console.log('=====================================\n');

// توليد مفتاح 32 بايت (256 بت)
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('تم توليد مفتاح التشفير بنجاح:\n');
console.log('WALLET_ENCRYPTION_KEY=' + encryptionKey + '\n');

console.log('=====================================');
console.log('خطوات التطبيق:');
console.log('=====================================\n');

console.log('1. انسخ السطر التالي إلى ملف .env:');
console.log('   WALLET_ENCRYPTION_KEY=' + encryptionKey + '\n');

console.log('2. احتفظ بنسخة آمنة من هذا المفتاح في مكان آمن\n');

console.log('3. لا تشارك هذا المفتاح مع أي شخص\n');

console.log('4. استخدم مفاتيح مختلفة للتطوير والإنتاج\n');

console.log('=====================================');
console.log('تحذيرات أمنية:');
console.log('=====================================\n');

console.log('- في حالة فقدان هذا المفتاح، لن تتمكن من فك تشفير المفاتيح الخاصة المخزنة');
console.log('- لا تحفظ هذا المفتاح في نظام التحكم بالإصدارات (Git)');
console.log('- استخدم مدير أسرار (Secrets Manager) في الإنتاج');
console.log('- فعّل 2FA على جميع الحسابات التي لها وصول للمفتاح\n');

// محاولة حفظ المفتاح في ملف مؤقت آمن (اختياري)
const tempDir = path.join(__dirname, '..', 'temp-keys');
const keyFile = path.join(tempDir, `encryption-key-${Date.now()}.txt`);

try {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const keyContent = `
=====================================
مفتاح تشفير المحافظ المشفرة
تاريخ التوليد: ${new Date().toISOString()}
=====================================

WALLET_ENCRYPTION_KEY=${encryptionKey}

=====================================
ملاحظات مهمة:
=====================================

1. احذف هذا الملف بعد نسخ المفتاح إلى .env
2. لا ترفع هذا الملف إلى Git أو أي نظام تخزين سحابي
3. احتفظ بنسخة آمنة من المفتاح في مكان آمن
4. استخدم مفاتيح مختلفة للتطوير والإنتاج

=====================================
في حالة الطوارئ:
=====================================

إذا فقدت هذا المفتاح:
- لن تتمكن من فك تشفير المفاتيح الخاصة المخزنة
- سيحتاج المستخدمون لاستيراد محافظهم من جديد
- قم بتوليد مفتاح جديد وإبلاغ المستخدمين

=====================================
`;

  fs.writeFileSync(keyFile, keyContent, 'utf8');
  console.log(`تم حفظ المفتاح مؤقتاً في: ${keyFile}`);
  console.log('احذف هذا الملف بعد نسخ المفتاح!\n');
} catch (error) {
  console.log('تنبيه: لم يتم حفظ المفتاح في ملف مؤقت');
  console.log('انسخ المفتاح من الشاشة مباشرة\n');
}

console.log('=====================================');
console.log('الخطوة التالية:');
console.log('=====================================\n');

console.log('قم بتشغيل الأوامر التالية:');
console.log('1. npm run prisma:generate');
console.log('2. npm run prisma:migrate');
console.log('3. npm run health-check\n');

console.log('=====================================\n');
