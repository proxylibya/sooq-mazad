import { useEffect, useState } from 'react';
import { initPortalFixes } from '../utils/devOverlayFix';

/**
 * مكون لإصلاح مشاكل React Portal في Next.js
 * Component to fix React Portal issues in Next.js
 *
 * يحل مشكلة: Cannot read properties of null (reading 'appendChild')
 * Fixes: Cannot read properties of null (reading 'appendChild')
 */

interface PortalFixProps {
  children: React.ReactNode;
}

export default function PortalFix({ children }: PortalFixProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // التأكد من أن DOM جاهز قبل عرض المحتوى
    setIsMounted(true);

    // تطبيق جميع إصلاحات Portal
    initPortalFixes();

    // لا حاجة لتنظيف في هذه الحالة
    return () => {
      // تنظيف إضافي إذا لزم الأمر
    };
  }, []);

  // عدم عرض المحتوى حتى يكون DOM جاهزاً
  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook لإصلاح مشاكل Portal
 * Hook to fix Portal issues
 */
export function usePortalFix() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // التأكد من جاهزية DOM
    const checkDOMReady = () => {
      if (typeof document !== 'undefined' && document.body) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (!checkDOMReady()) {
      // إعادة المحاولة بعد فترة قصيرة
      const timer = setTimeout(checkDOMReady, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return isReady;
}

/**
 * مكون Portal آمن
 * Safe Portal component
 */
interface SafePortalProps {
  children: React.ReactNode;
  container?: Element | null;
}

export function SafePortal({ children, container }: SafePortalProps) {
  const [mounted, setMounted] = useState(false);
  const isReady = usePortalFix();

  useEffect(() => {
    setMounted(true);
  }, []);

  // عدم عرض Portal حتى يكون كل شيء جاهزاً
  if (!mounted || !isReady) {
    return null;
  }

  // استخدام container مخصص أو إنشاء واحد افتراضي
  const targetContainer =
    container ||
    (() => {
      if (typeof document !== 'undefined') {
        let portalRoot = document.getElementById('portal-root');
        if (!portalRoot) {
          portalRoot = document.createElement('div');
          portalRoot.id = 'portal-root';
          document.body.appendChild(portalRoot);
        }
        return portalRoot;
      }
      return null;
    })();

  if (!targetContainer) {
    return null;
  }

  // استخدام React Portal بشكل آمن
  try {
    const { createPortal } = require('react-dom');
    return createPortal(children, targetContainer);
  } catch (error) {
    console.warn('فشل في إنشاء Portal، عرض المحتوى بشكل عادي:', error);
    return <>{children}</>;
  }
}
