import { useState, useEffect, useCallback, useRef } from 'react';

// Cache configuration interface
interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  enableCompression?: boolean; // Enable data compression
  persistToStorage?: boolean; // Persist cache to localStorage
  storageKey?: string; // Key for localStorage
  backgroundRefresh?: boolean; // Refresh data in background when near expiry
  refreshThreshold?: number; // Percentage of TTL when to refresh (0.8 = 80%)
}

// Cache item interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  compressed: boolean;
  version: string;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
}

// Default configuration
const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  enableCompression: true,
  persistToStorage: false,
  storageKey: 'smart-cache',
  backgroundRefresh: true,
  refreshThreshold: 0.8,
};

class SmartCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private config: Required<CacheConfig>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    memoryUsage: 0,
    hitRate: 0,
  };
  private refreshCallbacks = new Map<string, () => Promise<T>>();

  constructor(config: CacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
    this.startCleanupInterval();
  }

  // Get item from cache
  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check expiry
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    this.stats.hits++;
    this.updateHitRate();

    // Check if background refresh is needed
    if (this.config.backgroundRefresh && this.shouldBackgroundRefresh(item)) {
      this.backgroundRefresh(key);
    }

    return this.decompress(item);
  }

  // Set item in cache
  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const now = Date.now();
    const dataSize = this.calculateSize(data);

    const item: CacheItem<T> = {
      data: this.compress(data),
      timestamp: now,
      expiry: now + ttl,
      accessCount: 1,
      lastAccessed: now,
      size: dataSize,
      compressed: this.config.enableCompression,
      version: '1.0',
    };

    // Remove item if exists (for size calculation)
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Check cache size limit
    this.enforceMaxSize();

    this.cache.set(key, item);
    this.updateStats();
    this.saveToStorage();
  }

  // Delete item from cache
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.updateStats();
      this.saveToStorage();
    }
    return result;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      memoryUsage: 0,
      hitRate: 0,
    };
    this.saveToStorage();
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && Date.now() <= item.expiry;
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get all cache keys
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Set refresh callback for background updates
  setRefreshCallback(key: string, callback: () => Promise<T>): void {
    this.refreshCallbacks.set(key, callback);
  }

  // Remove refresh callback
  removeRefreshCallback(key: string): void {
    this.refreshCallbacks.delete(key);
  }

  // Manual refresh
  async refresh(key: string): Promise<T | null> {
    const callback = this.refreshCallbacks.get(key);
    if (!callback) return null;

    try {
      const data = await callback();
      this.set(key, data);
      return data;
    } catch (error) {
      console.error(`Cache refresh failed for key ${key}:`, error);
      return null;
    }
  }

  // Compress data if enabled
  private compress(data: T): T {
    if (!this.config.enableCompression) return data;

    try {
      // Simple compression by JSON stringifying and storing as string
      // In production, you might want to use actual compression libraries
      return JSON.parse(JSON.stringify(data)) as T;
    } catch {
      return data;
    }
  }

  // Decompress data if needed
  private decompress(item: CacheItem<T>): T {
    return item.data;
  }

  // Calculate data size estimation
  private calculateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 1024; // Default 1KB if calculation fails
    }
  }

  // Check if background refresh should occur
  private shouldBackgroundRefresh(item: CacheItem<T>): boolean {
    const timeUntilExpiry = item.expiry - Date.now();
    const totalTtl = item.expiry - item.timestamp;
    const remainingPercentage = timeUntilExpiry / totalTtl;

    return remainingPercentage <= 1 - this.config.refreshThreshold;
  }

  // Background refresh
  private async backgroundRefresh(key: string): Promise<void> {
    const callback = this.refreshCallbacks.get(key);
    if (!callback) return;

    try {
      const data = await callback();
      this.set(key, data);
    } catch (error) {
      console.error(`Background refresh failed for key ${key}:`, error);
    }
  }

  // Enforce maximum cache size
  private enforceMaxSize(): void {
    while (this.cache.size >= this.config.maxSize) {
      // Remove least recently used item
      let lruKey = '';
      let lruTime = Date.now();

      for (const [key, item] of this.cache.entries()) {
        if (item.lastAccessed < lruTime) {
          lruTime = item.lastAccessed;
          lruKey = key;
        }
      }

      if (lruKey) {
        this.cache.delete(lruKey);
        this.stats.evictions++;
      }
    }
  }

  // Update cache statistics
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = Array.from(this.cache.values()).reduce(
      (total, item) => total + item.size,
      0,
    );
    this.updateHitRate();
  }

  // Update hit rate
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  // Save cache to localStorage
  private saveToStorage(): void {
    if (!this.config.persistToStorage) return;

    try {
      const cacheData = {
        cache: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.config.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  // Load cache from localStorage
  private loadFromStorage(): void {
    if (!this.config.persistToStorage) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return;

      const cacheData = JSON.parse(stored);
      const now = Date.now();

      // Load cache items, filtering expired ones
      for (const [key, item] of cacheData.cache) {
        if (now <= item.expiry) {
          this.cache.set(key, item);
        }
      }

      // Restore stats
      this.stats = cacheData.stats || this.stats;
      this.updateStats();
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // Start cleanup interval
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Cleanup expired items
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      this.updateStats();
      this.saveToStorage();
    }
  }
}

// React hook for smart caching
export function useSmartCache<T = any>(config: CacheConfig = {}) {
  const cacheRef = useRef<SmartCache<T>>();
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    memoryUsage: 0,
    hitRate: 0,
  });

  // Initialize cache
  useEffect(() => {
    if (!cacheRef.current) {
      cacheRef.current = new SmartCache<T>(config);
    }
  }, [config]);

  // Update stats periodically (throttled and equality-checked)
  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const updateStats = () => {
      if (!mounted || !cacheRef.current) return;

      try {
        const next = cacheRef.current.getStats();
        setStats((prev) => {
          if (
            prev.hits === next.hits &&
            prev.misses === next.misses &&
            prev.evictions === next.evictions &&
            prev.size === next.size &&
            prev.memoryUsage === next.memoryUsage &&
            prev.hitRate === next.hitRate
          ) {
            return prev; // no change
          }
          return next;
        });
      } catch (error) {
        console.warn('Cache stats update error:', error);
      }
    };

    // Update every 15 seconds instead of 5 to reduce overhead
    interval = setInterval(updateStats, 15000);

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const get = useCallback((key: string) => {
    return cacheRef.current?.get(key) || null;
  }, []);

  const set = useCallback((key: string, data: T, ttl?: number) => {
    cacheRef.current?.set(key, data, ttl);
  }, []);

  const remove = useCallback((key: string) => {
    return cacheRef.current?.delete(key) || false;
  }, []);

  const clear = useCallback(() => {
    cacheRef.current?.clear();
  }, []);

  const has = useCallback((key: string) => {
    return cacheRef.current?.has(key) || false;
  }, []);

  const setRefreshCallback = useCallback((key: string, callback: () => Promise<T>) => {
    cacheRef.current?.setRefreshCallback(key, callback);
  }, []);

  const refresh = useCallback(async (key: string) => {
    return cacheRef.current?.refresh(key) || null;
  }, []);

  return {
    get,
    set,
    remove,
    clear,
    has,
    setRefreshCallback,
    refresh,
    stats,
  };
}

// Hook for cached data fetching
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig & { enabled?: boolean } = {},
) {
  const { enabled = true, ...cacheConfig } = config;
  const cache = useSmartCache<T>(cacheConfig);
  // Use stable method references to prevent effect dependency churn when cache stats update
  const cacheGet = cache.get;
  const cacheSet = cache.set;
  const cacheSetRefreshCallback = cache.setRefreshCallback;
  const cacheRemove = cache.remove;
  const cacheHas = cache.has;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Stabilize fetcher to avoid re-creating callbacks/effects when parent passes inline functions
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const fetchData = useCallback(
    async (force = false) => {
      if (!enabled) return;

      // Check cache first
      if (!force) {
        const cached = cacheGet(key);
        if (cached) {
          setData(cached);
          return cached;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current();
        cacheSet(key, result);
        // Register refresh callback using stable ref
        cacheSetRefreshCallback(key, () => fetcherRef.current());
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Fetch failed');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [key, enabled, cacheGet, cacheSet, cacheSetRefreshCallback],
  );

  // Initial fetch with stable cache references
  useEffect(() => {
    let mounted = true;

    const initialFetch = async () => {
      if (!enabled || !mounted) return;

      // Use cache reference directly to avoid dependency issues
      const cached = cache.get(key);
      if (cached) {
        setData(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current();
        if (mounted) {
          cache.set(key, result);
          cache.setRefreshCallback(key, () => fetcherRef.current());
          setData(result);
          setError(null); // Clear any previous errors
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('Fetch failed');
          console.warn(`Cache fetch failed for key ${key}:`, error);
          setError(error);

          // If it's an auth error, don't retry continuously
          if (error.message.includes('401') || error.message.includes('Authentication')) {
            console.log('Authentication error detected, stopping retries');
            return;
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialFetch();

    return () => {
      mounted = false;
    };
  }, [key, enabled, cache]); // Include cache but it's stable from useSmartCache

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => cacheRemove(key), [cacheRemove, key]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    cached: cacheHas(key),
    cacheStats: cache.stats,
  };
}

export default SmartCache;
