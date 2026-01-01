/**
 * 📄 صفحات الأخطاء الموحدة
 * Unified Error Pages Components
 */

import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  HomeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  LockClosedIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// =====================================
// 404 - Page Not Found
// =====================================

interface NotFoundPageProps {
  title?: string;
  description?: string;
  showAutoRedirect?: boolean;
  redirectUrl?: string;
  redirectDelay?: number;
  isAdmin?: boolean;
}

export function NotFoundPage({
  title = 'الصفحة غير موجودة',
  description = 'عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها.',
  showAutoRedirect = true,
  redirectUrl = '/',
  redirectDelay = 10,
  isAdmin = false,
}: NotFoundPageProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(redirectDelay);
  const [shouldRedirect, setShouldRedirect] = useState(showAutoRedirect);

  useEffect(() => {
    if (!shouldRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, shouldRedirect, redirectUrl]);

  const bgClass = isAdmin ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-blue-50';
  const textClass = isAdmin ? 'text-gray-100' : 'text-gray-900';
  const homeUrl = isAdmin ? '/admin' : '/';

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-12 ${bgClass}`}>
      <div className="w-full max-w-2xl text-center">
        {/* 404 Icon & Number */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 animate-pulse rounded-full bg-red-100 opacity-20"></div>
            </div>
            <div className="relative z-10 py-8">
              <h1 className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-9xl font-black text-transparent">
                404
              </h1>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className={`mb-4 text-3xl font-bold ${textClass}`}>
          {title}
        </h2>
        <p className={`mb-8 ${isAdmin ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>

        {/* Auto Redirect */}
        {shouldRedirect && countdown > 0 && (
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 rounded-full px-6 py-3 ${
              isAdmin ? 'bg-gray-800' : 'bg-blue-100'
            }`}>
              <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />
              <p className={`font-medium ${isAdmin ? 'text-blue-400' : 'text-blue-700'}`}>
                سيتم التوجيه خلال {countdown} ثانية
              </p>
            </div>
            <button
              onClick={() => setShouldRedirect(false)}
              className={`mt-3 block w-full text-sm underline ${
                isAdmin ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              إلغاء التوجيه التلقائي
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={homeUrl}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition ${
              isAdmin
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span>الصفحة الرئيسية</span>
          </Link>
          <button
            onClick={() => router.back()}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-medium transition ${
              isAdmin
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>رجوع</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================
// 500 - Server Error
// =====================================

interface ServerErrorPageProps {
  title?: string;
  description?: string;
  errorCode?: number;
  errorMessage?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  isAdmin?: boolean;
}

export function ServerErrorPage({
  title = 'خطأ في الخادم',
  description = 'عذراً، حدث خطأ غير متوقع. نعمل على حل المشكلة.',
  errorCode = 500,
  errorMessage,
  showDetails = false,
  onRetry,
  isAdmin = false,
}: ServerErrorPageProps) {
  const router = useRouter();
  const bgClass = isAdmin ? 'bg-gray-900' : 'bg-gradient-to-br from-red-50 via-white to-red-50';
  const textClass = isAdmin ? 'text-gray-100' : 'text-gray-900';
  const homeUrl = isAdmin ? '/admin' : '/';

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-12 ${bgClass}`}>
      <div className="w-full max-w-2xl text-center">
        {/* Error Icon & Code */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 animate-pulse rounded-full bg-red-100 opacity-20"></div>
            </div>
            <div className="relative z-10 py-8">
              <XCircleIcon className="mx-auto h-24 w-24 text-red-500" />
              <h1 className="mt-4 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-6xl font-black text-transparent">
                {errorCode}
              </h1>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className={`mb-4 text-3xl font-bold ${textClass}`}>
          {title}
        </h2>
        <p className={`mb-8 ${isAdmin ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>

        {/* Error Details */}
        {showDetails && errorMessage && (
          <div className={`mb-8 rounded-lg p-4 text-left ${
            isAdmin ? 'bg-gray-800' : 'bg-red-50'
          }`}>
            <p className={`font-mono text-sm ${
              isAdmin ? 'text-red-400' : 'text-red-600'
            }`}>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition ${
                isAdmin
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>إعادة المحاولة</span>
            </button>
          )}
          <Link
            href={homeUrl}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-medium transition ${
              isAdmin
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// =====================================
// 403 - Forbidden
// =====================================

interface ForbiddenPageProps {
  title?: string;
  description?: string;
  requiredRole?: string;
  requiredPermission?: string;
  isAdmin?: boolean;
}

export function ForbiddenPage({
  title = 'غير مصرح',
  description = 'ليس لديك الصلاحية للوصول إلى هذه الصفحة.',
  requiredRole,
  requiredPermission,
  isAdmin = false,
}: ForbiddenPageProps) {
  const router = useRouter();
  const bgClass = isAdmin ? 'bg-gray-900' : 'bg-gradient-to-br from-yellow-50 via-white to-yellow-50';
  const textClass = isAdmin ? 'text-gray-100' : 'text-gray-900';
  const homeUrl = isAdmin ? '/admin' : '/';
  const loginUrl = isAdmin ? '/admin/login' : '/login';

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-12 ${bgClass}`}>
      <div className="w-full max-w-2xl text-center">
        {/* Lock Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 animate-pulse rounded-full bg-yellow-100 opacity-20"></div>
            </div>
            <div className="relative z-10 py-8">
              <LockClosedIcon className="mx-auto h-24 w-24 text-yellow-500" />
              <h1 className="mt-4 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-6xl font-black text-transparent">
                403
              </h1>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className={`mb-4 text-3xl font-bold ${textClass}`}>
          {title}
        </h2>
        <p className={`mb-4 ${isAdmin ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>

        {/* Required Info */}
        {(requiredRole || requiredPermission) && (
          <div className={`mb-8 rounded-lg p-4 ${
            isAdmin ? 'bg-gray-800' : 'bg-yellow-50'
          }`}>
            {requiredRole && (
              <p className={`mb-2 ${isAdmin ? 'text-yellow-400' : 'text-yellow-700'}`}>
                <strong>الدور المطلوب:</strong> {requiredRole}
              </p>
            )}
            {requiredPermission && (
              <p className={isAdmin ? 'text-yellow-400' : 'text-yellow-700'}>
                <strong>الصلاحية المطلوبة:</strong> {requiredPermission}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={loginUrl}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition ${
              isAdmin
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            <LockClosedIcon className="h-5 w-5" />
            <span>تسجيل الدخول</span>
          </Link>
          <Link
            href={homeUrl}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-medium transition ${
              isAdmin
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// =====================================
// 401 - Unauthorized
// =====================================

interface UnauthorizedPageProps {
  title?: string;
  description?: string;
  isAdmin?: boolean;
}

export function UnauthorizedPage({
  title = 'غير مسموح',
  description = 'يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة.',
  isAdmin = false,
}: UnauthorizedPageProps) {
  const router = useRouter();
  const bgClass = isAdmin ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-50';
  const textClass = isAdmin ? 'text-gray-100' : 'text-gray-900';
  const loginUrl = isAdmin ? '/admin/login' : '/login';

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-12 ${bgClass}`}>
      <div className="w-full max-w-2xl text-center">
        {/* Warning Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 animate-pulse rounded-full bg-orange-100 opacity-20"></div>
            </div>
            <div className="relative z-10 py-8">
              <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-orange-500" />
              <h1 className="mt-4 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-6xl font-black text-transparent">
                401
              </h1>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className={`mb-4 text-3xl font-bold ${textClass}`}>
          {title}
        </h2>
        <p className={`mb-8 ${isAdmin ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`${loginUrl}?returnUrl=${encodeURIComponent(router.asPath)}`}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition ${
              isAdmin
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <LockClosedIcon className="h-5 w-5" />
            <span>تسجيل الدخول</span>
          </Link>
          <button
            onClick={() => router.back()}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-medium transition ${
              isAdmin
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>رجوع</span>
          </button>
        </div>
      </div>
    </div>
  );
}
