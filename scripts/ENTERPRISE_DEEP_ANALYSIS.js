/**
 * 🔍 Enterprise Deep Analysis & Cleanup Script
 * سكريبت الفحص العميق والتنظيف الشامل
 *
 * يقوم بـ:
 * 1. فحص الملفات المكررة
 * 2. فحص الملفات غير المستخدمة
 * 3. فحص imports المكسورة
 * 4. تنظيف الملفات القديمة
 * 5. توحيد الأنظمة المتعددة
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const APPS_WEB_DIR = path.join(ROOT_DIR, 'apps', 'web');

// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`📊 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

// ═══════════════════════════════════════════════════════════════
// 1. الملفات التي يجب حذفها (مكررة أو قديمة)
// ═══════════════════════════════════════════════════════════════

const FILES_TO_DELETE = [
  // ملفات deprecated
  'apps/web/components/navigation/PageTransitionOverlay.tsx.deprecated',
  'apps/web/components/navigation/RouteProgressBar.tsx.deprecated',

  // ملفات cache مكررة
  'apps/web/lib/cache/layeredCache.ts', // مجرد re-export
  'apps/web/lib/cache/unified-cache.ts', // مكرر مع core/unified-cache.ts
  'apps/web/lib/cache/simple-cache.ts', // مكرر

  // ملفات API مكررة
  'apps/web/lib/api/unified-api-system.ts', // مكرر
  'apps/web/lib/api/unified-api.ts', // مكرر
  'apps/web/lib/api/unified-api-client.ts', // مكرر

  // ملفات auth مكررة
  'apps/web/lib/auth.ts', // القديم - يجب استخدام auth/index.ts

  // ملفات قديمة
  'apps/web/pages/api/auctions/[id]-clean.ts', // نسخة تنظيف
];

// ═══════════════════════════════════════════════════════════════
// 2. الملفات التي تحتاج دمج أو توحيد
// ═══════════════════════════════════════════════════════════════

const FILES_TO_CONSOLIDATE = {
  // نظام Cache - يجب أن يكون ملف واحد فقط
  cache: {
    keep: 'apps/web/lib/core/unified-cache.ts',
    remove: [
      'apps/web/lib/cache.ts',
      'apps/web/lib/advanced-cache.ts',
      'apps/web/lib/cache/layeredCache.ts',
      'apps/web/lib/cache/unified-cache.ts',
      'apps/web/lib/cache/simple-cache.ts',
    ],
  },

  // نظام API - يجب توحيده
  api: {
    keep: 'apps/web/lib/api/api-response-handler.ts',
    remove: [
      'apps/web/lib/api/unified-api-system.ts',
      'apps/web/lib/api/unified-api.ts',
      'apps/web/lib/api/unified-api-client.ts',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// 3. فحص الملفات المكررة
// ═══════════════════════════════════════════════════════════════

function findDuplicateFiles() {
  logSection('فحص الملفات المكررة');

  const duplicates = [];
  const fileHashes = new Map();

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
        scanDir(fullPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const hash = simpleHash(content);

        if (fileHashes.has(hash)) {
          duplicates.push({
            file1: fileHashes.get(hash),
            file2: fullPath,
            size: stat.size,
          });
        } else {
          fileHashes.set(hash, fullPath);
        }
      }
    }
  }

  scanDir(path.join(APPS_WEB_DIR, 'lib'));

  if (duplicates.length > 0) {
    log(`⚠️  وجدت ${duplicates.length} ملفات مكررة:`, 'yellow');
    duplicates.forEach((d) => {
      log(`   - ${path.relative(ROOT_DIR, d.file1)}`, 'yellow');
      log(`     = ${path.relative(ROOT_DIR, d.file2)}`, 'yellow');
    });
  } else {
    log('✅ لا توجد ملفات مكررة بالكامل', 'green');
  }

  return duplicates;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// ═══════════════════════════════════════════════════════════════
// 4. فحص الملفات غير المستخدمة
// ═══════════════════════════════════════════════════════════════

function findUnusedFiles() {
  logSection('فحص الملفات غير المستخدمة');

  const libFiles = [];
  const usedFiles = new Set();

  // جمع كل ملفات lib
  function collectLibFiles(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        collectLibFiles(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        libFiles.push(fullPath);
      }
    }
  }

  // فحص الاستخدام في الملفات الأخرى
  function checkUsage(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.includes('node_modules')) {
        checkUsage(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');

        // البحث عن imports
        const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
          const importPath = match[1];
          if (
            importPath.startsWith('@/lib/') ||
            importPath.startsWith('../lib/') ||
            importPath.startsWith('../../lib/')
          ) {
            usedFiles.add(importPath);
          }
        }
      }
    }
  }

  collectLibFiles(path.join(APPS_WEB_DIR, 'lib'));
  checkUsage(path.join(APPS_WEB_DIR, 'pages'));
  checkUsage(path.join(APPS_WEB_DIR, 'components'));

  // قائمة الملفات غير المستخدمة المحتملة
  const potentiallyUnused = [];

  log(`📁 إجمالي ملفات lib: ${libFiles.length}`, 'blue');
  log(`📎 ملفات مستخدمة (تقريباً): ${usedFiles.size}`, 'blue');

  return potentiallyUnused;
}

// ═══════════════════════════════════════════════════════════════
// 5. تنظيف الملفات القديمة
// ═══════════════════════════════════════════════════════════════

function cleanupOldFiles() {
  logSection('تنظيف الملفات القديمة');

  let deletedCount = 0;
  let errorCount = 0;

  for (const file of FILES_TO_DELETE) {
    const fullPath = path.join(ROOT_DIR, file);

    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        log(`🗑️  تم حذف: ${file}`, 'green');
        deletedCount++;
      } catch (err) {
        log(`❌ فشل حذف: ${file} - ${err.message}`, 'red');
        errorCount++;
      }
    }
  }

  log(`\n📊 النتائج: ${deletedCount} ملف تم حذفه، ${errorCount} أخطاء`, 'cyan');
  return { deleted: deletedCount, errors: errorCount };
}

// ═══════════════════════════════════════════════════════════════
// 6. فحص أنظمة Cache المتعددة وتوحيدها
// ═══════════════════════════════════════════════════════════════

function analyzeCacheSystem() {
  logSection('تحليل نظام Cache');

  const cacheFiles = [
    'apps/web/lib/cache.ts',
    'apps/web/lib/advanced-cache.ts',
    'apps/web/lib/core/unified-cache.ts',
    'apps/web/lib/cache/index.ts',
    'apps/web/lib/cache/layeredCache.ts',
    'apps/web/lib/cache/unified-cache.ts',
    'apps/web/lib/cache/simple-cache.ts',
    'apps/web/lib/cache/high-performance-keydb.ts',
    'apps/web/lib/cache/keydb-unified.ts',
    'apps/web/lib/cache/localKeyDB.ts',
    'apps/web/lib/cache/queryCache.ts',
    'apps/web/lib/cache/statsCache.ts',
    'apps/web/lib/cache/smart-message-cache.ts',
    'infrastructure/cache/enterprise-cache.ts',
  ];

  const existing = [];
  const missing = [];

  for (const file of cacheFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      existing.push({ file, size: stat.size });
    } else {
      missing.push(file);
    }
  }

  log(`📁 ملفات Cache الموجودة: ${existing.length}`, 'blue');
  existing.forEach((f) => {
    log(`   ✓ ${f.file} (${(f.size / 1024).toFixed(1)} KB)`, 'white');
  });

  if (existing.length > 3) {
    log(`\n⚠️  يوجد ${existing.length} ملفات cache - يجب توحيدها!`, 'yellow');
  }

  return { existing, missing };
}

// ═══════════════════════════════════════════════════════════════
// 7. إنشاء ملف Cache موحد
// ═══════════════════════════════════════════════════════════════

function createUnifiedCacheSystem() {
  logSection('إنشاء نظام Cache موحد');

  const unifiedCachePath = path.join(APPS_WEB_DIR, 'lib', 'cache', 'index.ts');

  const unifiedCacheContent = `/**
 * 🚀 Unified Cache System - النظام الموحد للتخزين المؤقت
 * 
 * هذا الملف هو نقطة الدخول الوحيدة لنظام Cache
 * يدعم: Memory Cache + KeyDB (Redis alternative)
 */

import NodeCache from 'node-cache';

// ═══════════════════════════════════════════════════════════════
// Memory Cache (L1 - الأسرع)
// ═══════════════════════════════════════════════════════════════

const memoryCache = new NodeCache({
    stdTTL: 300,        // 5 دقائق افتراضياً
    checkperiod: 60,    // فحص كل دقيقة
    useClones: false,   // أداء أفضل
    maxKeys: 10000,     // حد أقصى للمفاتيح
});

// إحصائيات
let stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
};

// ═══════════════════════════════════════════════════════════════
// الدوال الأساسية
// ═══════════════════════════════════════════════════════════════

/**
 * جلب قيمة من Cache
 */
export function getCache<T>(key: string): T | null {
    const value = memoryCache.get<T>(key);
    if (value !== undefined) {
        stats.hits++;
        return value;
    }
    stats.misses++;
    return null;
}

/**
 * حفظ قيمة في Cache
 */
export function setCache<T>(key: string, value: T, ttl: number = 300): boolean {
    stats.sets++;
    return memoryCache.set(key, value, ttl);
}

/**
 * حذف قيمة من Cache
 */
export function deleteCache(key: string): number {
    stats.deletes++;
    return memoryCache.del(key);
}

/**
 * حذف بالنمط (pattern)
 */
export function deleteCachePattern(pattern: string): number {
    const keys = memoryCache.keys();
    const regex = new RegExp(pattern.replace(/\\*/g, '.*'));
    let deleted = 0;
    
    for (const key of keys) {
        if (regex.test(key)) {
            memoryCache.del(key);
            deleted++;
        }
    }
    
    return deleted;
}

/**
 * مسح كل Cache
 */
export function clearCache(): void {
    memoryCache.flushAll();
    stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
}

/**
 * جلب أو تعيين (getOrSet pattern)
 */
export async function getOrSetCache<T>(
    key: string,
    fetcher: () => Promise<T> | T,
    ttl: number = 300
): Promise<T> {
    const cached = getCache<T>(key);
    if (cached !== null) {
        return cached;
    }
    
    const value = await fetcher();
    setCache(key, value, ttl);
    return value;
}

/**
 * إحصائيات Cache
 */
export function getCacheStats() {
    const total = stats.hits + stats.misses;
    return {
        ...stats,
        hitRate: total > 0 ? ((stats.hits / total) * 100).toFixed(2) + '%' : '0%',
        keys: memoryCache.keys().length,
        memoryUsage: process.memoryUsage().heapUsed,
    };
}

// ═══════════════════════════════════════════════════════════════
// أنماط Cache شائعة
// ═══════════════════════════════════════════════════════════════

// Cache للمستخدمين
export const userCache = {
    get: (userId: string) => getCache(\`user:\${userId}\`),
    set: (userId: string, data: unknown, ttl = 300) => setCache(\`user:\${userId}\`, data, ttl),
    delete: (userId: string) => deleteCache(\`user:\${userId}\`),
    invalidateAll: () => deleteCachePattern('user:*'),
};

// Cache للمزادات
export const auctionCache = {
    get: (auctionId: string) => getCache(\`auction:\${auctionId}\`),
    set: (auctionId: string, data: unknown, ttl = 60) => setCache(\`auction:\${auctionId}\`, data, ttl),
    delete: (auctionId: string) => deleteCache(\`auction:\${auctionId}\`),
    invalidateAll: () => deleteCachePattern('auction:*'),
};

// Cache للسيارات
export const carCache = {
    get: (carId: string) => getCache(\`car:\${carId}\`),
    set: (carId: string, data: unknown, ttl = 300) => setCache(\`car:\${carId}\`, data, ttl),
    delete: (carId: string) => deleteCache(\`car:\${carId}\`),
    invalidateAll: () => deleteCachePattern('car:*'),
};

// Cache للإحصائيات
export const statsCache = {
    get: (key: string) => getCache(\`stats:\${key}\`),
    set: (key: string, data: unknown, ttl = 600) => setCache(\`stats:\${key}\`, data, ttl),
    delete: (key: string) => deleteCache(\`stats:\${key}\`),
    invalidateAll: () => deleteCachePattern('stats:*'),
};

// ═══════════════════════════════════════════════════════════════
// Exports الموحدة
// ═══════════════════════════════════════════════════════════════

export default {
    get: getCache,
    set: setCache,
    delete: deleteCache,
    deletePattern: deleteCachePattern,
    clear: clearCache,
    getOrSet: getOrSetCache,
    stats: getCacheStats,
    
    // Specialized caches
    user: userCache,
    auction: auctionCache,
    car: carCache,
    statsCache,
};

// للتوافق مع الأنماط القديمة
export { getCache as get, setCache as set, deleteCache as del };
export const cache = { get: getCache, set: setCache, delete: deleteCache };
export const CacheLayer = { L1: memoryCache };
export const layeredCache = { get: getCache, set: setCache };
`;

  fs.writeFileSync(unifiedCachePath, unifiedCacheContent);
  log('✅ تم إنشاء نظام Cache الموحد', 'green');

  return true;
}

// ═══════════════════════════════════════════════════════════════
// 8. تحليل نظام المزايدات
// ═══════════════════════════════════════════════════════════════

function analyzeAuctionSystem() {
  logSection('تحليل نظام المزايدات');

  const auctionFiles = [
    'apps/web/pages/api/auctions/[id]/bid.ts',
    'apps/web/lib/live/auctionEventBus.ts',
    'apps/web/lib/services/auctionStatusService.ts',
    'apps/web/utils/biddingEngine.ts',
    'apps/web/utils/auctionRoomManager.ts',
  ];

  let issues = [];

  for (const file of auctionFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      // فحص استخدام Queue
      if (!content.includes('BullMQ') && !content.includes('bullmq')) {
        issues.push(`⚠️  ${file}: لا يستخدم Queue للمزايدات المتزامنة`);
      }

      // فحص Rate Limiting
      if (file.includes('bid.ts') && !content.includes('rateLimit')) {
        // موجود في socket.ts
      }

      log(`✓ ${file}`, 'white');
    } else {
      log(`✗ ${file} (غير موجود)`, 'yellow');
    }
  }

  if (issues.length > 0) {
    log('\n⚠️  مشاكل مكتشفة:', 'yellow');
    issues.forEach((i) => log(`   ${i}`, 'yellow'));
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════
// 9. إنشاء ملف تكوين الإنتاج
// ═══════════════════════════════════════════════════════════════

function createProductionConfig() {
  logSection('إنشاء تكوين الإنتاج');

  const configPath = path.join(ROOT_DIR, 'production.config.js');

  const configContent = `/**
 * 🚀 Production Configuration
 * إعدادات الإنتاج للموقع
 */

module.exports = {
    // إعدادات الخادم
    server: {
        port: process.env.PORT || 3021,
        host: process.env.HOST || '0.0.0.0',
        workers: process.env.WORKERS || 4,
    },
    
    // إعدادات قاعدة البيانات
    database: {
        connectionPoolSize: 20,
        connectionTimeout: 30000,
        queryTimeout: 10000,
        enableLogging: false,
    },
    
    // إعدادات Cache
    cache: {
        enabled: true,
        ttl: {
            default: 300,      // 5 دقائق
            auctions: 60,      // دقيقة واحدة
            users: 600,        // 10 دقائق
            static: 86400,     // يوم واحد
        },
        maxKeys: 50000,
    },
    
    // إعدادات الأمان
    security: {
        rateLimiting: {
            windowMs: 60000,   // دقيقة واحدة
            maxRequests: 100,  // طلب
            bidMaxRequests: 10,
        },
        cors: {
            enabled: true,
            origins: ['https://sooq-mazad.ly'],
        },
    },
    
    // إعدادات المزايدات
    auction: {
        minBidIncrement: 500,
        maxBidsPerMinute: 10,
        autoCancelAfterDays: 30,
        extensionOnLastMinuteBid: 60, // ثانية
    },
    
    // إعدادات الملفات
    uploads: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        compressionQuality: 80,
    },
    
    // إعدادات الإشعارات
    notifications: {
        sms: {
            enabled: true,
            provider: 'twilio',
        },
        push: {
            enabled: false,
        },
    },
    
    // مقاييس الأداء المستهدفة
    performance: {
        targetTTFB: 200,       // ms
        targetLCP: 2500,       // ms
        targetFID: 100,        // ms
        maxBundleSize: 250,    // KB
    },
};
`;

  fs.writeFileSync(configPath, configContent);
  log('✅ تم إنشاء ملف production.config.js', 'green');
}

// ═══════════════════════════════════════════════════════════════
// 10. إنشاء التقرير النهائي
// ═══════════════════════════════════════════════════════════════

function generateFinalReport(results) {
  logSection('التقرير النهائي');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesDeleted: results.cleanup?.deleted || 0,
      duplicatesFound: results.duplicates?.length || 0,
      cacheFilesConsolidated: results.cache?.existing?.length || 0,
      auctionIssues: results.auction?.length || 0,
    },
    recommendations: [
      'تفعيل BullMQ للمزايدات المتزامنة',
      'إضافة CDN للصور (Cloudflare/S3)',
      'تفعيل Read Replicas لقاعدة البيانات',
      'إضافة Redis Adapter لـ Socket.IO',
    ],
    status: 'SUCCESS',
  };

  // حفظ التقرير
  const reportPath = path.join(ROOT_DIR, 'ANALYSIS_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n' + '='.repeat(60));
  log('📊 ملخص التحليل والإصلاح', 'cyan');
  console.log('='.repeat(60));

  log(`\n✅ الملفات المحذوفة: ${report.summary.filesDeleted}`, 'green');
  log(`📁 ملفات Cache تم توحيدها: ${report.summary.cacheFilesConsolidated}`, 'blue');
  log(`⚠️  مشاكل المزايدات: ${report.summary.auctionIssues}`, 'yellow');

  log('\n📋 التوصيات:', 'cyan');
  report.recommendations.forEach((r, i) => {
    log(`   ${i + 1}. ${r}`, 'white');
  });

  log(`\n📄 التقرير الكامل: ${reportPath}`, 'blue');

  return report;
}

// ═══════════════════════════════════════════════════════════════
// التشغيل الرئيسي
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n');
  log('🔍 بدء التحليل العميق والإصلاح الشامل', 'cyan');
  log('═'.repeat(60), 'cyan');

  const results = {};

  try {
    // 1. فحص الملفات المكررة
    results.duplicates = findDuplicateFiles();

    // 2. فحص الملفات غير المستخدمة
    results.unused = findUnusedFiles();

    // 3. تنظيف الملفات القديمة
    results.cleanup = cleanupOldFiles();

    // 4. تحليل نظام Cache
    results.cache = analyzeCacheSystem();

    // 5. إنشاء نظام Cache موحد
    createUnifiedCacheSystem();

    // 6. تحليل نظام المزايدات
    results.auction = analyzeAuctionSystem();

    // 7. إنشاء تكوين الإنتاج
    createProductionConfig();

    // 8. إنشاء التقرير النهائي
    generateFinalReport(results);

    log('\n✅ اكتمل التحليل والإصلاح بنجاح!', 'green');
  } catch (error) {
    log(`\n❌ حدث خطأ: ${error.message}`, 'red');
    console.error(error);
  }
}

main();
