// نظام إدارة الذاكرة المتقدم للاستقرار
import React from 'react';
interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
  timestamp: number;
}

interface MemoryAlert {
  level: 'warning' | 'critical';
  message: string;
  timestamp: number;
  usage: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

class MemoryManager {
  private static instance: MemoryManager;
  private observers: Array<(usage: MemoryUsage) => void> = [];
  private alertCallbacks: Array<(alert: MemoryAlert) => void> = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private history: MemoryUsage[] = [];
  private readonly maxHistorySize = 100;
  private readonly warningThreshold = 70; // 70%
  private readonly criticalThreshold = 85; // 85%
  private lastAlert: number = 0;
  private readonly alertCooldown = 30000; // 30 seconds

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // بدء مراقبة الذاكرة
  startMonitoring(intervalMs: number = 5000): void {
    if (typeof window === 'undefined') return;

    this.stopMonitoring(); // إيقاف المراقبة السابقة إن وجدت

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);

    console.log('Memory monitoring started');
  }

  // إيقاف مراقبة الذاكرة
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Memory monitoring stopped');
    }
  }

  // فحص استخدام الذاكرة
  private checkMemoryUsage(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const p: any = performance as any;
    if (p && typeof p.memory !== 'undefined') {
      const memInfo = p.memory as PerformanceMemory;
      const usage: MemoryUsage = {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        percentage: (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100,
        timestamp: Date.now()
      };

      this.addToHistory(usage);
      this.notifyObservers(usage);
      this.checkAlerts(usage);
    }
  }

  // إضافة لسجل الاستخدام
  private addToHistory(usage: MemoryUsage): void {
    this.history.push(usage);
    
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  // إشعار المراقبين
  private notifyObservers(usage: MemoryUsage): void {
    this.observers.forEach(callback => {
      try {
        callback(usage);
      } catch (error) {
        console.error('Error in memory observer:', error);
      }
    });
  }

  // فحص التنبيهات
  private checkAlerts(usage: MemoryUsage): void {
    const now = Date.now();
    
    // تجنب إرسال التنبيهات المتكررة
    if (now - this.lastAlert < this.alertCooldown) return;

    let alert: MemoryAlert | null = null;

    if (usage.percentage >= this.criticalThreshold) {
      alert = {
        level: 'critical',
        message: `استخدام الذاكرة حرج: ${usage.percentage.toFixed(1)}%`,
        timestamp: now,
        usage: usage.percentage
      };
    } else if (usage.percentage >= this.warningThreshold) {
      alert = {
        level: 'warning',
        message: `تحذير: استخدام الذاكرة عالي: ${usage.percentage.toFixed(1)}%`,
        timestamp: now,
        usage: usage.percentage
      };
    }

    if (alert) {
      this.lastAlert = now;
      this.notifyAlertCallbacks(alert);
      
      if (alert.level === 'critical') {
        this.performEmergencyCleanup();
      }
    }
  }

  // إشعار مستمعي التنبيهات
  private notifyAlertCallbacks(alert: MemoryAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  // تنظيف طارئ للذاكرة
  private performEmergencyCleanup(): void {
    console.warn('Performing emergency memory cleanup');

    // تنظيف الصور غير المستخدمة
    this.cleanupUnusedImages();
    
    // تنظيف Event Listeners القديمة
    this.cleanupEventListeners();
    
    // تشغيل Garbage Collection إن كان متاحاً
    this.requestGarbageCollection();
    
    // تنظيف التخزين المؤقت القديم
    this.cleanupOldCache();
  }

  // تنظيف الصور غير المستخدمة
  private cleanupUnusedImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // إزالة الصور المخفية أو غير المرئية
      if (img.offsetParent === null && !img.dataset.keepAlive) {
        img.src = '';
      }
    });
  }

  // تنظيف Event Listeners
  private cleanupEventListeners(): void {
    // تنظيف listeners القديمة (مثال بسيط)
    const oldElements = document.querySelectorAll('[data-old-listener]');
    oldElements.forEach(element => {
      // إزالة المعرف للسماح بـ garbage collection
      element.removeAttribute('data-old-listener');
    });
  }

  // طلب تشغيل Garbage Collection
  private requestGarbageCollection(): void {
    const w: any = window as any;
    if (w.gc && typeof w.gc === 'function') {
      try {
        w.gc();
        console.log('Garbage collection requested');
      } catch (error) {
        console.warn('Failed to request garbage collection:', error);
      }
    }
  }

  // تنظيف التخزين المؤقت القديم
  private cleanupOldCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const oldKeys = keys.filter(key => {
        if (key.startsWith('cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '');
            return Date.now() - item.timestamp > 60 * 60 * 1000; // أقدم من ساعة
          } catch {
            return true; // إزالة البيانات التالفة
          }
        }
        return false;
      });

      oldKeys.forEach(key => localStorage.removeItem(key));
      
      if (oldKeys.length > 0) {
        console.log(`Cleaned ${oldKeys.length} old cache items`);
      }
    } catch (error) {
      console.warn('Failed to cleanup old cache:', error);
    }
  }

  // إضافة مراقب لاستخدام الذاكرة
  onMemoryChange(callback: (usage: MemoryUsage) => void): () => void {
    this.observers.push(callback);
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  // إضافة مستمع للتنبيهات
  onAlert(callback: (alert: MemoryAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  // الحصول على إحصائيات الذاكرة
  getMemoryStats() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const p: any = performance as any;
    if (p && typeof p.memory !== 'undefined') {
      const memInfo = p.memory as PerformanceMemory;
      
      const current = {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        limit: memInfo.jsHeapSizeLimit,
        percentage: (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100
      };

      const trend = this.calculateTrend();
      
      return {
        current,
        trend,
        history: this.history.slice(-10), // آخر 10 قراءات
        alerts: {
          warningThreshold: this.warningThreshold,
          criticalThreshold: this.criticalThreshold,
          lastAlert: this.lastAlert
        }
      };
    }

    return null;
  }

  // حساب اتجاه استخدام الذاكرة
  private calculateTrend(): 'stable' | 'increasing' | 'decreasing' | 'unknown' {
    if (this.history.length < 5) return 'unknown';

    const recent = this.history.slice(-5);
    const older = this.history.slice(-10, -5);

    if (older.length === 0) return 'unknown';

    const recentAvg = recent.reduce((sum, item) => sum + item.percentage, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.percentage, 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (Math.abs(difference) < 2) return 'stable';
    if (difference > 0) return 'increasing';
    return 'decreasing';
  }

  // تنظيف يدوي للذاكرة
  forceCleanup(): void {
    console.log('Manual memory cleanup requested');
    this.performEmergencyCleanup();
  }
}

// Hook لاستخدام إدارة الذاكرة في React
export const useMemoryMonitor = () => {
  const memoryManager = MemoryManager.getInstance();

  React.useEffect(() => {
    memoryManager.startMonitoring();
    
    return () => {
      memoryManager.stopMonitoring();
    };
  }, [memoryManager]);

  return {
    getStats: () => memoryManager.getMemoryStats(),
    onMemoryChange: (callback: (usage: MemoryUsage) => void) => 
      memoryManager.onMemoryChange(callback),
    onAlert: (callback: (alert: MemoryAlert) => void) => 
      memoryManager.onAlert(callback),
    forceCleanup: () => memoryManager.forceCleanup()
  };
};

export type { MemoryUsage, MemoryAlert };
export default MemoryManager;
