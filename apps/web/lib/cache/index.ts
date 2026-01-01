/**
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
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
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
    get: (userId: string) => getCache(`user:${userId}`),
    set: (userId: string, data: unknown, ttl = 300) => setCache(`user:${userId}`, data, ttl),
    delete: (userId: string) => deleteCache(`user:${userId}`),
    invalidateAll: () => deleteCachePattern('user:*'),
};

// Cache للمزادات
export const auctionCache = {
    get: (auctionId: string) => getCache(`auction:${auctionId}`),
    set: (auctionId: string, data: unknown, ttl = 60) => setCache(`auction:${auctionId}`, data, ttl),
    delete: (auctionId: string) => deleteCache(`auction:${auctionId}`),
    invalidateAll: () => deleteCachePattern('auction:*'),
};

// Cache للسيارات
export const carCache = {
    get: (carId: string) => getCache(`car:${carId}`),
    set: (carId: string, data: unknown, ttl = 300) => setCache(`car:${carId}`, data, ttl),
    delete: (carId: string) => deleteCache(`car:${carId}`),
    invalidateAll: () => deleteCachePattern('car:*'),
};

// Cache للإحصائيات
export const statsCache = {
    get: (key: string) => getCache(`stats:${key}`),
    set: (key: string, data: unknown, ttl = 600) => setCache(`stats:${key}`, data, ttl),
    delete: (key: string) => deleteCache(`stats:${key}`),
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
