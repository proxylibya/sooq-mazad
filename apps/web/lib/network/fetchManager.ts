// Network fetch manager with retry, timeout, and caching
export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cacheTTL?: number;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FetchManager {
  private cache = new Map<string, CacheEntry>();
  private requestQueue = new Map<string, Promise<unknown>>();

  async fetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);

    // Return cached data if available and fresh
    if (options.cacheTTL && this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      if (Date.now() - entry.timestamp < entry.ttl) {
        return entry.data as T;
      }
      this.cache.delete(cacheKey);
    }

    // Return existing request if in flight
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey) as Promise<T>;
    }

    // Create new request
    const requestPromise = this.executeRequest<T>(url, options);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache successful response
      if (options.cacheTTL) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl: options.cacheTTL,
        });
      }

      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  private async executeRequest<T>(url: string, options: FetchOptions): Promise<T> {
    const { timeout = 10000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return (await response.text()) as T;
        }
      } catch (error) {
        lastError = error as Error;

        // تسجيل الخطأ للتتبع في وضع التطوير
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Fetch Attempt ${attempt + 1}/${retries + 1}] ${url}:`, error);
        }

        // Don't retry on certain errors
        if (
          error instanceof Error &&
          (error.name === 'AbortError' ||
            error.message.includes('400') ||
            error.message.includes('401') ||
            error.message.includes('403') ||
            error.message.includes('404'))
        ) {
          // في حالة الأخطاء التي لا يمكن إعادة المحاولة، نرجع خطأ واضح
          console.error(`[Fetch Error] ${url}:`, error.message);
          throw error;
        }

        // Wait before retry (except on last attempt)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    console.error(`[Fetch Failed] ${url} after ${retries + 1} attempts`);
    throw lastError!;
  }

  private getCacheKey(url: string, options: FetchOptions): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

export const fetchManager = new FetchManager();
export default FetchManager;
