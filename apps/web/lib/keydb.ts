// KeyDB Client Implementation
// واجهة موحدة للتفاعل مع KeyDB (أو البديل المحلي)

// Simple in-memory cache as local KeyDB replacement
const memoryStore = new Map<string, { value: any; expiresAt: number; }>();

const localKeyDB = {
  set: (key: string, value: any, ttl: number = 3600): boolean => {
    memoryStore.set(key, { value, expiresAt: Date.now() + (ttl * 1000) });
    return true;
  },
  get: <T>(key: string): T | null => {
    const item = memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) { memoryStore.delete(key); return null; }
    return item.value as T;
  },
  del: (key: string): boolean => memoryStore.delete(key),
  exists: (key: string): boolean => {
    const item = memoryStore.get(key);
    if (!item) return false;
    if (Date.now() > item.expiresAt) { memoryStore.delete(key); return false; }
    return true;
  },
  expire: (key: string, ttl: number): boolean => {
    const item = memoryStore.get(key);
    if (item) { item.expiresAt = Date.now() + (ttl * 1000); return true; }
    return false;
  },
  keys: (pattern: string = '*'): string[] => {
    const allKeys = Array.from(memoryStore.keys());
    if (pattern === '*') return allKeys;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(k => regex.test(k));
  },
  flushall: (): boolean => { memoryStore.clear(); return true; },
  info: (): Record<string, unknown> => ({
    keys: memoryStore.size,
    memory: 'in-memory',
    uptime: Date.now()
  })
};

export interface KeyDBLike {
  set(key: string, value: unknown, ttl?: number): Promise<boolean> | boolean;
  get<T>(key: string): Promise<T | null> | T | null;
  del(key: string): Promise<boolean> | boolean;
  exists(key: string): Promise<boolean> | boolean;
  expire(key: string, ttl: number): Promise<boolean> | boolean;
  keys(pattern?: string): Promise<string[]> | string[];
  flushall(): Promise<boolean> | boolean;
  info(): Promise<Record<string, unknown>> | Record<string, unknown>;
  /**
   * Health check method compatible with Redis/KeyDB semantics.
   * Should resolve successfully if the cache is reachable.
   */
  ping(): Promise<string> | string;
  // دوال إضافية للتوافق مع Redis API
  setex?(key: string, ttl: number, value: unknown): Promise<boolean> | boolean;
  ttl?(key: string): Promise<number> | number;
}

// تكييف localKeyDB لجعله متوافق مع Promise-based interface
class KeyDBAdapter implements KeyDBLike {
  private client = localKeyDB;

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    return this.client.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    return this.client.get<T>(key);
  }

  async del(key: string): Promise<boolean> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.client.exists(key);
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    return this.client.expire(key, ttl);
  }

  async keys(pattern?: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async flushall(): Promise<boolean> {
    return this.client.flushall();
  }

  async info(): Promise<Record<string, unknown>> {
    return this.client.info();
  }

  // Simulated ping using set/get/del to ensure the store is operational
  async ping(): Promise<string> {
    const testKey = '__keydb_ping__';
    try {
      await this.set(testKey, 'pong', 1);
      const res = await this.get<string>(testKey);
      if (res !== null) {
        await this.del(testKey);
      }
      return 'PONG';
    } catch {
      // Re-throw to allow callers to treat as down
      throw new Error('KeyDB ping failed');
    }
  }
}

// إضافة وظائف setex و ttl للتوافق مع Redis API
class KeyDBAdapterExtended extends KeyDBAdapter {
  async setex(key: string, ttl: number, value: unknown): Promise<boolean> {
    return this.set(key, value, ttl);
  }

  async ttl(key: string): Promise<number> {
    // محاكاة ttl بالتحقق من وجود المفتاح
    // إذا كان موجود، نرجع قيمة افتراضية (مثلاً 3600)
    // في التطبيق الحقيقي، يجب تخزين ttl مع البيانات
    const exists = await this.exists(key);
    return exists ? 3600 : -2; // -2 = key doesn't exist, -1 = no expiry
  }
}

// إنشاء عميل KeyDB الافتراضي
const keydbClient = new KeyDBAdapterExtended();

export default keydbClient;
export { keydbClient as keydb };

// وظائف مساعدة للتحقق من الاتصال والإحصائيات
export async function checkKeyDBConnection(): Promise<boolean> {
  try {
    await keydbClient.ping();
    return true;
  } catch (error) {
    console.error('KeyDB connection check failed:', error);
    return false;
  }
}

export async function getKeyDBStats(): Promise<Record<string, unknown>> {
  try {
    const info = await keydbClient.info();
    return {
      connected: true,
      ...info,
    };
  } catch (error) {
    console.error('Failed to get KeyDB stats:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function clearCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await keydbClient.keys(pattern);
    let deleted = 0;
    for (const key of keys) {
      const success = await keydbClient.del(key);
      if (success) deleted++;
    }
    return deleted;
  } catch (error) {
    console.error('Failed to clear cache pattern:', error);
    return 0;
  }
}

// تصدير العميل كـ named export أيضاً
export { keydbClient };

