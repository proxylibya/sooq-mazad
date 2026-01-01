import React, { useEffect, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  maxLoadingTime?: number; // الحد الأقصى لوقت التحميل بالميلي ثانية
}

/**
 * مكون حماية المصادقة - يمنع ظهور محتوى غير مناسب أثناء تحميل حالة المصادقة
 * يحل مشكلة FOUC (Flash of Unauthenticated Content)
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = null,
  loadingComponent = (
    <div className="animate-pulse rounded-lg bg-gray-100 px-4 py-2">
      <div className="h-4 w-32 rounded bg-gray-200"></div>
    </div>
  ),
  maxLoadingTime = 2000, // 2 ثانية كحد أقصى
}) => {
  const { user, loading } = useAuth();
  const [forceShowContent, setForceShowContent] = useState(false);

  // إجبار عرض المحتوى بعد فترة زمنية محددة
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setForceShowContent(true);
      }, maxLoadingTime);

      return () => clearTimeout(timer);
    } else {
      setForceShowContent(false);
    }
  }, [loading, maxLoadingTime]);

  // إذا انتهت مهلة التحميل أو لم يعد هناك تحميل
  if (forceShowContent || !loading) {
    // إذا كان المستخدم مسجل دخول، عرض المحتوى
    if (user) {
      return <>{children}</>;
    }
    // إذا لم يكن مسجل دخول، عرض البديل
    return <>{fallback}</>;
  }

  // أثناء التحميل، عرض مكون التحميل
  return <>{loadingComponent}</>;
};

export default AuthGuard;
