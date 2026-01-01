import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { PhoneIcon, ArrowRightIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { OpensooqNavbar } from '../components/common';
import { processPhoneNumber } from '../utils/phoneUtils';
import PhoneInputField from '../components/PhoneInputField';
import { type Country } from '../components/CountryCodeSelector';

interface PhoneInputFormData {
  phone: string;
  countryCode: string;
  accountType: string;
}

const PhoneInputPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<PhoneInputFormData>({
    phone: '',
    countryCode: '+218',
    accountType: 'REGULAR_USER',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // خيارات نوع الحساب
  const accountTypeOptions = [
    { value: 'REGULAR_USER', label: 'مستخدم عادي' },
    { value: 'TRANSPORT_OWNER', label: 'صاحب ساحبة - نقل' },
    { value: 'SHOWROOM', label: 'معرض سيارات' },
    { value: 'COMPANY', label: 'شركة' },
  ];

  const handleInputChange = (field: keyof PhoneInputFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const validatePhone = async (phone: string): Promise<boolean> => {
    const phoneResult = processPhoneNumber(formData.countryCode + phone);
    if (!phoneResult.isValid) {
      setError(phoneResult.error || 'رقم الهاتف غير صحيح');
      return false;
    }

    // التحقق من عدم وجود الرقم مسبقاً
    setIsCheckingPhone(true);
    try {
      const response = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneResult.fullNumber,
        }),
      });

      const data = await response.json();

      if (data.exists) {
        setError('رقم الهاتف مسجل مسبقاً. يرجى تسجيل الدخول أو استخدام رقم آخر.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('خطأ في التحقق من رقم الهاتف:', error);
      setError('حدث خطأ أثناء التحقق من رقم الهاتف. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await validatePhone(formData.phone);
      if (!isValid) {
        return;
      }

      const phoneResult = processPhoneNumber(formData.countryCode + formData.phone);

      // التوجه إلى صفحة التسجيل مع رقم الهاتف ونوع الحساب
      const params = new URLSearchParams({
        phone: phoneResult.fullNumber,
        accountType: formData.accountType,
      });

      router.push(`/register?${params.toString()}`);
    } catch (error) {
      console.error('خطأ في معالجة رقم الهاتف:', error);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>إنشاء حساب جديد - إدخال رقم الهاتف | موقع مزاد السيارات</title>
        <meta
          name="description"
          content="أدخل رقم هاتفك لبدء إنشاء حساب جديد في موقع مزاد السيارات"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* المحتوى الرئيسي */}
        <div className="flex min-h-[calc(100vh-80px)] items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* رأس الصفحة */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <PhoneIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">إنشاء حساب جديد</h1>
              <p className="text-gray-600">أدخل رقم هاتفك ونوع الحساب لبدء عملية التسجيل</p>
            </div>

            {/* حاوية النموذج */}
            <div className="relative z-10 rounded-xl bg-white shadow-lg">
              {/* رأس النموذج */}
              <div className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-lg font-bold text-white">معلومات الاتصال</h2>
                <p className="mt-1 text-sm text-blue-100">سنرسل رمز تحقق إلى رقم هاتفك</p>
              </div>

              {/* النموذج */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* رسالة خطأ عامة */}
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="ml-2 h-5 w-5 text-red-600" />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* رقم الهاتف */}
                  <div>
                    <PhoneInputField
                      label="رقم الهاتف"
                      required
                      value={formData.phone}
                      onChange={(v: string) => handleInputChange('phone', v)}
                      onCountryChange={(c: Country) => handleInputChange('countryCode', c.code)}
                      placeholder="أدخل رقم الهاتف"
                      className=""
                      allowCountrySelection={true}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      سيتم إرسال رمز التحقق إلى الرقم المُدخل
                    </p>
                  </div>

                  {/* نوع الحساب */}
                  <div>
                    <label
                      htmlFor="accountType"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      نوع الحساب
                    </label>
                    <select
                      id="accountType"
                      value={formData.accountType}
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading || isCheckingPhone}
                    >
                      {accountTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* زر المتابعة */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading || isCheckingPhone || !formData.phone.trim()}
                      className={`w-full rounded-lg px-4 py-3 font-medium text-white transition-colors ${
                        isLoading || isCheckingPhone || !formData.phone.trim()
                          ? 'cursor-not-allowed bg-gray-400'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }`}
                    >
                      {isLoading || isCheckingPhone ? (
                        <div className="flex items-center justify-center">
                          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                          {isCheckingPhone ? 'جاري التحقق من رقم الهاتف...' : 'جاري المعالجة...'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>متابعة إلى التسجيل</span>
                          <ArrowRightIcon className="mr-2 h-4 w-4" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* رابط تسجيل الدخول */}
                  <div className="border-t pt-4 text-center">
                    <p className="text-sm text-gray-600">
                      لديك حساب بالفعل؟{' '}
                      <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                        تسجيل الدخول
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* رابط العودة للصفحة الرئيسية */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhoneInputPage;
