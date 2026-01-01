/**
 * مراسل Web Vitals للمتصفح
 * يرسل المقاييس إلى API endpoint
 */

import type { Metric } from 'web-vitals';

/**
 * إرسال Web Vital إلى الخادم
 */
export function sendToAnalytics(metric: Metric) {
  // تجاهل في بيئة التطوير إذا لم يتم تفعيلها
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_VITALS_DEV) {
    console.log('[Web Vital]', metric);
    return;
  }

  // إرسال إلى API
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    page: window.location.pathname,
  });

  // استخدام sendBeacon إذا كان متاحاً (لا يتم حظره عند الخروج من الصفحة)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics/web-vitals', body);
  } else {
    // fallback إلى fetch
    fetch('/api/metrics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    }).catch((error) => {
      console.error('Failed to send web vital:', error);
    });
  }
}

/**
 * تهيئة Web Vitals tracking
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  // استيراد ديناميكي لتقليل حجم الباندل
  import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB, onINP }) => {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  });
}

/**
 * تقييم Web Vital
 */
export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    default:
      return 'needs-improvement';
  }
}

export default {
  sendToAnalytics,
  initWebVitals,
  getRating,
};
