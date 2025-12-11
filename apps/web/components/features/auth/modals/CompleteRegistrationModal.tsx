import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface CompleteRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onRegistrationSuccess: () => void;
}

const CompleteRegistrationModal: React.FC<CompleteRegistrationModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  onRegistrationSuccess,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    accountType: 'REGULAR_USER',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // إغلاق النافذة عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم مطلوب';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'اللقب مطلوب';
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

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'يجب الموافقة على الشروط والأحكام';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 1, text: 'ضعيفة', color: 'text-red-600' };
    if (password.length < 8) return { strength: 2, text: 'متوسطة', color: 'text-yellow-600' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, text: 'قوية', color: 'text-green-600' };
    }
    return { strength: 2, text: 'متوسطة', color: 'text-yellow-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // محاكاة عملية إنشاء الحساب
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // في التطبيق الحقيقي، ستكون هناك مكالمة API هنا
      // نجح التسجيل
      onRegistrationSuccess();
    } catch (error) {
      setErrors({
        general: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      {/* خلفية مظلمة */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* النافذة المنبثقة */}
      <div className="shadow-custom login-modal-content login-modal relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
        {/* رأس النافذة */}
        <div className="flex items-center justify-between border-b p-6" dir="rtl">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">إكمال التسجيل</h2>
              <p className="text-sm text-gray-600">أدخل بياناتك لإنشاء الحساب</p>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <UserIcon className="h-6 w-6 text-green-600" />
          </div>
        </div>

        {/* المحتوى */}
        <div className="p-6" dir="rtl">
          <div className="mb-6 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">تم تأكيد رقم الهاتف بنجاح</span>
            </div>
            <p className="font-medium text-gray-900" dir="ltr">
              {phoneNumber}
            </p>
          </div>

          {errors.general && <div className="error-message mb-4">{errors.general}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* اسمك واللقب */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* اسمك */}
              <div className="flex-1">
                <label htmlFor="firstName" className="mb-2 block text-sm font-bold text-gray-900">
                  اسمك
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="أدخل اسمك"
                  className={`w-full rounded-lg border px-3 py-3 transition-colors focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* اللقب */}
              <div className="flex-1">
                <label htmlFor="lastName" className="mb-2 block text-sm font-bold text-gray-900">
                  اللقب
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="أدخل اللقب"
                  className={`w-full rounded-lg border px-3 py-3 transition-colors focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-gray-900">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className={`w-full rounded-lg border px-3 py-3 pr-12 transition-colors focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength.strength === 1
                            ? 'w-1/3 bg-red-500'
                            : passwordStrength.strength === 2
                              ? 'w-2/3 bg-yellow-500'
                              : passwordStrength.strength === 3
                                ? 'w-full bg-green-500'
                                : 'w-0'
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* نوع الحساب */}
            <div>
              <label htmlFor="accountType" className="mb-2 block text-sm font-bold text-gray-900">
                نوع الحساب
              </label>
              <select
                id="accountType"
                value={formData.accountType}
                onChange={(e) => handleInputChange('accountType', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 transition-colors focus:ring-2 focus:ring-blue-500"
              >
                <option value="REGULAR_USER">مستخدم عادي</option>
                <option value="TRANSPORT_OWNER">صاحب ساحبة - نقل</option>
                <option value="SHOWROOM">معرض سيارات</option>
                <option value="COMPANY">شركة</option>
              </select>
              <p className="mt-1 text-sm text-gray-600">
                {formData.accountType === 'REGULAR_USER' && 'حساب عادي للمستخدمين الأفراد'}
                {formData.accountType === 'TRANSPORT_OWNER' &&
                  'حساب مخصص لأصحاب الساحبات وخدمات النقل'}
                {formData.accountType === 'SHOWROOM' && 'حساب مخصص لمعارض السيارات'}
                {formData.accountType === 'COMPANY' && 'حساب مخصص للشركات والمؤسسات'}
              </p>
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className={`w-full rounded-lg border px-3 py-3 pr-12 transition-colors focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">كلمات المرور متطابقة</span>
                </div>
              )}
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* الموافقة على الشروط */}
            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  أوافق على{' '}
                  <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-700">
                    شروط الاستخدام
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-700">
                    سياسة الخصوصية
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* زر إنشاء الحساب */}
            <button
              type="submit"
              disabled={isLoading}
              className={`next-button btn-primary w-full rounded-lg px-4 py-3 text-lg font-bold text-white transition-all ${
                isLoading ? 'cursor-not-allowed bg-gray-400' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner h-5 w-5 rounded-full border-2 border-white border-t-transparent"></div>
                  جاري إنشاء الحساب...
                </div>
              ) : (
                'إنشاء الحساب'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistrationModal;
