/**
 * Advanced Memory Optimization System
 * نظام تحسين الذاكرة والتنظيف التلقائي
 */

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

interface MemoryThresholds {
  warning: number; // نسبة مئوية
  critical: number;
  cleanup: number;
}

/**
 * Memory Monitor - مراقبة استهلاك الذاكرة
 */
export class MemoryMonitor {
  private thresholds: MemoryThresholds = {
    warning: 70, // 70%
    critical: 85, // 85%
    cleanup: 90, // 90%
  };

  private cleanupCallbacks: (() => void)[] = [];
  private monitorInterval: NodeJS.Timeout | null = null;

  /**
   * بدء المراقبة
   */
  startMonitoring(intervalMs: number = 30000) {
    if (this.monitorInterval) return;

    this.monitorInterval = setInterval(() => {
      this.checkMemory();
    }, intervalMs);
  }

  /**
   * إيقاف المراقبة
   */
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * فحص الذاكرة
   */
  checkMemory() {
    const stats = this.getMemoryStats();
    const usagePercent = this.getUsagePercent();

    if (usagePercent >= this.thresholds.cleanup) {
      console.warn(`CRITICAL: Memory usage at ${usagePercent.toFixed(1)}% - Running cleanup`);
      this.runCleanup();
      this.forceGarbageCollection();
    } else if (usagePercent >= this.thresholds.critical) {
      console.warn(`WARNING: Memory usage at ${usagePercent.toFixed(1)}% - Consider cleanup`);
    } else if (usagePercent >= this.thresholds.warning) {
      console.log(`INFO: Memory usage at ${usagePercent.toFixed(1)}%`);
    }

    return stats;
  }

  /**
   * الحصول على إحصائيات الذاكرة
   */
  getMemoryStats(): MemoryStats {
    const mem = process.memoryUsage();
    return {
      heapUsed: this.formatBytes(mem.heapUsed),
      heapTotal: this.formatBytes(mem.heapTotal),
      external: this.formatBytes(mem.external),
      rss: this.formatBytes(mem.rss),
      arrayBuffers: this.formatBytes(mem.arrayBuffers),
    };
  }

  /**
   * حساب نسبة الاستخدام
   */
  getUsagePercent(): number {
    const mem = process.memoryUsage();
    return (mem.heapUsed / mem.heapTotal) * 100;
  }

  /**
   * تسجيل callback للتنظيف
   */
  registerCleanupCallback(callback: () => void) {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * تشغيل جميع cleanup callbacks
   */
  private runCleanup() {
    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Cleanup callback error:', error);
      }
    });
  }

  /**
   * إجبار Garbage Collection
   */
  private forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('Garbage collection triggered');
    } else {
      console.warn('Garbage collection not available. Run with --expose-gc flag');
    }
  }

  /**
   * تنسيق البايتات
   */
  private formatBytes(bytes: number): number {
    return Math.round((bytes / 1024 / 1024) * 100) / 100; // MB
  }

  /**
   * الحصول على تقرير مفصل
   */
  getDetailedReport() {
    const stats = this.getMemoryStats();
    const usagePercent = this.getUsagePercent();

    return {
      timestamp: new Date().toISOString(),
      usage: `${usagePercent.toFixed(1)}%`,
      stats,
      status:
        usagePercent >= this.thresholds.critical
          ? 'critical'
          : usagePercent >= this.thresholds.warning
            ? 'warning'
            : 'healthy',
      recommendations: this.getRecommendations(usagePercent),
    };
  }

  /**
   * توصيات بناءً على الاستخدام
   */
  private getRecommendations(usagePercent: number): string[] {
    const recommendations: string[] = [];

    if (usagePercent >= this.thresholds.critical) {
      recommendations.push('Immediate action required: Memory usage is critical');
      recommendations.push('Consider restarting the application');
      recommendations.push('Review memory leaks and large object allocations');
    } else if (usagePercent >= this.thresholds.warning) {
      recommendations.push('Monitor memory usage closely');
      recommendations.push('Consider running manual cleanup');
      recommendations.push('Review cache sizes and data retention policies');
    } else {
      recommendations.push('Memory usage is healthy');
    }

    return recommendations;
  }
}

/**
 * Object Pool - إعادة استخدام الكائنات
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(factory: () => T, reset: (obj: T) => void, maxSize: number = 100) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  /**
   * الحصول على كائن من Pool
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  /**
   * إرجاع كائن إلى Pool
   */
  release(obj: T) {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  /**
   * مسح Pool
   */
  clear() {
    this.pool = [];
  }

  /**
   * حجم Pool
   */
  size(): number {
    return this.pool.length;
  }
}

/**
 * WeakMap Cache - cache ذاتي التنظيف
 */
export class WeakMapCache<K extends object, V> {
  private cache = new WeakMap<K, V>();
  private strongRefs = new Set<K>();
  private maxStrongRefs: number;

  constructor(maxStrongRefs: number = 100) {
    this.maxStrongRefs = maxStrongRefs;
  }

  /**
   * وضع قيمة في Cache
   */
  set(key: K, value: V, keepStrong: boolean = false) {
    this.cache.set(key, value);

    if (keepStrong) {
      this.strongRefs.add(key);

      // تنظيف إذا تجاوزنا الحد
      if (this.strongRefs.size > this.maxStrongRefs) {
        const oldest = this.strongRefs.values().next().value;
        this.strongRefs.delete(oldest);
      }
    }
  }

  /**
   * جلب قيمة من Cache
   */
  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  /**
   * حذف من Cache
   */
  delete(key: K) {
    this.cache.delete(key);
    this.strongRefs.delete(key);
  }

  /**
   * مسح Strong References
   */
  clearStrong() {
    this.strongRefs.clear();
  }
}

/**
 * Memory Leak Detector - كشف تسرب الذاكرة
 */
export class MemoryLeakDetector {
  private snapshots: MemoryStats[] = [];
  private maxSnapshots: number = 10;

  /**
   * أخذ snapshot
   */
  takeSnapshot() {
    const monitor = new MemoryMonitor();
    const stats = monitor.getMemoryStats();

    this.snapshots.push(stats);

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return stats;
  }

  /**
   * كشف تسرب محتمل
   */
  detectLeak(): {
    detected: boolean;
    trend: string;
    growthRate: number;
  } {
    if (this.snapshots.length < 3) {
      return { detected: false, trend: 'insufficient-data', growthRate: 0 };
    }

    // حساب الاتجاه
    const firstHeap = this.snapshots[0].heapUsed;
    const lastHeap = this.snapshots[this.snapshots.length - 1].heapUsed;
    const growth = lastHeap - firstHeap;
    const growthRate = (growth / firstHeap) * 100;

    // كشف تسرب: نمو ثابت أكثر من 20%
    const detected = growthRate > 20;
    const trend = growth > 0 ? 'increasing' : 'stable';

    return {
      detected,
      trend,
      growthRate: Math.round(growthRate * 100) / 100,
    };
  }

  /**
   * الحصول على تقرير
   */
  getReport() {
    const leak = this.detectLeak();

    return {
      snapshots: this.snapshots,
      leak,
      recommendations: leak.detected
        ? [
            'Potential memory leak detected',
            'Review event listeners and intervals',
            'Check for circular references',
            'Monitor cache sizes',
          ]
        : ['No memory leak detected'],
    };
  }
}

// Instances عامة
export const memoryMonitor = new MemoryMonitor();
export const memoryLeakDetector = new MemoryLeakDetector();

/**
 * تشغيل المراقبة التلقائية في Development
 */
if (process.env.NODE_ENV === 'development') {
  memoryMonitor.startMonitoring(60000); // كل دقيقة

  // أخذ snapshot كل 5 دقائق
  setInterval(() => {
    memoryLeakDetector.takeSnapshot();
  }, 300000);
}
