/**
 * سكريبت تنظيف شامل لمؤشرات التحميل
 * يبحث عن جميع أنماط التحميل القديمة ويوحدها
 */

const fs = require('fs');
const path = require('path');

const WEB_DIR = path.join(__dirname, '../apps/web');

// إحصائيات
let stats = {
  totalFiles: 0,
  filesWithSpinners: 0,
  fullPageSpinners: [],
  componentSpinners: [],
  buttonSpinners: [],
  mapSpinners: [],
  listSpinners: [],
};

// أنماط التحميل المختلفة
const patterns = {
  // 1. تحميل صفحة كاملة (min-h-screen)
  fullPage:
    /if\s*\([^)]*(?:loading|isLoading|authLoading)[^)]*\)\s*\{?\s*return\s*\(\s*<div[^>]*min-h-screen[^>]*>[\s\S]*?(?:SimpleSpinner|animate-spin)[\s\S]*?<\/div>\s*\)/g,

  // 2. تحميل مع Layout
  withLayout:
    /if\s*\([^)]*(?:loading|isLoading)[^)]*\)\s*\{?\s*return\s*\(\s*<Layout[\s\S]*?(?:SimpleSpinner|animate-spin)[\s\S]*?<\/Layout>\s*\)/g,

  // 3. تحميل بسيط (return null pattern يجب أن يكون موجود)
  simpleReturn:
    /if\s*\([^)]*(?:loading|isLoading|authLoading)[^)]*\)\s*\{?\s*return\s*\(\s*<div[^>]*(?:flex|items-center|justify-center)[^>]*>[\s\S]*?(?:SimpleSpinner|animate-spin)[\s\S]*?<\/div>\s*\)/g,
};

/**
 * تحليل ملف للبحث عن spinners
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(WEB_DIR, filePath);

    // تخطي ملفات معينة
    if (
      relativePath.includes('SimpleSpinner.tsx') ||
      relativePath.includes('UnifiedPageTransition') ||
      relativePath.includes('Loader.tsx')
    ) {
      return;
    }

    // البحث عن أنماط مختلفة
    const hasSimpleSpinner = content.includes('SimpleSpinner');
    const hasAnimateSpin = content.includes('animate-spin');
    const hasMinHScreen = content.includes('min-h-screen');
    const hasLoadingText = content.includes('جاري التحميل') || content.includes('Loading');

    if (!hasSimpleSpinner && !hasAnimateSpin) return;

    stats.filesWithSpinners++;

    // تصنيف نوع الـ spinner
    const info = {
      path: relativePath,
      hasSimpleSpinner,
      hasAnimateSpin,
      hasMinHScreen,
      hasLoadingText,
      isFullPage: false,
      isComponent: false,
      isButton: false,
      isMap: false,
      isList: false,
    };

    // تحديد النوع
    if (relativePath.includes('/pages/') && hasMinHScreen) {
      info.isFullPage = true;
      stats.fullPageSpinners.push(info);
    } else if (relativePath.includes('/maps/')) {
      info.isMap = true;
      stats.mapSpinners.push(info);
    } else if (relativePath.includes('Button') || relativePath.includes('button')) {
      info.isButton = true;
      stats.buttonSpinners.push(info);
    } else if (relativePath.includes('List') || relativePath.includes('Grid')) {
      info.isList = true;
      stats.listSpinners.push(info);
    } else {
      info.isComponent = true;
      stats.componentSpinners.push(info);
    }
  } catch (error) {
    // تخطي الملفات التي لا يمكن قراءتها
  }
}

/**
 * المشي في المجلدات
 */
function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          if (!file.includes('node_modules') && !file.includes('.next')) {
            walkDir(filePath);
          }
        } else if (file.endsWith('.tsx')) {
          stats.totalFiles++;
          analyzeFile(filePath);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

// البدء
console.log('🔍 تحليل شامل لمؤشرات التحميل في المشروع...\n');
walkDir(WEB_DIR);

// عرض النتائج
console.log('='.repeat(60));
console.log('📊 إحصائيات التحليل:');
console.log('='.repeat(60));
console.log(`📁 إجمالي الملفات: ${stats.totalFiles}`);
console.log(`🔄 ملفات تحتوي على spinners: ${stats.filesWithSpinners}`);
console.log('');

if (stats.fullPageSpinners.length > 0) {
  console.log('\n🚨 FULL PAGE SPINNERS (يجب إصلاحها - تحميل صفحة كاملة):');
  console.log('-'.repeat(50));
  stats.fullPageSpinners.forEach((s) => {
    console.log(`   📄 ${s.path}`);
    if (s.hasLoadingText) console.log(`      ⚠️  يحتوي على نص تحميل`);
  });
}

if (stats.mapSpinners.length > 0) {
  console.log('\n🗺️ MAP SPINNERS (خرائط):');
  console.log('-'.repeat(50));
  stats.mapSpinners.forEach((s) => {
    console.log(`   📄 ${s.path}`);
  });
}

if (stats.componentSpinners.length > 0) {
  console.log('\n🧩 COMPONENT SPINNERS (مكونات - قد تحتاج مراجعة):');
  console.log('-'.repeat(50));
  stats.componentSpinners.forEach((s) => {
    console.log(`   📄 ${s.path}`);
    if (s.hasMinHScreen) console.log(`      ⚠️  يحتوي على min-h-screen!`);
  });
}

if (stats.listSpinners.length > 0) {
  console.log('\n📋 LIST/GRID SPINNERS (قوائم):');
  console.log('-'.repeat(50));
  stats.listSpinners.forEach((s) => {
    console.log(`   📄 ${s.path}`);
  });
}

if (stats.buttonSpinners.length > 0) {
  console.log('\n🔘 BUTTON SPINNERS (أزرار - مقبول):');
  console.log('-'.repeat(50));
  stats.buttonSpinners.forEach((s) => {
    console.log(`   📄 ${s.path}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('✨ انتهى التحليل!');
console.log('💡 الملفات المميزة بـ 🚨 تحتاج إصلاح فوري');
console.log('💡 الملفات المميزة بـ ⚠️ تحتاج مراجعة');
