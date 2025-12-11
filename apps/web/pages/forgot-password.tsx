import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { type Country } from '../components/CountryCodeSelector';
import PhoneInputField from '../components/PhoneInputField';
import { OpensooqNavbar } from '../components/common';
import { BackIcon, ForwardIcon } from '../components/common/icons/RTLIcon';
import { processPhoneNumber } from '../utils/phoneUtils';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [siteElements, setSiteElements] = useState<Record<string, boolean> | null>(null);
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+218');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // يتم تحديث كود الدولة عبر onCountryChange من PhoneInputField

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      setError('رقم الهاتف مطلوب');
      return;
    }

    const phoneResult = processPhoneNumber(dialCode + phone);
    if (!phoneResult.isValid) {
      setError(phoneResult.error || 'رقم الهاتف غير صحيح');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneResult.fullNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال رمز إعادة التعيين');
      }

      // التوجيه إلى صفحة التحقق
      const fullPhone = phoneResult.fullNumber;
      router.push(`/verify-phone?phone=${encodeURIComponent(fullPhone)}&type=password_reset`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء إرسال رمز إعادة التعيين. يرجى المحاولة مرة أخرى.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // جلب إعدادات العناصر القابلة للإظهار/الإخفاء
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/site-settings');
        const data = await res.json();
        if (mounted && data?.elements) setSiteElements(data.elements as Record<string, boolean>);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (isSuccess) {
    return (
      <>
        <Head>
          <title>تم إرسال رمز إعادة التعيين | موقع مزاد السيارات</title>
        </Head>

        <div className="min-h-screen bg-gray-50" dir="rtl">
          <OpensooqNavbar />

          <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">تم إرسال الرمز بنجاح</h2>
                <p className="mb-6 text-gray-600">
                  تم إرسال رمز إعادة تعيين كلمة المرور إلى رقم هاتفك
                </p>
                <p className="mb-8 text-sm text-gray-500">
                  {dialCode}
                  {phone}
                </p>
              </div>

              <div className="rounded-lg bg-white p-8 shadow-lg">
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">الخطوات التالية</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>1. تحقق من رسائل SMS على هاتفك</p>
                    <p>2. أدخل الرمز المرسل في الصفحة التالية</p>
                    <p>3. قم بإنشاء كلمة مرور جديدة</p>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => {
                        const resetPhone = localStorage.getItem('resetPhone');
                        router.push(
                          `/verify-phone?phone=${encodeURIComponent(resetPhone || '')}&type=password_reset`,
                        );
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      متابعة إعادة التعيين
                      <ForwardIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <p className="mb-2 text-xs text-gray-500">لم تستلم الرمز؟</p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>نسيت كلمة المرور | موقع مزاد السيارات</title>
        <meta name="description" content="إعادة تعيين كلمة المرور لحسابك في موقع مزاد السيارات" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
                <KeyIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">نسيت كلمة المرور؟</h2>
              <p className="text-gray-600">أدخل رقم هاتفك وسنرسل لك رمز إعادة التعيين</p>
            </div>

            {/* Form */}
            <div className="rounded-lg bg-white p-8 shadow-lg">
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* طريقة الاستعادة عبر الهاتف */}
              {siteElements?.['forgot_phone_method'] !== false ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Phone Number */}
                  <div>
                    <PhoneInputField
                      label="رقم الهاتف المسجل"
                      required
                      value={phone}
                      onChange={(v: string) => {
                        setPhone(v);
                        if (error) setError('');
                      }}
                      onCountryChange={(c: Country) => {
                        setDialCode(c.code);
                      }}
                      placeholder="أدخل رقم الهاتف"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      سيتم إرسال رمز إعادة التعيين إلى هذا الرقم
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex w-full justify-center rounded-lg border border-transparent px-4 py-3 text-sm font-medium text-white shadow-sm ${
                      isLoading
                        ? 'cursor-not-allowed bg-gray-400'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    } transition-colors`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        جاري الإرسال...
                      </div>
                    ) : (
                      'إرسال رمز إعادة التعيين'
                    )}
                  </button>
                </form>
              ) : (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                  طريقة الاستعادة عبر الهاتف غير متاحة حالياً
                </div>
              )}
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                العودة لتسجيل الدخول
                <BackIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* Help */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">
                تحتاج مساعدة؟
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• تأكد من أن رقم الهاتف هو نفسه المسجل في حسابك</p>
                <p>• تحقق من رسائل SMS في هاتفك</p>
                <p>• قد يستغرق وصول الرمز دقيقتين</p>
              </div>
              <div className="mt-4 border-t pt-4 text-center">
                <Link href="/help" className="text-sm text-blue-600 hover:text-blue-500">
                  تواصل مع الدعم الفني
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
