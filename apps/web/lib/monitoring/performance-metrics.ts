/**
 * نظام مراقبة الأداء الشامل - SERVER SIDE ONLY
 * يتكامل مع Sentry Performance و Prometheus
 * تحذير: هذا الملف للاستخدام في server-side APIs فقط
 */

// التحقق من البيئة - يعمل فقط على السيرفر
const isServer = typeof window === 'undefined';

let register: any;
let Counter: any;
let Histogram: any;
let Gauge: any;
let collectDefaultMetrics: any;

// استيراد prom-client فقط في server-side
if (isServer) {
  try {
    const promClient = require('prom-client');
    register = promClient.register;
    Counter = promClient.Counter;
    Histogram = promClient.Histogram;
    Gauge = promClient.Gauge;
    collectDefaultMetrics = promClient.collectDefaultMetrics;
  } catch (error) {
    console.warn('[Performance Metrics] prom-client not available in this environment');
  }
}

// حماية ضد التسجيل المكرر في Next.js Development
const globalForMetrics = global as unknown as { metricsInitialized?: boolean };

// تفعيل جمع المقاييس الافتراضية فقط في المرة الأولى وفي server-side
if (isServer && collectDefaultMetrics && !globalForMetrics.metricsInitialized) {
  try {
    collectDefaultMetrics({ prefix: 'mazad_' });
    globalForMetrics.metricsInitialized = true;
  } catch (error) {
    console.warn('[Performance Metrics] Failed to initialize default metrics');
  }
}

// دالة مساعدة لتسجيل الـ metrics بشكل آمن
function getOrCreateMetric<T>(name: string, create: () => T): T {
  if (!isServer || !register) {
    // في client-side، إرجاع كائن وهمي
    return { inc: () => {}, observe: () => {}, set: () => {}, startTimer: () => () => {} } as unknown as T;
  }
  
  try {
    return create();
  } catch (error) {
    // إذا كان المقياس موجوداً بالفعل، احصل عليه من السجل
    const existingMetric = register.getSingleMetric(name);
    if (existingMetric) {
      return existingMetric as T;
    }
    throw error;
  }
}

// Counters - لعد الأحداث
export const httpRequestsTotal = getOrCreateMetric(
  'mazad_http_requests_total',
  () =>
    new Counter({
      name: 'mazad_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),
);

export const dbQueriesTotal = getOrCreateMetric(
  'mazad_db_queries_total',
  () =>
    new Counter({
      name: 'mazad_db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status'],
    }),
);

export const cacheHitsTotal = getOrCreateMetric(
  'mazad_cache_hits_total',
  () =>
    new Counter({
      name: 'mazad_cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type', 'hit'],
    }),
);

export const auctionBidsTotal = getOrCreateMetric(
  'mazad_auction_bids_total',
  () =>
    new Counter({
      name: 'mazad_auction_bids_total',
      help: 'Total number of auction bids',
      labelNames: ['status'],
    }),
);

export const authAttemptsTotal = getOrCreateMetric(
  'mazad_auth_attempts_total',
  () =>
    new Counter({
      name: 'mazad_auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['result', 'method'],
    }),
);

// Histograms - لقياس التوزيع والنسب المئوية
export const httpRequestDuration = getOrCreateMetric(
  'mazad_http_request_duration_seconds',
  () =>
    new Histogram({
      name: 'mazad_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),
);

export const dbQueryDuration = getOrCreateMetric(
  'mazad_db_query_duration_seconds',
  () =>
    new Histogram({
      name: 'mazad_db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    }),
);

export const cacheOperationDuration = getOrCreateMetric(
  'mazad_cache_operation_duration_seconds',
  () =>
    new Histogram({
      name: 'mazad_cache_operation_duration_seconds',
      help: 'Duration of cache operations in seconds',
      labelNames: ['operation'],
      buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.025, 0.05],
    }),
);

// Web Vitals
export const webVitalsLCP = getOrCreateMetric(
  'mazad_web_vitals_lcp_seconds',
  () =>
    new Histogram({
      name: 'mazad_web_vitals_lcp_seconds',
      help: 'Largest Contentful Paint (LCP) in seconds',
      labelNames: ['page'],
      buckets: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5],
    }),
);

export const webVitalsFID = getOrCreateMetric(
  'mazad_web_vitals_fid_milliseconds',
  () =>
    new Histogram({
      name: 'mazad_web_vitals_fid_milliseconds',
      help: 'First Input Delay (FID) in milliseconds',
      labelNames: ['page'],
      buckets: [10, 25, 50, 100, 200, 300, 500],
    }),
);

export const webVitalsCLS = getOrCreateMetric(
  'mazad_web_vitals_cls_score',
  () =>
    new Histogram({
      name: 'mazad_web_vitals_cls_score',
      help: 'Cumulative Layout Shift (CLS) score',
      labelNames: ['page'],
      buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 1],
    }),
);

// Gauges - لقياس القيم الحالية
export const activeAuctions = getOrCreateMetric(
  'mazad_active_auctions',
  () =>
    new Gauge({
      name: 'mazad_active_auctions',
      help: 'Number of currently active auctions',
    }),
);

export const onlineUsers = getOrCreateMetric(
  'mazad_online_users',
  () =>
    new Gauge({
      name: 'mazad_online_users',
      help: 'Number of currently online users',
    }),
);

export const activeWebSocketConnections = getOrCreateMetric(
  'mazad_websocket_connections',
  () =>
    new Gauge({
      name: 'mazad_websocket_connections',
      help: 'Number of active WebSocket connections',
    }),
);

export const dbConnectionPoolSize = getOrCreateMetric(
  'mazad_db_connection_pool_size',
  () =>
    new Gauge({
      name: 'mazad_db_connection_pool_size',
      help: 'Current database connection pool size',
    }),
);

export const cacheSize = getOrCreateMetric(
  'mazad_cache_size_bytes',
  () =>
    new Gauge({
      name: 'mazad_cache_size_bytes',
      help: 'Current cache size in bytes',
      labelNames: ['cache_type'],
    }),
);

/**
 * دالة مساعدة لقياس وقت التنفيذ
 */
export async function measureExecutionTime<T>(
  operation: string,
  histogram: any,
  labels: Record<string, string>,
  fn: () => Promise<T>,
): Promise<T> {
  if (!isServer || !histogram) {
    return await fn();
  }
  
  const end = histogram.startTimer(labels);
  try {
    const result = await fn();
    end();
    return result;
  } catch (error) {
    end();
    throw error;
  }
}

/**
 * تصدير جميع المقاييس
 */
export async function getMetrics(): Promise<string> {
  if (!isServer || !register) {
    return '';
  }
  return register.metrics();
}

/**
 * مسح جميع المقاييس (للاختبار فقط)
 */
export function clearMetrics(): void {
  if (!isServer || !register) {
    return;
  }
  register.clear();
}

/**
 * إضافة مقاييس مخصصة
 */
export const metrics = {
  // HTTP Requests
  recordHttpRequest: (method: string, route: string, statusCode: number, duration: number) => {
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  },

  // Database Operations
  recordDbQuery: (operation: string, table: string, duration: number, success: boolean) => {
    dbQueriesTotal.inc({
      operation,
      table,
      status: success ? 'success' : 'error',
    });
    dbQueryDuration.observe({ operation, table }, duration);
  },

  // Cache Operations
  recordCacheOperation: (type: string, hit: boolean, duration: number) => {
    cacheHitsTotal.inc({ cache_type: type, hit: hit ? 'true' : 'false' });
    cacheOperationDuration.observe({ operation: hit ? 'hit' : 'miss' }, duration);
  },

  // Web Vitals
  recordWebVital: (metric: 'LCP' | 'FID' | 'CLS', value: number, page: string) => {
    switch (metric) {
      case 'LCP':
        webVitalsLCP.observe({ page }, value / 1000); // تحويل إلى ثواني
        break;
      case 'FID':
        webVitalsFID.observe({ page }, value);
        break;
      case 'CLS':
        webVitalsCLS.observe({ page }, value);
        break;
    }
  },

  // Auction Metrics
  recordAuctionBid: (status: 'success' | 'failed' | 'outbid') => {
    auctionBidsTotal.inc({ status });
  },

  // Auth Metrics
  recordAuthAttempt: (result: 'success' | 'failed', method: 'password' | 'otp' | 'oauth') => {
    authAttemptsTotal.inc({ result, method });
  },

  // Live Gauges
  setActiveAuctions: (count: number) => {
    activeAuctions.set(count);
  },

  setOnlineUsers: (count: number) => {
    onlineUsers.set(count);
  },

  setActiveWebSocketConnections: (count: number) => {
    activeWebSocketConnections.set(count);
  },

  setDbConnectionPoolSize: (size: number) => {
    dbConnectionPoolSize.set(size);
  },

  setCacheSize: (type: string, bytes: number) => {
    cacheSize.set({ cache_type: type }, bytes);
  },
};

export default metrics;
