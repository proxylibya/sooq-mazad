/**
 * 🚀 Enterprise Cache System - نظام التخزين المؤقت المتقدم
 * يدعم Multi-layer caching مع Redis/KeyDB وMemory cache
 * مصمم لملايين الطلبات
 */

import Redis from 'ioredis';

// =====================================
// Types & Interfaces
// =====================================

export interface CacheConfig {
    redis: {
        host: string;
        port: number;
        password?: string;
        db?: number;
        keyPrefix: string;
        maxRetriesPerRequest: number;
        enableReadyCheck: boolean;
        lazyConnect: boolean;
    };
    memory: {
        maxSize: number; // MB
        ttl: number; // seconds
        checkPeriod: number; // seconds
    };
    defaults: {
        ttl: number;
        namespace: string;
    };
}

export interface CacheEntry<T> {
    value: T;
    expires: number;
    createdAt: number;
    hits: number;
    tags?: string[];
}

export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    hitRate: number;
    memorySize: number;
    redisConnected: boolean;
    memoryEntries: number;
}

export interface CacheOptions {
    ttl?: number;
    namespace?: string;
    tags?: string[];
    useMemoryOnly?: boolean;
    useRedisOnly?: boolean;
    priority?: 'memory' | 'redis';
}

// =====================================
// Configuration
// =====================================

const defaultConfig: CacheConfig = {
    redis: {
        host: process.env.REDIS_HOST || process.env.KEYDB_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || process.env.KEYDB_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || process.env.KEYDB_PASSWORD,
        db: parseInt(process.env.REDIS_DB || process.env.KEYDB_DB || '0'),
        keyPrefix: 'sooq:cache:',
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
    },
    memory: {
        maxSize: 100, // 100MB
        ttl: 300, // 5 minutes
        checkPeriod: 60, // cleanup every minute
    },
    defaults: {
        ttl: 300,
        namespace: 'default',
    },
};

// =====================================
// Memory Cache Layer
// =====================================

class MemoryCache {
    private store = new Map<string, CacheEntry<unknown>>();
    private stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
    private maxSize: number;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(config: CacheConfig['memory']) {
        this.maxSize = config.maxSize * 1024 * 1024; // Convert to bytes
        this.startCleanup(config.checkPeriod);
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key);

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        if (Date.now() > entry.expires) {
            this.store.delete(key);
            this.stats.misses++;
            return null;
        }

        entry.hits++;
        this.stats.hits++;
        return entry.value as T;
    }

    set<T>(key: string, value: T, ttl: number, tags?: string[]): boolean {
        // Check memory limit
        if (this.getMemorySize() > this.maxSize) {
            this.evictLRU();
        }

        this.store.set(key, {
            value,
            expires: Date.now() + ttl * 1000,
            createdAt: Date.now(),
            hits: 0,
            tags,
        });

        this.stats.sets++;
        return true;
    }

    delete(key: string): boolean {
        const deleted = this.store.delete(key);
        if (deleted) this.stats.deletes++;
        return deleted;
    }

    invalidateByTag(tag: string): number {
        let count = 0;
        for (const [key, entry] of this.store.entries()) {
            if (entry.tags?.includes(tag)) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    }

    invalidateByPattern(pattern: string): number {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        let count = 0;
        for (const key of this.store.keys()) {
            if (regex.test(key)) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    }

    clear(): void {
        this.store.clear();
    }

    getStats(): { hits: number; misses: number; sets: number; deletes: number; hitRate: number; entries: number; size: number; } {
        const total = this.stats.hits + this.stats.misses;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            sets: this.stats.sets,
            deletes: this.stats.deletes,
            hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
            entries: this.store.size,
            size: this.getMemorySize(),
        };
    }

    private getMemorySize(): number {
        let size = 0;
        for (const entry of this.store.values()) {
            size += JSON.stringify(entry).length * 2; // Approximate bytes
        }
        return size;
    }

    private evictLRU(): void {
        // Remove least recently used (lowest hits) entries
        const entries = Array.from(this.store.entries())
            .sort((a, b) => a[1].hits - b[1].hits)
            .slice(0, Math.ceil(this.store.size * 0.1)); // Remove 10%

        for (const [key] of entries) {
            this.store.delete(key);
        }
    }

    private startCleanup(intervalSeconds: number): void {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.store.entries()) {
                if (now > entry.expires) {
                    this.store.delete(key);
                }
            }
        }, intervalSeconds * 1000);
    }

    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.store.clear();
    }
}

// =====================================
// Redis Cache Layer
// =====================================

class RedisCache {
    private client: Redis | null = null;
    private connected = false;
    private stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
    private config: CacheConfig['redis'];

    constructor(config: CacheConfig['redis']) {
        this.config = config;
        this.connect();
    }

    private connect(): void {
        try {
            this.client = new Redis({
                host: this.config.host,
                port: this.config.port,
                password: this.config.password,
                db: this.config.db,
                keyPrefix: this.config.keyPrefix,
                maxRetriesPerRequest: this.config.maxRetriesPerRequest,
                enableReadyCheck: this.config.enableReadyCheck,
                lazyConnect: this.config.lazyConnect,
                retryStrategy: (times) => Math.min(times * 50, 2000),
            });

            this.client.on('connect', () => {
                this.connected = true;
                console.log('✅ Enterprise Cache: Redis connected');
            });

            this.client.on('error', (err) => {
                console.error('❌ Enterprise Cache: Redis error:', err.message);
                this.connected = false;
            });

            this.client.on('close', () => {
                this.connected = false;
            });
        } catch (error) {
            console.error('❌ Enterprise Cache: Failed to connect to Redis:', error);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.connected || !this.client) {
            return null;
        }

        try {
            const data = await this.client.get(key);
            if (!data) {
                this.stats.misses++;
                return null;
            }

            this.stats.hits++;
            return JSON.parse(data) as T;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttl: number): Promise<boolean> {
        if (!this.connected || !this.client) {
            return false;
        }

        try {
            await this.client.setex(key, ttl, JSON.stringify(value));
            this.stats.sets++;
            return true;
        } catch (error) {
            console.error('Redis set error:', error);
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        if (!this.connected || !this.client) {
            return false;
        }

        try {
            await this.client.del(key);
            this.stats.deletes++;
            return true;
        } catch (error) {
            console.error('Redis delete error:', error);
            return false;
        }
    }

    async invalidateByPattern(pattern: string): Promise<number> {
        if (!this.connected || !this.client) {
            return 0;
        }

        try {
            const keys = await this.client.keys(`${this.config.keyPrefix}${pattern}`);
            if (keys.length === 0) return 0;

            // Remove prefix before deleting
            const keysWithoutPrefix = keys.map(k => k.replace(this.config.keyPrefix, ''));
            await this.client.del(...keysWithoutPrefix);
            return keys.length;
        } catch (error) {
            console.error('Redis invalidate error:', error);
            return 0;
        }
    }

    async clear(): Promise<void> {
        if (!this.connected || !this.client) {
            return;
        }

        try {
            await this.client.flushdb();
        } catch (error) {
            console.error('Redis clear error:', error);
        }
    }

    async healthCheck(): Promise<boolean> {
        if (!this.connected || !this.client) {
            return false;
        }

        try {
            await this.client.ping();
            return true;
        } catch {
            return false;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }

    getStats(): { hits: number; misses: number; sets: number; deletes: number; connected: boolean; } {
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            sets: this.stats.sets,
            deletes: this.stats.deletes,
            connected: this.connected,
        };
    }

    async destroy(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }
}

// =====================================
// Enterprise Cache (Multi-layer)
// =====================================

class EnterpriseCache {
    private memoryCache: MemoryCache;
    private redisCache: RedisCache;
    private config: CacheConfig;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
        this.memoryCache = new MemoryCache(this.config.memory);
        this.redisCache = new RedisCache(this.config.redis);
    }

    /**
     * Get value from cache (memory first, then redis)
     */
    async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
        const fullKey = this.buildKey(key, options?.namespace);

        // Try memory cache first (faster)
        if (!options?.useRedisOnly) {
            const memoryResult = this.memoryCache.get<T>(fullKey);
            if (memoryResult !== null) {
                return memoryResult;
            }
        }

        // Try redis cache
        if (!options?.useMemoryOnly) {
            const redisResult = await this.redisCache.get<T>(fullKey);
            if (redisResult !== null) {
                // Store in memory for faster access next time
                const ttl = options?.ttl || this.config.defaults.ttl;
                this.memoryCache.set(fullKey, redisResult, Math.min(ttl, 60)); // Max 1 min in memory
                return redisResult;
            }
        }

        return null;
    }

    /**
     * Set value in cache (both layers)
     */
    async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
        const fullKey = this.buildKey(key, options?.namespace);
        const ttl = options?.ttl || this.config.defaults.ttl;

        let success = true;

        // Set in memory cache
        if (!options?.useRedisOnly) {
            this.memoryCache.set(fullKey, value, Math.min(ttl, 300), options?.tags); // Max 5 min in memory
        }

        // Set in redis cache
        if (!options?.useMemoryOnly) {
            const redisSuccess = await this.redisCache.set(fullKey, value, ttl);
            success = success && redisSuccess;
        }

        return success;
    }

    /**
     * Delete from cache (both layers)
     */
    async delete(key: string, options?: CacheOptions): Promise<boolean> {
        const fullKey = this.buildKey(key, options?.namespace);

        this.memoryCache.delete(fullKey);
        await this.redisCache.delete(fullKey);

        return true;
    }

    /**
     * Get or set pattern
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        options?: CacheOptions
    ): Promise<T> {
        const cached = await this.get<T>(key, options);
        if (cached !== null) {
            return cached;
        }

        const value = await fetcher();
        await this.set(key, value, options);
        return value;
    }

    /**
     * Invalidate by pattern
     */
    async invalidate(pattern: string, namespace?: string): Promise<number> {
        const fullPattern = namespace ? `${namespace}:${pattern}` : pattern;

        const memoryCount = this.memoryCache.invalidateByPattern(fullPattern);
        const redisCount = await this.redisCache.invalidateByPattern(fullPattern);

        return memoryCount + redisCount;
    }

    /**
     * Invalidate by tag
     */
    invalidateByTag(tag: string): number {
        return this.memoryCache.invalidateByTag(tag);
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        this.memoryCache.clear();
        await this.redisCache.clear();
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<{ memory: boolean; redis: boolean; }> {
        return {
            memory: true,
            redis: await this.redisCache.healthCheck(),
        };
    }

    /**
     * Get statistics
     */
    getStats(): CacheStats {
        const memoryStats = this.memoryCache.getStats();
        const redisStats = this.redisCache.getStats();

        return {
            hits: memoryStats.hits + redisStats.hits,
            misses: memoryStats.misses + redisStats.misses,
            sets: memoryStats.sets + redisStats.sets,
            deletes: memoryStats.deletes + redisStats.deletes,
            hitRate: memoryStats.hitRate,
            memorySize: memoryStats.size,
            redisConnected: redisStats.connected,
            memoryEntries: memoryStats.entries,
        };
    }

    /**
     * Build cache key with namespace
     */
    private buildKey(key: string, namespace?: string): string {
        const ns = namespace || this.config.defaults.namespace;
        return `${ns}:${key}`;
    }

    /**
     * Destroy cache connections
     */
    async destroy(): Promise<void> {
        this.memoryCache.destroy();
        await this.redisCache.destroy();
    }
}

// =====================================
// Singleton Instance & Exports
// =====================================

let cacheInstance: EnterpriseCache | null = null;

export function getCache(config?: Partial<CacheConfig>): EnterpriseCache {
    if (!cacheInstance) {
        cacheInstance = new EnterpriseCache(config);
    }
    return cacheInstance;
}

export const cache = getCache();

// Helper functions for backwards compatibility
export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 300,
    namespace = 'default'
): Promise<T> {
    return cache.getOrSet(key, fetcher, { ttl, namespace });
}

export async function invalidateCache(pattern: string, namespace?: string): Promise<number> {
    return cache.invalidate(pattern, namespace);
}

export async function clearCache(): Promise<void> {
    return cache.clear();
}

export { EnterpriseCache };
export default cache;
