/**
 * 🏥 Enterprise Health Check System
 * نظام مراقبة صحة النظام المتقدم
 */

import { PrismaClient } from '@prisma/client';
import { cache } from '../cache/enterprise-cache';

// =====================================
// Types & Interfaces
// =====================================

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    checks: ServiceCheck[];
    summary: {
        total: number;
        healthy: number;
        degraded: number;
        unhealthy: number;
    };
}

export interface ServiceCheck {
    name: string;
    status: 'up' | 'degraded' | 'down';
    latency?: number;
    message?: string;
    details?: Record<string, unknown>;
    lastCheck: string;
}

export interface HealthCheckConfig {
    timeout: number;
    interval: number;
    services: string[];
}

// =====================================
// Health Check System
// =====================================

class HealthCheckSystem {
    private startTime = Date.now();
    private lastResults = new Map<string, ServiceCheck>();
    private checkInterval: NodeJS.Timeout | null = null;
    private prisma: PrismaClient | null = null;

    constructor() {
        this.initializePrisma();
    }

    private async initializePrisma(): Promise<void> {
        try {
            this.prisma = new PrismaClient();
        } catch (error) {
            console.error('Failed to initialize Prisma for health checks');
        }
    }

    /**
     * فحص صحة النظام الشامل
     */
    async check(): Promise<HealthStatus> {
        const checks: ServiceCheck[] = [];

        // فحص الخدمات المختلفة
        const [
            databaseCheck,
            cacheCheck,
            memoryCheck,
            diskCheck,
        ] = await Promise.allSettled([
            this.checkDatabase(),
            this.checkCache(),
            this.checkMemory(),
            this.checkDisk(),
        ]);

        // جمع النتائج
        if (databaseCheck.status === 'fulfilled') checks.push(databaseCheck.value);
        if (cacheCheck.status === 'fulfilled') checks.push(cacheCheck.value);
        if (memoryCheck.status === 'fulfilled') checks.push(memoryCheck.value);
        if (diskCheck.status === 'fulfilled') checks.push(diskCheck.value);

        // حساب الملخص
        const summary = {
            total: checks.length,
            healthy: checks.filter(c => c.status === 'up').length,
            degraded: checks.filter(c => c.status === 'degraded').length,
            unhealthy: checks.filter(c => c.status === 'down').length,
        };

        // تحديد الحالة العامة
        let overallStatus: HealthStatus['status'] = 'healthy';
        if (summary.unhealthy > 0) {
            overallStatus = 'unhealthy';
        } else if (summary.degraded > 0) {
            overallStatus = 'degraded';
        }

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            checks,
            summary,
        };
    }

    /**
     * فحص قاعدة البيانات
     */
    async checkDatabase(): Promise<ServiceCheck> {
        const start = Date.now();
        const name = 'database';

        try {
            if (!this.prisma) {
                return {
                    name,
                    status: 'down',
                    message: 'Prisma client not initialized',
                    lastCheck: new Date().toISOString(),
                };
            }

            // اختبار اتصال بسيط
            await this.prisma.$queryRaw`SELECT 1`;
            const latency = Date.now() - start;

            // التحقق من الأداء
            let status: ServiceCheck['status'] = 'up';
            if (latency > 1000) {
                status = 'degraded';
            }

            const result: ServiceCheck = {
                name,
                status,
                latency,
                message: status === 'up' ? 'Database is healthy' : 'High latency detected',
                lastCheck: new Date().toISOString(),
                details: {
                    provider: 'PostgreSQL',
                    latencyMs: latency,
                },
            };

            this.lastResults.set(name, result);
            return result;
        } catch (error) {
            const result: ServiceCheck = {
                name,
                status: 'down',
                latency: Date.now() - start,
                message: error instanceof Error ? error.message : 'Database connection failed',
                lastCheck: new Date().toISOString(),
            };

            this.lastResults.set(name, result);
            return result;
        }
    }

    /**
     * فحص الكاش
     */
    async checkCache(): Promise<ServiceCheck> {
        const start = Date.now();
        const name = 'cache';

        try {
            const health = await cache.healthCheck();
            const latency = Date.now() - start;

            let status: ServiceCheck['status'] = 'up';
            let message = 'Cache systems healthy';

            if (!health.redis && !health.memory) {
                status = 'down';
                message = 'All cache systems down';
            } else if (!health.redis) {
                status = 'degraded';
                message = 'Redis unavailable, using memory cache only';
            }

            const result: ServiceCheck = {
                name,
                status,
                latency,
                message,
                lastCheck: new Date().toISOString(),
                details: {
                    redis: health.redis,
                    memory: health.memory,
                    stats: cache.getStats(),
                },
            };

            this.lastResults.set(name, result);
            return result;
        } catch (error) {
            const result: ServiceCheck = {
                name,
                status: 'down',
                latency: Date.now() - start,
                message: error instanceof Error ? error.message : 'Cache check failed',
                lastCheck: new Date().toISOString(),
            };

            this.lastResults.set(name, result);
            return result;
        }
    }

    /**
     * فحص الذاكرة
     */
    async checkMemory(): Promise<ServiceCheck> {
        const name = 'memory';

        try {
            const usage = process.memoryUsage();
            const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
            const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
            const rssMB = Math.round(usage.rss / 1024 / 1024);
            const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;

            let status: ServiceCheck['status'] = 'up';
            let message = 'Memory usage normal';

            if (usagePercent > 90) {
                status = 'down';
                message = 'Critical memory usage';
            } else if (usagePercent > 75) {
                status = 'degraded';
                message = 'High memory usage';
            }

            const result: ServiceCheck = {
                name,
                status,
                message,
                lastCheck: new Date().toISOString(),
                details: {
                    heapUsedMB,
                    heapTotalMB,
                    rssMB,
                    usagePercent: Math.round(usagePercent),
                },
            };

            this.lastResults.set(name, result);
            return result;
        } catch (error) {
            return {
                name,
                status: 'down',
                message: error instanceof Error ? error.message : 'Memory check failed',
                lastCheck: new Date().toISOString(),
            };
        }
    }

    /**
     * فحص المساحة التخزينية
     */
    async checkDisk(): Promise<ServiceCheck> {
        const name = 'disk';

        // فحص بسيط - في الإنتاج يمكن استخدام مكتبة disk-space
        const result: ServiceCheck = {
            name,
            status: 'up',
            message: 'Disk check simplified',
            lastCheck: new Date().toISOString(),
        };

        this.lastResults.set(name, result);
        return result;
    }

    /**
     * فحص سريع (للـ load balancer)
     */
    async quickCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string; }> {
        try {
            // فحص سريع للـ database فقط
            if (this.prisma) {
                await this.prisma.$queryRaw`SELECT 1`;
            }
            return { status: 'ok', timestamp: new Date().toISOString() };
        } catch {
            return { status: 'error', timestamp: new Date().toISOString() };
        }
    }

    /**
     * فحص جاهزية التطبيق (Kubernetes readiness)
     */
    async readinessCheck(): Promise<boolean> {
        try {
            const health = await this.check();
            return health.status !== 'unhealthy';
        } catch {
            return false;
        }
    }

    /**
     * فحص حيوية التطبيق (Kubernetes liveness)
     */
    async livenessCheck(): Promise<boolean> {
        try {
            // التطبيق حي إذا كان يستجيب
            return true;
        } catch {
            return false;
        }
    }

    /**
     * الحصول على آخر النتائج
     */
    getLastResults(): Map<string, ServiceCheck> {
        return this.lastResults;
    }

    /**
     * الحصول على وقت التشغيل
     */
    getUptime(): number {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    /**
     * بدء المراقبة الدورية
     */
    startMonitoring(intervalMs = 30000): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        this.checkInterval = setInterval(async () => {
            try {
                await this.check();
            } catch (error) {
                console.error('Health check monitoring error:', error);
            }
        }, intervalMs);

        console.log(`✅ Health monitoring started (interval: ${intervalMs}ms)`);
    }

    /**
     * إيقاف المراقبة
     */
    stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('Health monitoring stopped');
        }
    }

    /**
     * تنظيف الموارد
     */
    async destroy(): Promise<void> {
        this.stopMonitoring();
        if (this.prisma) {
            await this.prisma.$disconnect();
        }
    }
}

// =====================================
// Singleton & Exports
// =====================================

export const healthCheck = new HealthCheckSystem();

export default healthCheck;
