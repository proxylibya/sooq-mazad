import { NextApiRequest, NextApiResponse } from 'next';
import { getKeyDBClient } from './keydb';

interface PerformanceMetric {
  timestamp: number;
  url: string;
  method: string;
  duration: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  userAgent?: string;
  ipAddress?: string;
}

interface SystemMetrics {
  timestamp: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
}

class PerformanceMonitor {
  private keydbClient = getKeyDBClient();
  private metrics: PerformanceMetric[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private startTime = process.hrtime();
  private initialCpuUsage = process.cpuUsage();

  constructor() {
    // جمع معايير النظام كل 30 ثانية
    setInterval(() => this.collectSystemMetrics(), 30000);

    // تنظيف المعايير القديمة كل 10 دقائق
    setInterval(() => this.cleanupOldMetrics(), 600000);
  }

  // مراقبة طلب API
  async monitorRequest(
    req: NextApiRequest,
    res: NextApiResponse,
    handler: () => Promise<void>,
  ): Promise<void> {
    const startTime = process.hrtime();
    const startCpuUsage = process.cpuUsage();

    this.requestCount++;

    try {
      await handler();
    } catch (error) {
      this.errorCount++;
      throw error;
    } finally {
      const endTime = process.hrtime(startTime);
      const endCpuUsage = process.cpuUsage(startCpuUsage);

      const duration = endTime[0] * 1000 + endTime[1] / 1000000; // milliseconds

      const metric: PerformanceMetric = {
        timestamp: Date.now(),
        url: req.url || '',
        method: req.method || 'GET',
        duration,
        statusCode: res.statusCode,
        memoryUsage: process.memoryUsage(),
        cpuUsage: endCpuUsage,
        userAgent: req.headers['user-agent'],
        ipAddress: this.getClientIP(req),
      };

      await this.saveMetric(metric);

      // إضافة headers للأداء
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
      res.setHeader('X-Memory-Usage', `${Math.round(metric.memoryUsage.heapUsed / 1024 / 1024)}MB`);
    }
  }

  // جمع معايير النظام
  private async collectSystemMetrics(): Promise<void> {
    const currentTime = process.hrtime(this.startTime);
    const currentCpuUsage = process.cpuUsage(this.initialCpuUsage);
    const uptime = currentTime[0] * 1000 + currentTime[1] / 1000000;

    // حساب معدل الطلبات في الثانية الواحدة
    const timeWindowMs = 30000; // 30 ثانية
    const recentMetrics = this.metrics.filter((m) => Date.now() - m.timestamp < timeWindowMs);
    const requestsPerSecond = (recentMetrics.length / timeWindowMs) * 1000;

    // حساب معدل الأخطاء
    const recentErrors = recentMetrics.filter((m) => m.statusCode >= 400);
    const errorRate =
      recentMetrics.length > 0 ? (recentErrors.length / recentMetrics.length) * 100 : 0;

    const systemMetric: SystemMetrics = {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: currentCpuUsage,
      uptime,
      activeConnections: this.getActiveConnections(),
      requestsPerSecond,
      errorRate,
    };

    this.systemMetrics.push(systemMetric);
    await this.saveSystemMetric(systemMetric);

    // إنذار إذا كان الأداء ضعيف
    this.checkPerformanceAlerts(systemMetric);
  }

  // فحص تنبيهات الأداء
  private checkPerformanceAlerts(metric: SystemMetrics): void {
    const memoryUsageMB = metric.memoryUsage.heapUsed / 1024 / 1024;

    // تنبيه استخدام الذاكرة (أكثر من 512 MB)
    if (memoryUsageMB > 512) {
      console.warn(`⚠️ استخدام ذاكرة عالي: ${memoryUsageMB.toFixed(2)} MB`);
    }

    // تنبيه معدل الأخطاء (أكثر من 5%)
    if (metric.errorRate > 5) {
      console.warn(`⚠️ معدل أخطاء عالي: ${metric.errorRate.toFixed(2)}%`);
    }

    // تنبيه معدل الطلبات العالي (أكثر من 100 طلب/ثانية)
    if (metric.requestsPerSecond > 100) {
      console.warn(`⚠️ معدل طلبات عالي: ${metric.requestsPerSecond.toFixed(2)} req/sec`);
    }
  }

  // حفظ معايير الطلب
  private async saveMetric(metric: PerformanceMetric): Promise<void> {
    // حفظ في الذاكرة المحلية
    this.metrics.push(metric);

    // الاحتفاظ بآخر 1000 معاملة فقط في الذاكرة
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // حفظ في KeyDB إذا متوفر
    if (this.keydbClient) {
      const key = `perf_metric:${Date.now()}:${Math.random()}`;
      await this.keydbClient.setex(key, 3600, JSON.stringify(metric)); // ساعة واحدة
    }
  }

  // حفظ معايير النظام
  private async saveSystemMetric(metric: SystemMetrics): Promise<void> {
    // حفظ في الذاكرة المحلية
    this.systemMetrics.push(metric);

    // الاحتفاظ بآخر 100 معاملة فقط
    if (this.systemMetrics.length > 100) {
      this.systemMetrics = this.systemMetrics.slice(-100);
    }

    // حفظ في KeyDB
    if (this.keydbClient) {
      const key = `sys_metric:${Date.now()}`;
      await this.keydbClient.setex(key, 7200, JSON.stringify(metric)); // ساعتان
    }
  }

  // تنظيف المعايير القديمة
  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    this.metrics = this.metrics.filter((m) => m.timestamp > oneHourAgo);
    this.systemMetrics = this.systemMetrics.filter((m) => m.timestamp > oneHourAgo);
  }

  // الحصول على إحصائيات الأداء
  async getPerformanceStats(timeWindow: number = 3600000): Promise<{
    averageResponseTime: number;
    requestCount: number;
    errorRate: number;
    slowRequests: number;
    topSlowEndpoints: Array<{
      url: string;
      avgDuration: number;
      count: number;
    }>;
    memoryTrend: Array<{ timestamp: number; usage: number }>;
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  }> {
    const cutoffTime = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoffTime);
    const recentSystemMetrics = this.systemMetrics.filter((m) => m.timestamp > cutoffTime);

    // حساب متوسط زمن الاستجابة
    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = recentMetrics.length > 0 ? totalDuration / recentMetrics.length : 0;

    // حساب معدل الأخطاء
    const errorMetrics = recentMetrics.filter((m) => m.statusCode >= 400);
    const errorRate =
      recentMetrics.length > 0 ? (errorMetrics.length / recentMetrics.length) * 100 : 0;

    // الطلبات البطيئة (أكثر من 1000ms)
    const slowRequests = recentMetrics.filter((m) => m.duration > 1000).length;

    // أبطأ endpoints
    const endpointStats = new Map<string, { totalDuration: number; count: number }>();

    recentMetrics.forEach((m) => {
      const key = `${m.method} ${m.url}`;
      const existing = endpointStats.get(key) || { totalDuration: 0, count: 0 };
      existing.totalDuration += m.duration;
      existing.count += 1;
      endpointStats.set(key, existing);
    });

    const topSlowEndpoints = Array.from(endpointStats.entries())
      .map(([url, stats]) => ({
        url,
        avgDuration: stats.totalDuration / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    // اتجاه استخدام الذاكرة
    const memoryTrend = recentSystemMetrics.map((m) => ({
      timestamp: m.timestamp,
      usage: m.memoryUsage.heapUsed / 1024 / 1024, // MB
    }));

    // تقييم صحة النظام
    let systemHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

    if (
      averageResponseTime > 2000 ||
      errorRate > 10 ||
      memoryTrend[memoryTrend.length - 1]?.usage > 800
    ) {
      systemHealth = 'poor';
    } else if (
      averageResponseTime > 1000 ||
      errorRate > 5 ||
      memoryTrend[memoryTrend.length - 1]?.usage > 600
    ) {
      systemHealth = 'fair';
    } else if (
      averageResponseTime > 500 ||
      errorRate > 2 ||
      memoryTrend[memoryTrend.length - 1]?.usage > 400
    ) {
      systemHealth = 'good';
    }

    return {
      averageResponseTime: Math.round(averageResponseTime),
      requestCount: recentMetrics.length,
      errorRate: Math.round(errorRate * 100) / 100,
      slowRequests,
      topSlowEndpoints,
      memoryTrend,
      systemHealth,
    };
  }

  // الحصول على معايير الوقت الفعلي
  getRealTimeMetrics(): {
    currentMemoryUsage: number;
    requestsLastMinute: number;
    averageResponseTimeLast5Min: number;
    activeConnections: number;
  } {
    const oneMinuteAgo = Date.now() - 60000;
    const fiveMinutesAgo = Date.now() - 300000;

    const lastMinuteRequests = this.metrics.filter((m) => m.timestamp > oneMinuteAgo);
    const lastFiveMinuteRequests = this.metrics.filter((m) => m.timestamp > fiveMinutesAgo);

    const avgResponseTime =
      lastFiveMinuteRequests.length > 0
        ? lastFiveMinuteRequests.reduce((sum, m) => sum + m.duration, 0) /
          lastFiveMinuteRequests.length
        : 0;

    return {
      currentMemoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      requestsLastMinute: lastMinuteRequests.length,
      averageResponseTimeLast5Min: Math.round(avgResponseTime),
      activeConnections: this.getActiveConnections(),
    };
  }

  private getClientIP(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0]
      : req.connection.remoteAddress;
    return ip || 'unknown';
  }

  private getActiveConnections(): number {
    // تقدير تقريبي - يمكن تحسينه
    return this.metrics.filter((m) => Date.now() - m.timestamp < 5000).length;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Middleware لمراقبة الأداء
export function withPerformanceMonitoring(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return performanceMonitor.monitorRequest(req, res, () => handler(req, res));
  };
}

// دالة لإنشاء تقرير أداء شامل
export async function generatePerformanceReport(): Promise<string> {
  const stats = await performanceMonitor.getPerformanceStats();
  const realTime = performanceMonitor.getRealTimeMetrics();

  const report = `
📊 تقرير الأداء - ${new Date().toLocaleString('ar-EG')}

🏥 صحة النظام: ${
    stats.systemHealth === 'excellent'
      ? '🟢 ممتاز'
      : stats.systemHealth === 'good'
        ? '🟡 جيد'
        : stats.systemHealth === 'fair'
          ? '🟠 مقبول'
          : '🔴 ضعيف'
  }

⚡ المعايير الحالية:
- استخدام الذاكرة: ${realTime.currentMemoryUsage} MB
- الطلبات في الدقيقة الأخيرة: ${realTime.requestsLastMinute}
- متوسط زمن الاستجابة (5 دقائق): ${realTime.averageResponseTimeLast5Min}ms
- الاتصالات النشطة: ${realTime.activeConnections}

📈 إحصائيات الساعة الأخيرة:
- إجمالي الطلبات: ${stats.requestCount}
- متوسط زمن الاستجابة: ${stats.averageResponseTime}ms
- معدل الأخطاء: ${stats.errorRate}%
- الطلبات البطيئة (>1s): ${stats.slowRequests}

🐌 أبطأ النقاط:
${stats.topSlowEndpoints
  .slice(0, 5)
  .map(
    (endpoint) =>
      `- ${endpoint.url}: ${Math.round(endpoint.avgDuration)}ms (${endpoint.count} طلب)`,
  )
  .join('\n')}

💾 اتجاه الذاكرة:
- الحد الأدنى: ${Math.min(...stats.memoryTrend.map((m) => m.usage)).toFixed(1)} MB
- الحد الأقصى: ${Math.max(...stats.memoryTrend.map((m) => m.usage)).toFixed(1)} MB
- الحالي: ${stats.memoryTrend[stats.memoryTrend.length - 1]?.usage.toFixed(1) || 0} MB
`;

  return report;
}
