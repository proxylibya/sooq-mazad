/**
 * Hook آمن لإدارة AbortController مع معالجة محسنة للأخطاء
 * يمنع ظهور أخطاء AbortError في console
 * 
 * التحديث: استخدام abort صامت بدون رسائل خطأ
 */

import { useCallback, useRef } from 'react';

// علامة صامتة للإلغاء - لا تُنشئ DOMException
const SILENT_ABORT_REASON = 'SILENT_ABORT';

export const useSafeAbortController = () => {
  const controllerRef = useRef<AbortController | null>(null);

  // إنشاء controller جديد مع إلغاء السابق بأمان وصمت
  const createNewController = useCallback(() => {
    // إلغاء Controller السابق بشكل صامت تماماً
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      try {
        // استخدام سبب صامت بسيط - لا ينشئ DOMException
        controllerRef.current.abort(SILENT_ABORT_REASON);
      } catch {
        // تجاهل صامت
      }
    }
    controllerRef.current = null;

    // إنشاء controller جديد
    const newController = new AbortController();
    controllerRef.current = newController;
    return newController;
  }, []);

  // إلغاء آمن وصامت للcontroller الحالي
  const abortSafely = useCallback(() => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      try {
        controllerRef.current.abort(SILENT_ABORT_REASON);
      } catch {
        // تجاهل صامت
      }
    }
    controllerRef.current = null;
  }, []);

  // فحص شامل ما إذا كان الخطأ هو AbortError
  const isAbortError = useCallback((error: unknown): boolean => {
    if (!error) return false;

    // فحص السبب الصامت مباشرة
    if (error === SILENT_ABORT_REASON || error === 'SILENT_ABORT') return true;

    // فحص Controller المحلي
    if (controllerRef.current?.signal.aborted) return true;

    // فحص toString للخطأ أولاً (أسرع)
    const errorStr = String(error).toLowerCase();
    if (errorStr === 'silent_abort' ||
      errorStr.includes('silent_abort') ||
      errorStr.includes('aborterror') ||
      errorStr.includes('abort') ||
      errorStr.includes('cancelled') ||
      errorStr.includes('canceled')) {
      return true;
    }

    // فحص كائن الخطأ
    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>;

      // فحص اسم الخطأ
      if (err.name === 'AbortError') return true;

      // فحص رسالة الخطأ
      const message = String(err.message || '').toLowerCase();
      if (message.includes('abort') ||
        message.includes('signal is aborted') ||
        message.includes('cancelled') ||
        message.includes('canceled') ||
        message.includes('silent_abort')) {
        return true;
      }
    }

    return false;
  }, []);

  // الحصول على Controller الحالي
  const getCurrentController = useCallback(() => {
    return controllerRef.current;
  }, []);

  return {
    createNewController,
    abortSafely,
    isAbortError,
    getCurrentController,
  };
};
