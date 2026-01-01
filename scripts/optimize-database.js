/**
 * تحسين قاعدة البيانات
 * يقوم بتحليل وتحسين Prisma Schema والاستعلامات
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║     تحسين قاعدة البيانات                      ║');
console.log('╚════════════════════════════════════════════════╝\n');

const projectRoot = path.join(__dirname, '..');
const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');

// قراءة Schema
if (!fs.existsSync(schemaPath)) {
  console.log('خطأ: ملف schema.prisma غير موجود');
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf-8');

// تحليل الفهارس الموجودة
const existingIndexes = (schema.match(/@@index\(\[.*?\]\)/g) || []).length;
const uniqueIndexes = (schema.match(/@@unique\(\[.*?\]\)/g) || []).length;

console.log('تحليل Schema الحالي:\n');
console.log(`- الفهارس الموجودة: ${existingIndexes}`);
console.log(`- الفهارس الفريدة: ${uniqueIndexes}`);

// البحث عن الحقول التي تحتاج فهارس
const suggestions = [];

// فحص العلاقات بدون فهارس
const relations = schema.match(/(\w+)\s+(\w+)\s+@relation/g) || [];
console.log(`\n- العلاقات: ${relations.length}`);

// فحص حقول التصفية الشائعة
const commonFilterFields = ['status', 'createdAt', 'updatedAt', 'userId', 'isActive', 'type'];
commonFilterFields.forEach((field) => {
  const regex = new RegExp(`${field}\\s+\\w+`, 'g');
  const matches = schema.match(regex) || [];
  if (matches.length > 0) {
    suggestions.push(`- إضافة فهرس على حقل "${field}" (موجود في ${matches.length} model)`);
  }
});

console.log('\n════════════════════════════════════════════════');
console.log('توصيات التحسين:');
console.log('════════════════════════════════════════════════\n');

suggestions.forEach((s) => console.log(s));

console.log('\nنصائح إضافية:');
console.log('- استخدم select بدلاً من include لتقليل البيانات المجلوبة');
console.log('- استخدم pagination مع take و skip');
console.log('- تجنب N+1 queries باستخدام include مع العلاقات');
console.log('- استخدم createMany و updateMany للعمليات المجمعة');

console.log('\n════════════════════════════════════════════════');
console.log('الأوامر المفيدة:');
console.log('════════════════════════════════════════════════\n');
console.log('npx prisma db push    - تطبيق التغييرات');
console.log('npx prisma generate   - تحديث Client');
console.log('npx prisma studio     - واجهة إدارة البيانات');

console.log('\nتم اكتمال التحليل بنجاح!\n');
