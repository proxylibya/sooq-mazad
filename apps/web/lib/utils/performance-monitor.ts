/**
 * أداة مراقبة الأداء
 * لقياس سرعة العمليات في Development
 */

class PerformanceMonitor {
  private metrics: Map<string, number>;
  private enabled: boolean;

  constructor() {
    this.metrics = new Map();
    this.enabled = process.env.NODE_ENV === 'development';
  }

  /**
   * بدء قياس عملية
   */
  start(name: string): void {
    if (!this.enabled) return;
    this.metrics.set(name, Date.now());
  }

  /**
   * إنهاء قياس عملية
   */
  end(name: string): number | null {
    if (!this.enabled) return null;

    const startTime = this.metrics.get(name);
    if (!startTime) return null;

    const duration = Date.now() - startTime;
    this.metrics.delete(name);

    console.log(`[Performance] ${name}: ${duration}ms`);
    return duration;
  }

  /**
   * قياس دالة async
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * قياس دالة sync
   */
  measureSync<T>(name: string, fn: () => T): T {
    this.start(name);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

// Singleton
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;

/**
 * Helper function للاستخدام السريع
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return performanceMonitor.measure(name, fn);
}

export function measureSync<T>(name: string, fn: () => T): T {
  return performanceMonitor.measureSync(name, fn);
}
