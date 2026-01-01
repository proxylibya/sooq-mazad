import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BackButton } from '../components/common';
import { LoadingButton } from '../components/ui';
import { saveUserSession } from '../utils/authUtils';
// BackButton removed: using inline safe back button
// import {
//   ArrowRightIcon,
//   EyeIcon,
//   EyeSlashIcon,
//   CheckIcon
// } from '@heroicons/react/24/outline';

const LoginPasswordPage: React.FC = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // استخراج رقم الهاتف من URL
  useEffect(() => {
    if (router.query.phone) {
      setPhoneNumber(router.query.phone as string);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // تسجيل البيانات المُرسلة للتشخيص (في development فقط)
      if (process.env.NODE_ENV === 'development') {
        console.log('[تسجيل دخول] البيانات المُرسلة:', {
          phone: phoneNumber,
          passwordLength: password.length,
          rememberMe: rememberMe,
        });
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          'Accept-Charset': 'utf-8',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          password: password,
          rememberMe: rememberMe,
        }),
      });

      const data = await response.json();

      // تسجيل الاستجابة للتشخيص
      if (process.env.NODE_ENV === 'development') {
        console.log('[تسجيل دخول] حالة الاستجابة:', response.status);
        console.log('[تسجيل دخول] بيانات الاستجابة:', data);
      }

      if (!response.ok) {
        // استخراج رسالة الخطأ بشكل صحيح
        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';

        if (data.error) {
          // إذا كان error هو object (من errorHandler)
          if (typeof data.error === 'object' && data.error.message) {
            errorMessage = data.error.message;
          }
          // إذا كان error هو string مباشر
          else if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        }

        // رسائل مخصصة حسب نوع الخطأ
        if (response.status === 401) {
          errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة';
        } else if (response.status === 404) {
          errorMessage = 'الحساب غير موجود. يرجى التحقق من رقم الهاتف';
        } else if (response.status === 429) {
          errorMessage = 'محاولات كثيرة. يرجى المحاولة بعد قليل';
        }

        throw new Error(errorMessage);
      }

      // حفظ الجلسة وإطلاق أحداث التحديث
      saveUserSession(data.data.user, data.data.token, rememberMe);
      if (data.data.wallet) {
        localStorage.setItem('wallet', JSON.stringify(data.data.wallet));
      }
      if (data.data.transportProfile) {
        localStorage.setItem('transportProfile', JSON.stringify(data.data.transportProfile));
      }

      // نجح تسجيل الدخول - توجيه للصفحة المناسبة
      const callbackUrl = router.query.callbackUrl as string;

      // التحقق من أن المستخدم ليس مدير - المديرين يجب أن يستخدموا نظام تسجيل الدخول الإداري
      if (data.data.user.role === 'ADMIN' || data.data.user.role === 'MODERATOR') {
        // إزالة بيانات الجلسة وإعادة التوجيه لتسجيل الدخول الإداري
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('wallet');
        localStorage.removeItem('transportProfile');

        setError('يرجى استخدام نظام تسجيل الدخول الإداري للوصول إلى لوحة التحكم');
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
        return;
      }

      // تحديد وجهة التوجيه
      let redirectUrl = '/';
      if (callbackUrl && !callbackUrl.startsWith('/admin')) {
        redirectUrl = callbackUrl;
      } else if (data.data.user.accountType === 'TRANSPORT_OWNER') {
        redirectUrl = '/transport/dashboard';
      } else if (data.data.user.accountType === 'SHOWROOM') {
        redirectUrl = '/showroom/dashboard';
      } else if (data.data.user.accountType === 'COMPANY') {
        redirectUrl = '/my-account';
      }

      // استخدام replace بدلاً من push لتجنب تضارب HMR
      // وإضافة تأخير بسيط للسماح بتحديث الحالة
      setTimeout(() => {
        router.replace(redirectUrl).catch(() => {
          // تجاهل أخطاء الإلغاء أثناء التطوير (HMR)
          if (process.env.NODE_ENV === 'development') {
            console.log('[تسجيل دخول] تم تجاهل خطأ التوجيه (HMR)');
          }
        });
      }, 100);
    } catch (error) {
      // معالجة الخطأ وعرض رسالة واضحة
      let errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // معالجة الأخطاء من نوع object
        errorMessage = (error as any).message || (error as any).error || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // التحقق من وجود callbackUrl للعودة إليه
    const callbackUrl = router.query.callbackUrl as string;

    // التحقق من وجود تاريخ تصفح
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else if (callbackUrl) {
      // إذا كان هناك callbackUrl، العودة للصفحة الرئيسية مع الاحتفاظ بالمعامل
      router.push(`/?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else {
      // إذا لم يكن هناك تاريخ تصفح أو callbackUrl، توجيه للصفحة الرئيسية
      router.push('/');
    }
  };

  const handleForgotPassword = () => {
    router.push(`/reset-password?phone=${encodeURIComponent(phoneNumber)}`);
  };

  const isPasswordValid = password.trim().length > 0;

  return (
    <>
      <Head>
        <title>كلمة المرور - مزاد السيارات</title>
        <meta name="description" content="تسجيل الدخول إلى حسابك" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-6 py-5 shadow-sm backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <BackButton
              onClick={handleBack}
              iconOnly
              size="sm"
              variant="gray"
              className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200"
            />

            <div className="flex items-center">
              <img
                src="/favicon.svg"
                alt="مزاد السيارات"
                className="h-10 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                }}
              />
              <div className="hidden text-xl font-bold text-blue-600">مزاد السيارات</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-md px-6 py-6">
          {/* Password Screen Container */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="mb-1 text-xl font-bold text-gray-900">كلمة المرور</h1>
              <p className="text-xs text-gray-600">الرجاء إدخال كلمة المرور للمتابعة</p>
            </div>

            {/* Form Section */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone Number Field (Disabled) */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone-field"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    رقم الموبايل
                  </label>
                  <div className="relative">
                    <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                        <svg
                          className="h-4 w-4 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <input
                        id="phone-field"
                        type="tel"
                        value={phoneNumber}
                        disabled
                        className="ml-3 h-full flex-1 border-none bg-transparent text-right font-medium text-gray-700 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password-field"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="flex h-14 items-center overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                        <svg
                          className="h-4 w-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        id="password-field"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        className="mx-3 h-full flex-1 border-none font-medium text-gray-900 placeholder-gray-400 outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-blue-600 transition-all duration-200 hover:bg-blue-50"
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Options Row */}
                <div className="mb-6 mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>

                  <label className="group flex cursor-pointer items-center">
                    <span className="mr-4 text-sm font-medium leading-6 text-gray-700 transition-colors duration-200 group-hover:text-gray-900">
                      تذكرني
                    </span>
                    <div className="relative ml-4 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`mx-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                          rememberMe
                            ? 'border-blue-600 bg-blue-600 shadow-md'
                            : 'border-gray-300 bg-white group-hover:border-blue-400'
                        }`}
                      >
                        {rememberMe && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                        <svg
                          className="h-4 w-4 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <LoadingButton
                  type="submit"
                  disabled={!isPasswordValid}
                  isLoading={isLoading}
                  loadingText="جاري تسجيل الدخول..."
                  className={`h-14 w-full rounded-xl text-lg font-semibold transition-all duration-200 ${
                    isPasswordValid && !isLoading
                      ? 'transform bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl'
                      : 'cursor-not-allowed bg-gray-200 text-gray-500'
                  }`}
                >
                  تسجيل دخول
                </LoadingButton>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 py-8 text-center text-sm text-gray-500">
          <p className="leading-relaxed">
            باستخدامك مزاد السيارات أنت توافق على <br />
            <Link
              href="/terms"
              className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
            >
              شروط الاستخدام
            </Link>
            {' و '}
            <Link
              href="/privacy"
              className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
            >
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPasswordPage;
