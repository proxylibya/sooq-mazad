/**
 * Middleware لمراقبة أداء API endpoints
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { metrics } from './performance-metrics';
import { trackApiCall } from './sentry-config';
import { logger } from '../logger';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Wrapper لمراقبة أداء API
 */
export function withPerformanceMonitoring(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const route = req.url || 'unknown';
    const method = req.method || 'UNKNOWN';

    // تتبع الطلب
    logger.api(`${method} ${route}`, {
      headers: sanitizeHeaders(req.headers),
      query: req.query,
    });

    // Intercept response
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    let statusCode = 200;
    let responseIntercepted = false;

    // Override json method
    res.json = function (body: unknown) {
      if (!responseIntercepted) {
        statusCode = res.statusCode;
        recordMetrics();
        responseIntercepted = true;
      }
      return originalJson(body);
    };

    // Override send method
    res.send = function (body: unknown) {
      if (!responseIntercepted) {
        statusCode = res.statusCode;
        recordMetrics();
        responseIntercepted = true;
      }
      return originalSend(body);
    };

    function recordMetrics() {
      const duration = (Date.now() - startTime) / 1000;

      // تسجيل في Prometheus
      metrics.recordHttpRequest(method, route, statusCode, duration);

      // تسجيل في Logger
      if (statusCode >= 400) {
        logger.error(`API Error: ${method} ${route}`, undefined, {
          statusCode,
          duration,
        });
      } else {
        logger.info(`API Success: ${method} ${route}`, {
          statusCode,
          duration,
        });
      }
    }

    try {
      // تنفيذ الـ handler مع تتبع Sentry
      await trackApiCall(route, method, async () => {
        await handler(req, res);
      });
    } catch (error) {
      if (!responseIntercepted) {
        statusCode = res.statusCode || 500;
        recordMetrics();
      }

      logger.error(`API Exception: ${method} ${route}`, error as Error);

      // إرجاع خطأ إذا لم يتم إرسال استجابة
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message:
            process.env.NODE_ENV === 'development' ? (error as Error).message : 'An error occurred',
        });
      }
    }
  };
}

/**
 * تنظيف Headers لإزالة البيانات الحساسة
 */
function sanitizeHeaders(headers: NextApiRequest['headers']): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveKeys = ['authorization', 'cookie', 'x-api-key'];

  Object.entries(headers).forEach(([key, value]) => {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.join(', ');
    }
  });

  return sanitized;
}

/**
 * Middleware لمراقبة عمليات قاعدة البيانات
 */
export function trackDatabaseOperation<T>(
  operation: string,
  table: string,
  callback: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();

  return callback()
    .then((result) => {
      const duration = (Date.now() - startTime) / 1000;
      metrics.recordDbQuery(operation, table, duration, true);

      logger.debug(`DB ${operation} ${table}`, {
        duration,
        success: true,
      });

      return result;
    })
    .catch((error) => {
      const duration = (Date.now() - startTime) / 1000;
      metrics.recordDbQuery(operation, table, duration, false);

      logger.error(`DB ${operation} ${table} failed`, error, {
        duration,
      });

      throw error;
    });
}

/**
 * Middleware لمراقبة عمليات الكاش
 */
export function trackCacheOperation<T>(
  operation: 'get' | 'set' | 'del',
  key: string,
  callback: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();

  return callback()
    .then((result) => {
      const duration = (Date.now() - startTime) / 1000;
      const hit = operation === 'get' && result !== null && result !== undefined;

      metrics.recordCacheOperation('keydb', hit, duration);

      logger.debug(`Cache ${operation} ${key}`, {
        duration,
        hit,
      });

      return result;
    })
    .catch((error) => {
      const duration = (Date.now() - startTime) / 1000;
      metrics.recordCacheOperation('keydb', false, duration);

      logger.error(`Cache ${operation} ${key} failed`, error, {
        duration,
      });

      throw error;
    });
}

export default {
  withPerformanceMonitoring,
  trackDatabaseOperation,
  trackCacheOperation,
};
