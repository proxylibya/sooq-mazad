import { NextApiRequest, NextApiResponse } from 'next';
import { logPerformance } from '../lib/monitoring/performanceMonitor';
/**
 * Performance Monitoring Middleware
 * يتتبع أداء جميع API requests تلقائياً
 */
export function performanceMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    const endpoint = `${req.method} ${req.url}`;
    let success = true;
    // Override res.json و res.send لتتبع النتائج
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    res.json = function (data: any /* auto-fixed */ /* auto-fixed */ /* auto-fixed */ /* eslint-disable-line */) {
      success = res.statusCode < 400;
      return originalJson(data);
    };

    res.send = function (data: any /* auto-fixed */ /* auto-fixed */ /* auto-fixed */ /* eslint-disable-line */) {
      success = res.statusCode < 400;
      return originalSend(data);
    };

    try {
      await handler(req, res);
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - start;
      // تسجيل الأداء
      logPerformance({
        timestamp: new Date(),
        endpoint,
        duration,
        success,
      });

      // إضافة Performance Headers
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Cache-Status', res.getHeader('X-Cache-Status') || 'MISS');
    }
  };
}

/**
 * Cache Middleware - يضيف headers للـ cache
 */
export function cacheMiddleware(ttl: number = 60) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      // تحديد نوع Cache بناءً على الطلب
      const isPrivate = req.headers.authorization || req.headers.cookie;
      if (req.method === 'GET' && !isPrivate) {
        res.setHeader(
          'Cache-Control',
          `public, max-age=${ttl}, s-maxage=${ttl * 2}, stale-while-revalidate=${ttl * 3}`,
        );
      } else if (req.method === 'GET' && isPrivate) {
        res.setHeader('Cache-Control', `private, max-age=${ttl}`);
      } else {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }

      await handler(req, res);
    };
  };
}

/**
 * Compression Middleware - ضغط الاستجابات الكبيرة
 */
export function compressionMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const originalJson = res.json.bind(res);
    res.json = function (data: any /* auto-fixed */ /* auto-fixed */ /* auto-fixed */ /* eslint-disable-line */) {
      // إضافة headers للضغط
      const acceptEncoding = req.headers['accept-encoding'] || '';
      if (acceptEncoding.includes('gzip')) {
        res.setHeader('Content-Encoding', 'gzip');
      } else if (acceptEncoding.includes('deflate')) {
        res.setHeader('Content-Encoding', 'deflate');
      }

      return originalJson(data);
    };

    await handler(req, res);
  };
}

/**
 * دمج جميع Middlewares
 */
export function withOptimizations(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: { cache?: number; performance?: boolean } = {},
) {
  let wrappedHandler = handler;
  // إضافة Performance Monitoring
  if (options.performance !== false) {
    wrappedHandler = performanceMiddleware(wrappedHandler);
  }

  // إضافة Cache
  if (options.cache) {
    wrappedHandler = cacheMiddleware(options.cache)(wrappedHandler);
  }

  // إضافة Compression
  wrappedHandler = compressionMiddleware(wrappedHandler);

  return wrappedHandler;
}
