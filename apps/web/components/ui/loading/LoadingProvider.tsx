/**
 * LoadingProvider - مزود حالة التحميل العالمي
 * نظام التحميل العالمي الموحد - سوق مزاد
 *
 * @description Context وProvider للتحكم المركزي في حالات التحميل
 * @version 2.0.0
 */

import { useRouter } from 'next/router';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// ============================================
// Types & Interfaces
// ============================================

export type LoadingType =
  | 'page' // تحميل صفحة كاملة
  | 'section' // تحميل قسم
  | 'component' // تحميل مكون
  | 'action' // تحميل إجراء (زر، نموذج)
  | 'data' // تحميل بيانات
  | 'navigation'; // تنقل بين الصفحات

export interface LoadingState {
  /** هل التحميل نشط */
  isLoading: boolean;
  /** نوع التحميل */
  type: LoadingType;
  /** معرف فريد للتحميل */
  id: string;
  /** رسالة التحميل */
  message?: string;
  /** نسبة التقدم (0-100) */
  progress?: number;
  /** بيانات إضافية */
  metadata?: Record<string, unknown>;
}

export interface LoadingContextValue {
  /** حالات التحميل النشطة */
  loadingStates: Map<string, LoadingState>;
  /** هل يوجد أي تحميل نشط */
  isAnyLoading: boolean;
  /** هل الصفحة تتحول */
  isPageTransitioning: boolean;
  /** بدء تحميل */
  startLoading: (id: string, type?: LoadingType, message?: string) => void;
  /** إنهاء تحميل */
  stopLoading: (id: string) => void;
  /** تحديث تقدم التحميل */
  updateProgress: (id: string, progress: number) => void;
  /** فحص حالة تحميل معينة */
  isLoading: (id: string) => boolean;
  /** الحصول على حالة تحميل */
  getLoadingState: (id: string) => LoadingState | undefined;
  /** مسح كل حالات التحميل */
  clearAll: () => void;
}

// ============================================
// Context
// ============================================

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

export interface LoadingProviderProps {
  children: ReactNode;
  /** تفعيل تتبع تنقل Next.js */
  trackNavigation?: boolean;
  /** الحد الأدنى لمدة التحميل (مللي ثانية) */
  minimumLoadingTime?: number;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  trackNavigation = true,
  minimumLoadingTime = 300,
}) => {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // ============================================
  // Navigation Tracking
  // ============================================

  useEffect(() => {
    if (!trackNavigation) return;

    let loadingTimer: NodeJS.Timeout | null = null;

    const handleStart = (url: string) => {
      // لا نعرض التحميل للتنقل السريع (نفس الصفحة)
      if (url === router.asPath) return;

      setIsPageTransitioning(true);
      setLoadingStates((prev) => {
        const newMap = new Map(prev);
        newMap.set('navigation', {
          isLoading: true,
          type: 'navigation',
          id: 'navigation',
          message: 'جاري التحميل...',
        });
        return newMap;
      });
    };

    const handleComplete = () => {
      // تأخير قليل لضمان تجربة سلسة
      loadingTimer = setTimeout(() => {
        setIsPageTransitioning(false);
        setLoadingStates((prev) => {
          const newMap = new Map(prev);
          newMap.delete('navigation');
          return newMap;
        });
      }, minimumLoadingTime);
    };

    const handleError = () => {
      setIsPageTransitioning(false);
      setLoadingStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete('navigation');
        return newMap;
      });
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router, trackNavigation, minimumLoadingTime]);

  // ============================================
  // Loading State Management
  // ============================================

  const startLoading = useCallback(
    (id: string, type: LoadingType = 'component', message?: string) => {
      setLoadingStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(id, {
          isLoading: true,
          type,
          id,
          message,
          progress: 0,
        });
        return newMap;
      });
    },
    [],
  );

  const stopLoading = useCallback((id: string) => {
    setLoadingStates((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setLoadingStates((prev) => {
      const existing = prev.get(id);
      if (!existing) return prev;

      const newMap = new Map(prev);
      newMap.set(id, { ...existing, progress: Math.min(100, Math.max(0, progress)) });
      return newMap;
    });
  }, []);

  const isLoading = useCallback((id: string) => loadingStates.has(id), [loadingStates]);

  const getLoadingState = useCallback((id: string) => loadingStates.get(id), [loadingStates]);

  const clearAll = useCallback(() => {
    setLoadingStates(new Map());
    setIsPageTransitioning(false);
  }, []);

  // ============================================
  // Computed Values
  // ============================================

  const isAnyLoading = useMemo(() => loadingStates.size > 0, [loadingStates]);

  // ============================================
  // Context Value
  // ============================================

  const value = useMemo<LoadingContextValue>(
    () => ({
      loadingStates,
      isAnyLoading,
      isPageTransitioning,
      startLoading,
      stopLoading,
      updateProgress,
      isLoading,
      getLoadingState,
      clearAll,
    }),
    [
      loadingStates,
      isAnyLoading,
      isPageTransitioning,
      startLoading,
      stopLoading,
      updateProgress,
      isLoading,
      getLoadingState,
      clearAll,
    ],
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

// ============================================
// Hook
// ============================================

export const useLoading = (): LoadingContextValue => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// ============================================
// Utility Hooks
// ============================================

/**
 * Hook لتحميل بيانات مع حالة تلقائية
 */
export function useLoadingState(id: string) {
  const { startLoading, stopLoading, isLoading, updateProgress } = useLoading();

  const start = useCallback(
    (message?: string) => startLoading(id, 'data', message),
    [id, startLoading],
  );

  const stop = useCallback(() => stopLoading(id), [id, stopLoading]);

  const setProgress = useCallback(
    (progress: number) => updateProgress(id, progress),
    [id, updateProgress],
  );

  return {
    isLoading: isLoading(id),
    start,
    stop,
    setProgress,
  };
}

/**
 * Hook لتنفيذ إجراء مع حالة تحميل
 */
export function useLoadingAction<T extends (...args: unknown[]) => Promise<unknown>>(
  id: string,
  action: T,
  options?: { message?: string },
) {
  const { startLoading, stopLoading, isLoading: checkLoading } = useLoading();
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      setError(null);
      startLoading(id, 'action', options?.message);
      try {
        const result = await action(...args);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        stopLoading(id);
      }
    },
    [id, action, startLoading, stopLoading, options?.message],
  );

  return {
    execute: execute as T,
    isLoading: checkLoading(id),
    error,
  };
}

export default LoadingProvider;
