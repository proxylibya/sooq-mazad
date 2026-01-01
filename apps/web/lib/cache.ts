/**
 * ملف إعادة التصدير للكاش
 * يحيل جميع الاستيرادات إلى النظام الموحد
 */

export {
    CacheLayer, UnifiedCache, cache, cacheQuery, generateCacheKey, getCachedQuery, getHighPerformanceKeyDB, getOrSetCache, invalidateCache, invalidateCachePattern, invalidateQueryCache, invalidateUserCache, keydb,
    keydbClient, layeredCache, unifiedCache, type CacheItem,
    type CacheOptions,
    type CacheStats
} from './core/unified-cache';

export { cache as default } from './core/unified-cache';
