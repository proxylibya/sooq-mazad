import {
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AuthError = () => {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [errorDescription, setErrorDescription] = useState<string>('');

  useEffect(() => {
    const { error: errorCode } = router.query;

    switch (errorCode) {
      case 'Configuration':
        setError('خطأ في تكوين المصادقة');
        setErrorDescription('هناك مشكلة في إعدادات نظام المصادقة. يرجى التواصل مع الدعم الفني.');
        break;
      case 'AccessDenied':
        setError('تم رفض الوصول');
        setErrorDescription('ليس لديك الصلاحيات الكافية للوصول إلى هذا المورد.');
        break;
      case 'Verification':
        setError('فشل في التحقق');
        setErrorDescription('لم نتمكن من التحقق من بياناتك. يرجى المحاولة مرة أخرى.');
        break;
      case 'Default':
      default:
        setError('حدث خطأ في المصادقة');
        setErrorDescription('حدث خطأ غير متوقع أثناء عملية المصادقة. يرجى المحاولة مرة أخرى.');
        break;
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>خطأ في المصادقة - سوق المزاد</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* رسم توضيحي متحرك */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              {/* دوائر متحركة في الخلفية */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 animate-pulse rounded-full bg-blue-100 opacity-20"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 animate-ping rounded-full bg-blue-200 opacity-10"></div>
              </div>

              {/* أيقونة التحذير */}
              <div className="relative z-10 py-8">
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-400 md:h-48 md:w-48">
                  <ExclamationTriangleIcon className="h-16 w-16 text-white md:h-24 md:w-24" />
                </div>
              </div>
            </div>
          </div>

          {/* العنوان والوصف */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">{error}</h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">{errorDescription}</p>

            {/* رسالة توضيحية */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-6 py-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
              <p className="font-medium text-blue-700">
                يرجى المحاولة مرة أخرى أو التواصل مع الدعم
              </p>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="mb-12">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* تسجيل الدخول */}
              <Link
                href="/login"
                className="group relative rounded-xl border-2 border-transparent bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 transition-colors duration-300 group-hover:bg-blue-600">
                    <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      تسجيل الدخول
                    </h4>
                    <p className="text-sm text-gray-600">العودة لصفحة تسجيل الدخول</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>
              </Link>

              {/* الصفحة الرئيسية */}
              <Link
                href="/"
                className="group relative rounded-xl border-2 border-transparent bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-500 transition-colors duration-300 group-hover:bg-green-600">
                    <HomeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      الصفحة الرئيسية
                    </h4>
                    <p className="text-sm text-gray-600">العودة للصفحة الرئيسية</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>
              </Link>
            </div>
          </div>

          {/* زر العودة للصفحة الرئيسية الرئيسي */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex transform items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl"
            >
              <HomeIcon className="h-5 w-5" />
              <span>العودة للصفحة الرئيسية</span>
            </Link>
          </div>

          {/* معلومات المساعدة */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-6 py-3">
              <PhoneIcon className="h-5 w-5 text-gray-600" />
              <p className="text-gray-700">
                هل تحتاج مساعدة؟{' '}
                <Link
                  href="/contact"
                  className="font-medium text-blue-600 underline hover:text-blue-700"
                >
                  تواصل معنا
                </Link>
              </p>
            </div>
          </div>

          {/* شريط الديكور السفلي */}
          <div className="mt-16 flex justify-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthError;
