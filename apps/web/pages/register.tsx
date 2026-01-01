import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { type Country } from '../components/CountryCodeSelector';
import PhoneInputField from '../components/PhoneInputField';
import { OpensooqNavbar } from '../components/common';
import SelectField from '../components/ui/SelectField';
import { authApi } from '../utils/apiUtils';
import { processPhoneNumber } from '../utils/phoneUtils';

import type { AccountType } from '../types/account';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: AccountType;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  accountType?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { phone, accountType } = router.query;

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: (phone as string) || '',
    password: '',
    confirmPassword: '',
    accountType: 'REGULAR_USER',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [siteElements, setSiteElements] = useState<Record<string, boolean> | null>(null);

  // خيارات نوع الحساب
  const accountTypeOptions = useMemo(() => {
    const base = [
      { value: 'REGULAR_USER', label: 'مستخدم عادي' },
      { value: 'TRANSPORT_OWNER', label: 'صاحب ساحبة - نقل' },
      { value: 'SHOWROOM', label: 'معرض سيارات' },
      { value: 'COMPANY', label: 'شركة' },
    ];
    if (!siteElements) return base;
    const map: Record<AccountType, string> = {
      REGULAR_USER: 'register_account_personal',
      TRANSPORT_OWNER: 'register_account_transport',
      SHOWROOM: 'register_account_showroom',
      COMPANY: 'register_account_company',
    } as const;
    return base.filter((opt) => siteElements[map[opt.value as AccountType]] !== false);
  }, [siteElements]);

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

  // التحقق من وجود رقم الهاتف من URL (اختياري)
  useEffect(() => {
    if (phone && typeof phone === 'string') {
      try {
        const result = processPhoneNumber(phone);
        if (result.isValid) {
          // استخدم العرض المحلي (0 + الرقم الوطني) بدون مفتاح الدولة
          setFormData((prev) => ({ ...prev, phone: result.displayNumber }));
        } else {
          // تنظيف احتياطي: إزالة أي رموز ثم إزالة 218 إن وجدت وإضافة 0 في البداية
          let digits = phone.replace(/\D/g, '');
          if (digits.startsWith('218')) digits = digits.slice(3);
          if (!digits.startsWith('0') && digits.length > 0) digits = '0' + digits;
          setFormData((prev) => ({ ...prev, phone: digits }));
        }
      } catch {
        let digits = phone.replace(/\D/g, '');
        if (digits.startsWith('218')) digits = digits.slice(3);
        if (!digits.startsWith('0') && digits.length > 0) digits = '0' + digits;
        setFormData((prev) => ({ ...prev, phone: digits }));
      }
    }
  }, [phone]);

  // تعيين نوع الحساب من المعامل
  useEffect(() => {
    if (
      accountType &&
      ['REGULAR_USER', 'TRANSPORT_OWNER', 'COMPANY', 'SHOWROOM'].includes(accountType as string)
    ) {
      setFormData((prev) => ({
        ...prev,
        accountType: accountType as AccountType,
      }));
    }
  }, [accountType]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم مطلوب';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'الاسم يجب أن يكون حرفين على الأقل';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'اللقب مطلوب';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'اللقب يجب أن يكون حرفين على الأقل';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('[التحرير] البيانات:', {
        phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        accountType: formData.accountType,
      });
      console.log('[البحث] نوع البيانات:', {
        accountTypeType: typeof formData.accountType,
        accountTypeValue: formData.accountType,
        accountTypeLength: formData.accountType?.length,
      });

      const result = await authApi.register({
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        accountType: formData.accountType,
      });

      if (result.success) {
        // إذا كان هناك رمز تحقق في الاستجابة، عرضه للمستخدم
        // التحقق من أن المستخدم المسجل ليس مدير
        if (result.data?.user?.role === 'ADMIN' || result.data?.user?.role === 'MODERATOR') {
          setErrors({
            general: 'لا يمكن إنشاء حسابات إدارية من خلال هذا النظام. يرجى التواصل مع مدير النظام.',
          });
          return;
        }

        if (result.data?.verificationCode) {
          setVerificationCode(result.data.verificationCode);
          setShowVerificationCode(true);
        } else {
          // تمرير رقم الهاتف مع رسالة نجاح التسجيل
          const phoneParam = formData.phone ? `&phone=${encodeURIComponent(formData.phone)}` : '';
          router.push(`/login?message=registration_success${phoneParam}`);
        }
      } else {
        console.error('[فشل] فشل التسجيل:', result.error);
        setErrors({ general: result.error || 'حدث خطأ أثناء التسجيل' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsLoading(false);
    }
  };

  // مكون يعمل مع أو بدون phone parameter

  // مكون عرض رمز التحقق
  if (showVerificationCode && verificationCode) {
    return (
      <>
        <Head>
          <title>رمز التحقق - مزاد السيارات</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">تم إنشاء الحساب بنجاح!</h1>
              <p className="mb-6 text-gray-600">رمز التحقق الخاص بك:</p>

              <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <div className="font-mono text-3xl font-bold tracking-wider text-blue-600">
                  {verificationCode}
                </div>
              </div>

              <p className="mb-6 text-sm text-gray-500">
                يرجى حفظ هذا الرمز واستخدامه للتحقق من رقم هاتفك عند تسجيل الدخول.
              </p>

              <button
                onClick={() => {
                  // تمرير رقم الهاتف مع رسالة نجاح التسجيل
                  const phoneParam = formData.phone
                    ? `&phone=${encodeURIComponent(formData.phone)}`
                    : '';
                  router.push(`/login?message=registration_success${phoneParam}`);
                }}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                متابعة إلى تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>إنشاء حساب جديد | موقع مزاد السيارات</title>
        <meta
          name="description"
          content="انضم إلى موقع مزاد السيارات وابدأ في شراء وبيع السيارات المستعملة بأفضل الأسعار"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* المحتوى الرئيسي */}
        <div className="flex min-h-[calc(100vh-80px)] items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* حاوية النموذج */}
            <div className="relative z-10 rounded-xl bg-white shadow-lg">
              {/* رأس النموذج */}
              <div className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <h1 className="text-lg font-bold text-white">إنشاء حساب جديد</h1>
                <p className="mt-0.5 text-xs text-blue-100">
                  انضم إلى موقع مزاد السيارات وابدأ رحلتك معنا
                </p>
              </div>

              {/* النموذج */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* رسالة خطأ عامة */}
                  {errors.general && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                  )}

                  {/* الاسم الأول */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-right text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل اسمك الأول"
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* اللقب */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      اللقب
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-right text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل اللقب"
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <PhoneInputField
                      label="رقم الهاتف"
                      required
                      value={formData.phone}
                      onChange={(v: string) => handleInputChange('phone', v)}
                      onCountryChange={(_c: Country) => {
                        // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
                      }}
                      placeholder="أدخل رقم الهاتف"
                      error={errors.phone}
                      disabled={isLoading}
                      allowCountrySelection={true}
                      defaultCountry="LY"
                    />
                  </div>

                  {/* نوع الحساب */}
                  <div>
                    <label
                      htmlFor="accountType"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      نوع الحساب
                    </label>
                    <SelectField
                      options={accountTypeOptions}
                      value={formData.accountType}
                      onChange={(value) => handleInputChange('accountType', value as AccountType)}
                      placeholder="اختر نوع الحساب"
                      disabled={isLoading}
                      error={errors.accountType}
                      searchable
                      clearable
                    />
                    {errors.accountType && (
                      <p className="mt-1 text-xs text-red-600">{errors.accountType}</p>
                    )}
                  </div>

                  {/* كلمة المرور */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 pr-10 text-right text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                        placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* تأكيد كلمة المرور */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 pr-10 text-right text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.confirmPassword
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="أعد إدخال كلمة المرور"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* زر الإرسال */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full rounded-lg px-4 py-3 font-medium text-white transition-colors ${
                        isLoading
                          ? 'cursor-not-allowed bg-gray-400'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                            style={{ width: 24, height: 24 }}
                            role="status"
                            aria-label="جاري التحميل"
                          />
                          <span>جاري إنشاء الحساب...</span>
                        </div>
                      ) : (
                        'إنشاء الحساب'
                      )}
                    </button>
                  </div>

                  {/* رابط تسجيل الدخول */}
                  <div className="mt-6 border-t pt-4 text-center">
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
}
