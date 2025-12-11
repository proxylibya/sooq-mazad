/**
 * Performance Monitoring System
 * مراقبة أداء النظام و Database
 */

import { prisma } from '../prisma';

interface PerformanceMetrics {
  timestamp: Date;
  endpoint?: string;
  duration: number;
  success: boolean;
  error?: string;
}

const metricsStore: PerformanceMetrics[] = [];
const MAX_METRICS_STORE = 1000; // حفظ آخر 1000 طلب

/**
 * تسجيل أداء API
 */
export function logPerformance(metrics: PerformanceMetrics): void {
  metricsStore.push(metrics);

  // الحفاظ على الحد الأقصى
  if (metricsStore.length > MAX_METRICS_STORE) {
    metricsStore.shift();
  }

  // تحذير للطلبات البطيئة
  if (metrics.duration > 2000) {
    console.warn(`Slow API Response: ${metrics.endpoint} took ${metrics.duration}ms`);
  }
}

/**
 * الحصول على إحصائيات الأداء
 */
export function getPerformanceStats() {
  if (metricsStore.length === 0) {
    return null;
  }

  const durations = metricsStore.map((m) => m.duration);
  const successRate = (metricsStore.filter((m) => m.success).length / metricsStore.length) * 100;

  return {
    totalRequests: metricsStore.length,
    successRate: successRate.toFixed(2) + '%',
    averageDuration: (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) + 'ms',
    minDuration: Math.min(...durations) + 'ms',
    maxDuration: Math.max(...durations) + 'ms',
    last24h: metricsStore.filter((m) => m.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .length,
  };
}

/**
 * فحص صحة قاعدة البيانات
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  details: string;
}> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return {
      healthy: latency < 1000, // healthy إذا كان أقل من 1 ثانية
      latency,
      details:
        latency < 100
          ? 'Excellent'
          : latency < 500
            ? 'Good'
            : latency < 1000
              ? 'Acceptable'
              : 'Slow',
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

/**
 * الحصول على إحصائيات قاعدة البيانات
 */
export async function getDatabaseStats() {
  try {
    const [usersCount, carsCount, auctionsCount, showroomsCount] = await Promise.all([
      prisma.users.count(),
      prisma.cars.count(),
      prisma.auctions.count(),
      prisma.showrooms.count(),
    ]);

    return {
      connected: true,
      counts: {
        users: usersCount,
        cars: carsCount,
        auctions: auctionsCount,
        showrooms: showroomsCount,
      },
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Middleware wrapper لمراقبة أداء API
 */
export function withPerformanceMonitoring(
  handler: (req: any, res: any) => Promise<void>,
  endpointName: string,
) {
  return async (req: any, res: any) => {
    const start = Date.now();
    let success = true;
    let error: string | undefined;

    try {
      await handler(req, res);
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const duration = Date.now() - start;

      logPerformance({
        timestamp: new Date(),
        endpoint: endpointName,
        duration,
        success,
        error,
      });
    }
  };
}

/**
 * Get slow queries report
 */
export function getSlowQueriesReport() {
  const slowQueries = metricsStore
    .filter((m) => m.duration > 1000)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 20); // Top 20 slow queries

  return {
    count: slowQueries.length,
    queries: slowQueries.map((q) => ({
      endpoint: q.endpoint,
      duration: q.duration + 'ms',
      timestamp: q.timestamp,
      success: q.success,
    })),
  };
}
