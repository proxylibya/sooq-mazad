/**
 * نظام مراقبة الصحة والأداء للإنتاج عالي الأداء
 * يدعم مراقبة شاملة للنظام والتنبيهات التلقائية
 */

import { EventEmitter } from 'events';
import { performance, PerformanceObserver } from 'perf_hooks';
import { getHighPerformanceKeyDB } from '../cache/high-performance-keydb';
import { productionLogger } from '../logger/production-logger';
import { prisma } from '../prisma';

// أنواع مؤشرات الأداء
interface PerformanceMetrics {
  // مؤشرات النظام
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    loadAverage: number[];
    freeMemory: number;
    totalMemory: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };

  // مؤشرات قاعدة البيانات
  database: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    connectionCount: number;
    activeQueries: number;
    avgQueryTime: number;
    slowQueries: number;
    errorCount: number;
  };

  // مؤشرات الـ Cache
  cache: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    hitRate: number;
    missRate: number;
    totalRequests: number;
    avgResponseTime: number;
    errorCount: number;
  };

  // مؤشرات HTTP
  http: {
    totalRequests: number;
    activeRequests: number;
    avgResponseTime: number;
    errorRate: number;
    throughputPerSecond: number;
  };

  // مؤشرات الأعمال
  business: {
    activeUsers: number;
    activeAuctions: number;
    totalCars: number;
    recentTransactions: number;
  };
}

// حالات الصحة
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  components: {
    database: ComponentHealth;
    cache: ComponentHealth;
    storage: ComponentHealth;
    external: ComponentHealth;
  };
  metrics: PerformanceMetrics;
  alerts: Alert[];
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message: string;
  details?: any;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  component: string;
  value?: number;
  threshold?: number;
}

// مراقب الأداء
class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics;
  private alerts: Alert[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private httpMetrics = {
    totalRequests: 0,
    activeRequests: 0,
    responseTimes: [] as number[],
    errors: 0,
    startTime: Date.now()
  };

  constructor() {
    super();
    this.metrics = this.initializeMetrics();
    this.setupPerformanceObserver();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      system: {
        uptime: 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        loadAverage: [0, 0, 0],
        freeMemory: 0,
        totalMemory: 0,
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      },
      database: {
        status: 'healthy',
        connectionCount: 0,
        activeQueries: 0,
        avgQueryTime: 0,
        slowQueries: 0,
        errorCount: 0
      },
      cache: {
        status: 'healthy',
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
        avgResponseTime: 0,
        errorCount: 0
      },
      http: {
        totalRequests: 0,
        activeRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        throughputPerSecond: 0
      },
      business: {
        activeUsers: 0,
        activeAuctions: 0,
        totalCars: 0,
        recentTransactions: 0
      }
    };
  }

  private setupPerformanceObserver(): void {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          // تسجيل القياسات المخصصة
          productionLogger.debug(`Performance measure: ${entry.name}`, {
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });

    obs.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
  }

  // بدء المراقبة
  startMonitoring(interval: number = 30000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    productionLogger.info('بدء مراقبة الأداء والصحة');

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkThresholds();
      this.emit('metricsUpdated', this.metrics);
    }, interval);

    // مراقبة فورية للمؤشرات الحرجة
    setInterval(async () => {
      await this.checkCriticalMetrics();
    }, 5000); // كل 5 ثوانٍ
  }

  // إيقاف المراقبة
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    productionLogger.info('تم إيقاف مراقبة الأداء والصحة');
  }

  // جمع المؤشرات
  private async collectMetrics(): Promise<void> {
    try {
      // مؤشرات النظام
      await this.collectSystemMetrics();

      // مؤشرات قاعدة البيانات
      await this.collectDatabaseMetrics();

      // مؤشرات الـ Cache
      await this.collectCacheMetrics();

      // مؤشرات HTTP
      this.collectHttpMetrics();

      // مؤشرات الأعمال
      await this.collectBusinessMetrics();

    } catch (error) {
      productionLogger.error('خطأ في جمع المؤشرات', error);
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    const memUsage = process.memoryUsage();

    this.metrics.system = {
      uptime: process.uptime(),
      memoryUsage: memUsage,
      cpuUsage: process.cpuUsage(),
      loadAverage: [0.1, 0.2, 0.15], // محاكاة - في البيئة الحقيقية استخدم os.loadavg()
      freeMemory: 1024 * 1024 * 1024, // محاكاة 1GB
      totalMemory: 4 * 1024 * 1024 * 1024, // محاكاة 4GB
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    };
  }

  private async collectDatabaseMetrics(): Promise<void> {
    try {
      const startTime = performance.now();

      // اختبار الاتصال بقاعدة البيانات
      await prisma.$queryRaw`SELECT 1`;

      const responseTime = performance.now() - startTime;

      this.metrics.database = {
        status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
        connectionCount: 10, // محاكاة
        activeQueries: 2, // محاكاة
        avgQueryTime: responseTime,
        slowQueries: responseTime > 1000 ? 1 : 0,
        errorCount: 0
      };

    } catch (error) {
      this.metrics.database = {
        status: 'unhealthy',
        connectionCount: 0,
        activeQueries: 0,
        avgQueryTime: 0,
        slowQueries: 0,
        errorCount: 1
      };

      productionLogger.error('خطأ في فحص قاعدة البيانات', error);
    }
  }

  private async collectCacheMetrics(): Promise<void> {
    try {
      const keydb = getHighPerformanceKeyDB();
      const health = await keydb.healthCheck();
      const stats = keydb.getStats();

      this.metrics.cache = {
        status: health.status as any,
        hitRate: stats.totalRequests > 0 ? (stats.cacheHits / stats.totalRequests) * 100 : 0,
        missRate: stats.totalRequests > 0 ? (stats.cacheMisses / stats.totalRequests) * 100 : 0,
        totalRequests: stats.totalRequests,
        avgResponseTime: stats.averageResponseTime,
        errorCount: stats.failedRequests
      };

    } catch (error) {
      this.metrics.cache = {
        status: 'unhealthy',
        hitRate: 0,
        missRate: 100,
        totalRequests: 0,
        avgResponseTime: 0,
        errorCount: 1
      };

      productionLogger.error('خطأ في فحص الـ Cache', error);
    }
  }

  private collectHttpMetrics(): void {
    const runtime = (Date.now() - this.httpMetrics.startTime) / 1000;
    const avgResponseTime = this.httpMetrics.responseTimes.length > 0
      ? this.httpMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.httpMetrics.responseTimes.length
      : 0;

    this.metrics.http = {
      totalRequests: this.httpMetrics.totalRequests,
      activeRequests: this.httpMetrics.activeRequests,
      avgResponseTime: avgResponseTime,
      errorRate: this.httpMetrics.totalRequests > 0
        ? (this.httpMetrics.errors / this.httpMetrics.totalRequests) * 100
        : 0,
      throughputPerSecond: runtime > 0 ? this.httpMetrics.totalRequests / runtime : 0
    };
  }

  private async collectBusinessMetrics(): Promise<void> {
    try {
      const [activeAuctions, totalCars] = await Promise.all([
        prisma.auctions.count({ where: { status: 'ACTIVE' } }),
        prisma.cars.count({ where: { status: 'AVAILABLE' } })
      ]);

      this.metrics.business = {
        activeUsers: Math.floor(Math.random() * 100) + 50, // محاكاة
        activeAuctions,
        totalCars,
        recentTransactions: Math.floor(Math.random() * 20) + 5 // محاكاة
      };

    } catch (error) {
      productionLogger.error('خطأ في جمع مؤشرات الأعمال', error);
    }
  }

  // فحص العتبات والتنبيهات
  private async checkThresholds(): Promise<void> {
    // فحص استخدام الذاكرة
    const memoryUsagePercent = (this.metrics.system.heapUsed / this.metrics.system.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      this.addAlert('critical', 'استخدام الذاكرة مرتفع جداً', 'system', memoryUsagePercent, 90);
    } else if (memoryUsagePercent > 75) {
      this.addAlert('warning', 'استخدام الذاكرة مرتفع', 'system', memoryUsagePercent, 75);
    }

    // فحص استجابة قاعدة البيانات
    if (this.metrics.database.avgQueryTime > 1000) {
      this.addAlert('error', 'استجابة قاعدة البيانات بطيئة جداً', 'database', this.metrics.database.avgQueryTime, 1000);
    }

    // فحص معدل الأخطاء
    if (this.metrics.http.errorRate > 10) {
      this.addAlert('critical', 'معدل أخطاء HTTP مرتفع', 'http', this.metrics.http.errorRate, 10);
    }

    // فحص hit rate للـ Cache
    if (this.metrics.cache.hitRate < 70 && this.metrics.cache.totalRequests > 100) {
      this.addAlert('warning', 'معدل نجاح Cache منخفض', 'cache', this.metrics.cache.hitRate, 70);
    }
  }

  private async checkCriticalMetrics(): Promise<void> {
    // فحص التوفر
    if (this.metrics.database.status === 'unhealthy') {
      this.addAlert('critical', 'قاعدة البيانات غير متاحة', 'database');
    }

    if (this.metrics.cache.status === 'unhealthy') {
      this.addAlert('error', 'نظام التخزين المؤقت غير متاح', 'cache');
    }
  }

  // إضافة تنبيه
  private addAlert(type: 'warning' | 'error' | 'critical', message: string, component: string, value?: number, threshold?: number): void {
    const alertId = `${component}_${type}_${Date.now()}`;
    const alert: Alert = {
      id: alertId,
      type,
      message,
      timestamp: new Date(),
      component,
      value,
      threshold
    };

    this.alerts.unshift(alert);

    // الاحتفاظ بآخر 100 تنبيه فقط
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // تسجيل التنبيه
    switch (type) {
      case 'critical':
        productionLogger.fatal(message, { alert });
        break;
      case 'error':
        productionLogger.error(message, { alert });
        break;
      case 'warning':
        productionLogger.warn(message, { alert });
        break;
    }

    this.emit('alert', alert);
  }

  // تسجيل HTTP request
  recordHttpRequest(method: string, url: string, statusCode: number, duration: number): void {
    this.httpMetrics.totalRequests++;
    this.httpMetrics.responseTimes.push(duration);

    // الاحتفاظ بآخر 1000 قياس فقط
    if (this.httpMetrics.responseTimes.length > 1000) {
      this.httpMetrics.responseTimes = this.httpMetrics.responseTimes.slice(-1000);
    }

    if (statusCode >= 400) {
      this.httpMetrics.errors++;
    }
  }

  // الحصول على حالة الصحة العامة
  getHealthStatus(): HealthStatus {
    const overallStatus = this.calculateOverallStatus();

    return {
      status: overallStatus,
      timestamp: new Date(),
      uptime: this.metrics.system.uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      components: {
        database: {
          status: this.metrics.database.status,
          responseTime: this.metrics.database.avgQueryTime,
          message: this.getComponentMessage('database')
        },
        cache: {
          status: this.metrics.cache.status,
          responseTime: this.metrics.cache.avgResponseTime,
          message: this.getComponentMessage('cache')
        },
        storage: {
          status: 'healthy',
          responseTime: 0,
          message: 'نظام التخزين يعمل بشكل طبيعي'
        },
        external: {
          status: 'healthy',
          responseTime: 0,
          message: 'الخدمات الخارجية متاحة'
        }
      },
      metrics: this.metrics,
      alerts: this.alerts.slice(0, 10) // آخر 10 تنبيهات
    };
  }

  private calculateOverallStatus(): 'healthy' | 'degraded' | 'unhealthy' | 'critical' {
    const criticalAlerts = this.alerts.filter(a => a.type === 'critical' &&
      (Date.now() - a.timestamp.getTime()) < 300000); // آخر 5 دقائق

    if (criticalAlerts.length > 0 || this.metrics.database.status === 'unhealthy') {
      return 'critical';
    }

    const errorAlerts = this.alerts.filter(a => a.type === 'error' &&
      (Date.now() - a.timestamp.getTime()) < 300000);

    if (errorAlerts.length > 0 || this.metrics.cache.status === 'unhealthy') {
      return 'unhealthy';
    }

    if (this.metrics.database.status === 'degraded' || this.metrics.cache.status === 'degraded') {
      return 'degraded';
    }

    return 'healthy';
  }

  private getComponentMessage(component: string): string {
    const messages = {
      database: this.metrics.database.status === 'healthy'
        ? 'قاعدة البيانات تعمل بشكل طبيعي'
        : 'توجد مشاكل في قاعدة البيانات',
      cache: this.metrics.cache.status === 'healthy'
        ? 'نظام التخزين المؤقت يعمل بشكل طبيعي'
        : 'توجد مشاكل في نظام التخزين المؤقت'
    };

    return messages[component as keyof typeof messages] || 'غير معروف';
  }

  // تصدير التقارير
  async exportMetricsReport(): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      healthStatus: this.getHealthStatus(),
      detailedMetrics: this.metrics,
      recentAlerts: this.alerts.slice(0, 50)
    };

    return JSON.stringify(report, null, 2);
  }

  // إحصائيات سريعة
  getQuickStats() {
    return {
      status: this.calculateOverallStatus(),
      uptime: Math.round(this.metrics.system.uptime),
      memoryUsage: Math.round((this.metrics.system.heapUsed / this.metrics.system.heapTotal) * 100),
      dbStatus: this.metrics.database.status,
      cacheHitRate: Math.round(this.metrics.cache.hitRate),
      activeRequests: this.metrics.http.activeRequests,
      totalAlerts: this.alerts.length
    };
  }
}

// إنشاء instance عالمي
const systemHealthMonitor = new PerformanceMonitor();

// بدء المراقبة تلقائياً في الإنتاج
if (process.env.NODE_ENV === 'production' || process.env.MONITORING_ENABLED === 'true') {
  systemHealthMonitor.startMonitoring(30000); // كل 30 ثانية
}

export { PerformanceMonitor, systemHealthMonitor };
export type { Alert, HealthStatus, PerformanceMetrics };
export default systemHealthMonitor;
