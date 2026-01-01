import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getUserSession } from '../utils/authUtils';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = React.memo(({ children }) => {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // تبسيط SessionManager - تفعيل مباشر
    setIsInitialized(true);
  }, []);

  // مراقبة تغييرات المسار للتحقق من الصلاحيات
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // استثناء جميع مسارات الإدارة من حماية الجلسة العامة
      if (url.startsWith('/admin')) {
        return;
      }
      const session = getUserSession();
      const protectedPaths = [
        '/my-account',
        '/wallet',
        '/transport/add-service',
        '/promote-listing',
      ];
      const isProtectedPath = protectedPaths.some((path) => url.startsWith(path));
      if (isProtectedPath) {
        if (!session) {
          router.push(`/login?callbackUrl=${encodeURIComponent(url)}`);
          return;
        }
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    // التحقق من المسار الحالي عند التحميل
    if (isInitialized) {
      handleRouteChange(router.pathname);
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, isInitialized]);

  // عرض شاشة تحميل أثناء التحقق من الجلسة
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
      </div>
    );
  }

  return <>{children}</>;
});
SessionManager.displayName = 'SessionManager';

export default SessionManager;
