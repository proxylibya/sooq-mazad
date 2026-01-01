/**
 * نظام مراقبة أداء مُعطل لتحسين الأداء
 * Disabled Performance Monitoring for Better Performance
 */

// تعطيل النظام بالكامل لتحسين الأداء
const MONITORING_DISABLED = true;

// واجهة مقاييس الأداء
export interface PerformanceMetrics {
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  metadata?: Record<string, any>;
  status: 'STARTED' | 'COMPLETED' | 'FAILED';
  errorCount?: number;
  warningCount?: number;
}

// واجهة إحصائيات النظام
export interface SystemStats {
  timestamp: string;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeOperations: number;
  totalOperations: number;
  errorRate: number;
  averageResponseTime: number;
}

// فئة مراقب الأداء
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private completedOperations: PerformanceMetrics[] = [];
  private maxHistorySize = 1000;
  private startTime = Date.now();
  private cpuUsageStart: NodeJS.CpuUsage | undefined;

  private constructor() {
    // فقط في بيئة Node.js (الخادم)
    if (typeof process !== 'undefined' && process.cpuUsage) {
      this.cpuUsageStart = process.cpuUsage();
      this.startPeriodicReporting();
    }
  }

  // الحصول على المثيل الوحيد
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // بدء تتبع عملية - مُعطل لتحسين الأداء
  public startOperation(_operationName: string, _metadata?: Record<string, any>): string {
    return 'disabled';
  }

  // إنهاء تتبع عملية بنجاح
  public completeOperation(
    operationId: string,
    additionalMetadata?: Record<string, any>,
  ): PerformanceMetrics | null {
    const metrics = this.metrics.get(operationId);
    if (!metrics) {
      console.warn(`[Performance] عملية غير موجودة: ${operationId}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metrics.startTime;
    const currentMemory = typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : undefined;
    const currentCpu = typeof process !== 'undefined' && process.cpuUsage && metrics.cpuUsage ? process.cpuUsage(metrics.cpuUsage) : undefined;

    const completedMetrics: PerformanceMetrics = {
      ...metrics,
      endTime,
      duration,
      memoryUsage: currentMemory,
      cpuUsage: currentCpu,
      metadata: { ...metrics.metadata, ...additionalMetadata },
      status: 'COMPLETED',
    };

    this.metrics.delete(operationId);
    this.addToHistory(completedMetrics);

    // تسجيل العملية المكتملة
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] اكتملت العملية: ${metrics.operationName}`, {
        operationId,
        duration,
      });
    }

    // تحذير إذا كانت العملية بطيئة
    if (duration > 5000) {
      // أكثر من 5 ثوان
      console.warn(`[Performance] تحذير عملية بطيئة: ${metrics.operationName}`, {
        operationId,
        duration,
        threshold: 5000,
      });
    }

    return completedMetrics;
  }

  // إنهاء تتبع عملية بفشل
  public failOperation(
    operationId: string,
    error: any,
    additionalMetadata?: Record<string, any>,
  ): PerformanceMetrics | null {
    const metrics = this.metrics.get(operationId);
    if (!metrics) {
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metrics.startTime;

    const failedMetrics: PerformanceMetrics = {
      ...metrics,
      endTime,
      duration,
      metadata: {
        ...metrics.metadata,
        ...additionalMetadata,
        error: error.message || error,
        errorType: error.constructor.name,
      },
      status: 'FAILED',
      errorCount: 1,
    };

    this.metrics.delete(operationId);
    this.addToHistory(failedMetrics);

    console.error(`[Performance] فشلت العملية: ${metrics.operationName}`, {
      operationId,
      duration,
      error: error.message || error,
    });

    return failedMetrics;
  }

  // إضافة إلى التاريخ
  private addToHistory(metrics: PerformanceMetrics): void {
    this.completedOperations.push(metrics);

    // الحفاظ على حجم التاريخ
    if (this.completedOperations.length > this.maxHistorySize) {
      this.completedOperations = this.completedOperations.slice(-this.maxHistorySize);
    }
  }

  // حساب الفرق في استخدام الذاكرة
  private calculateMemoryDelta(
    before: NodeJS.MemoryUsage,
    after: NodeJS.MemoryUsage,
  ): Record<string, number> {
    return {
      rss: after.rss - before.rss,
      heapUsed: after.heapUsed - before.heapUsed,
      heapTotal: after.heapTotal - before.heapTotal,
      external: after.external - before.external,
    };
  }

  // الحصول على إحصائيات النظام
  public getSystemStats(): SystemStats {
    const now = Date.now();
    const uptime = now - this.startTime;
    const recentOperations = this.completedOperations.filter(
      (op) => op.endTime && now - op.endTime < 60000, // آخر دقيقة
    );

    const errorCount = recentOperations.filter((op) => op.status === 'FAILED').length;
    const errorRate = recentOperations.length > 0 ? errorCount / recentOperations.length : 0;

    const totalDuration = recentOperations.reduce((sum, op) => sum + (op.duration || 0), 0);
    const averageResponseTime =
      recentOperations.length > 0 ? totalDuration / recentOperations.length : 0;

    return {
      timestamp: new Date().toISOString(),
      uptime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(this.cpuUsageStart),
      activeOperations: this.metrics.size,
      totalOperations: this.completedOperations.length,
      errorRate,
      averageResponseTime,
    };
  }

  // الحصول على العمليات النشطة
  public getActiveOperations(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // الحصول على العمليات المكتملة حديثاً
  public getRecentOperations(limit: number = 50): PerformanceMetrics[] {
    return this.completedOperations.slice(-limit).reverse();
  }

  // الحصول على إحصائيات العمليات
  public getOperationStats(operationName?: string): {
    total: number;
    successful: number;
    failed: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
  } {
    const operations = operationName
      ? this.completedOperations.filter((op) => op.operationName === operationName)
      : this.completedOperations;

    const successful = operations.filter((op) => op.status === 'COMPLETED').length;
    const failed = operations.filter((op) => op.status === 'FAILED').length;

    const durations = operations
      .filter((op) => op.duration !== undefined)
      .map((op) => op.duration!);

    const averageDuration =
      durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

    return {
      total: operations.length,
      successful,
      failed,
      averageDuration,
      minDuration: durations.length > 0 ? Math.min(...durations) : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
    };
  }

  // تقرير دوري عن الأداء
  private startPeriodicReporting(): void {
    setInterval(() => {
      const stats = this.getSystemStats();

      // تسجيل إحصائيات النظام
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance] إحصائيات النظام الدورية', {
          uptime: stats.uptime,
          activeOperations: stats.activeOperations,
          errorRate: stats.errorRate,
        });
      }

      // تحذيرات الأداء
      if (stats.memoryUsage.heapUsed > 500 * 1024 * 1024) {
        // أكثر من 500MB
        console.warn('[Performance] تحذير استخدام ذاكرة عالي', {
          heapUsed: stats.memoryUsage.heapUsed,
          threshold: 500 * 1024 * 1024,
        });
      }

      if (stats.errorRate > 0.1) {
        // أكثر من 10% أخطاء
        console.warn('[Performance] تحذير معدل أخطاء عالي', {
          errorRate: stats.errorRate,
          threshold: 0.1,
        });
      }

      if (stats.averageResponseTime > 3000) {
        // أكثر من 3 ثوان
        console.warn('[Performance] تحذير وقت استجابة بطيء', {
          averageResponseTime: stats.averageResponseTime,
          threshold: 3000,
        });
      }
    }, 60000); // كل دقيقة
  }

  // تنظيف البيانات القديمة
  public cleanup(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 ساعة

    this.completedOperations = this.completedOperations.filter(
      (op) => op.endTime && op.endTime > cutoffTime,
    );

    console.log('[Performance] تم تنظيف بيانات الأداء القديمة', {
      remainingOperations: this.completedOperations.length,
    });
  }
}

// دوال مساعدة للاستخدام السريع
export const performanceMonitor = PerformanceMonitor.getInstance();

export const trackOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>,
): Promise<T> => {
  const operationId = performanceMonitor.startOperation(operationName, metadata);

  try {
    const result = await operation();
    performanceMonitor.completeOperation(operationId);
    return result;
  } catch (error) {
    performanceMonitor.failOperation(operationId, error);
    throw error;
  }
};

export const trackSyncOperation = <T>(
  operationName: string,
  operation: () => T,
  metadata?: Record<string, any>,
): T => {
  const operationId = performanceMonitor.startOperation(operationName, metadata);

  try {
    const result = operation();
    performanceMonitor.completeOperation(operationId);
    return result;
  } catch (error) {
    performanceMonitor.failOperation(operationId, error);
    throw error;
  }
};

// Decorator للتتبع التلقائي
export function TrackPerformance(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      return trackOperation(name, () => method.apply(this, args));
    };
  };
}

// Middleware لتتبع طلبات API
export const performanceMiddleware = () => {
  return (req: any, res: any, next: any) => {
    const operationName = `API ${req.method} ${req.path}`;
    const operationId = performanceMonitor.startOperation(operationName, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // تتبع انتهاء الطلب
    const originalSend = res.send;
    res.send = function (data: any) {
      performanceMonitor.completeOperation(operationId, {
        statusCode: res.statusCode,
        responseSize: Buffer.byteLength(data || '', 'utf8'),
      });

      return originalSend.call(this, data);
    };

    // تتبع الأخطاء
    res.on('error', (error: any) => {
      performanceMonitor.failOperation(operationId, error);
    });

    next();
  };
};

export default PerformanceMonitor;
