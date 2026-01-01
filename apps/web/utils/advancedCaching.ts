/**
 * Advanced Caching Utilities
 */

const cache = new Map<string, { value: unknown; expires: number; }>();

export function getCached<T>(key: string, _options?: unknown): T | null {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
        cache.delete(key);
        return null;
    }
    return item.value as T;
}

export function setCached<T>(
    key: string,
    value: T,
    ttlOrOptions?: number | { ttl?: number; namespace?: string; tags?: string[]; }
): void {
    let ttlMs = 300000;
    if (typeof ttlOrOptions === 'number') {
        ttlMs = ttlOrOptions;
    } else if (ttlOrOptions && typeof ttlOrOptions === 'object') {
        if (typeof ttlOrOptions.ttl === 'number') {
            ttlMs = ttlOrOptions.ttl * 1000;
        }
    }
    cache.set(key, {
        value,
        expires: Date.now() + ttlMs,
    });
}

export function clearCache(): void {
    cache.clear();
}

// Advanced Cache object for compatibility
export const advancedCache = {
    get: getCached,
    set: setCached,
    clear: clearCache,
    invalidate: (pattern: string) => {
        for (const key of cache.keys()) {
            if (key.includes(pattern.replace('*', ''))) {
                cache.delete(key);
            }
        }
    }
};

// Cache Namespaces
export const CacheNamespaces = {
    MARKETPLACE: 'marketplace',
    AUCTIONS: 'auctions',
    USERS: 'users',
    CARS: 'cars',
    STATS: 'stats',
} as const;

// Cache Tags
export const CacheTags = {
    CAR_DETAILS: 'car-details',
    AUCTION_DETAILS: 'auction-details',
    USER_PROFILE: 'user-profile',
    MARKETPLACE_LIST: 'marketplace-list',
} as const;

// Invalidate cache on update helper
export function invalidateCacheOnUpdate(namespace: string, key?: string): void {
    if (key) {
        const fullKey = `${namespace}:${key}`;
        cache.delete(fullKey);
    } else {
        // Invalidate all keys in namespace
        for (const k of cache.keys()) {
            if (k.startsWith(namespace)) {
                cache.delete(k);
            }
        }
    }
}

export default { getCached, setCached, clearCache, advancedCache, CacheNamespaces, CacheTags, invalidateCacheOnUpdate };
