/**
 * سكريبت توحيد JWT_SECRET في جميع ملفات المشروع
 * Unify JWT_SECRET across all project files
 */

const fs = require('fs');
const path = require('path');

// القيمة الموحدة
const UNIFIED_SECRET = 'your-secret-key-change-in-production';

// القيم القديمة التي يجب استبدالها
const OLD_SECRETS = [
  'sooq-mazad-jwt-secret-2024-libya',
  'development-secret-key',
  'fallback-secret',
  'your-secret-key',
  'dev-secret-change-me',
  'change-this-in-production',
  'default-jwt-secret-change-in-production',
];

// المجلدات للبحث فيها
const SEARCH_DIRS = ['apps/web/pages/api', 'apps/web/lib', 'apps/web/utils', 'apps/web/middleware'];

// عداد الملفات المحدثة
let updatedFiles = 0;
let totalReplacements = 0;

function findFiles(dir, extensions = ['.ts', '.tsx', '.js']) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...findFiles(fullPath, extensions));
    } else if (extensions.some((ext) => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileReplacements = 0;

  for (const oldSecret of OLD_SECRETS) {
    // البحث عن أنماط مختلفة
    const patterns = [
      // Pattern 1: process.env.JWT_SECRET || 'old-secret'
      new RegExp(
        `(process\\.env\\.JWT_SECRET\\s*\\|\\|\\s*['"])${escapeRegex(oldSecret)}(['"])`,
        'g',
      ),
      // Pattern 2: const JWT_SECRET = ... || 'old-secret'
      new RegExp(`(JWT_SECRET[^=]*=\\s*[^|]*\\|\\|\\s*['"])${escapeRegex(oldSecret)}(['"])`, 'g'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, `$1${UNIFIED_SECRET}$2`);
        modified = true;
        fileReplacements++;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  Updated: ${filePath} (${fileReplacements} replacements)`);
    updatedFiles++;
    totalReplacements += fileReplacements;
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

console.log('==========================================');
console.log('  JWT_SECRET Unification Script');
console.log('==========================================\n');
console.log(`Unified Secret: ${UNIFIED_SECRET}\n`);
console.log('Old secrets to replace:');
OLD_SECRETS.forEach((s) => console.log(`  - ${s}`));
console.log('\n');

// البحث والتحديث
for (const dir of SEARCH_DIRS) {
  const fullDir = path.join(__dirname, '..', dir);
  console.log(`Scanning: ${dir}`);

  const files = findFiles(fullDir);
  for (const file of files) {
    processFile(file);
  }
}

console.log('\n==========================================');
console.log('  Summary');
console.log('==========================================');
console.log(`Files updated: ${updatedFiles}`);
console.log(`Total replacements: ${totalReplacements}`);
console.log('\n');

if (updatedFiles > 0) {
  console.log('All JWT_SECRET values have been unified!');
  console.log('Please restart your development server.');
} else {
  console.log('No files needed updating.');
}
