/**
 * سكريبت تنظيف المشروع
 * يحذف الملفات المكررة وغير الضرورية
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// الملفات والمجلدات المراد حذفها
const TO_DELETE = {
  // ملفات مكررة بلاحقة -new
  duplicatePages: [
    'apps/web/pages/transport-new.tsx',
    'apps/web/pages/reset-password-new.tsx',
    'apps/web/pages/showroom/dashboard-new.tsx',
    'apps/web/data/conditions-new.js',
  ],

  // مجلدات فارغة أو غير مستخدمة
  emptyDirs: [
    'test-reports/html',
    'test-reports',
    'test-results',
    'uploads/cars',
    'uploads/temp',
    '.ai',
    '.keys',
    '.storybook',
    '.husky',
  ],

  // ملفات مؤقتة أو تقارير
  tempFiles: ['missing-images-report.json'],

  // مجلدات منفصلة غير مرتبطة بالمشروع
  separateProjects: [
    // 'nexus-erp', // تعليق: قد يكون مطلوب، تحقق أولاً
  ],
};

// إحصائيات
let stats = {
  deleted: 0,
  failed: 0,
  skipped: 0,
};

// دالة حذف آمنة
function safeDelete(itemPath, isDir = false) {
  const fullPath = path.join(ROOT, itemPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  تخطي (غير موجود): ${itemPath}`);
    stats.skipped++;
    return;
  }

  try {
    if (isDir) {
      // حذف المجلد بشكل متكرر
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
    console.log(`✅ تم حذف: ${itemPath}`);
    stats.deleted++;
  } catch (error) {
    console.error(`❌ فشل حذف ${itemPath}:`, error.message);
    stats.failed++;
  }
}

// دالة فحص إذا كان المجلد فارغ
function isDirEmpty(dirPath) {
  const fullPath = path.join(ROOT, dirPath);
  if (!fs.existsSync(fullPath)) return true;

  try {
    const files = fs.readdirSync(fullPath);
    return files.length === 0;
  } catch {
    return true;
  }
}

async function main() {
  console.log('🧹 بدء تنظيف المشروع...\n');

  // 1. حذف الملفات المكررة
  console.log('📄 حذف الملفات المكررة...');
  for (const file of TO_DELETE.duplicatePages) {
    safeDelete(file);
  }

  // 2. حذف الملفات المؤقتة
  console.log('\n📋 حذف الملفات المؤقتة...');
  for (const file of TO_DELETE.tempFiles) {
    safeDelete(file);
  }

  // 3. حذف المجلدات الفارغة
  console.log('\n📁 حذف المجلدات الفارغة...');
  for (const dir of TO_DELETE.emptyDirs) {
    if (isDirEmpty(dir)) {
      safeDelete(dir, true);
    } else {
      console.log(`⏭️  تخطي (ليس فارغ): ${dir}`);
      stats.skipped++;
    }
  }

  // 4. المشاريع المنفصلة (معلقة بشكل افتراضي)
  if (TO_DELETE.separateProjects.length > 0) {
    console.log('\n🗂️  مشاريع منفصلة (تحتاج مراجعة يدوية):');
    for (const proj of TO_DELETE.separateProjects) {
      console.log(`   - ${proj}`);
    }
  }

  // طباعة الإحصائيات
  console.log('\n' + '='.repeat(50));
  console.log('📊 إحصائيات التنظيف:');
  console.log(`   ✅ تم حذف: ${stats.deleted} عنصر`);
  console.log(`   ⏭️  تم تخطي: ${stats.skipped} عنصر`);
  console.log(`   ❌ فشل: ${stats.failed} عنصر`);
  console.log('='.repeat(50));

  // توصيات إضافية
  console.log('\n💡 توصيات إضافية:');
  console.log('   1. قم بتشغيل: npm run build للتحقق من سلامة المشروع');
  console.log('   2. راجع مجلد nexus-erp إذا لم يكن مطلوباً');
  console.log('   3. احذف .next و node_modules وأعد التثبيت إذا لزم الأمر');
}

main().catch(console.error);
