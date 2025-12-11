/**
 * تكوين Sentry للمراقبة الشاملة
 * يشمل Performance Monitoring و Error Tracking
 */

import * as Sentry from '@sentry/nextjs';

// تكوين متقدم لـ Sentry
export function initSentry() {
  const isProduction = process.env.NODE_ENV === 'production';

  // في الإنتاج فقط أو إذا تم تفعيله صراحة في التطوير
  if (
    (isProduction || process.env.ENABLE_SENTRY_DEV === 'true') &&
    process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // معدل أخذ العينات للأداء
      tracesSampleRate: isProduction ? 0.1 : 1.0,

      // معدل أخذ العينات للجلسات
      replaysSessionSampleRate: isProduction ? 0.1 : 0,

      // معدل أخذ العينات عند حدوث أخطاء
      replaysOnErrorSampleRate: 1.0,

      environment: process.env.NODE_ENV,

      // تفعيل Performance Monitoring
      integrations: [
        new Sentry.BrowserTracing({
          // تتبع التنقل بين الصفحات
          routingInstrumentation: Sentry.nextRouterInstrumentation,

          // تتبع طلبات API
          traceFetch: true,
          traceXHR: true,

          // استبعاد بعض الطلبات من التتبع
          shouldCreateSpanForRequest: (url) => {
            // عدم تتبع الأصول الثابتة
            if (url.includes('/_next/static/')) return false;
            if (url.includes('/images/')) return false;
            if (url.includes('/fonts/')) return false;
            return true;
          },
        }),

        // تسجيل الجلسات للتشخيص
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // تصفية الأخطاء غير المهمة
      beforeSend(event, hint) {
        const error = hint.originalException;

        // تجاهل أخطاء الشبكة البسيطة
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message);

          // تجاهل أخطاء CORS
          if (message.includes('CORS')) return null;

          // تجاهل أخطاء الإلغاء
          if (message.includes('aborted') || message.includes('cancelled')) return null;

          // تجاهل أخطاء الاتصال البسيطة
          if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
            // نرسل فقط إذا كانت متكررة
            if (Math.random() > 0.1) return null;
          }
        }

        return event;
      },

      // إضافة معلومات إضافية
      beforeBreadcrumb(breadcrumb) {
        // تجاهل console.log في breadcrumbs
        if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
          return null;
        }
        return breadcrumb;
      },

      // إضافة بيانات سياقية
      initialScope: {
        tags: {
          service: 'sooq-mazad',
          platform: 'nextjs',
        },
      },
    });
  }
}

/**
 * تتبع معاملة مخصصة
 */
export function trackTransaction(
  name: string,
  op: string,
  callback: (transaction: ReturnType<typeof Sentry.startTransaction>) => Promise<void>,
) {
  const transaction = Sentry.startTransaction({ name, op });

  return callback(transaction)
    .then(() => {
      transaction.setStatus('ok');
    })
    .catch((error) => {
      transaction.setStatus('internal_error');
      Sentry.captureException(error);
      throw error;
    })
    .finally(() => {
      transaction.finish();
    });
}

/**
 * تتبع Web Vitals
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  label: string;
  value: number;
}) {
  // إرسال إلى Sentry
  if (typeof window !== 'undefined') {
    Sentry.setMeasurement(metric.name, metric.value, 'millisecond');

    // إضافة كـ breadcrumb
    Sentry.addBreadcrumb({
      category: 'web-vital',
      message: `${metric.name}: ${metric.value}`,
      level: 'info',
      data: metric,
    });
  }
}

/**
 * تتبع أداء API
 */
export function trackApiCall<T>(
  route: string,
  method: string,
  callback: () => Promise<T>,
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: `${method} ${route}`,
    op: 'http.server',
  });

  const startTime = Date.now();

  return callback()
    .then((result) => {
      const duration = Date.now() - startTime;
      transaction.setData('duration', duration);
      transaction.setStatus('ok');
      return result;
    })
    .catch((error) => {
      transaction.setStatus('internal_error');
      Sentry.captureException(error, {
        tags: {
          api_route: route,
          method,
        },
      });
      throw error;
    })
    .finally(() => {
      transaction.finish();
    });
}

/**
 * تتبع عملية قاعدة البيانات
 */
export function trackDatabaseQuery<T>(
  operation: string,
  table: string,
  callback: () => Promise<T>,
): Promise<T> {
  const span = Sentry.getCurrentHub()
    .getScope()
    ?.getTransaction()
    ?.startChild({
      op: 'db.query',
      description: `${operation} ${table}`,
    });

  const startTime = Date.now();

  return callback()
    .then((result) => {
      const duration = Date.now() - startTime;
      span?.setData('duration', duration);
      span?.setStatus('ok');
      return result;
    })
    .catch((error) => {
      span?.setStatus('internal_error');
      Sentry.captureException(error, {
        tags: {
          db_operation: operation,
          db_table: table,
        },
      });
      throw error;
    })
    .finally(() => {
      span?.finish();
    });
}

/**
 * تسجيل خطأ مع سياق إضافي
 */
export function captureError(
  error: Error,
  context?: {
    user?: { id: string; username?: string; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
) {
  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser(context.user);
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureException(error);
  });
}

export default {
  initSentry,
  trackTransaction,
  reportWebVitals,
  trackApiCall,
  trackDatabaseQuery,
  captureError,
};
