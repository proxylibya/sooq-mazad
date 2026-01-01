import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import { processPhoneNumber } from '../../utils/phoneUtils';
// import { login, logout } from '../../utils/authUtils'; // تعطيل مؤقت
import PhoneInputField from '../PhoneInputField';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

// قائمة الدول العربية مع الأعلام
const arabCountries = [
  { code: '+218', name: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾' },
  { code: '+20', name: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: '+966', name: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', name: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪' },
  { code: '+974', name: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
  { code: '+965', name: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', name: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', name: 'عُمان', nameEn: 'Oman', flag: '🇴🇲' },
  { code: '+962', name: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: '+961', name: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧' },
  { code: '+963', name: 'سوريا', nameEn: 'Syria', flag: '🇸🇾' },
  { code: '+964', name: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { code: '+212', name: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: '+213', name: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
  { code: '+216', name: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
  { code: '+249', name: 'السودان', nameEn: 'Sudan', flag: '🇸🇩' },
  { code: '+967', name: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪' },
  { code: '+970', name: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸' },
  { code: '+222', name: 'موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷' },
  { code: '+252', name: 'الصومال', nameEn: 'Somalia', flag: '🇸🇴' },
  { code: '+253', name: 'جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯' },
  { code: '+269', name: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲' },
];

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess: _onLoginSuccess,
}) => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(arabCountries[0]); // ليبيا افتراضياً
  const dropdownRef = useRef<HTMLDivElement>(null);

  // تتبع تغيير حالة القائمة المنسدلة
  useEffect(() => {}, [showCountryDropdown]);

  // إضافة/إزالة كلاس modal-open للجسم
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // تنظيف عند إلغاء المكون
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

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

  // دالة تنقل آمنة كتبديل في حال فشل router.push
  const safeNavigate = (path: string) => {
    try {
      setTimeout(() => {
        router.push(path).catch(() => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('فشل التنقل باستخدام router.push، سيتم استخدام window.location');
          }
          window.location.href = path;
        });
      }, 100);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('استثناء أثناء التنقل، سيتم استخدام window.location:', error);
      }
      window.location.href = path;
    }
  };

  // إغلاق النافذة عند النقر خارجها
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // معالجة إدخال رقم الهاتف
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError('');

    // التحقق الفوري من صحة الرقم مع رمز الدولة المختار
    if (value.length > 0) {
      const result = processPhoneNumber(selectedCountry.code + value);
      if (!result.isValid && value.length > 3) {
        setPhoneError(result.error || 'رقم الهاتف غير صحيح');
      }
    }
  };

  // ملاحظة: اختيار الدولة يتم الآن من خلال PhoneInputField

  const handleNext = async () => {
    if (!phoneNumber.trim()) {
      setPhoneError('يرجى إدخال رقم الهاتف');
      return;
    }

    // معالجة رقم الهاتف باستخدام النظام الجديد
    const phoneResult = processPhoneNumber(selectedCountry.code + phoneNumber);

    if (!phoneResult.isValid) {
      setPhoneError(phoneResult.error || 'رقم الهاتف غير صحيح');
      return;
    }

    setIsLoading(true);
    setPhoneError('');

    try {
      const fullPhoneNumber = phoneResult.fullNumber;

      // التحقق من وجود رقم الهاتف في قاعدة البيانات
      const response = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: fullPhoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        // إغلاق النافذة المنبثقة
        onClose();

        // إضافة callbackUrl إذا كان موجوداً
        const callbackUrl = router.query.callbackUrl as string;
        const callbackParam = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : '';

        if (data.data.exists) {
          // المستخدم موجود - توجيه لصفحة كلمة المرور
          safeNavigate(
            `/login-password?phone=${encodeURIComponent(fullPhoneNumber)}${callbackParam}`,
          );
        } else {
          // مستخدم جديد - توجيه لصفحة التسجيل
          const pendingAccountType = localStorage.getItem('pendingAccountType');
          const accountTypeParam = pendingAccountType ? `&accountType=${pendingAccountType}` : '';
          safeNavigate(
            `/register?phone=${encodeURIComponent(fullPhoneNumber)}${callbackParam}${accountTypeParam}`,
          );
          // مسح نوع الحساب المحفوظ
          localStorage.removeItem('pendingAccountType');
        }
      } else {
        console.error('خطأ في التحقق من رقم الهاتف:', data.error);
        // في حالة الخطأ، توجيه افتراضي لصفحة تسجيل الدخول
        onClose();
        const callbackUrl = router.query.callbackUrl as string;
        const callbackParam = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : '';
        safeNavigate(
          `/login-password?phone=${encodeURIComponent(fullPhoneNumber)}${callbackParam}`,
        );
      }
    } catch (error) {
      console.error('خطأ في الاتصال بالخادم:', error);
      // في حالة الخطأ، توجيه افتراضي لصفحة تسجيل الدخول
      const phoneResult = processPhoneNumber(selectedCountry.code + phoneNumber);
      if (phoneResult.isValid) {
        onClose();
        const callbackUrl = router.query.callbackUrl as string;
        const callbackParam = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : '';
        safeNavigate(
          `/login-password?phone=${encodeURIComponent(phoneResult.fullNumber)}${callbackParam}`,
        );
      } else {
        setPhoneError('حدث خطأ في التحقق من رقم الهاتف');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPhoneValid = phoneNumber.trim().length > 0 && processPhoneNumber(phoneNumber).isValid;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
      dir="rtl"
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        style={{
          boxShadow:
            'rgba(0, 0, 0, 0.2) 0px 11px 15px -7px, rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 46px 8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-4">
            {/* زر الإغلاق المحسن */}
            <button
              onClick={onClose}
              className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 transition-all duration-200 hover:border-red-300 hover:bg-red-100"
              title="إغلاق"
            >
              <XMarkIcon className="h-6 w-6 text-red-600 group-hover:text-red-700" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">تسجيل الدخول أو التسجيل</h2>
              <p className="text-sm text-gray-600">الرجاء تعبئة رقم الموبايل</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* زر رجوع */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800"
            >
              رجوع
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex max-[700px]:flex-col">
          {/* Form Section */}
          <div className="flex-1 bg-gray-50 p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isPhoneValid && !isLoading) {
                  handleNext();
                }
              }}
            >
              <PhoneInputField
                value={phoneNumber}
                onChange={handlePhoneChange}
                onCountryChange={(country) => {
                  // تحويل تنسيق البلد ليتوافق مع selectedCountry
                  const convertedCountry = {
                    code: country.code,
                    name: country.name,
                    nameEn: country.name, // استخدام نفس الاسم
                    flag: 'ليبيا', // علم افتراضي
                  };
                  setSelectedCountry(convertedCountry);
                }}
                onEnterPress={() => {
                  if (isPhoneValid && !isLoading) {
                    handleNext();
                  }
                }}
                label="رقم الموبايل"
                placeholder="أدخل رقم الموبايل"
                error={phoneError}
                required
                autoFocus
                className="mb-6"
              />

              <button
                type="submit"
                disabled={!isPhoneValid || isLoading}
                className={`w-full rounded-lg px-4 py-3 text-lg font-medium transition-colors ${
                  isPhoneValid && !isLoading
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
              >
                {isLoading ? 'جاري التحقق...' : 'التالي'}
              </button>
            </form>

            {/* رابط إنشاء حساب جديد */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                لا تملك حساب؟{' '}
                <button
                  onClick={() => {
                    onClose();
                    router.push('/register');
                  }}
                  className="font-medium text-blue-600 underline hover:text-blue-700"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              باستخدامك مزاد السيارات أنت توافق على <br />
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                شروط الاستخدام
              </Link>
              {' و '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                سياسة الخصوصية
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-white p-6 max-[700px]:w-full max-[700px]:border-r-0 max-[700px]:border-t">
            <div className="mb-6">
              <p className="mb-1 text-sm text-gray-600">أفضل طريقة</p>
              <h3 className="text-xl font-bold text-gray-900">لبيع أو شراء أي سيارة</h3>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>انضم إلى آلاف الأشخاص على مزاد السيارات</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>تسجيل الدخول يعزز الثقة والأمان</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>أجب على الرسائل والعروض</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>إدارة الإعلانات المفضلة والمحفوظة</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>أضف أي سيارة للبيع أو للمزاد</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
