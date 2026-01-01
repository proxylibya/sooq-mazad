/**
 * Stats Cache - نظام تخزين مؤقت للإحصائيات
 */
import { cache as unifiedCache } from './unified-cache';

// تصدير cache الأساسي
export { unifiedCache as cache };

// ============================================
// Stats Cache Object
// ============================================

/**
 * كائن statsCache الموحد للإحصائيات
 */
export const statsCache = {
    /**
     * جلب إحصائيات من الـ cache
     */
    async get(key: string) {
        return unifiedCache.get(`stats:${key}`);
    },

    /**
     * حفظ إحصائيات في الـ cache
     */
    async set(key: string, data: unknown, ttl = 300) {
        return unifiedCache.set(`stats:${key}`, data, ttl);
    },

    /**
     * حذف إحصائيات من الـ cache
     */
    async delete(key: string) {
        return unifiedCache.del(`stats:${key}`);
    },

    /**
     * جلب أو حفظ إحصائيات
     */
    async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl = 300): Promise<T> {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached as T;
        }
        const data = await fetcher();
        await this.set(key, data, ttl);
        return data;
    },

    /**
     * مسح جميع إحصائيات الـ cache
     */
    async clear() {
        // يمسح جميع مفاتيح الإحصائيات
        return unifiedCache.del('stats:*');
    }
};

// ============================================
// Legacy Functions للتوافقية
// ============================================

export async function getStatsFromCache(key: string) {
    return statsCache.get(key);
}

export async function setStatsCache(key: string, data: unknown, ttl = 300) {
    return statsCache.set(key, data, ttl);
}

export default statsCache;

// Alias for backwards compatibility
export const statsCacheAlias = {
    get: getStatsFromCache,
    set: setStatsCache,
    cache: statsCache
};
