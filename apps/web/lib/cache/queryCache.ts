/**
 * Query Cache - إعادة توجيه للنظام الموحد
 */
export * from './unified-cache';
export {
    cache, generateCacheKey, getCachedQuery, getOrSetCache, invalidateCachePattern
} from './unified-cache';

