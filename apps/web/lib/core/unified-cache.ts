/**
 * 💾 نظام التخزين المؤقت الموحد العالمي
 * UNIFIED CACHE SYSTEM - الملف الوحيد للكاش
 * ========================================
 * ⚠️ هذا هو الملف الرئيسي الوحيد للكاش
 * جميع الملفات الأخرى تعيد التصدير من هنا
 */

// ============================================
// Types
// ============================================

export interface CacheItem<T> {
    value: T;
    expiry: number;
    tags?: string[];
}

export interface CacheOptions {
    ttl?: number;
    namespace?: string;
    tags?: string[];
}

export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    hitRate: number;
    size: number;
}

export enum CacheLayer {
    MEMORY = 'memory',
    REDIS = 'redis',
}

// ============================================
// Memory Cache Storage
// ============================================

const memoryCache = new Map<string, CacheItem<unknown>>();
let stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };

// ============================================
// Unified Cache Class
// ============================================

class UnifiedCacheSystem {
    /**
     * الحصول على قيمة من الكاش
     */
    async get<T>(key: string, namespace?: string): Promise<T | null> {
        const fullKey = namespace ? `${namespace}:${key}` : key;
        const item = memoryCache.get(fullKey) as CacheItem<T> | undefined;

        if (!item) {
            stats.misses++;
            return null;
        }

        if (item.expiry < Date.now()) {
            memoryCache.delete(fullKey);
            stats.misses++;
            return null;
        }

        stats.hits++;
        return item.value;
    }

    /**
     * تخزين قيمة في الكاش
     */
    async set<T>(key: string, value: T, options?: CacheOptions | number): Promise<boolean> {
        const ttl = typeof options === 'number' ? options : (options?.ttl || 3600);
        const namespace = typeof options === 'object' ? options?.namespace : undefined;
        const tags = typeof options === 'object' ? options?.tags : undefined;
        const fullKey = namespace ? `${namespace}:${key}` : key;

        memoryCache.set(fullKey, {
            value,
            expiry: Date.now() + ttl * 1000,
            tags,
        });

        stats.sets++;
        return true;
    }

    /**
     * حذف قيمة من الكاش
     */
    async del(key: string | string[]): Promise<boolean> {
        if (Array.isArray(key)) {
            key.forEach(k => memoryCache.delete(k));
            stats.deletes += key.length;
        } else {
            memoryCache.delete(key);
            stats.deletes++;
        }
        return true;
    }

    /**
     * حذف مع namespace
     */
    async delete(key: string, namespace?: string): Promise<boolean> {
        const fullKey = namespace ? `${namespace}:${key}` : key;
        memoryCache.delete(fullKey);
        stats.deletes++;
        return true;
    }

    /**
     * التحقق من وجود مفتاح
     */
    async exists(key: string, namespace?: string): Promise<boolean> {
        const fullKey = namespace ? `${namespace}:${key}` : key;
        const item = memoryCache.get(fullKey);
        if (!item) return false;
        if (item.expiry < Date.now()) {
            memoryCache.delete(fullKey);
            return false;
        }
        return true;
    }

    /**
     * مسح الكاش بالكامل
     */
    async clear(): Promise<boolean> {
        memoryCache.clear();
        return true;
    }

    /**
     * Flush (alias for clear)
     */
    async flush(): Promise<boolean> {
        return this.clear();
    }

    /**
     * الحصول أو التعيين
     */
    async getOrSet<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T> {
        const namespace = options?.namespace;
        const cached = await this.get<T>(key, namespace);
        if (cached !== null) return cached;

        const value = await fetcher();
        await this.set(key, value, options);
        return value;
    }

    /**
     * حذف بنمط معين
     */
    async invalidate(pattern: string): Promise<number> {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        let count = 0;
        Array.from(memoryCache.keys()).forEach(key => {
            if (regex.test(key)) {
                memoryCache.delete(key);
                count++;
            }
        });
        stats.deletes += count;
        return count;
    }

    /**
     * حذف بواسطة tag
     */
    async invalidateByTag(tag: string): Promise<number> {
        let deleted = 0;
        Array.from(memoryCache.entries()).forEach(([key, item]) => {
            if (item.tags?.includes(tag)) {
                memoryCache.delete(key);
                deleted++;
            }
        });
        stats.deletes += deleted;
        return deleted;
    }

    /**
     * الحصول على المفاتيح
     */
    async keys(pattern?: string): Promise<string[]> {
        const allKeys = Array.from(memoryCache.keys());
        if (!pattern) return allKeys;
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return allKeys.filter(key => regex.test(key));
    }

    /**
     * الحصول على الحجم
     */
    async size(): Promise<number> {
        return memoryCache.size;
    }

    /**
     * تنظيف المنتهية
     */
    async cleanup(): Promise<number> {
        let cleaned = 0;
        const now = Date.now();
        Array.from(memoryCache.entries()).forEach(([key, item]) => {
            if (item.expiry < now) {
                memoryCache.delete(key);
                cleaned++;
            }
        });
        return cleaned;
    }

    /**
     * فحص الصحة
     */
    async health(): Promise<boolean> {
        return true;
    }

    async healthCheck(): Promise<boolean> {
        return true;
    }

    /**
     * الحصول على الإحصائيات
     */
    getStats(): CacheStats {
        const total = stats.hits + stats.misses;
        return {
            ...stats,
            hitRate: total > 0 ? (stats.hits / total) * 100 : 0,
            size: memoryCache.size,
        };
    }
}

// ============================================
// Singleton Instance
// ============================================

export const cache = new UnifiedCacheSystem();

// ============================================
// Helper Functions
// ============================================

export async function getOrSetCache<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>,
    namespace?: string
): Promise<T> {
    return cache.getOrSet(key, fetchFn, { ttl, namespace });
}

export async function getCachedQuery<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl = 3600
): Promise<T> {
    return getOrSetCache(key, ttl, fetchFn);
}

export async function cacheQuery<T>(
    queryName: string,
    params: Record<string, unknown>,
    ttl: number,
    queryFn: () => Promise<T>
): Promise<T> {
    const key = `query:${queryName}:${JSON.stringify(params)}`;
    return getOrSetCache(key, ttl, queryFn);
}

export async function invalidateCache(pattern: string, namespace?: string): Promise<number> {
    const fullPattern = namespace ? `${namespace}:${pattern}` : pattern;
    return cache.invalidate(fullPattern);
}

export async function invalidateUserCache(userId: string): Promise<void> {
    const keys = await cache.keys(`user:${userId}:*`);
    await cache.del(keys);
}

export async function invalidateQueryCache(queryName?: string): Promise<void> {
    const pattern = queryName ? `query:${queryName}:*` : 'query:*';
    const keys = await cache.keys(pattern);
    await cache.del(keys);
}

export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join(':');
    return `${prefix}:${sortedParams}`;
}

export async function invalidateCachePattern(pattern: string): Promise<boolean> {
    await cache.invalidate(pattern);
    return true;
}

// ============================================
// Layered Cache (Alias)
// ============================================

export const layeredCache = {
    get: <T>(key: string) => cache.get<T>(key),
    set: <T>(key: string, value: T, options?: CacheOptions) => cache.set(key, value, options),
    delete: (key: string) => cache.del(key),
    clear: () => cache.clear(),
    getOrSet: <T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions) =>
        cache.getOrSet(key, fetchFn, options),
};

// ============================================
// KeyDB/Redis Compatibility Aliases
// ============================================

export const keydb = cache;
export const keydbClient = cache;
export const unifiedCache = cache;
export const UnifiedCache = cache;

export async function getHighPerformanceKeyDB() {
    return cache;
}

// ============================================
// Default Export
// ============================================

export default cache;
