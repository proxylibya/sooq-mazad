/**
 * صفحة طلب نقل - نظام متكامل
 * Transport Request Page - Integrated System
 */

import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { type Country } from '../../components/CountryCodeSelector';
import PhoneInputField from '../../components/PhoneInputField';
import { OpensooqNavbar } from '../../components/common';
import SelectField from '../../components/ui/SelectField';
import { useUserContext } from '../../contexts/UserContext';
import { libyanCities } from '../../data/libyan-cities';
import { processPhoneNumber } from '../../utils/phoneUtils';
import { translateVehicleType } from '../../utils/transportTranslations';

// واجهة مقدم الخدمة
interface TransportProvider {
  id: string;
  title: string;
  description: string;
  truckType: string;
  capacity: number;
  pricePerKm: number | null;
  images: string;
  contactPhone: string;
  serviceArea: string;
  isAvailable: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
    verified: boolean;
    rating?: number;
  };
}

const RequestTransportPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUserContext();
  const { providerId } = router.query;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provider, setProvider] = useState<TransportProvider | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingId, setBookingId] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    fromCity: '',
    fromArea: '',
    toCity: '',
    toArea: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    carType: '',
    carColor: '',
    carPlateNumber: '',
    urgency: 'normal',
    contactPhone: '',
    notes: '',
    insurance: true,
    tracking: true,
  });
  const [contactDialCode, setContactDialCode] = useState('+218');
  const [userDataFilled, setUserDataFilled] = useState(false);

  // أخطاء الحقول
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // مراجع الحقول للتركيز عليها
  const customerNameRef = useRef<HTMLInputElement>(null);
  const fromCityRef = useRef<HTMLDivElement>(null);
  const toCityRef = useRef<HTMLDivElement>(null);
  const carBrandRef = useRef<HTMLInputElement>(null);
  const carModelRef = useRef<HTMLInputElement>(null);
  const contactPhoneRef = useRef<HTMLDivElement>(null);

  // جلب بيانات مقدم الخدمة
  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) {
        setLoadingProvider(false);
        return;
      }

      try {
        const response = await fetch(`/api/transport/services/${providerId}`);
        const data = await response.json();

        if (data.success && (data.data || data.service)) {
          setProvider(data.data || data.service);
          console.log('✅ [Request] تم جلب بيانات مقدم الخدمة:', data.data || data.service);
        } else {
          console.error('❌ [Request] فشل في جلب بيانات الخدمة:', data);
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات مقدم الخدمة:', error);
      } finally {
        setLoadingProvider(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  // تعبئة رقم الهاتف واسم المستخدم من حساب المستخدم
  useEffect(() => {
    // انتظار انتهاء تحميل بيانات المستخدم
    if (userLoading) return;

    // تعبئة البيانات مرة واحدة فقط عند توفر المستخدم
    if (user && !userDataFilled) {
      // استخدام phone أو phoneNumber حسب المتوفر
      const userPhone = user.phone || user.phoneNumber || '';
      const userName = user.name || user.fullName || user.firstName || '';

      console.log('📱 [Request] بيانات المستخدم المتاحة:', {
        hasUser: !!user,
        phone: userPhone,
        name: userName,
        userId: user.id,
      });

      if (userPhone) {
        // إزالة كود الدولة إذا كان موجوداً
        let cleanPhone = userPhone
          .replace(/^\+218/, '')
          .replace(/^218/, '')
          .replace(/^0/, '');

        // إزالة أي مسافات أو رموز
        cleanPhone = cleanPhone.replace(/[\s\-]/g, '');

        console.log('📱 [Request] تعبئة رقم الهاتف تلقائياً:', {
          original: userPhone,
          cleaned: cleanPhone,
        });

        setFormData((prev) => ({
          ...prev,
          contactPhone: cleanPhone,
          customerName: userName || prev.customerName,
        }));
      } else {
        // فقط تعبئة الاسم إذا لم يكن هناك رقم هاتف
        if (userName) {
          setFormData((prev) => ({
            ...prev,
            customerName: userName,
          }));
        }
      }

      setUserDataFilled(true);
    }
  }, [user, userLoading, userDataFilled]);

  // أنواع السيارات
  const carTypes = [
    'سيارة صغيرة (هاتشباك)',
    'سيارة متوسطة (سيدان)',
    'سيارة كبيرة (SUV)',
    'سيارة فاخرة',
    'سيارة رياضية',
    'شاحنة صغيرة',
    'دراجة نارية',
  ];

  // درجات الأولوية
  const urgencyLevels = [
    { value: 'normal', label: 'عادي' },
    { value: 'urgent', label: 'عاجل' },
    { value: 'emergency', label: 'طارئ' },
  ];

  // دالة التمرير والتركيز على حقل معين
  const scrollToField = useCallback((fieldRef: React.RefObject<HTMLElement>) => {
    if (fieldRef.current) {
      fieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // التركيز على حقل الإدخال داخل العنصر
      const input = fieldRef.current.querySelector('input, select, textarea') as HTMLElement;
      if (input) {
        setTimeout(() => input.focus(), 300);
      } else if (fieldRef.current.tagName === 'INPUT') {
        setTimeout(() => fieldRef.current?.focus(), 300);
      }
    }
  }, []);

  // مسح خطأ حقل معين
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors((prev) => {
      if (prev[fieldName]) {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // معالجة تغيير البيانات
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const name = (target as HTMLInputElement).name;
    let value: string | boolean = (target as HTMLInputElement).value;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      value = target.checked;
    }

    // مسح الخطأ عند التعديل
    clearFieldError(name);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // معالجة إرسال الطلب
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});

    if (!user) {
      router.push('/login-password?redirect=' + encodeURIComponent(router.asPath));
      return;
    }

    // التحقق من البيانات المطلوبة مع تحديد الحقل الخاطئ
    const errors: { [key: string]: string } = {};

    if (!formData.customerName.trim()) {
      errors.customerName = 'الاسم الكامل مطلوب';
    }

    if (!formData.fromCity) {
      errors.fromCity = 'يجب اختيار مدينة الانطلاق';
    }

    if (!formData.toCity) {
      errors.toCity = 'يجب اختيار مدينة الوصول';
    }

    if (!formData.carBrand.trim()) {
      errors.carBrand = 'ماركة السيارة مطلوبة';
    }

    if (!formData.carModel.trim()) {
      errors.carModel = 'موديل السيارة مطلوب';
    }

    // تحقق رقم الهاتف بصيغة موحدة
    if (!formData.contactPhone.trim()) {
      errors.contactPhone = 'رقم الهاتف مطلوب';
    } else {
      const phoneResult = processPhoneNumber(contactDialCode + formData.contactPhone);
      if (!phoneResult.isValid) {
        errors.contactPhone = phoneResult.error || 'رقم الهاتف غير صحيح';
      }
    }

    // إذا كانت هناك أخطاء، عرضها والتركيز على أول حقل خاطئ
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      // التركيز على أول حقل به خطأ
      const firstErrorField = Object.keys(errors)[0];
      const fieldRefMap: { [key: string]: React.RefObject<HTMLElement> } = {
        customerName: customerNameRef,
        fromCity: fromCityRef,
        toCity: toCityRef,
        carBrand: carBrandRef,
        carModel: carModelRef,
        contactPhone: contactPhoneRef,
      };

      const targetRef = fieldRefMap[firstErrorField];
      if (targetRef) {
        scrollToField(targetRef as React.RefObject<HTMLElement>);
      }

      setSubmitError(`يوجد ${Object.keys(errors).length} حقول تحتاج للتصحيح`);
      return;
    }

    // الحصول على رقم الهاتف المعالج للإرسال
    const phoneResult = processPhoneNumber(contactDialCode + formData.contactPhone);

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      // إرسال الطلب لـ API
      const response = await fetch('/api/transport/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          serviceId: providerId,
          customerName: formData.customerName,
          customerPhone: phoneResult.fullNumber,
          fromCity: formData.fromCity,
          toCity: formData.toCity,
          pickupAddress: formData.fromArea || formData.fromCity,
          deliveryAddress: formData.toArea || formData.toCity,
          carMake: formData.carBrand,
          carModel: formData.carModel,
          carYear: formData.carYear,
          carColor: formData.carColor,
          carPlateNumber: formData.carPlateNumber,
          preferredDate: new Date().toISOString(),
          preferredTime: '',
          specialInstructions: formData.notes,
          insurance: formData.insurance,
          tracking: formData.tracking,
          serviceType: formData.urgency === 'emergency' ? 'express' : 'standard',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // التعامل مع بنية الاستجابة: data.data.booking أو data.booking
        const bookingData = data.data?.booking || data.booking;
        setBookingId(bookingData?.id || '');
        setSubmitSuccess(true);

        console.log('✅ [Request] تم إنشاء الحجز:', bookingData);

        // إرسال إشعار ورسالة لمقدم الخدمة
        if (providerId && bookingData?.id && provider?.user?.id) {
          await sendNotificationAndMessage(bookingData, provider.user.id);
        } else {
          console.warn('⚠️ [Request] لم يتم إرسال الإشعار - بيانات ناقصة:', {
            providerId,
            bookingId: bookingData?.id,
            providerUserId: provider?.user?.id,
          });
        }
      } else {
        setSubmitError(data.message || data.error || 'فشل في إرسال الطلب');
      }
    } catch (error) {
      console.error('خطأ في إرسال الطلب:', error);
      setSubmitError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // إرسال إشعار ورسالة لمقدم الخدمة
  const sendNotificationAndMessage = async (
    booking: { id: string; providerId?: string },
    providerUserId: string,
  ) => {
    try {
      const token = localStorage.getItem('token');

      if (!booking?.id || !providerUserId) {
        console.error('❌ [Notify] بيانات ناقصة:', { bookingId: booking?.id, providerUserId });
        return;
      }

      console.log('📤 [Notify] إرسال إشعار لمقدم الخدمة:', {
        bookingId: booking.id,
        providerUserId,
      });

      // إرسال إشعار ورسالة
      const response = await fetch('/api/transport/notify-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bookingId: booking.id,
          providerId: providerUserId,
          serviceId: providerId,
          customerName: formData.customerName,
          fromCity: formData.fromCity,
          toCity: formData.toCity,
          preferredDate: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ [Notify] تم إرسال الإشعار بنجاح');
      } else {
        console.error('❌ [Notify] فشل إرسال الإشعار:', result.message);
      }
    } catch (error) {
      console.error('❌ [Notify] خطأ في إرسال الإشعار:', error);
    }
  };

  return (
    <>
      <Head>
        <title>طلب نقل مخصص | موقع مزاد السيارات</title>
        <meta
          name="description"
          content="اطلب خدمة نقل مخصصة لسيارتك واحصل على عروض من أفضل مقدمي الخدمة"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="transport-request-page min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/transport" className="text-blue-600 hover:text-blue-700">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <TruckIcon className="h-8 w-8 text-blue-600" />
                  طلب نقل مخصص
                </h1>
                <p className="mt-1 text-gray-600">احصل على عروض متعددة من مقدمي خدمات النقل</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* شاشة النجاح */}
          {submitSuccess ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">تم إرسال طلبك بنجاح!</h2>
              <p className="mb-6 text-gray-600">
                تم إرسال طلب النقل الخاص بك إلى مقدم الخدمة. سيتم التواصل معك قريباً.
              </p>
              {bookingId && (
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">رقم الطلب</p>
                  <p className="font-mono text-lg font-semibold text-gray-900">
                    #{bookingId.slice(-8)}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/transport/my-bookings"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                >
                  متابعة طلباتي
                </Link>
                <Link
                  href="/transport"
                  className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* بطاقة مقدم الخدمة */}
              {provider && (
                <div className="mb-8 overflow-hidden rounded-xl border bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <h3 className="text-lg font-semibold text-white">مقدم الخدمة</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                        {provider.user?.profileImage ? (
                          <img
                            src={provider.user.profileImage}
                            alt={provider.user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{provider.user?.name}</h4>
                          {provider.user?.verified && (
                            <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{provider.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            {translateVehicleType(provider.truckType)}
                          </span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            سعة {provider.capacity} طن
                          </span>
                          {provider.pricePerKm && (
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                              {provider.pricePerKm} د.ل/كم
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* رسالة الخطأ */}
              {submitError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />
                    <p className="text-red-800">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Info Alert */}
              <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
                  <div>
                    <h3 className="mb-1 font-medium text-blue-900">كيف يعمل طلب النقل؟</h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• املأ تفاصيل طلب النقل</li>
                      <li>• سيتم إرسال طلبك لمقدم الخدمة</li>
                      <li>• سيتواصل معك مقدم الخدمة لتأكيد التفاصيل</li>
                      <li>• يمكنك متابعة حالة طلبك من صفحة حجوزاتي</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* معلومات العميل */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                    معلومات العميل
                  </h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      الاسم الكامل *
                    </label>
                    <input
                      ref={customerNameRef}
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      placeholder="أدخل اسمك الكامل"
                      className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                        fieldErrors.customerName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {fieldErrors.customerName}
                      </p>
                    )}
                  </div>
                </div>
                {/* معلومات النقل */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                    معلومات النقل
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* من */}
                    <div ref={fromCityRef}>
                      <SelectField
                        label="من مدينة"
                        options={libyanCities.map((city) => city.name)}
                        value={formData.fromCity}
                        onChange={(value) => {
                          clearFieldError('fromCity');
                          setFormData((prev) => ({ ...prev, fromCity: value }));
                        }}
                        placeholder="اختر المدينة"
                        required
                        searchable
                        clearable
                        error={fieldErrors.fromCity}
                      />
                    </div>

                    {/* إلى */}
                    <div ref={toCityRef}>
                      <SelectField
                        label="إلى مدينة"
                        options={libyanCities.map((city) => city.name)}
                        value={formData.toCity}
                        onChange={(value) => {
                          clearFieldError('toCity');
                          setFormData((prev) => ({ ...prev, toCity: value }));
                        }}
                        placeholder="اختر المدينة"
                        required
                        searchable
                        clearable
                        error={fieldErrors.toCity}
                      />
                    </div>

                    {/* منطقة الاستلام */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        منطقة الاستلام
                      </label>
                      <input
                        type="text"
                        name="fromArea"
                        value={formData.fromArea}
                        onChange={handleInputChange}
                        placeholder="مثال: حي الأندلس"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* منطقة التسليم */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        منطقة التسليم
                      </label>
                      <input
                        type="text"
                        name="toArea"
                        value={formData.toArea}
                        onChange={handleInputChange}
                        placeholder="مثال: وسط المدينة"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* معلومات السيارة */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <TruckIcon className="h-6 w-6 text-blue-600" />
                    معلومات السيارة
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        ماركة السيارة *
                      </label>
                      <input
                        ref={carBrandRef}
                        type="text"
                        name="carBrand"
                        value={formData.carBrand}
                        onChange={handleInputChange}
                        required
                        placeholder="مثال: تويوتا"
                        className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                          fieldErrors.carBrand ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.carBrand && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          {fieldErrors.carBrand}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        موديل السيارة *
                      </label>
                      <input
                        ref={carModelRef}
                        type="text"
                        name="carModel"
                        value={formData.carModel}
                        onChange={handleInputChange}
                        required
                        placeholder="مثال: كامري"
                        className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                          fieldErrors.carModel ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.carModel && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          {fieldErrors.carModel}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        سنة الصنع
                      </label>
                      <input
                        type="number"
                        name="carYear"
                        value={formData.carYear}
                        onChange={handleInputChange}
                        min="1990"
                        max="2024"
                        placeholder="2020"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <SelectField
                        label="نوع السيارة"
                        options={carTypes}
                        value={formData.carType}
                        onChange={(value) => setFormData((prev) => ({ ...prev, carType: value }))}
                        placeholder="اختر نوع السيارة"
                        required
                        searchable
                        clearable
                      />
                    </div>
                  </div>
                </div>

                {/* درجة الأولوية */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <TruckIcon className="h-6 w-6 text-blue-600" />
                    نوع الطلب
                  </h2>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      درجة الأولوية
                    </label>
                    <div className="flex gap-3">
                      {urgencyLevels.map((level) => (
                        <label key={level.value} className="flex-1">
                          <input
                            type="radio"
                            name="urgency"
                            value={level.value}
                            checked={formData.urgency === level.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div
                            className={`cursor-pointer rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
                              formData.urgency === level.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {level.label}
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      سيتم التواصل معك من قبل مقدم الخدمة لتحديد موعد النقل
                    </p>
                  </div>
                </div>

                {/* معلومات التواصل */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    معلومات التواصل
                  </h2>

                  <div className="space-y-6">
                    <div ref={contactPhoneRef}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        رقم الهاتف للتواصل *
                      </label>

                      {/* عرض رقم الحساب كمرجع */}
                      {user && (user.phone || user.phoneNumber) && (
                        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-blue-700">رقم هاتف حسابك</p>
                              <p
                                className="font-mono text-sm font-semibold text-blue-900"
                                dir="ltr"
                              >
                                {user.phone || user.phoneNumber}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const userPhone = user.phone || user.phoneNumber || '';
                                let cleanPhone = userPhone
                                  .replace(/^\+218/, '')
                                  .replace(/^218/, '')
                                  .replace(/^0/, '')
                                  .replace(/[\s\-]/g, '');
                                setFormData((prev) => ({ ...prev, contactPhone: cleanPhone }));
                                clearFieldError('contactPhone');
                              }}
                              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              استخدم هذا الرقم
                            </button>
                          </div>
                        </div>
                      )}

                      <div
                        className={fieldErrors.contactPhone ? 'rounded-lg ring-2 ring-red-500' : ''}
                      >
                        <PhoneInputField
                          value={formData.contactPhone}
                          onChange={(v: string) => {
                            clearFieldError('contactPhone');
                            setFormData((prev) => ({ ...prev, contactPhone: v }));
                          }}
                          onCountryChange={(c: Country) => setContactDialCode(c.code)}
                          placeholder="أدخل رقم الهاتف"
                          error={fieldErrors.contactPhone}
                        />
                      </div>

                      {fieldErrors.contactPhone && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          {fieldErrors.contactPhone}
                        </p>
                      )}

                      {!fieldErrors.contactPhone && formData.contactPhone && user && (
                        <p className="mt-1 text-xs text-green-600">
                          سيتم التواصل معك على هذا الرقم
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        ملاحظات إضافية
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="أي ملاحظات أو متطلبات خاصة..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* خيارات إضافية */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="insurance"
                          checked={formData.insurance}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">أريد تأمين شامل على السيارة</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="tracking"
                          checked={formData.tracking}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">أريد خدمة التتبع المباشر</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-4">
                  <Link href="/transport" className="flex-1">
                    <button
                      type="button"
                      className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        إرسال الطلب
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RequestTransportPage;
