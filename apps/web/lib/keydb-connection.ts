/**
 * إعدادات اتصال KeyDB المركزية
 * يوفر إعدادات موحدة لجميع اتصالات KeyDB/Redis في التطبيق
 */

import Redis from 'ioredis';

/**
 * الإعدادات الافتراضية لاتصال KeyDB
 */
export const DEFAULT_KEYDB_CONFIG = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
} as const;

/**
 * إنشاء اتصال KeyDB جديد بالإعدادات الموحدة
 */
export function createKeyDBConnection(url?: string): Redis {
  const connectionUrl = url || process.env.KEYDB_URL || 'redis://localhost:6379';
  
  return new Redis(connectionUrl, DEFAULT_KEYDB_CONFIG);
}

/**
 * إنشاء اتصال KeyDB للـ Pub/Sub
 */
export function createKeyDBPubSubConnection(url?: string): Redis {
  const connectionUrl = url || process.env.KEYDB_URL || 'redis://localhost:6379';
  
  return new Redis(connectionUrl, {
    ...DEFAULT_KEYDB_CONFIG,
    enableReadyCheck: true, // مطلوب للـ Pub/Sub
  });
}

/**
 * إنشاء اتصال KeyDB للـ BullMQ
 */
export function createKeyDBBullMQConnection(url?: string): Redis {
  const connectionUrl = url || process.env.KEYDB_URL || 'redis://localhost:6379';
  
  return new Redis(connectionUrl, {
    ...DEFAULT_KEYDB_CONFIG,
    maxRetriesPerRequest: null, // مطلوب لـ BullMQ
    enableReadyCheck: false,
  });
}

/**
 * تصدير الاتصالات المجهزة مسبقاً
 */
export const keydbConnection = createKeyDBConnection();
export const keydbPubSubConnection = createKeyDBPubSubConnection();
export const keydbBullMQConnection = createKeyDBBullMQConnection();

export default keydbConnection;
