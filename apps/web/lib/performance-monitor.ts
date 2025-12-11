// نظام مراقبة الأداء المتقدم
// استخدام دالة وقت آمنة للعمل على المتصفح والسيرفر
const safeNow = () => {
  try {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    if (typeof globalThis !== 'undefined') {
      const gp = (globalThis as unknown as { performance?: { now?: () => number } }).performance;
      if (gp && typeof gp.now === 'function') return gp.now();
    }
  } catch (_) {}
  return Date.now();
};

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  additionalInfo?: Record<string, unknown>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // بدء قياس الوقت
  startTimer(name: string): void {
    this.timers.set(name, safeNow());
  }

  // إنهاء قياس الوقت وتسجيل النتيجة
  endTimer(name: string, additionalInfo?: Record<string, unknown>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer ${name} not found`);
      return 0;
    }

    const duration = safeNow() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      additionalInfo
    });

    return duration;
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // حفظ في localStorage للمطورين
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('performance_metrics') || '[]';
        const existing: PerformanceMetric[] = JSON.parse(stored);
        existing.push(metric);
        // الاحتفاظ بآخر 100 متريك فقط
        if (existing.length > 100) {
          existing.splice(0, existing.length - 100);
        }
        localStorage.setItem('performance_metrics', JSON.stringify(existing.slice(-100)));
      } catch {
        // تجاهل أخطاء التخزين
      }
    }

    // طباعة في console في بيئة التطوير
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${metric.name} = ${metric.value}${metric.unit}`);
    }
  }

  // قياس أداء API
  async measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    this.startTimer(`api_${name}`);
    try {
      const result = await apiCall();
      this.endTimer(`api_${name}`, { success: true });
      return result;
    } catch (error: unknown) {
      this.endTimer(`api_${name}`, {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  // قياس أداء تحميل المكونات
  measureComponentRender(componentName: string): () => void {
    this.startTimer(`component_${componentName}`);
    
    return () => {
      this.endTimer(`component_${componentName}`);
    };
  }

  // الحصول على الإحصائيات
  getStats(): {
    totalMetrics: number;
    averageApiTime: number;
    slowestApi: PerformanceMetric | null;
    componentRenderTimes: PerformanceMetric[];
  } {
    const apiMetrics = this.metrics.filter(m => m.name.startsWith('api_'));
    const componentMetrics = this.metrics.filter(m => m.name.startsWith('component_'));

    const averageApiTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
      : 0;

    const slowestApi = apiMetrics.length > 0
      ? apiMetrics.reduce((prev, current) => 
          prev.value > current.value ? prev : current)
      : null;

    return {
      totalMetrics: this.metrics.length,
      averageApiTime,
      slowestApi,
      componentRenderTimes: componentMetrics
    };
  }

  // تنظيف الذاكرة
  clearMetrics(): void {
    this.metrics = [];
    this.timers.clear();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('performance_metrics');
    }
  }

  // إرسال إحصائيات للخادم (اختياري)
  async sendToServer(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metrics,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });
      
      this.clearMetrics();
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }
}

// Hook لاستخدام مراقب الأداء في React
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();

  return {
    startTimer: monitor.startTimer.bind(monitor),
    endTimer: monitor.endTimer.bind(monitor),
    measureApiCall: monitor.measureApiCall.bind(monitor),
    measureComponentRender: monitor.measureComponentRender.bind(monitor),
    getStats: monitor.getStats.bind(monitor)
  };
};

// Decorator لقياس أداء الدوال
export const measurePerformance = (name: string) => {
  return function (target: object, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value as (this: unknown, ...args: unknown[]) => unknown | Promise<unknown>;
    const monitor = PerformanceMonitor.getInstance();

    descriptor.value = async function (...args: unknown[]) {
      const self = this as { constructor?: { name?: string } } | undefined;
      const fallback = `${self?.constructor?.name || 'Fn'}_${propertyName}`;
      const timerLabel = name && name.length > 0 ? name : fallback;
      monitor.startTimer(timerLabel);
      
      try {
        const result = await Promise.resolve(method.apply(this, args));
        monitor.endTimer(timerLabel, { success: true });
        return result;
      } catch (error) {
        monitor.endTimer(timerLabel, { success: false });
        throw error;
      }
    };
  };
};

export default PerformanceMonitor;
