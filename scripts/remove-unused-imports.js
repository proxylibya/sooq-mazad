/**
 * سكريبت حذف استيرادات SimpleSpinner غير المستخدمة
 */

const fs = require('fs');
const path = require('path');

const WEB_DIR = path.join(__dirname, '../apps/web');

let fixedCount = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const relativePath = path.relative(WEB_DIR, filePath);

    // تخطي ملفات معينة
    if (
      relativePath.includes('SimpleSpinner.tsx') ||
      relativePath.includes('LoadingButton') ||
      relativePath.includes('.next') ||
      relativePath.includes('node_modules')
    ) {
      return false;
    }

    // إذا كان يحتوي على import SimpleSpinner ولكن لا يستخدمه
    const hasImport = /import\s+SimpleSpinner\s+from\s+['"][^'"]+['"];?\n?/.test(content);
    const usageCount = (content.match(/<SimpleSpinner/g) || []).length;

    if (hasImport && usageCount === 0) {
      content = content.replace(/import\s+SimpleSpinner\s+from\s+['"][^'"]+['"];?\n?/g, '');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ حذف import غير مستخدم: ${relativePath}`);
        fixedCount++;
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

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
          fixFile(filePath);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log('🧹 حذف استيرادات SimpleSpinner غير المستخدمة...\n');
walkDir(WEB_DIR);
console.log(`\n📊 تم إصلاح ${fixedCount} ملف`);
