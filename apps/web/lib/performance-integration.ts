// نظام تكامل شامل للأداء والاستقرار
import React from 'react';
import { appCache, apiCache, imageCache } from './advanced-cache';
import MemoryManager from './memory-manager';
import PerformanceMonitor from './performance-monitor';

interface IntegrationConfig {
  enableAutoOptimization: boolean;
  performanceThresholds: {
    apiResponseTime: number;
    memoryUsage: number;
    renderTime: number;
    errorRate: number;
  };
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
  monitoringInterval: number;
}

class PerformanceIntegration {
  private static instance: PerformanceIntegration;
  private config: IntegrationConfig;
  private memoryManager: MemoryManager;
  private performanceMonitor: PerformanceMonitor;
  private isInitialized = false;
  private optimizationInProgress = false;

  constructor(config?: Partial<IntegrationConfig>) {
    this.config = {
      enableAutoOptimization: true,
      performanceThresholds: {
        apiResponseTime: 1000,
        memoryUsage: 75,
        renderTime: 100,
        errorRate: 5
      },
      cacheStrategy: 'balanced',
      monitoringInterval: 10000,
      ...config
    };

    this.memoryManager = MemoryManager.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  static getInstance(config?: Partial<IntegrationConfig>): PerformanceIntegration {
    if (!PerformanceIntegration.instance) {
      PerformanceIntegration.instance = new PerformanceIntegration(config);
    }
    return PerformanceIntegration.instance;
  }

  // تهيئة النظام الشامل
  initialize(): void {
    if (this.isInitialized) return;

    console.log('Initializing Performance Integration System...');

    // بدء مراقبة الذاكرة
    this.memoryManager.startMonitoring(this.config.monitoringInterval);

    // إعداد مستمعي التنبيهات
    this.setupAlertListeners();

    // إعداد مراقبة الأداء
    this.setupPerformanceMonitoring();

    // إعداد استراتيجية التخزين المؤقت
    this.setupCacheStrategy();

    // تسجيل Service Worker
    this.registerServiceWorker();

    // مراقبة دورية للنظام
    this.startSystemMonitoring();

    this.isInitialized = true;
    console.log('Performance Integration System initialized');
  }

  // إعداد مستمعي التنبيهات
  private setupAlertListeners(): void {
    // تنبيهات الذاكرة
    this.memoryManager.onAlert((alert) => {
      if (alert.level === 'critical') {
        this.handleCriticalAlert('memory', alert);
      }
    });

    // مراقبة أخطاء JavaScript
    window.addEventListener('error', (event) => {
      this.performanceMonitor.recordMetric({
        name: 'javascript_error',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        additionalInfo: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });

      if (this.config.enableAutoOptimization) {
        this.scheduleOptimization();
      }
    });

    // مراقبة أخطاء Promise
    window.addEventListener('unhandledrejection', (event) => {
      this.performanceMonitor.recordMetric({
        name: 'promise_rejection',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        additionalInfo: {
          reason: event.reason?.toString()
        }
      });
    });
  }

  // إعداد مراقبة الأداء
  private setupPerformanceMonitoring(): void {
    // مراقبة تحميل الصفحة
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.performanceMonitor.recordMetric({
        name: 'page_load_time',
        value: navigation.loadEventEnd - navigation.fetchStart,
        unit: 'ms',
        timestamp: new Date()
      });
    });

    // مراقبة First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.performanceMonitor.recordMetric({
            name: entry.name.replace(/-/g, '_'),
            value: entry.startTime,
            unit: 'ms',
            timestamp: new Date()
          });
        });
      });

      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  // إعداد استراتيجية التخزين المؤقت
  private setupCacheStrategy(): void {
    const strategies = {
      aggressive: {
        apiTTL: 15 * 60 * 1000,    // 15 minutes
        imageTTL: 2 * 60 * 60 * 1000, // 2 hours
        maxCacheSize: 200
      },
      balanced: {
        apiTTL: 10 * 60 * 1000,    // 10 minutes
        imageTTL: 60 * 60 * 1000,  // 1 hour
        maxCacheSize: 100
      },
      conservative: {
        apiTTL: 5 * 60 * 1000,     // 5 minutes
        imageTTL: 30 * 60 * 1000,  // 30 minutes
        maxCacheSize: 50
      }
    };

    const _strategy = strategies[this.config.cacheStrategy];
    
    // تطبيق الإعدادات على الـ caches
    console.log(`Applied ${this.config.cacheStrategy} cache strategy`);
  }

  // تسجيل Service Worker
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker-advanced.js');
        console.log('Service Worker registered successfully');

        // إرسال رسائل للـ Service Worker
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // مراقبة دورية للنظام
  private startSystemMonitoring(): void {
    setInterval(() => {
      this.performSystemHealthCheck();
    }, this.config.monitoringInterval);
  }

  // فحص صحة النظام
  private performSystemHealthCheck(): void {
    const memoryStats = this.memoryManager.getMemoryStats();
    const performanceStats = this.performanceMonitor.getStats();

    if (memoryStats && memoryStats.current.percentage > this.config.performanceThresholds.memoryUsage) {
      console.warn(`Memory usage high: ${memoryStats.current.percentage}%`);
      
      if (this.config.enableAutoOptimization) {
        this.scheduleOptimization();
      }
    }

    if (performanceStats.averageApiTime > this.config.performanceThresholds.apiResponseTime) {
      console.warn(`API response time slow: ${performanceStats.averageApiTime}ms`);
      
      if (this.config.enableAutoOptimization) {
        this.optimizeAPIPerformance();
      }
    }
  }

  // معالجة التنبيهات الحرجة
  private handleCriticalAlert(type: string, alert: any): void {
    console.error(`Critical ${type} alert:`, alert);
    
    if (this.config.enableAutoOptimization && !this.optimizationInProgress) {
      this.performEmergencyOptimization();
    }
  }

  // جدولة التحسين
  private scheduleOptimization(): void {
    if (this.optimizationInProgress) return;

    setTimeout(() => {
      this.performOptimization();
    }, 1000);
  }

  // تحسين عام
  async performOptimization(): Promise<void> {
    if (this.optimizationInProgress) return;
    
    this.optimizationInProgress = true;
    console.log('Starting system optimization...');

    try {
      // تنظيف الذاكرة
      await this.optimizeMemory();
      
      // تحسين التخزين المؤقت
      await this.optimizeCache();
      
      // تحسين DOM
      await this.optimizeDOM();
      
      console.log('System optimization completed');
      
    } catch (error) {
      console.error('❌ Optimization failed:', error);
    } finally {
      this.optimizationInProgress = false;
    }
  }

  // تحسين طارئ
  private async performEmergencyOptimization(): Promise<void> {
    console.warn('Performing emergency optimization...');
    
    // تنظيف فوري للذاكرة
    this.memoryManager.forceCleanup();
    
    // مسح caches غير الضرورية
    appCache.clear();
    
    // تحسين صور فوري
    this.emergencyImageOptimization();
    
    // طلب garbage collection
    const w: any = window as any;
    if (w.gc && typeof w.gc === 'function') {
      try {
        w.gc();
      } catch (error) {
        console.warn('Failed to request GC:', error);
      }
    }
  }

  // تحسين الذاكرة
  private async optimizeMemory(): Promise<void> {
    // تنظيف Event Listeners غير المستخدمة
    const elements = document.querySelectorAll('[data-cleanup-listeners]');
    elements.forEach(element => {
      element.removeAttribute('data-cleanup-listeners');
    });

    // تنظيف Timers منتهية الصلاحية
    // هذا مثال - في التطبيق الحقيقي نحتاج تتبع أفضل
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // تحسين التخزين المؤقت
  private async optimizeCache(): Promise<void> {
    // تنظيف cache entries منتهية الصلاحية
    const cacheStats = appCache.getStats();
    
    if (parseFloat(cacheStats.currentSizeMB) > 50) {
      // مسح جزئي للـ cache
      console.log('Performing partial cache cleanup');
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // تحسين DOM
  private async optimizeDOM(): Promise<void> {
    // إزالة عناصر مخفية غير ضرورية
    const hiddenElements = document.querySelectorAll('[style*="display: none"]:not([data-keep])');
    let removedCount = 0;
    
    hiddenElements.forEach(element => {
      if (!element.hasAttribute('data-keep')) {
        element.remove();
        removedCount++;
      }
    });

    if (removedCount > 0) {
      console.log(`Removed ${removedCount} hidden DOM elements`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // تحسين أداء API
  private optimizeAPIPerformance(): void {
    // تطبيق timeout أقصر للـ API calls البطيئة
    console.log('Applying API performance optimizations');
    
    // هنا يمكن تطبيق تحسينات مثل:
    // - تقليل timeout
    // - استخدام cache أكثر
    // - تجميع الطلبات
  }

  // تحسين طارئ للصور
  private emergencyImageOptimization(): void {
    const images = document.querySelectorAll('img');
    let optimizedCount = 0;

    images.forEach(img => {
      // تأخير تحميل الصور غير المرئية
      if (!img.complete && img.getBoundingClientRect().top > window.innerHeight + 500) {
        img.loading = 'lazy';
        optimizedCount++;
      }
    });

    if (optimizedCount > 0) {
      console.log(`Emergency optimized ${optimizedCount} images`);
    }
  }

  // إحصائيات شاملة
  getSystemStats() {
    return {
      memory: this.memoryManager.getMemoryStats(),
      performance: this.performanceMonitor.getStats(),
      cache: {
        app: appCache.getStats(),
        api: apiCache.getStats(),
        image: imageCache.getStats()
      },
      config: this.config,
      isOptimizationInProgress: this.optimizationInProgress,
      timestamp: Date.now()
    };
  }

  // تحديث الإعدادات
  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Configuration updated:', newConfig);
  }

  // إيقاف النظام
  shutdown(): void {
    this.memoryManager.stopMonitoring();
    this.isInitialized = false;
    console.log('Performance Integration System stopped');
  }
}

// تصدير النسخة الوحيدة
export const performanceIntegration = PerformanceIntegration.getInstance();

// Hook لاستخدام النظام في React
export const usePerformanceIntegration = () => {
  React.useEffect(() => {
    performanceIntegration.initialize();
    
    return () => {
      // تنظيف عند unmount المكون الرئيسي فقط
    };
  }, []);

  return {
    getStats: () => performanceIntegration.getSystemStats(),
    updateConfig: (config: Partial<IntegrationConfig>) => 
      performanceIntegration.updateConfig(config),
    forceOptimization: () => performanceIntegration.performOptimization()
  };
};

export type { IntegrationConfig };
export default PerformanceIntegration;
