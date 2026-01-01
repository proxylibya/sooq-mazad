/**
 * High Performance KeyDB - نظام تخزين مؤقت عالي الأداء
 */
import { cache as unifiedCache, getOrSetCache as unifiedGetOrSet } from './unified-cache';

// تصدير cache و getOrSetCache
export const cache = unifiedCache;
export const getOrSetCache = unifiedGetOrSet;
export const keydbClient = unifiedCache;

// ============================================
// High Performance KeyDB Instance
// ============================================

export interface HighPerformanceKeyDBConfig {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
}

let highPerformanceInstance: typeof import('./unified-cache').cache | null = null;

/**
 * الحصول على مثيل KeyDB عالي الأداء
 */
export async function getHighPerformanceKeyDB(config?: HighPerformanceKeyDBConfig) {
    if (highPerformanceInstance) {
        return highPerformanceInstance;
    }

    const { cache } = await import('./unified-cache');
    highPerformanceInstance = cache;
    return highPerformanceInstance;
}

/**
 * فحص صحة اتصال KeyDB
 */
export async function checkKeyDBHealth(): Promise<{
    healthy: boolean;
    latency: number;
    error?: string;
}> {
    const start = Date.now();
    try {
        const { cache } = await import('./unified-cache');
        await cache.set('health_check', 'ok', 10);
        const value = await cache.get('health_check');
        const latency = Date.now() - start;

        return {
            healthy: value === 'ok',
            latency
        };
    } catch (err) {
        return {
            healthy: false,
            latency: Date.now() - start,
            error: err instanceof Error ? err.message : 'Unknown error'
        };
    }
}

/**
 * إحصائيات KeyDB
 */
export async function getKeyDBStats(): Promise<{
    connected: boolean;
    memoryUsage?: number;
    keysCount?: number;
}> {
    try {
        const { cache } = await import('./unified-cache');
        const exists = await cache.exists('health_check');
        return {
            connected: true,
            keysCount: exists ? 1 : 0
        };
    } catch {
        return {
            connected: false
        };
    }
}
