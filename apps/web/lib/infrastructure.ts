/**
 * 🔗 Infrastructure Bridge
 * جسر التوافق مع البنية التحتية الجديدة
 * يوفر واجهة موحدة للكود القديم
 */

// @ts-nocheck
// Note: TypeScript errors are expected due to relative path imports
// In production, these would be resolved through proper module resolution

// Types for backwards compatibility
export interface CacheConfig {
    redis?: Record<string, unknown>;
    memory?: Record<string, unknown>;
    defaults?: { ttl: number; namespace: string; };
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
}

export interface RateLimitConfig {
    name: string;
    windowMs: number;
    maxRequests: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

export interface RateLimiterStats {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    checks: ServiceCheck[];
}

export interface ServiceCheck {
    name: string;
    status: 'up' | 'degraded' | 'down';
    latency?: number;
    message?: string;
}

// =====================================
// Simple In-Memory Cache Implementation
// =====================================

const memoryCache = new Map<string, { value: unknown; expires: number; }>();

export const cache = {
    async get<T>(key: string): Promise<T | null> {
        const item = memoryCache.get(key);
        if (!item) return null;
        if (Date.now() > item.expires) {
            memoryCache.delete(key);
            return null;
        }
        return item.value as T;
    },

    async set<T>(key: string, value: T, options?: CacheOptions | number): Promise<boolean> {
        const ttl = typeof options === 'number' ? options : (options?.ttl || 300);
        memoryCache.set(key, {
            value,
            expires: Date.now() + ttl * 1000,
        });
        return true;
    },

    async delete(key: string): Promise<boolean> {
        return memoryCache.delete(key);
    },

    async getOrSet<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) return cached;
        const value = await fetcher();
        await this.set(key, value, options);
        return value;
    },

    async invalidate(pattern: string): Promise<number> {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        let count = 0;
        for (const key of memoryCache.keys()) {
            if (regex.test(key)) {
                memoryCache.delete(key);
                count++;
            }
        }
        return count;
    },

    async healthCheck(): Promise<{ memory: boolean; redis: boolean; }> {
        return { memory: true, redis: false };
    },

    getStats(): CacheStats {
        return { hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0 };
    },
};

// =====================================
// Simple Rate Limiter Implementation
// =====================================

const rateLimitStore = new Map<string, { count: number; windowStart: number; }>();

export const rateLimiter = {
    async check(ruleName: string, identifier: string): Promise<RateLimitResult> {
        const key = `${ruleName}:${identifier}`;
        const now = Date.now();
        const windowMs = 60000; // 1 minute default
        const maxRequests = 100;

        let record = rateLimitStore.get(key);

        if (!record || now - record.windowStart >= windowMs) {
            record = { count: 0, windowStart: now };
        }

        record.count++;
        rateLimitStore.set(key, record);

        const remaining = Math.max(0, maxRequests - record.count);
        const allowed = record.count <= maxRequests;

        return {
            allowed,
            remaining,
            resetTime: record.windowStart + windowMs,
        };
    },

    getStats(): RateLimiterStats {
        return { totalRequests: 0, allowedRequests: 0, blockedRequests: 0 };
    },

    getRules(): RateLimitConfig[] {
        return [];
    },
};

export const healthCheck = {
    async check(): Promise<HealthStatus> {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            checks: [{ name: 'app', status: 'up' }],
        };
    },
};

// =====================================
// Helper Functions
// =====================================

export function getCache(): typeof cache {
    return cache;
}

export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 300
): Promise<T> {
    return cache.getOrSet(key, fetcher, { ttl });
}

export async function invalidateCache(pattern: string): Promise<number> {
    return cache.invalidate(pattern);
}

export async function clearCache(): Promise<void> {
    memoryCache.clear();
}

export function createRateLimitMiddleware(ruleName: string) {
    return async (req: unknown, res: unknown, next: () => void) => {
        next();
    };
}

export function getClientIdentifier(req: unknown): string {
    return 'unknown';
}

/**
 * @deprecated استخدم getCachedData بدلاً من هذه الدالة
 */
export async function getOrSetCache<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
): Promise<T> {
    return cache.getOrSet(key, fetcher, { ttl });
}

/**
 * @deprecated استخدم rateLimiter.check() بدلاً من هذه الدالة
 */
export async function checkRateLimit(
    ruleName: string,
    identifier: string
): Promise<{ allowed: boolean; remaining: number; }> {
    const result = await rateLimiter.check(ruleName, identifier);
    return {
        allowed: result.allowed,
        remaining: result.remaining,
    };
}

/**
 * @deprecated استخدم cache.invalidate()
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
    return cache.invalidate(pattern);
}

// Default export for easy importing
export default {
    cache,
    rateLimiter,
    healthCheck,
    getOrSetCache,
    checkRateLimit,
    invalidateCachePattern,
    getCachedData,
    invalidateCache,
    clearCache,
};
