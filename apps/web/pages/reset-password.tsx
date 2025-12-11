import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../components/common';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // مسح الخطأ عند تغيير القيمة
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // التحقق من الكود
    if (!formData.code.trim()) {
      newErrors.code = 'رمز التحقق مطلوب';
    } else if (formData.code.length !== 6) {
      newErrors.code = 'رمز التحقق يجب أن يكون 6 أرقام';
    }

    // التحقق من كلمة المرور الجديدة
    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم';
    }

    // التحقق من تأكيد كلمة المرور
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // محاكاة عملية إعادة تعيين كلمة المرور
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // في التطبيق الحقيقي، ستكون هناك مكالمة API هنا

      // إعادة توجيه للصفحة الرئيسية مع رسالة نجاح
      router.push('/?reset=success');
    } catch (error) {
      setErrors({
        general: 'حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.newPassword;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'ضعيفة', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'متوسطة', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'قوية', color: 'bg-green-500' };
    return { strength, label: 'قوية جداً', color: 'bg-green-600' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <Head>
        <title>إعادة تعيين كلمة المرور | موقع مزاد السيارات</title>
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
              <h2 className="mb-2 text-3xl font-bold text-gray-900">إعادة تعيين كلمة المرور</h2>
              <p className="text-gray-600">أدخل رمز التحقق وكلمة المرور الجديدة</p>
            </div>

            {/* Form */}
            <div className="rounded-lg bg-white p-8 shadow-lg">
              {errors.general && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-700">{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Verification Code */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    رمز التحقق *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="أدخل الرمز المرسل إلى هاتفك"
                    className={`w-full rounded-lg border px-3 py-3 text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={6}
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    كلمة المرور الجديدة *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="أدخل كلمة مرور قوية"
                      className={`w-full rounded-lg border px-3 py-3 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                        errors.newPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                            style={{
                              width: `${(passwordStrength.strength / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    تأكيد كلمة المرور الجديدة *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      className={`w-full rounded-lg border px-3 py-3 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword &&
                    formData.newPassword === formData.confirmPassword && (
                      <div className="mt-1 flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">كلمة المرور متطابقة</span>
                      </div>
                    )}
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
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
                      جاري إعادة التعيين...
                    </div>
                  ) : (
                    'إعادة تعيين كلمة المرور'
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>

            {/* Security Tips */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">نصائح الأمان</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• استخدم كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام</p>
                <p>• لا تشارك كلمة المرور مع أي شخص آخر</p>
                <p>• قم بتغيير كلمة المرور بانتظام</p>
                <p>• لا تستخدم نفس كلمة المرور في مواقع أخرى</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
