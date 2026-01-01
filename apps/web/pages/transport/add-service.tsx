import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { type Country } from '../../components/CountryCodeSelector';
import PhoneInputField from '../../components/PhoneInputField';
import { OpensooqNavbar } from '../../components/common';
import TransportImageUploader from '../../components/transport/TransportImageUploader';
import useAuth from '../../hooks/useAuth';
import { isTransportOwner } from '../../utils/accountTypeUtils';
import { processPhoneNumber } from '../../utils/phoneUtils';

// دالة إنشاء عنوان خدمة النقل تلقائياً
function generateTransportServiceTitle(truckType: string, serviceRegions: string[]): string {
  if (!truckType) return 'خدمة نقل سيارات';

  const regionsText =
    serviceRegions.length > 0
      ? ` - ${serviceRegions.slice(0, 3).join('، ')}${serviceRegions.length > 3 ? ' وأكثر' : ''}`
      : '';

  return `خدمة نقل ${truckType}${regionsText}`;
}

interface ServiceData {
  truckType: string;
  capacity: number;
  truckDescription: string;
  serviceRegions: string[];
  address: string;
  workingDays: string[];
  contactPhone: string;
  images: string[];
  promotionPackage: string;
  promotionDays: number;
}

// باقات الترويج المتاحة - نفس باقات المزادات
const PROMOTION_PACKAGES = [
  { id: 'free', name: 'مجاني', price: 0, days: 0 },
  { id: 'basic', name: 'الأساسية', price: 50, days: 7 },
  { id: 'premium', name: 'المتقدمة', price: 100, days: 14, popular: true },
  { id: 'vip', name: 'VIP', price: 200, days: 30 },
];

export default function AddTransportService() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [serviceData, setServiceData] = useState<ServiceData>({
    truckType: '',
    capacity: 1,
    truckDescription: '',
    serviceRegions: [],
    address: '',
    workingDays: [],
    contactPhone: '',
    images: [],
    promotionPackage: 'free',
    promotionDays: 0,
  });
  const [contactCountryCode, setContactCountryCode] = useState('+218');

  // تعبئة رقم الهاتف تلقائياً من بيانات المستخدم (مرة واحدة فقط)
  const [hasAutoFilledPhone, setHasAutoFilledPhone] = useState(false);

  useEffect(() => {
    const getUserPhone = async () => {
      // عدم إعادة الملء إذا:
      // 1. تم الملء التلقائي مسبقاً
      // 2. المستخدم قام بحذف الرقم يدوياً (hasAutoFilledPhone = true لكن contactPhone فارغ)
      if (hasAutoFilledPhone) return;

      try {
        // أولاً: استخدام useAuth إذا كان المستخدم مسجل دخول
        if (user && user.phone) {
          const cleanPhone = user.phone.replace(/^\+218/, '').replace(/^\+/, '');
          setServiceData((prev) => ({ ...prev, contactPhone: cleanPhone }));
          setHasAutoFilledPhone(true);
          return;
        }

        // ثانياً: محاولة جلب من localStorage
        const savedUserData = localStorage.getItem('user');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          if (userData.phone) {
            const cleanPhone = userData.phone.replace(/^\+218/, '').replace(/^\+/, '');
            setServiceData((prev) => ({ ...prev, contactPhone: cleanPhone }));
            setHasAutoFilledPhone(true);
            return;
          }
        }

        // ثالثاً: محاولة جلب من API إذا كان هناك token
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.phone) {
              const cleanPhone = result.data.phone.replace(/^\+218/, '').replace(/^\+/, '');
              setServiceData((prev) => ({ ...prev, contactPhone: cleanPhone }));
              setHasAutoFilledPhone(true);
            }
          }
        }
      } catch (error) {}
    };

    getUserPhone();
  }, [user]); // فقط عند تغيير user، ليس contactPhone

  // تحديث العنوان تلقائياً عند تغيير نوع الناقل والمناطق
  useEffect(() => {
    if (serviceData.truckType && serviceData.serviceRegions.length > 0) {
      const cities = serviceData.serviceRegions.slice(0, 3).join(' - ');
      const autoAddress = `${serviceData.truckType} - ${cities}`;

      // تحديث العنوان فقط إذا كان فارغاً أو يحتوي على النمط التلقائي السابق
      if (!serviceData.address || serviceData.address.includes(' - ')) {
        setServiceData((prev) => ({
          ...prev,
          address: autoAddress,
        }));
      }
    }
  }, [serviceData.truckType, serviceData.serviceRegions]);

  // التحقق من صلاحية الوصول
  useEffect(() => {
    if (!loading && (!user || !isTransportOwner(user.accountType))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // التحقق من الحقول المطلوبة
    if (
      !serviceData.truckType ||
      !serviceData.capacity ||
      serviceData.serviceRegions.length === 0 ||
      !serviceData.address ||
      !serviceData.contactPhone
    ) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      setIsLoading(false);
      return;
    }

    try {
      // تحقق من رقم الهاتف
      const phoneResult = processPhoneNumber(contactCountryCode + serviceData.contactPhone);
      if (!phoneResult.isValid) {
        setError(phoneResult.error || 'رقم الهاتف غير صحيح');
        setIsLoading(false);
        return;
      }
      const token = localStorage.getItem('token');

      if (!token) {
        setError('يجب تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }

      // تحضير البيانات للإرسال
      const submitData = {
        title: generateTransportServiceTitle(serviceData.truckType, serviceData.serviceRegions),
        description:
          serviceData.truckDescription ||
          `خدمة نقل احترافية باستخدام ${serviceData.truckType} تستوعب ${serviceData.capacity} سيارة`,
        truckType: serviceData.truckType,
        capacity: serviceData.capacity,
        serviceArea: serviceData.serviceRegions.join(','),
        address: serviceData.address,
        pricePerKm: null,
        availableDays: serviceData.workingDays.join(','),
        contactPhone: phoneResult.fullNumber,
        images: serviceData.images.join(','),
        features: '',
        // حقول الترويج
        promotionPackage: serviceData.promotionPackage,
        promotionDays: serviceData.promotionDays,
      };

      const response = await fetch('/api/transport/create-service', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        // إذا تم اختيار باقة مدفوعة، توجيه لصفحة الدفع
        if (serviceData.promotionPackage !== 'free' && data.id) {
          const selectedPkg = PROMOTION_PACKAGES.find((p) => p.id === serviceData.promotionPackage);
          setSuccess('تم إضافة الخدمة! جاري التوجيه لصفحة الدفع...');
          setTimeout(() => {
            router.push(
              `/payment/transport?serviceId=${data.id}&package=${serviceData.promotionPackage}&amount=${selectedPkg?.price || 0}`,
            );
          }, 1500);
        } else {
          setSuccess('تم إضافة خدمة النقل بنجاح!');
          setTimeout(() => {
            router.push('/transport/dashboard');
          }, 2000);
        }
      } else {
        setError(data.error || 'فشل في إضافة الخدمة');
      }
    } catch (error) {
      console.error('خطأ في إضافة الخدمة:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const updateServiceData = (key: keyof ServiceData, value: any) => {
    setServiceData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // دالة تحديث الصور
  const handleImagesChange = (newImages: string[]) => {
    updateServiceData('images', newImages);
    setError(''); // مسح أي رسائل خطأ سابقة
  };

  // دالة تحديد/إلغاء تحديد مدينة
  const toggleCity = (city: string) => {
    const isSelected = serviceData.serviceRegions.includes(city);
    if (isSelected) {
      // إزالة المدينة
      updateServiceData(
        'serviceRegions',
        serviceData.serviceRegions.filter((c) => c !== city),
      );
    } else {
      // إضافة المدينة
      updateServiceData('serviceRegions', [...serviceData.serviceRegions, city]);
    }
  };

  // دالة تحديد جميع المدن
  const selectAllCities = () => {
    updateServiceData('serviceRegions', [...filteredCities]);
  };

  // دالة إلغاء تحديد جميع المدن
  const deselectAllCities = () => {
    updateServiceData('serviceRegions', []);
  };

  // أنواع الساحبات المتاحة
  const truckTypes = [
    { value: 'ساحبة مسطحة', label: 'ساحبة مسطحة' },
    { value: 'ناقلة سيارات', label: 'ناقلة سيارات (كاريير)' },
    { value: 'ساحبة مغلقة', label: 'ساحبة مغلقة' },
    { value: 'ساحبة ثقيلة', label: 'ساحبة ثقيلة' },
    { value: 'ونش نقل', label: 'ونش نقل' },
  ];

  // جميع المدن الليبية في قائمة موحدة
  const libyanCities = [
    // المدن الغربية
    'طرابلس',
    'الزاوية',
    'غريان',
    'صبراتة',
    'العجيلات',
    'زوارة',
    'الخمس',
    'المايا',
    'جنزور',
    'تاجوراء',
    'بن غشير',
    'سوق الجمعة',
    'أبو سليم',
    'الدريبي',
    // المدن الوسطى
    'مصراتة',
    'زليتن',
    'تاورغاء',
    'بني وليد',
    'غدامس',
    'نالوت',
    'الجميل',
    'القصر',
    'يفرن',
    'الرجبان',
    'القواليش',
    'الأصابعة',
    // المدن الشرقية
    'بنغازي',
    'اجدابيا',
    'طبرق',
    'المرج',
    'البيضاء',
    'درنة',
    'شحات',
    'القبة',
    'سلوق',
    'المقرون',
    'قمينس',
    'أمساعد',
    'راس لانوف',
    'بريقة',
    // المدن الجنوبية
    'سبها',
    'الكفرة',
    'مرزق',
    'غات',
    'أوباري',
    'تراغن',
    'القطرون',
    'الشاطئ',
    'براك',
    'ادري',
    'تمنهنت',
    'الفقهاء',
    'وادي عتبة',
  ].sort(); // ترتيب أبجدي للمدن

  // state للبحث في المدن
  const [citySearchTerm, setCitySearchTerm] = useState('');

  // فلترة المدن حسب البحث
  const filteredCities = libyanCities.filter((city) => city.includes(citySearchTerm.trim()));

  // أيام الأسبوع
  const weekDays = [
    { value: 'الأحد', label: 'الأحد' },
    { value: 'الاثنين', label: 'الاثنين' },
    { value: 'الثلاثاء', label: 'الثلاثاء' },
    { value: 'الأربعاء', label: 'الأربعاء' },
    { value: 'الخميس', label: 'الخميس' },
    { value: 'الجمعة', label: 'الجمعة' },
    { value: 'السبت', label: 'السبت' },
  ];

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  if (!user || !isTransportOwner(user.accountType)) {
    return null;
  }

  return (
    <>
      <Head>
        <title>إضافة خدمة نقل جديدة | موقع مزاد السيارات</title>
        <meta name="description" content="أضف خدمة نقل جديدة لعرضها على العملاء المحتملين" />
      </Head>

      {/* CSS مخصص قوي لتجاوز جميع القيود */}
      <style jsx global>{`
        .transport-form-select,
        .transport-form-select:not([disabled]),
        select.transport-form-select {
          font-size: 1rem !important;
          padding: 0.75rem 3rem 0.75rem 1rem !important;
          min-height: 50px !important;
          height: 50px !important;
          line-height: 1.5 !important;
          box-sizing: border-box !important;
        }

        .transport-form-input,
        .transport-form-input:not([disabled]),
        input.transport-form-input {
          font-size: 1rem !important;
          padding: 0.75rem 3rem 0.75rem 1rem !important;
          min-height: 50px !important;
          height: 50px !important;
          line-height: 1.5 !important;
          box-sizing: border-box !important;
        }

        .transport-form-select:focus,
        .transport-form-input:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* تجاوز جميع القواعد العامة */
        .transport-form-container select,
        .transport-form-container input[type='number'] {
          font-size: 1rem !important;
          padding: 0.75rem 3rem 0.75rem 1rem !important;
          min-height: 50px !important;
          height: 50px !important;
          line-height: 1.5 !important;
        }

        /* تحسين أسهم حقل الرقم */
        .transport-form-input::-webkit-outer-spin-button,
        .transport-form-input::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }

        .transport-form-input[type='number'] {
          -moz-appearance: textfield !important;
        }

        /* أسهم مخصصة أكبر وأوضح */
        .number-input-container {
          position: relative !important;
        }

        .custom-number-controls {
          position: absolute !important;
          left: 8px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 2px !important;
          z-index: 10 !important;
        }

        .custom-number-btn {
          width: 24px !important;
          height: 18px !important;
          background: #f3f4f6 !important;
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-size: 12px !important;
          font-weight: bold !important;
          color: #6b7280 !important;
          user-select: none !important;
        }

        .custom-number-btn:hover {
          background: #e5e7eb !important;
          border-color: #9ca3af !important;
          color: #374151 !important;
        }

        .custom-number-btn:active {
          background: #d1d5db !important;
          transform: scale(0.95) !important;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* رسائل النجاح والخطأ */}
        {success && (
          <div className="mx-auto max-w-4xl px-4 pt-4">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-4xl px-4 pt-4">
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <XMarkIcon className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Header المحدث */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
                  <TruckIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">إضافة خدمة نقل جديدة</h1>
                  <p className="text-lg text-gray-600">
                    أضف خدمة نقل احترافية لعرضها على العملاء المحتملين
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>سهل وسريع - يستغرق 5 دقائق فقط</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push('/transport/dashboard')}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 hover:shadow-md"
              >
                <ArrowRightIcon className="h-5 w-5" />
                <span>العودة للوحة التحكم</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-4xl px-4 py-8 pb-36">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* قسم معلومات الساحبة - تصميم محدث */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <TruckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">معلومات الساحبة</h2>
                  <p className="text-gray-600">أدخل تفاصيل الساحبة والخدمة المقدمة</p>
                </div>
              </div>

              <div className="transport-form-container grid gap-6 md:grid-cols-2">
                {/* نوع الساحبة - محدث */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    نوع الساحبة <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={serviceData.truckType}
                      onChange={(e) => updateServiceData('truckType', e.target.value)}
                      className="transport-form-select w-full appearance-none rounded-xl border-2 border-gray-200 bg-white text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-blue-50/20 focus:ring-2 focus:ring-blue-200"
                      style={{
                        minHeight: '50px',
                        fontSize: '1rem',
                        padding: '0.75rem 3rem 0.75rem 1rem',
                        height: '50px',
                        lineHeight: '1.5',
                      }}
                      required
                    >
                      <option value="" className="text-gray-500">
                        اختر نوع الساحبة
                      </option>
                      <option value="ساحبة مسطحة" className="text-gray-900">
                        ساحبة مسطحة
                      </option>
                      <option value="ناقلة سيارات" className="text-gray-900">
                        ناقلة سيارات (كاريير)
                      </option>
                      <option value="ساحبة مغلقة" className="text-gray-900">
                        ساحبة مغلقة
                      </option>
                      <option value="ساحبة ثقيلة" className="text-gray-900">
                        ساحبة ثقيلة
                      </option>
                      <option value="ونش نقل" className="text-gray-900">
                        ونش نقل
                      </option>
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">اختر نوع الساحبة المناسب لخدمتك</p>
                </div>

                {/* عدد السيارات - محدث */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    عدد السيارات التي تستوعبها <span className="text-red-500">*</span>
                  </label>
                  <div className="number-input-container relative">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={serviceData.capacity}
                      onChange={(e) => updateServiceData('capacity', parseInt(e.target.value))}
                      className="transport-form-input w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50/20 focus:ring-2 focus:ring-green-200"
                      style={{
                        minHeight: '50px',
                        fontSize: '1rem',
                        padding: '0.75rem 4rem 0.75rem 1rem',
                        height: '50px',
                        lineHeight: '1.5',
                      }}
                      placeholder="مثال: 2"
                      required
                    />

                    {/* أسهم مخصصة */}
                    <div className="custom-number-controls">
                      <button
                        type="button"
                        className="custom-number-btn"
                        onClick={() => {
                          const newValue = Math.min(20, serviceData.capacity + 1);
                          updateServiceData('capacity', newValue);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="custom-number-btn"
                        onClick={() => {
                          const newValue = Math.max(1, serviceData.capacity - 1);
                          updateServiceData('capacity', newValue);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        ▼
                      </button>
                    </div>

                    <div className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2">
                      <span className="text-sm text-gray-500">سيارة</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">الحد الأقصى للسيارات في الرحلة الواحدة</p>
                </div>
              </div>

              {/* وصف الساحبة */}
              <div className="mt-8 space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  وصف الساحبة والخدمة
                </label>
                <div>
                  <textarea
                    value={serviceData.truckDescription}
                    onChange={(e) => updateServiceData('truckDescription', e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="مثال: ساحبة حديثة موديل 2020، حالة ممتازة، مجهزة بأحدث أنظمة الأمان وتقنيات الحماية للسيارات المنقولة..."
                  />
                  <div className="mt-2 text-xs text-gray-400">
                    اختياري - يساعد في جذب المزيد من العملاء
                  </div>
                </div>
              </div>
            </div>

            {/* قسم نطاق العمل - تصميم مبسط وسهل */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-6 w-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">نطاق العمل</h2>
                  <p className="text-gray-600">اختر المدن التي تقدم فيها خدمة النقل</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* حقل البحث والأزرار */}
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-green-50 p-6">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* حقل البحث */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={citySearchTerm}
                        onChange={(e) => setCitySearchTerm(e.target.value)}
                        placeholder="ابحث عن مدينة... مثال: طرابلس، بنغازي"
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllCities}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        تحديد الكل
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllCities}
                        className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        إلغاء الكل
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {filteredCities.length === libyanCities.length
                      ? `جميع المدن متاحة (${libyanCities.length} مدينة)`
                      : `عدد المدن المطابقة: ${filteredCities.length} من ${libyanCities.length}`}
                    {serviceData.serviceRegions.length > 0 && (
                      <span className="mr-4 text-green-700">
                        • تم اختيار {serviceData.serviceRegions.length} مدينة
                      </span>
                    )}
                  </div>
                </div>

                {/* قائمة المدن */}
                <div className="max-h-80 overflow-y-auto rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filteredCities.map((city) => (
                      <label
                        key={city}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2.5 transition-all duration-200 hover:shadow-sm ${
                          serviceData.serviceRegions.includes(city)
                            ? 'border-green-400 bg-green-100 text-green-800 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={serviceData.serviceRegions.includes(city)}
                          onChange={() => toggleCity(city)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium">{city}</span>
                      </label>
                    ))}
                  </div>

                  {filteredCities.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="mx-auto mb-2 h-8 w-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                      لا توجد مدن تطابق البحث &quot;{citySearchTerm}&quot;
                    </div>
                  )}
                </div>

                {/* ملخص المدن المختارة */}
                {serviceData.serviceRegions.length > 0 && (
                  <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-gray-800">
                      المدن المختارة ({serviceData.serviceRegions.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {serviceData.serviceRegions.slice(0, 10).map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                        >
                          {city}
                          <button
                            type="button"
                            onClick={() => toggleCity(city)}
                            className="ml-1 rounded-full hover:bg-green-200"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {serviceData.serviceRegions.length > 10 && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          +{serviceData.serviceRegions.length - 10} مدينة أخرى
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* قسم أوقات العمل - تصميم محدث */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">أوقات العمل</h2>
                  <p className="text-gray-600">حدد الأيام التي تتوفر فيها لتقديم الخدمة</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* أيام العمل */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    أيام العمل *
                  </label>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                    {weekDays.map((day) => (
                      <label
                        key={day.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-sm ${
                          serviceData.workingDays.includes(day.value)
                            ? 'border-blue-300 bg-blue-50 text-blue-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={serviceData.workingDays.includes(day.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateServiceData('workingDays', [
                                ...serviceData.workingDays,
                                day.value,
                              ]);
                            } else {
                              updateServiceData(
                                'workingDays',
                                serviceData.workingDays.filter((d) => d !== day.value),
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* قسم معلومات التواصل - تصميم محدث */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-md">
                  <PhoneIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">معلومات التواصل</h2>
                  <p className="text-gray-600">أضف أرقام التواصل للعملاء المهتمين</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* رقم الهاتف */}
                <div>
                  <PhoneInputField
                    value={serviceData.contactPhone}
                    onChange={(v: string) => updateServiceData('contactPhone', v)}
                    onCountryChange={(c: Country) => setContactCountryCode(c.code)}
                    placeholder="أدخل رقم الهاتف"
                    label="رقم الهاتف للتواصل"
                    required
                  />
                </div>

                {/* العنوان */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">العنوان *</label>
                  <div>
                    <input
                      type="text"
                      value={serviceData.address}
                      onChange={(e) => updateServiceData('address', e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      placeholder="سيتم ملء هذا الحقل تلقائياً عند اختيار نوع الناقل والمدن"
                      required
                    />
                    <div className="mt-2 text-xs text-gray-400">يمكنك تعديل العنوان حسب الحاجة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* قسم باقات الترويج - نفس تصميم المزادات */}
            <div className="rounded-3xl bg-gradient-to-b from-slate-50 to-white p-8">
              <div className="mb-10 text-center">
                <h3 className="text-3xl font-black text-slate-900">اختر باقة الترويج</h3>
                <p className="mt-3 text-lg text-slate-600">
                  زِد من فرص ظهور خدمتك بسرعة مع باقات الترويج المميزة
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {/* الباقة المجانية */}
                <div
                  onClick={() => {
                    updateServiceData('promotionPackage', 'free');
                    updateServiceData('promotionDays', 0);
                  }}
                  className={`border-3 relative cursor-pointer rounded-2xl p-8 transition-all duration-300 ${
                    serviceData.promotionPackage === 'free'
                      ? 'scale-[1.02] border-slate-800 bg-slate-100 shadow-xl'
                      : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-lg'
                  }`}
                >
                  {serviceData.promotionPackage === 'free' && (
                    <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 shadow-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
                      <TruckIcon className="h-8 w-8 text-slate-600" />
                    </div>
                    <h4 className="mb-2 text-xl font-black text-slate-800">مجاني</h4>
                    <p className="text-3xl font-black text-slate-900">0</p>
                    <p className="text-sm font-semibold text-slate-500">دينار ليبي</p>
                    <div className="mt-4 w-full border-t-2 border-slate-200 pt-4">
                      <p className="text-sm font-medium text-slate-600">نشر عادي</p>
                    </div>
                  </div>
                </div>

                {/* الباقة الأساسية */}
                <div
                  onClick={() => {
                    updateServiceData('promotionPackage', 'basic');
                    updateServiceData('promotionDays', 7);
                  }}
                  className={`border-3 relative cursor-pointer rounded-2xl p-8 transition-all duration-300 ${
                    serviceData.promotionPackage === 'basic'
                      ? 'scale-[1.02] border-blue-600 bg-blue-50 shadow-xl shadow-blue-200'
                      : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-lg'
                  }`}
                >
                  {serviceData.promotionPackage === 'basic' && (
                    <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                      <StarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="mb-2 text-xl font-black text-slate-800">الأساسية</h4>
                    <p className="text-3xl font-black text-blue-600">50</p>
                    <p className="text-sm font-semibold text-slate-500">دينار / 7 أيام</p>
                    <div className="mt-4 w-full border-t-2 border-blue-200 pt-4">
                      <p className="text-sm font-medium text-blue-700">شارة مميز + أولوية</p>
                    </div>
                  </div>
                </div>

                {/* الباقة المتقدمة */}
                <div
                  onClick={() => {
                    updateServiceData('promotionPackage', 'premium');
                    updateServiceData('promotionDays', 14);
                  }}
                  className={`border-3 relative cursor-pointer rounded-2xl p-8 transition-all duration-300 ${
                    serviceData.promotionPackage === 'premium'
                      ? 'scale-[1.02] border-green-600 bg-green-50 shadow-xl shadow-green-200'
                      : 'border-slate-200 bg-white hover:border-green-400 hover:shadow-lg'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-4 py-1.5 text-xs font-black text-white shadow-lg">
                    الأكثر طلباً
                  </div>
                  {serviceData.promotionPackage === 'premium' && (
                    <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 shadow-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                      <SparklesIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="mb-2 text-xl font-black text-slate-800">المتقدمة</h4>
                    <p className="text-3xl font-black text-green-600">100</p>
                    <p className="text-sm font-semibold text-slate-500">دينار / 14 يوم</p>
                    <div className="mt-4 w-full border-t-2 border-green-200 pt-4">
                      <p className="text-sm font-medium text-green-700">إشعارات + إحصائيات</p>
                    </div>
                  </div>
                </div>

                {/* باقة VIP */}
                <div
                  onClick={() => {
                    updateServiceData('promotionPackage', 'vip');
                    updateServiceData('promotionDays', 30);
                  }}
                  className={`border-3 relative cursor-pointer rounded-2xl p-8 transition-all duration-300 ${
                    serviceData.promotionPackage === 'vip'
                      ? 'scale-[1.02] border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl shadow-amber-200'
                      : 'border-slate-200 bg-gradient-to-br from-white to-amber-50/50 hover:border-amber-400 hover:shadow-lg'
                  }`}
                >
                  {serviceData.promotionPackage === 'vip' && (
                    <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 shadow-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-orange-200">
                      <StarIcon className="h-8 w-8 text-amber-700" />
                    </div>
                    <h4 className="mb-2 text-xl font-black text-slate-800">VIP</h4>
                    <p className="text-3xl font-black text-amber-600">200</p>
                    <p className="text-sm font-semibold text-slate-500">دينار / 30 يوم</p>
                    <div className="mt-4 w-full border-t-2 border-amber-200 pt-4">
                      <p className="text-sm font-medium text-amber-700">أعلى أولوية + دعم</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ملخص الباقة المختارة */}
              {serviceData.promotionPackage !== 'free' && (
                <div
                  className={`mt-8 flex items-center justify-between rounded-2xl p-5 ${
                    serviceData.promotionPackage === 'basic'
                      ? 'border-2 border-blue-300 bg-blue-100'
                      : serviceData.promotionPackage === 'premium'
                        ? 'border-2 border-green-300 bg-green-100'
                        : 'border-2 border-amber-300 bg-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                        serviceData.promotionPackage === 'basic'
                          ? 'bg-blue-200'
                          : serviceData.promotionPackage === 'premium'
                            ? 'bg-green-200'
                            : 'bg-amber-200'
                      }`}
                    >
                      <StarIcon
                        className={`h-7 w-7 ${
                          serviceData.promotionPackage === 'basic'
                            ? 'text-blue-700'
                            : serviceData.promotionPackage === 'premium'
                              ? 'text-green-700'
                              : 'text-amber-700'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900">
                        {serviceData.promotionPackage === 'basic' && 'الباقة الأساسية'}
                        {serviceData.promotionPackage === 'premium' && 'الباقة المتقدمة'}
                        {serviceData.promotionPackage === 'vip' && 'باقة VIP'}
                      </p>
                      <p className="text-base font-medium text-slate-600">
                        ظهور مميز لمدة {serviceData.promotionDays} يوم • سيتم الدفع بعد النشر
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-4xl font-black ${
                      serviceData.promotionPackage === 'basic'
                        ? 'text-blue-700'
                        : serviceData.promotionPackage === 'premium'
                          ? 'text-green-700'
                          : 'text-amber-700'
                    }`}
                  >
                    {serviceData.promotionPackage === 'basic' && '50'}
                    {serviceData.promotionPackage === 'premium' && '100'}
                    {serviceData.promotionPackage === 'vip' && '200'}
                    <span className="mr-1 text-lg font-bold text-slate-500">د.ل</span>
                  </p>
                </div>
              )}
            </div>

            {/* قسم الصور - مكون محدث */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
                  <PhotoIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">صور الساحبة</h2>
                  <p className="text-gray-600">أضف صور واضحة للساحبة لجذب المزيد من العملاء</p>
                </div>
              </div>

              <TransportImageUploader
                images={serviceData.images}
                onImagesChange={handleImagesChange}
                maxImages={5}
                disabled={isLoading}
              />
            </div>

            {/* أزرار الإجراءات - شريط ثابت أسفل الشاشة */}
            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
              <div
                className="mx-auto max-w-4xl px-4 py-3"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0rem)' }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => router.push('/transport/dashboard')}
                    className="group flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
                  >
                    <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    <span>إلغاء والعودة</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                        <span>إضافة خدمة النقل</span>
                        <PlusIcon className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
