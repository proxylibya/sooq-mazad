import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { type Country } from '../../components/CountryCodeSelector';
import PhoneInputField from '../../components/PhoneInputField';
import { OpensooqNavbar } from '../../components/common';
import NextButtonWithValidation from '../../components/ui/NextButtonWithValidation';
import SelectField from '../../components/ui/SelectField';
import { useUserContext } from '../../contexts/UserContext';
import { processPhoneNumber } from '../../utils/phoneUtils';

interface BookingForm {
  // معلومات العميل
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  // تفاصيل النقل
  fromCity: string;
  toCity: string;
  pickupAddress: string;
  deliveryAddress: string;

  // معلومات السيارة
  carMake: string;
  carModel: string;
  carYear: string;
  carColor: string;

  // تفاصيل الخدمة
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  specialInstructions: string;

  // خيارات إضافية
  insurance: boolean;
  tracking: boolean;
  expressService: boolean;
}

const TransportBookingPage = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hasAutoFilledUser, setHasAutoFilledUser] = useState(false);

  const [formData, setFormData] = useState<BookingForm>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    fromCity: '',
    toCity: '',
    pickupAddress: '',
    deliveryAddress: '',
    carMake: '',
    carModel: '',
    carYear: '',
    carColor: '',
    serviceType: 'ساحبة نقل متوسطة (حتى 8 سيارات)',
    preferredDate: '',
    preferredTime: '',
    specialInstructions: '',
    insurance: true,
    tracking: true,
    expressService: false,
  });
  const [customerDialCode, setCustomerDialCode] = useState('+218');

  // تعبئة بيانات المستخدم تلقائياً من الحساب
  useEffect(() => {
    if (hasAutoFilledUser) return;

    const autoFillUserData = async () => {
      try {
        // أولاً: من UserContext
        if (user) {
          const userPhone = (user.phone || user.phoneNumber || '')
            .replace(/^\+218/, '')
            .replace(/^218/, '')
            .replace(/^0/, '');

          setFormData((prev) => ({
            ...prev,
            customerName: user.name || prev.customerName,
            customerPhone: userPhone || prev.customerPhone,
            customerEmail: user.email || prev.customerEmail,
          }));
          setHasAutoFilledUser(true);
          return;
        }

        // ثانياً: من localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const userPhone = (userData.phone || '')
            .replace(/^\+218/, '')
            .replace(/^218/, '')
            .replace(/^0/, '');

          setFormData((prev) => ({
            ...prev,
            customerName: userData.name || prev.customerName,
            customerPhone: userPhone || prev.customerPhone,
            customerEmail: userData.email || prev.customerEmail,
          }));
          setHasAutoFilledUser(true);
          return;
        }

        // ثالثاً: من API
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const userPhone = (result.data.phone || '')
                .replace(/^\+218/, '')
                .replace(/^218/, '')
                .replace(/^0/, '');

              setFormData((prev) => ({
                ...prev,
                customerName: result.data.name || prev.customerName,
                customerPhone: userPhone || prev.customerPhone,
                customerEmail: result.data.email || prev.customerEmail,
              }));
              setHasAutoFilledUser(true);
            }
          }
        }
      } catch (error) {
        console.error('خطأ في تعبئة بيانات المستخدم:', error);
      }
    };

    autoFillUserData();
  }, [user, hasAutoFilledUser]);

  // أنواع الخدمات المتاحة
  const serviceTypes = [
    {
      name: 'ساحبة نقل عادية (سيارة واحدة)',
      price: 1,
      description: 'الخيار الأساسي لنقل سيارة واحدة',
    },
    {
      name: 'ساحبة نقل مع رافعة (سيارة واحدة)',
      price: 1.2,
      description: 'للسيارات المعطلة أو التي تحتاج رافعة',
    },
    {
      name: 'شاحنة نقل صغيرة (حتى 3 سيارات)',
      price: 1.5,
      description: 'لنقل عدة سيارات في رحلة واحدة',
    },
    {
      name: 'شاحنة نقل كبيرة (حتى 6 سيارات)',
      price: 2.2,
      description: 'للشحنات التجارية والكميات الكبيرة',
    },
  ];

  // حساب السعر التقديري
  const calculatePrice = () => {
    if (!formData.fromCity || !formData.toCity) return 0;

    // مسافة تقديرية (يمكن تحسينها لاحقاً)
    const estimatedDistance = Math.floor(Math.random() * 800) + 100;
    const basePrice = 2.5; // دينار لكل كيلومتر
    const serviceMultiplier = serviceTypes.find((s) => s.name === formData.serviceType)?.price || 1;

    let totalPrice = estimatedDistance * basePrice * serviceMultiplier;

    // إضافة تكلفة الخدمات الإضافية
    if (formData.insurance) totalPrice += 50;
    if (formData.tracking) totalPrice += 25;
    if (formData.expressService) totalPrice += 100;

    return Math.round(totalPrice);
  };

  useEffect(() => {
    setEstimatedPrice(calculatePrice());
  }, [
    formData.fromCity,
    formData.toCity,
    formData.serviceType,
    formData.insurance,
    formData.tracking,
    formData.expressService,
  ]);

  const handleInputChange = (field: keyof BookingForm, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // إزالة الخطأ عند التعديل
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // التحقق من صحة البيانات لكل خطوة
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // معلومات العميل
        if (!formData.customerName.trim()) newErrors.customerName = 'الاسم مطلوب';
        if (!formData.customerPhone.trim()) {
          newErrors.customerPhone = 'رقم الهاتف مطلوب';
        } else {
          const phoneResult = processPhoneNumber(customerDialCode + formData.customerPhone);
          if (!phoneResult.isValid) {
            newErrors.customerPhone = phoneResult.error || 'رقم الهاتف غير صحيح';
          }
        }
        if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
          newErrors.customerEmail = 'البريد الإلكتروني غير صحيح';
        }
        break;
      case 2: // تفاصيل النقل
        if (!formData.fromCity) newErrors.fromCity = 'مدينة الانطلاق مطلوبة';
        if (!formData.toCity) newErrors.toCity = 'مدينة الوصول مطلوبة';
        if (!formData.pickupAddress.trim()) newErrors.pickupAddress = 'عنوان الاستلام مطلوب';
        if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'عنوان التسليم مطلوب';
        if (!formData.preferredDate) newErrors.preferredDate = 'تاريخ النقل مطلوب';
        break;
      case 3: // معلومات السيارة
        if (!formData.carMake.trim()) newErrors.carMake = 'ماركة السيارة مطلوبة';
        if (!formData.carModel.trim()) newErrors.carModel = 'موديل السيارة مطلوب';
        if (!formData.carYear.trim()) newErrors.carYear = 'سنة الصنع مطلوبة';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    const isValid = validateStep(currentStep);

    if (!isValid) {
      setHasUserInteracted(true);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);

      // التمرير إلى الأعلى بسلاسة عند الانتقال للخطوة التالية
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);

      // التمرير إلى الأعلى بسلاسة عند الانتقال للخطوة السابقة
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // جلب serviceId من URL إن وجد
      const serviceId = router.query.serviceId as string;

      // تجهيز البيانات للإرسال
      const bookingData = {
        serviceId: serviceId || undefined,
        customerName: formData.customerName,
        customerPhone: customerDialCode + formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        fromCity: formData.fromCity,
        toCity: formData.toCity,
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        carMake: formData.carMake,
        carModel: formData.carModel,
        carYear: formData.carYear,
        carColor: formData.carColor || undefined,
        serviceType: formData.serviceType,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime || undefined,
        specialInstructions: formData.specialInstructions || undefined,
        insurance: formData.insurance,
        tracking: formData.tracking,
        expressService: formData.expressService,
        estimatedPrice: estimatedPrice,
      };

      // إرسال البيانات للـ API
      const response = await fetch('/api/transport/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success) {
        // التوجيه لصفحة التأكيد مع معرف الحجز
        router.push(`/transport/confirmation?bookingId=${result.booking?.id}&status=success`);
      } else {
        // عرض رسالة الخطأ
        alert(result.message || 'حدث خطأ أثناء إنشاء الحجز');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('خطأ في إرسال الحجز:', error);
      alert('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'معلومات العميل', icon: UserIcon },
    { number: 2, title: 'تفاصيل النقل', icon: MapPinIcon },
    { number: 3, title: 'معلومات السيارة', icon: TruckIcon },
    { number: 4, title: 'مراجعة وتأكيد', icon: CheckCircleIcon },
  ];

  return (
    <>
      <Head>
        <title>حجز خدمة النقل | موقع مزاد السيارات</title>
        <meta
          name="description"
          content="احجز خدمة نقل السيارات بسهولة مع ضمان الأمان والوصول في الوقت المحدد"
        />
      </Head>

      <div className="transport-book-page min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-6">
            <div className="mb-6 flex items-center gap-3">
              <TruckIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">حجز خدمة النقل</h1>
                <p className="text-gray-600">املأ البيانات المطلوبة لحجز خدمة نقل سيارتك</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep >= step.number
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="mr-3">
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      الخطوة {step.number}
                    </div>
                    <div
                      className={`text-xs ${
                        currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRightIcon className="mx-4 h-5 w-5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* نموذج الحجز */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                {/* الخطوة 1: معلومات العميل */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">معلومات العميل</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          الاسم الكامل *
                        </label>
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          placeholder="أدخل اسمك الكامل"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                        {errors.customerName && (
                          <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          رقم الهاتف *
                        </label>
                        <PhoneInputField
                          value={formData.customerPhone}
                          onChange={(v: string) => handleInputChange('customerPhone', v)}
                          onCountryChange={(c: Country) => setCustomerDialCode(c.code)}
                          placeholder="أدخل رقم الهاتف"
                        />
                        {errors.customerPhone && (
                          <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                )}

                {/* الخطوة 2: تفاصيل النقل */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">تفاصيل النقل</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <SelectField
                          options={[
                            'طرابلس',
                            'بنغازي',
                            'مصراتة',
                            'سبها',
                            'الزاوية',
                            'أجدابيا',
                            'درنة',
                            'غات',
                            'مرزق',
                            'زليتن',
                          ]}
                          value={formData.fromCity}
                          onChange={(city) => handleInputChange('fromCity', city)}
                          label="مدينة الانطلاق *"
                          placeholder="اختر مدينة الانطلاق"
                          required
                          searchable
                          clearable
                        />
                      </div>

                      <div>
                        <SelectField
                          options={[
                            'طرابلس',
                            'بنغازي',
                            'مصراتة',
                            'سبها',
                            'الزاوية',
                            'أجدابيا',
                            'درنة',
                            'غات',
                            'مرزق',
                            'زليتن',
                          ]}
                          value={formData.toCity}
                          onChange={(city) => handleInputChange('toCity', city)}
                          label="مدينة الوجهة *"
                          placeholder="اختر مدينة الوجهة"
                          required
                          searchable
                          clearable
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        عنوان الاستلام *
                      </label>
                      <textarea
                        value={formData.pickupAddress}
                        onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="أدخل العنوان التفصيلي لاستلام السيارة"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        عنوان التسليم *
                      </label>
                      <textarea
                        value={formData.deliveryAddress}
                        onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="أدخل العنوان التفصيلي لتسليم السيارة"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          التاريخ المفضل *
                        </label>
                        <input
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          الوقت المفضل
                        </label>
                        <select
                          value={formData.preferredTime}
                          onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر الوقت</option>
                          <option value="morning">الصباح (8:00 - 12:00)</option>
                          <option value="afternoon">بعد الظهر (12:00 - 17:00)</option>
                          <option value="evening">المساء (17:00 - 20:00)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        نوع الخدمة *
                      </label>
                      <div className="space-y-3">
                        {serviceTypes.map((service) => (
                          <div key={service.name} className="rounded-lg border p-3">
                            <label className="flex cursor-pointer items-center">
                              <input
                                type="radio"
                                name="serviceType"
                                value={service.name}
                                checked={formData.serviceType === service.name}
                                onChange={(e) => handleInputChange('serviceType', e.target.value)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <div className="mr-3 flex-1">
                                <div className="font-medium text-gray-900">{service.name}</div>
                                <div className="text-sm text-gray-500">{service.description}</div>
                              </div>
                              <div className="text-sm font-medium text-blue-600">
                                معامل السعر: {service.price}x
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        الخدمات الإضافية
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.insurance}
                            onChange={(e) => handleInputChange('insurance', e.target.checked)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="mr-3 text-gray-900">تأمين شامل (+50 د.ل)</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.tracking}
                            onChange={(e) => handleInputChange('tracking', e.target.checked)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="mr-3 text-gray-900">تتبع GPS (+25 د.ل)</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.expressService}
                            onChange={(e) => handleInputChange('expressService', e.target.checked)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="mr-3 text-gray-900">خدمة سريعة (+100 د.ل)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* الخطوة 3: معلومات السيارة */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">معلومات السيارة</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          الماركة *
                        </label>
                        <input
                          type="text"
                          value={formData.carMake}
                          onChange={(e) => handleInputChange('carMake', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="مثال: تويوتا"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          الموديل *
                        </label>
                        <input
                          type="text"
                          value={formData.carModel}
                          onChange={(e) => handleInputChange('carModel', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="مثال: كامري"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          سنة الصنع *
                        </label>
                        <input
                          type="number"
                          value={formData.carYear}
                          onChange={(e) => handleInputChange('carYear', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="2020"
                          min="1990"
                          max="2024"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          اللون
                        </label>
                        <input
                          type="text"
                          value={formData.carColor}
                          onChange={(e) => handleInputChange('carColor', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="مثال: أبيض"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        تعليمات خاصة
                      </label>
                      <textarea
                        value={formData.specialInstructions}
                        onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="أي تعليمات خاصة أو ملاحظات حول السيارة أو عملية النقل..."
                      />
                    </div>
                  </div>
                )}

                {/* الخطوة 4: مراجعة وتأكيد */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">مراجعة وتأكيد الطلب</h2>

                    <div className="space-y-4 rounded-lg bg-gray-50 p-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="mb-2 font-medium text-gray-900">معلومات العميل</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">الاسم:</span> {formData.customerName}
                            </p>
                            <p>
                              <span className="font-medium">الهاتف:</span> {formData.customerPhone}
                            </p>
                            {formData.customerEmail && (
                              <p>
                                <span className="font-medium">البريد:</span>{' '}
                                {formData.customerEmail}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-2 font-medium text-gray-900">تفاصيل النقل</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">من:</span> {formData.fromCity}
                            </p>
                            <p>
                              <span className="font-medium">إلى:</span> {formData.toCity}
                            </p>
                            <p>
                              <span className="font-medium">التاريخ:</span> {formData.preferredDate}
                            </p>
                            {formData.preferredTime && (
                              <p>
                                <span className="font-medium">الوقت:</span> {formData.preferredTime}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium text-gray-900">معلومات السيارة</h3>
                        <div className="text-sm text-gray-600">
                          <p>
                            {formData.carMake} {formData.carModel} {formData.carYear}{' '}
                            {formData.carColor && `- ${formData.carColor}`}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium text-gray-900">نوع الخدمة</h3>
                        <div className="text-sm text-gray-600">
                          <p>{formData.serviceType}</p>
                        </div>
                      </div>

                      {(formData.insurance || formData.tracking || formData.expressService) && (
                        <div>
                          <h3 className="mb-2 font-medium text-gray-900">الخدمات الإضافية</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            {formData.insurance && <p>• تأمين شامل</p>}
                            {formData.tracking && <p>• تتبع GPS</p>}
                            {formData.expressService && <p>• خدمة سريعة</p>}
                          </div>
                        </div>
                      )}

                      {formData.specialInstructions && (
                        <div>
                          <h3 className="mb-2 font-medium text-gray-900">تعليمات خاصة</h3>
                          <div className="text-sm text-gray-600">
                            <p>{formData.specialInstructions}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-900">إجمالي التكلفة</h3>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{estimatedPrice} د.ل</div>
                      <p className="mt-1 text-sm text-green-700">
                        السعر المعروض تقديري وسيتم تأكيد السعر النهائي عند الاتصال بك
                      </p>
                    </div>
                  </div>
                )}

                {/* أزرار التنقل */}
                <div className="mt-8 flex justify-between border-t pt-6">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    السابق
                  </button>

                  <NextButtonWithValidation
                    onClick={currentStep < 4 ? nextStep : handleSubmit}
                    errors={errors}
                    hasUserInteracted={hasUserInteracted}
                    isSubmitting={isSubmitting}
                    submitText="تأكيد الحجز"
                    nextText="التالي"
                    isLastStep={currentStep === 4}
                    className="px-6 py-2"
                  />
                </div>
              </div>
            </div>

            {/* ملخص الطلب */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">ملخص الطلب</h3>

                <div className="space-y-3 text-sm">
                  {formData.fromCity && formData.toCity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المسار:</span>
                      <span className="font-medium">
                        {formData.fromCity} ← {formData.toCity}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع الخدمة:</span>
                    <span className="text-xs font-medium">{formData.serviceType}</span>
                  </div>

                  {formData.preferredDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">التاريخ:</span>
                      <span className="font-medium">{formData.preferredDate}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">تكلفة النقل:</span>
                      <span>
                        {estimatedPrice -
                          (formData.insurance ? 50 : 0) -
                          (formData.tracking ? 25 : 0) -
                          (formData.expressService ? 100 : 0)}{' '}
                        د.ل
                      </span>
                    </div>

                    {formData.insurance && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">التأمين:</span>
                        <span>50 د.ل</span>
                      </div>
                    )}

                    {formData.tracking && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">التتبع:</span>
                        <span>25 د.ل</span>
                      </div>
                    )}

                    {formData.expressService && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">الخدمة السريعة:</span>
                        <span>100 د.ل</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>الإجمالي:</span>
                      <span className="text-green-600">{estimatedPrice} د.ل</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-blue-50 p-3">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div className="text-sm text-blue-800">
                      <p className="mb-1 font-medium">ملاحظة مهمة:</p>
                      <p>السعر المعروض تقديري وقد يتغير حسب الظروف الفعلية للنقل</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransportBookingPage;
