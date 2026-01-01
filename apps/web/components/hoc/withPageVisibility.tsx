import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { checkPageVisibility } from '../../lib/pageVisibility';

interface PageVisibilityState {
  isLoading: boolean;
  isVisible: boolean;
  isAllowed: boolean;
  redirectTo?: string;
  reason?: string;
}

interface WithPageVisibilityOptions {
  fallbackComponent?: React.ComponentType<any>;
  loadingComponent?: React.ComponentType<any>;
  getUserRole?: () => string | undefined;
  getIsAuthenticated?: () => boolean;
  onAccessDenied?: (reason: string, redirectTo?: string) => void;
  onPageHidden?: () => void;
}

// مكون التحميل الافتراضي
const DefaultLoadingComponent: React.FC = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
      <p className="text-sm text-gray-500">جاري التحقق من صلاحية الوصول...</p>
    </div>
  </div>
);

// مكون الوصول المرفوض الافتراضي
const DefaultFallbackComponent: React.FC<{ reason?: string }> = ({ reason }) => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 text-red-500">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">غير مصرح بالوصول</h3>
      <p className="mt-1 text-sm text-gray-500">
        {reason || 'ليس لديك صلاحية للوصول إلى هذه الصفحة'}
      </p>
    </div>
  </div>
);

// HOC للتحقق من رؤية الصفحة
export function withPageVisibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPageVisibilityOptions = {},
) {
  const {
    fallbackComponent: FallbackComponent = DefaultFallbackComponent,
    loadingComponent: LoadingComponent = DefaultLoadingComponent,
    getUserRole,
    getIsAuthenticated,
    onAccessDenied,
    onPageHidden,
  } = options;

  const WithPageVisibilityComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const [state, setState] = useState<PageVisibilityState>({
      isLoading: true,
      isVisible: true,
      isAllowed: true,
    });

    useEffect(() => {
      async function checkVisibility() {
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
          const userRole = getUserRole ? getUserRole() : undefined;
          const isAuthenticated = getIsAuthenticated ? getIsAuthenticated() : false;

          const result = await checkPageVisibility(router.asPath, userRole, isAuthenticated);

          setState({
            isLoading: false,
            isVisible: result.isVisible,
            isAllowed: result.isAllowed,
            redirectTo: result.redirectTo,
            reason: result.reason,
          });

          // معالجة حالات الوصول المرفوض
          if (!result.isVisible) {
            onPageHidden?.();
            if (result.redirectTo) {
              router.replace(result.redirectTo);
            }
          } else if (!result.isAllowed) {
            onAccessDenied?.(result.reason || 'غير مصرح', result.redirectTo);
            if (result.redirectTo) {
              router.replace(result.redirectTo);
            }
          }
        } catch (error) {
          console.error('خطأ في التحقق من رؤية الصفحة:', error);
          setState({
            isLoading: false,
            isVisible: true,
            isAllowed: true,
          });
        }
      }

      checkVisibility();
    }, [router.asPath]);

    if (state.isLoading) {
      return <LoadingComponent />;
    }

    if (!state.isVisible || !state.isAllowed) {
      return <FallbackComponent reason={state.reason} />;
    }

    return <WrappedComponent {...props} />;
  };

  WithPageVisibilityComponent.displayName = `withPageVisibility(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPageVisibilityComponent;
}

// Hook للتحقق من رؤية الصفحة
export function usePageVisibilityCheck(
  getUserRole?: () => string | undefined,
  getIsAuthenticated?: () => boolean,
) {
  const router = useRouter();
  const [state, setState] = useState<PageVisibilityState>({
    isLoading: true,
    isVisible: true,
    isAllowed: true,
  });

  useEffect(() => {
    async function checkVisibility() {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const userRole = getUserRole ? getUserRole() : undefined;
        const isAuthenticated = getIsAuthenticated ? getIsAuthenticated() : false;

        const result = await checkPageVisibility(router.asPath, userRole, isAuthenticated);

        setState({
          isLoading: false,
          isVisible: result.isVisible,
          isAllowed: result.isAllowed,
          redirectTo: result.redirectTo,
          reason: result.reason,
        });
      } catch (error) {
        console.error('خطأ في التحقق من رؤية الصفحة:', error);
        setState({
          isLoading: false,
          isVisible: true,
          isAllowed: true,
        });
      }
    }

    checkVisibility();
  }, [router.asPath]);

  return state;
}

// مكون للحماية الشرطية للمحتوى
export const ConditionalRender: React.FC<{
  children: React.ReactNode;
  path?: string;
  requiresAuth?: boolean;
  allowedRoles?: string[];
  userRole?: string;
  isAuthenticated?: boolean;
  fallback?: React.ReactNode;
}> = ({
  children,
  path,
  requiresAuth = false,
  allowedRoles = [],
  userRole,
  isAuthenticated = false,
  fallback = null,
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkVisibility() {
      setIsLoading(true);

      const targetPath = path || router.asPath;
      const result = await checkPageVisibility(targetPath, userRole, isAuthenticated);

      let shouldShow = result.isVisible && result.isAllowed;

      // فحص إضافي للمتطلبات المحلية
      if (shouldShow && requiresAuth && !isAuthenticated) {
        shouldShow = false;
      }

      if (
        shouldShow &&
        allowedRoles.length > 0 &&
        (!userRole || !allowedRoles.includes(userRole))
      ) {
        shouldShow = false;
      }

      setIsVisible(shouldShow);
      setIsLoading(false);
    }

    checkVisibility();
  }, [path, router.asPath, requiresAuth, allowedRoles, userRole, isAuthenticated]);

  if (isLoading) {
    return null; // أو مكون تحميل صغير
  }

  if (!isVisible) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// مكون للتحقق من رؤية رابط
export const VisibilityAwareLink: React.FC<{
  href: string;
  children: React.ReactNode;
  userRole?: string;
  isAuthenticated?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ href, children, userRole, isAuthenticated, className, fallback = null }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkLinkVisibility() {
      setIsLoading(true);
      const result = await checkPageVisibility(href, userRole, isAuthenticated);
      setIsVisible(result.isVisible && result.isAllowed);
      setIsLoading(false);
    }

    checkLinkVisibility();
  }, [href, userRole, isAuthenticated]);

  if (isLoading) {
    return null;
  }

  if (!isVisible) {
    return <>{fallback}</>;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};
