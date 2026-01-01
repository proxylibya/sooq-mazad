/**
 * مسح Cache النظام
 * يقوم بمسح جميع ملفات الكاش المؤقتة
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║     مسح Cache النظام                           ║');
console.log('╚════════════════════════════════════════════════╝\n');

const projectRoot = path.join(__dirname, '..');

// مسارات Cache
const cachePaths = [
  path.join(projectRoot, '.next', 'cache'),
  path.join(projectRoot, 'node_modules', '.cache'),
  path.join(projectRoot, '.turbo'),
];

let clearedCount = 0;
let clearedSize = 0;

function getDirectorySize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;

  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    }
  } catch (e) {}

  return size;
}

function deleteDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return false;

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  } catch (e) {
    console.log(`   تحذير: لم يتم حذف ${dirPath}`);
    return false;
  }
}

console.log('جاري مسح Cache...\n');

for (const cachePath of cachePaths) {
  const relativePath = path.relative(projectRoot, cachePath);

  if (fs.existsSync(cachePath)) {
    const size = getDirectorySize(cachePath);

    if (deleteDirectory(cachePath)) {
      clearedCount++;
      clearedSize += size;
      console.log(`- تم مسح: ${relativePath} (${(size / 1024 / 1024).toFixed(2)} MB)`);
    }
  } else {
    console.log(`- غير موجود: ${relativePath}`);
  }
}

console.log('\n════════════════════════════════════════════════');
console.log('النتائج:');
console.log('════════════════════════════════════════════════\n');
console.log(`- المجلدات المحذوفة: ${clearedCount}`);
console.log(`- الحجم المحرر: ${(clearedSize / 1024 / 1024).toFixed(2)} MB`);

console.log('\nتم مسح Cache بنجاح!\n');
