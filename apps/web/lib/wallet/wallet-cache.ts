/**
 * نظام التخزين المؤقت للمحفظة
 * Wallet Cache System
 *
 * @description إدارة الـ Cache لعمليات المحفظة باستخدام KeyDB/Redis
 */

import { keydb } from '@/lib/keydb';

// ============================================
// Cache Keys
// ============================================

export const CACHE_KEYS = {
    // Wallet balance keys
    WALLET_BALANCE: (userId: string) => `wallet:balance:${userId}`,
    MULTI_WALLET_BALANCE: (userId: string) => `wallet:multi:${userId}`,

    // Transaction keys
    USER_TRANSACTIONS: (userId: string, page: number) =>
        `wallet:transactions:${userId}:page:${page}`,
    TRANSACTION_STATS: (userId: string) => `wallet:stats:${userId}`,

    // Exchange rates
    EXCHANGE_RATES: 'wallet:exchange_rates',
    EXCHANGE_RATE: (from: string, to: string) => `wallet:rate:${from}:${to}`,

    // Payment methods
    PAYMENT_METHODS: (type: string) => `wallet:payment_methods:${type}`,

    // User limits
    USER_DAILY_USAGE: (userId: string) => `wallet:daily:${userId}`,
    USER_MONTHLY_USAGE: (userId: string) => `wallet:monthly:${userId}`,

    // Rate limiting
    RATE_LIMIT: (userId: string, action: string) =>
        `wallet:ratelimit:${action}:${userId}`,
};

// ============================================
// Cache TTL (Time To Live) in seconds
// ============================================

export const CACHE_TTL = {
    // Short-lived cache (1 minute)
    BALANCE: 60,

    // Medium cache (5 minutes)
    TRANSACTIONS: 5 * 60,
    PAYMENT_METHODS: 5 * 60,

    // Long cache (1 hour)
    EXCHANGE_RATES: 60 * 60,
    STATS: 60 * 60,

    // Daily reset
    DAILY_USAGE: 24 * 60 * 60,

    // Monthly reset
    MONTHLY_USAGE: 30 * 24 * 60 * 60,

    // Rate limiting windows
    RATE_LIMIT_MINUTE: 60,
    RATE_LIMIT_HOUR: 60 * 60,
};

// ============================================
// Wallet Cache Class
// ============================================

export class WalletCache {
    private static instance: WalletCache;

    private constructor() { }

    static getInstance(): WalletCache {
        if (!WalletCache.instance) {
            WalletCache.instance = new WalletCache();
        }
        return WalletCache.instance;
    }

    // ============================================
    // Generic Cache Operations
    // ============================================

    /**
     * الحصول على قيمة من الـ cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (!keydb) return null;

        try {
            const cached = await keydb.get(key);
            if (!cached) return null;
            return cached as T;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * حفظ قيمة في الـ cache
     */
    async set<T>(key: string, value: T, ttl: number = CACHE_TTL.BALANCE): Promise<boolean> {
        if (!keydb) return false;

        try {
            await keydb.set(key, value, ttl);
            return true;
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * حذف قيمة من الـ cache
     */
    async delete(key: string): Promise<boolean> {
        if (!keydb) return false;

        try {
            await keydb.del(key);
            return true;
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * حذف جميع المفاتيح بنمط معين
     */
    async deletePattern(pattern: string): Promise<boolean> {
        if (!keydb) return false;

        try {
            // KeyDB/Redis pattern matching
            const keys = await keydb.keys(pattern);
            if (keys && keys.length > 0) {
                await Promise.all(keys.map((k: string) => keydb.del(k)));
            }
            return true;
        } catch (error) {
            console.error(`Cache deletePattern error for ${pattern}:`, error);
            return false;
        }
    }

    // ============================================
    // Wallet-Specific Operations
    // ============================================

    /**
     * الحصول على رصيد المحفظة من الـ cache
     */
    async getWalletBalance(userId: string): Promise<{
        local: number;
        global: number;
        crypto: number;
    } | null> {
        const key = CACHE_KEYS.MULTI_WALLET_BALANCE(userId);
        return this.get(key);
    }

    /**
     * حفظ رصيد المحفظة في الـ cache
     */
    async setWalletBalance(
        userId: string,
        balance: { local: number; global: number; crypto: number; }
    ): Promise<boolean> {
        const key = CACHE_KEYS.MULTI_WALLET_BALANCE(userId);
        return this.set(key, balance, CACHE_TTL.BALANCE);
    }

    /**
     * إبطال cache رصيد المحفظة
     */
    async invalidateWalletBalance(userId: string): Promise<boolean> {
        const key = CACHE_KEYS.MULTI_WALLET_BALANCE(userId);
        const singleKey = CACHE_KEYS.WALLET_BALANCE(userId);
        await this.delete(singleKey);
        return this.delete(key);
    }

    // ============================================
    // Transaction Cache Operations
    // ============================================

    /**
     * الحصول على معاملات المستخدم من الـ cache
     */
    async getTransactions(
        userId: string,
        page: number = 1
    ): Promise<unknown[] | null> {
        const key = CACHE_KEYS.USER_TRANSACTIONS(userId, page);
        return this.get(key);
    }

    /**
     * حفظ معاملات المستخدم في الـ cache
     */
    async setTransactions(
        userId: string,
        page: number,
        transactions: unknown[]
    ): Promise<boolean> {
        const key = CACHE_KEYS.USER_TRANSACTIONS(userId, page);
        return this.set(key, transactions, CACHE_TTL.TRANSACTIONS);
    }

    /**
     * إبطال cache المعاملات
     */
    async invalidateTransactions(userId: string): Promise<boolean> {
        const pattern = `wallet:transactions:${userId}:*`;
        return this.deletePattern(pattern);
    }

    // ============================================
    // Exchange Rate Cache Operations
    // ============================================

    /**
     * الحصول على أسعار الصرف من الـ cache
     */
    async getExchangeRates(): Promise<Record<string, number> | null> {
        return this.get(CACHE_KEYS.EXCHANGE_RATES);
    }

    /**
     * حفظ أسعار الصرف في الـ cache
     */
    async setExchangeRates(rates: Record<string, number>): Promise<boolean> {
        return this.set(CACHE_KEYS.EXCHANGE_RATES, rates, CACHE_TTL.EXCHANGE_RATES);
    }

    // ============================================
    // Rate Limiting Operations
    // ============================================

    /**
     * التحقق من rate limit
     */
    async checkRateLimit(
        userId: string,
        action: string,
        limit: number,
        windowSeconds: number
    ): Promise<{ allowed: boolean; remaining: number; resetIn: number; }> {
        if (!keydb) {
            return { allowed: true, remaining: limit, resetIn: 0 };
        }

        const key = CACHE_KEYS.RATE_LIMIT(userId, action);

        try {
            const current = await keydb.get<number>(key);
            const count = current ? Number(current) : 0;

            if (count >= limit) {
                const ttl = keydb.ttl ? await keydb.ttl(key) : windowSeconds;
                return { allowed: false, remaining: 0, resetIn: ttl };
            }

            // Increment counter using set (since incr is not available)
            const newCount = count + 1;
            await keydb.set(key, newCount, windowSeconds);

            return {
                allowed: true,
                remaining: limit - newCount,
                resetIn: windowSeconds,
            };
        } catch (error) {
            console.error(`Rate limit check error:`, error);
            return { allowed: true, remaining: limit, resetIn: 0 };
        }
    }

    // ============================================
    // Usage Tracking Operations
    // ============================================

    /**
     * الحصول على الاستخدام اليومي
     */
    async getDailyUsage(userId: string): Promise<number> {
        const key = CACHE_KEYS.USER_DAILY_USAGE(userId);
        const usage = await this.get<number>(key);
        return usage || 0;
    }

    /**
     * تحديث الاستخدام اليومي
     */
    async updateDailyUsage(userId: string, amount: number): Promise<boolean> {
        const key = CACHE_KEYS.USER_DAILY_USAGE(userId);
        const current = await this.getDailyUsage(userId);
        return this.set(key, current + amount, CACHE_TTL.DAILY_USAGE);
    }

    /**
     * الحصول على الاستخدام الشهري
     */
    async getMonthlyUsage(userId: string): Promise<number> {
        const key = CACHE_KEYS.USER_MONTHLY_USAGE(userId);
        const usage = await this.get<number>(key);
        return usage || 0;
    }

    /**
     * تحديث الاستخدام الشهري
     */
    async updateMonthlyUsage(userId: string, amount: number): Promise<boolean> {
        const key = CACHE_KEYS.USER_MONTHLY_USAGE(userId);
        const current = await this.getMonthlyUsage(userId);
        return this.set(key, current + amount, CACHE_TTL.MONTHLY_USAGE);
    }
}

// Export singleton instance
export const walletCache = WalletCache.getInstance();
