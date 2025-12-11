/**
 * Custom Hook للتحميل الديناميكي للمكونات
 * يوفر واجهة سهلة لاستخدام Dynamic Imports مع معالجة الأخطاء
 */

import { useState, useEffect, ComponentType } from 'react';

interface UseDynamicImportOptions {
  /**
   * تأخير التحميل بالميلي ثانية
   */
  delay?: number;
  /**
   * تحميل المكون فقط عند التفاعل (مثل hover أو click)
   */
  loadOnInteraction?: boolean;
  /**
   * تحميل المكون فقط عند الظهور في viewport
   */
  loadOnVisible?: boolean;
}

interface UseDynamicImportResult<T> {
  Component: ComponentType<T> | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

/**
 * Hook للتحميل الديناميكي مع خيارات متقدمة
 */
export function useDynamicImport<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: UseDynamicImportOptions = {},
): UseDynamicImportResult<T> {
  const { delay = 0, loadOnInteraction = false, loadOnVisible = false } = options;

  const [Component, setComponent] = useState<ComponentType<T> | null>(null);
  const [loading, setLoading] = useState(!loadOnInteraction && !loadOnVisible);
  const [error, setError] = useState<Error | null>(null);
  const [shouldLoad, setShouldLoad] = useState(!loadOnInteraction && !loadOnVisible);

  const loadComponent = async () => {
    if (Component) return; // Already loaded

    setLoading(true);
    setError(null);

    try {
      // Apply delay if specified
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const module = await importFn();
      setComponent(() => module.default);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
      console.error('Dynamic import error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldLoad) {
      loadComponent();
    }
  }, [shouldLoad]);

  const reload = () => {
    setComponent(null);
    setError(null);
    setShouldLoad(true);
  };

  // Trigger load on interaction
  const triggerLoad = () => {
    if (!Component && !loading) {
      setShouldLoad(true);
    }
  };

  return {
    Component,
    loading,
    error,
    reload,
    ...(loadOnInteraction && { triggerLoad }),
  } as UseDynamicImportResult<T> & { triggerLoad?: () => void };
}

/**
 * Hook مخصص لتحميل المكتبات الثقيلة عند الحاجة فقط
 */
export function useLazyLibrary<T>(libraryName: string, importFn: () => Promise<T>) {
  const [library, setLibrary] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadLibrary = async () => {
    if (library || loading) return library;

    setLoading(true);
    setError(null);

    try {
      const lib = await importFn();
      setLibrary(lib);
      console.log(`✓ ${libraryName} loaded successfully`);
      return lib;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to load ${libraryName}`);
      setError(error);
      console.error(`✗ Failed to load ${libraryName}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    library,
    loading,
    error,
    loadLibrary,
  };
}

/**
 * Hook لتحميل السكريبتات الخارجية بشكل ديناميكي
 */
export function useScript(src: string, options: { async?: boolean; defer?: boolean } = {}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      setLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = options.async ?? true;
    script.defer = options.defer ?? false;

    const handleLoad = () => {
      setLoaded(true);
      console.log(`✓ Script loaded: ${src}`);
    };

    const handleError = (err: Event | string) => {
      const error = new Error(`Failed to load script: ${src}`);
      setError(error);
      console.error('✗ Script load error:', err);
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      // Note: We don't remove the script on unmount as other components might use it
    };
  }, [src, options.async, options.defer]);

  return { loaded, error };
}

/**
 * Hook لتحميل CSS بشكل ديناميكي
 */
export function useStylesheet(href: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if stylesheet already exists
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      setLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;

    const handleLoad = () => {
      setLoaded(true);
      console.log(`✓ Stylesheet loaded: ${href}`);
    };

    const handleError = () => {
      const error = new Error(`Failed to load stylesheet: ${href}`);
      setError(error);
      console.error('✗ Stylesheet load error');
    };

    link.addEventListener('load', handleLoad);
    link.addEventListener('error', handleError);

    document.head.appendChild(link);

    return () => {
      link.removeEventListener('load', handleLoad);
      link.removeEventListener('error', handleError);
    };
  }, [href]);

  return { loaded, error };
}

export default useDynamicImport;
