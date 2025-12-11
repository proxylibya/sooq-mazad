// @ts-nocheck
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

/**
 * Web Vitals Performance Monitoring
 * قياس ومراقبة أداء الموقع بالمعايير العالمية
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// حدود التقييم حسب Google
const thresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 600, poor: 1800 }
};

// تقييم الأداء
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[metric as keyof typeof thresholds];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// إرسال البيانات للتحليل
function sendToAnalytics(metric: PerformanceMetric) {
  // يمكن إرسالها إلى Google Analytics, Sentry, أو custom endpoint
  if ((process as any).env.NODE_ENV === 'production') {
    // Log to console in production
    console.log(`[Performance] ${metric.name}: ${metric.value}ms (${metric.rating})`);
    
    // Send to analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(err => console.error('Failed to send performance metrics:', err));
  } else {
    // Development logging
    console.log(`[Dev Performance] ${metric.name}:`, {
      value: `${metric.value}ms`,
      rating: metric.rating,
      emoji: metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
    });
  }
}

// تفعيل المراقبة
export function initPerformanceMonitoring() {
  // Cumulative Layout Shift (CLS) - استقرار التخطيط
  getCLS((metric) => {
    sendToAnalytics({
      name: 'CLS',
      value: metric.value,
      rating: getRating('CLS', metric.value)
    });
  });

  // First Input Delay (FID) - سرعة الاستجابة
  getFID((metric) => {
    sendToAnalytics({
      name: 'FID',
      value: metric.value,
      rating: getRating('FID', metric.value)
    });
  });

  // First Contentful Paint (FCP) - أول محتوى مرئي
  getFCP((metric) => {
    sendToAnalytics({
      name: 'FCP',
      value: metric.value,
      rating: getRating('FCP', metric.value)
    });
  });

  // Largest Contentful Paint (LCP) - أكبر محتوى مرئي
  getLCP((metric) => {
    sendToAnalytics({
      name: 'LCP',
      value: metric.value,
      rating: getRating('LCP', metric.value)
    });
  });

  // Time to First Byte (TTFB) - وقت أول بايت
  getTTFB((metric) => {
    sendToAnalytics({
      name: 'TTFB',
      value: metric.value,
      rating: getRating('TTFB', metric.value)
    });
  });
}

// Resource timing API
export function trackResourceLoading() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // تتبع الموارد البطيئة (أكثر من 500ms)
          if (resourceEntry.duration > 500) {
            console.warn(`Slow resource detected: ${resourceEntry.name} (${Math.round(resourceEntry.duration)}ms)`);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }
}

// Memory monitoring (Chrome only)
export function trackMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    setInterval(() => {
      const memoryInfo = {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) // %
      };
      
      // تحذير إذا استخدام الذاكرة أكثر من 90%
      if (memoryInfo.usage > 90) {
        console.warn('High memory usage detected:', memoryInfo);
      }
    }, 30000); // كل 30 ثانية
  }
}

// Custom performance marks
export function markPerformance(markName: string) {
  if ('performance' in window) {
    performance.mark(markName);
  }
}

export function measurePerformance(measureName: string, startMark: string, endMark: string) {
  if ('performance' in window) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      console.log(`${measureName}: ${Math.round(measure.duration)}ms`);
      return measure.duration;
    } catch (err) {
      console.error('Failed to measure performance:', err);
    }
  }
  return null;
}

// تهيئة كاملة
export function initFullMonitoring() {
  // Web Vitals
  initPerformanceMonitoring();
  
  // Resource loading
  trackResourceLoading();
  
  // Memory (Chrome only)
  if ((process as any).env.NODE_ENV === 'development') {
    trackMemoryUsage();
  }
  
  console.log('🚀 Performance monitoring initialized');
}

export default {
  init: initFullMonitoring,
  mark: markPerformance,
  measure: measurePerformance
};
