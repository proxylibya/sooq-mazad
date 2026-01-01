interface MetricData {
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface AggregatedMetric {
  avg: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
  count: number;
  lastUpdated: number;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics = new Map<string, MetricData[]>();
  private readonly maxDataPoints = 1000;
  private readonly retentionTime = 24 * 60 * 60 * 1000; // 24 ساعة

  private constructor() {
    // تنظيف دوري للبيانات القديمة
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // كل ساعة
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  // تسجيل قياس جديد
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const timestamp = Date.now();
    const metricData: MetricData = { value, timestamp, metadata };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const dataPoints = this.metrics.get(name)!;
    dataPoints.push(metricData);

    // الحفاظ على الحد الأقصى لنقاط البيانات
    if (dataPoints.length > this.maxDataPoints) {
      dataPoints.shift();
    }
  }

  // تسجيل وقت الاستجابة
  recordResponseTime(endpoint: string, duration: number, statusCode?: number): void {
    this.recordMetric(`response_time_${endpoint}`, duration, {
      statusCode,
      endpoint,
    });
  }

  // تسجيل استخدام الذاكرة
  recordMemoryUsage(): void {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const heapPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

    this.recordMetric('memory_heap_used', heapUsedMB);
    this.recordMetric('memory_heap_total', heapTotalMB);
    this.recordMetric('memory_heap_percentage', heapPercentage);
  }

  // تسجيل عدد الطلبات
  recordRequestCount(endpoint: string, method: string, statusCode: number): void {
    this.recordMetric(`requests_${endpoint}_${method}`, 1, {
      endpoint,
      method,
      statusCode,
    });
  }

  // تسجيل أخطاء
  recordError(errorType: string, endpoint?: string): void {
    this.recordMetric(`errors_${errorType}`, 1, {
      errorType,
      endpoint,
    });
  }

  // حساب النسب المئوية
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)] || 0;
  }

  // تجميع البيانات لقياس معين
  getAggregatedMetric(name: string, timeWindow?: number): AggregatedMetric | null {
    const dataPoints = this.metrics.get(name);
    if (!dataPoints || dataPoints.length === 0) {
      return null;
    }

    const cutoffTime = timeWindow ? Date.now() - timeWindow : 0;
    const validPoints = dataPoints.filter((point) => point.timestamp > cutoffTime);

    if (validPoints.length === 0) {
      return null;
    }

    const values = validPoints.map((point) => point.value);
    const sum = values.reduce((acc, val) => acc + val, 0);

    return {
      avg: Math.round((sum / values.length) * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
      p95: this.calculatePercentile(values, 0.95),
      p99: this.calculatePercentile(values, 0.99),
      count: values.length,
      lastUpdated: Math.max(...validPoints.map((p) => p.timestamp)),
    };
  }

  // الحصول على جميع القياسات المتاحة
  getAllMetrics(timeWindow?: number): Record<string, AggregatedMetric> {
    const result: Record<string, AggregatedMetric> = {};

    for (const [name] of this.metrics) {
      const aggregated = this.getAggregatedMetric(name, timeWindow);
      if (aggregated) {
        result[name] = aggregated;
      }
    }

    return result;
  }

  // إحصائيات سريعة للنظام
  getSystemStats(): {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    activeMetrics: number;
  } {
    return {
      uptime: Math.round(process.uptime()),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeMetrics: this.metrics.size,
    };
  }

  // تنظيف البيانات القديمة
  private cleanup(): void {
    const cutoffTime = Date.now() - this.retentionTime;
    let totalCleaned = 0;

    for (const [name, dataPoints] of this.metrics) {
      const beforeCount = dataPoints.length;
      const filtered = dataPoints.filter((point) => point.timestamp > cutoffTime);

      if (filtered.length !== beforeCount) {
        this.metrics.set(name, filtered);
        totalCleaned += beforeCount - filtered.length;
      }

      // حذف القياسات الفارغة
      if (filtered.length === 0) {
        this.metrics.delete(name);
      }
    }

    if (totalCleaned > 0) {
      console.log(`تم تنظيف ${totalCleaned} نقطة بيانات قديمة من القياسات`);
    }
  }

  // إعادة تعيين جميع القياسات
  reset(): void {
    this.metrics.clear();
  }

  // تصدير البيانات لملف
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      systemStats: this.getSystemStats(),
      metrics: this.getAllMetrics(),
    };

    return JSON.stringify(data, null, 2);
  }
}

// Singleton instance
export const metricsCollector = MetricsCollector.getInstance();

// Helper functions للاستخدام السريع
export const recordResponseTime = (endpoint: string, duration: number, statusCode?: number) => {
  metricsCollector.recordResponseTime(endpoint, duration, statusCode);
};

export const recordError = (errorType: string, endpoint?: string) => {
  metricsCollector.recordError(errorType, endpoint);
};

export const recordMemoryUsage = () => {
  metricsCollector.recordMemoryUsage();
};

export const getMetrics = (timeWindow?: number) => {
  return metricsCollector.getAllMetrics(timeWindow);
};
