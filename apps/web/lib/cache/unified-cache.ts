/**
 * 🔄 إعادة تصدير من النظام الموحد
 * هذا الملف للتوافق مع الكود القديم فقط
 * =============================================
 * جميع الدوال والأنواع تأتي من lib/core/unified-cache.ts
 */

export * from '../core/unified-cache';
export {
    CacheLayer, UnifiedCache, cache, cacheQuery, cache as default, generateCacheKey,
    getCachedQuery,
    getHighPerformanceKeyDB,
    getOrSetCache,
    invalidateCache,
    invalidateCachePattern,
    invalidateQueryCache,
    invalidateUserCache,
    keydb,
    keydbClient,
    layeredCache, cache as unifiedCache
} from '../core/unified-cache';

export type {
    CacheItem,
    CacheOptions,
    CacheStats
} from '../core/unified-cache';

