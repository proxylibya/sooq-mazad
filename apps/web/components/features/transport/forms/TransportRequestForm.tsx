import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useState } from 'react';

interface TransportRequest {
  // معلومات العميل
  customerName: string;
  customerPhone: string;

  // معلومات النقل
  fromCity: string;
  fromArea: string;
  fromAddress: string;
  toCity: string;
  toArea: string;
  toAddress: string;

  // معلومات السيارة
  carBrand: string;
  carModel: string;
  carYear: string;
  carColor: string;
  carCondition: string;
  carValue: string;

  // تفاصيل الطلب
  pickupDate: string;
  pickupTime: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  notes: string;

  // الخدمات الإضافية
  insurance: boolean;
  tracking: boolean;
  photos: File[];
}

interface TransportRequestFormProps {
  onSubmit: (request: TransportRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<TransportRequest>;
}

const TransportRequestForm: React.FC<TransportRequestFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData = {},
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TransportRequest>({
    customerName: '',
    customerPhone: '',
    fromCity: '',
    fromArea: '',
    fromAddress: '',
    toCity: '',
    toArea: '',
    toAddress: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    carColor: '',
    carCondition: 'good',
    carValue: '',
    pickupDate: '',
    pickupTime: '',
    urgency: 'normal',
    notes: '',
    insurance: false,
    tracking: false,
    photos: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // المدن الليبية
  const cities = [
    'طرابلس',
    'بنغازي',
    'مصراتة',
    'الزاوية',
    'البيضاء',
    'سبها',
    'زليتن',
    'أجدابيا',
    'درنة',
    'توكرة',
    'الخمس',
    'زوارة',
  ];

  // ماركات السيارات
  const carBrands = [
    'تويوتا',
    'نيسان',
    'هوندا',
    'هيونداي',
    'كيا',
    'مازدا',
    'مرسيدس',
    'بي إم دبليو',
    'أودي',
    'فولكس واجن',
    'فورد',
    'شيفروليه',
  ];

  // حالات السيارة
  const carConditions = [
    { value: 'جديد', label: 'جديد', color: 'text-green-600' },
    { value: 'مستعمل', label: 'مستعمل', color: 'text-blue-600' },
    { value: 'تحتاج صيانة', label: 'تحتاج صيانة', color: 'text-red-600' },
  ];

  // درجات الأولوية
  const urgencyLevels = [
    { value: 'normal', label: 'عادي', description: 'خلال 3-5 أيام', extra: '' },
    {
      value: 'urgent',
      label: 'عاجل',
      description: 'خلال 24-48 ساعة',
      extra: '+20% رسوم',
    },
    {
      value: 'emergency',
      label: 'طارئ',
      description: 'خلال 12 ساعة',
      extra: '+50% رسوم',
    },
  ];

  // خطوات النموذج
  const steps = [
    { number: 1, title: 'معلومات العميل', icon: UserIcon },
    { number: 2, title: 'تفاصيل النقل', icon: MapPinIcon },
    { number: 3, title: 'معلومات السيارة', icon: TruckIcon },
    { number: 4, title: 'تأكيد الطلب', icon: CheckCircleIcon },
  ];

  // تحديث البيانات
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // إزالة الخطأ عند التعديل
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // التحقق من صحة البيانات
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.customerName.trim()) newErrors.customerName = 'الاسم مطلوب';
        if (!formData.customerPhone.trim()) newErrors.customerPhone = 'رقم الهاتف مطلوب';
        break;
      case 2:
        if (!formData.fromCity) newErrors.fromCity = 'مدينة الانطلاق مطلوبة';
        if (!formData.toCity) newErrors.toCity = 'مدينة الوصول مطلوبة';
        if (!formData.pickupDate) newErrors.pickupDate = 'تاريخ الاستلام مطلوب';
        break;
      case 3:
        if (!formData.carBrand) newErrors.carBrand = 'ماركة السيارة مطلوبة';
        if (!formData.carModel.trim()) newErrors.carModel = 'موديل السيارة مطلوب';
        if (!formData.carYear) newErrors.carYear = 'سنة الصنع مطلوبة';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // الانتقال للخطوة التالية
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  // الانتقال للخطوة السابقة
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // إرسال النموذج
  const handleSubmit = () => {
    if (validateStep(3)) {
      onSubmit(formData);
    }
  };

  // رفع الصور
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateFormData('photos', [...formData.photos, ...files]);
  };

  // حذف صورة
  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', newPhotos);
  };

  return (
    <div className="transport-request-form mx-auto max-w-4xl rounded-xl bg-white shadow-lg">
      {/* العنوان */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <TruckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">طلب خدمة نقل</h2>
              <p className="text-sm text-gray-600">املأ النموذج لطلب خدمة نقل سيارتك</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* مؤشر الخطوات */}
        <div className="mt-6 flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center gap-2 ${
                  currentStep >= step.number ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep >= step.number
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden text-sm font-medium sm:block">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* محتوى النموذج */}
      <div className="p-6">
        {/* الخطوة 1: معلومات العميل */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="mb-4 text-lg font-bold text-gray-900">معلومات العميل</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <UserIcon className="ml-1 inline h-4 w-4" />
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => updateFormData('customerName', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخل اسمك الكامل"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <PhoneIcon className="ml-1 inline h-4 w-4" />
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => updateFormData('customerPhone', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 ${
                    errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0912345678"
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerPhone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* الخطوة 2: تفاصيل النقل */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="mb-4 text-lg font-bold text-gray-900">تفاصيل النقل</h3>

            {/* من */}
            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="mb-3 font-medium text-green-800">نقطة الانطلاق</h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المدينة *</label>
                  <select
                    value={formData.fromCity}
                    onChange={(e) => updateFormData('fromCity', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 ${
                      errors.fromCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر المدينة</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.fromCity && (
                    <p className="mt-1 text-sm text-red-500">{errors.fromCity}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المنطقة</label>
                  <input
                    type="text"
                    value={formData.fromArea}
                    onChange={(e) => updateFormData('fromArea', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="اسم المنطقة"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  value={formData.fromAddress}
                  onChange={(e) => updateFormData('fromAddress', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                  placeholder="العنوان الكامل لاستلام السيارة"
                />
              </div>
            </div>

            {/* إلى */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-3 font-medium text-blue-800">نقطة الوصول</h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المدينة *</label>
                  <select
                    value={formData.toCity}
                    onChange={(e) => updateFormData('toCity', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                      errors.toCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر المدينة</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.toCity && <p className="mt-1 text-sm text-red-500">{errors.toCity}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المنطقة</label>
                  <input
                    type="text"
                    value={formData.toArea}
                    onChange={(e) => updateFormData('toArea', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="اسم المنطقة"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  value={formData.toAddress}
                  onChange={(e) => updateFormData('toAddress', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="العنوان الكامل لتسليم السيارة"
                />
              </div>
            </div>

            {/* تاريخ ووقت الاستلام */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <CalendarIcon className="ml-1 inline h-4 w-4" />
                  تاريخ الاستلام *
                </label>
                <input
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => updateFormData('pickupDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 ${
                    errors.pickupDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pickupDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.pickupDate}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <ClockIcon className="ml-1 inline h-4 w-4" />
                  وقت الاستلام المفضل
                </label>
                <select
                  value={formData.pickupTime}
                  onChange={(e) => updateFormData('pickupTime', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                >
                  <option value="">أي وقت</option>
                  <option value="morning">صباحاً (8-12)</option>
                  <option value="afternoon">بعد الظهر (12-17)</option>
                  <option value="evening">مساءً (17-20)</option>
                </select>
              </div>
            </div>

            {/* درجة الأولوية */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">درجة الأولوية</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {urgencyLevels.map((level) => (
                  <label key={level.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={level.value}
                      checked={formData.urgency === level.value}
                      onChange={(e) => updateFormData('urgency', e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`rounded-lg border-2 p-3 transition-colors ${
                        formData.urgency === level.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                      {level.extra && (
                        <div className="text-sm font-medium text-orange-600">{level.extra}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* الخطوة 3: معلومات السيارة */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="mb-4 text-lg font-bold text-gray-900">معلومات السيارة</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ماركة السيارة *
                </label>
                <select
                  value={formData.carBrand}
                  onChange={(e) => updateFormData('carBrand', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 ${
                    errors.carBrand ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر الماركة</option>
                  {carBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                {errors.carBrand && <p className="mt-1 text-sm text-red-500">{errors.carBrand}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">الموديل *</label>
                <input
                  type="text"
                  value={formData.carModel}
                  onChange={(e) => updateFormData('carModel', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 ${
                    errors.carModel ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="مثال: كامري، أكورد، إلنترا"
                />
                {errors.carModel && <p className="mt-1 text-sm text-red-500">{errors.carModel}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">سنة الصنع *</label>
                <select
                  value={formData.carYear}
                  onChange={(e) => updateFormData('carYear', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 ${
                    errors.carYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر السنة</option>
                  {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ),
                  )}
                </select>
                {errors.carYear && <p className="mt-1 text-sm text-red-500">{errors.carYear}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">اللون</label>
                <input
                  type="text"
                  value={formData.carColor}
                  onChange={(e) => updateFormData('carColor', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                  placeholder="أبيض، أسود، فضي..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  القيمة التقديرية (د.ل)
                </label>
                <input
                  type="number"
                  value={formData.carValue}
                  onChange={(e) => updateFormData('carValue', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                  placeholder="15000"
                />
              </div>
            </div>

            {/* حالة السيارة */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">حالة السيارة</label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {carConditions.map((condition) => (
                  <label key={condition.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="carCondition"
                      value={condition.value}
                      checked={formData.carCondition === condition.value}
                      onChange={(e) => updateFormData('carCondition', e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`rounded-lg border-2 p-3 text-center transition-colors ${
                        formData.carCondition === condition.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`font-medium ${condition.color}`}>{condition.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* رفع صور السيارة */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                <CameraIcon className="ml-1 inline h-4 w-4" />
                صور السيارة (اختياري)
              </label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <CameraIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">انقر لرفع صور السيارة</p>
                  <p className="text-sm text-gray-500">PNG, JPG حتى 10MB</p>
                </label>
              </div>

              {/* عرض الصور المرفوعة */}
              {formData.photos.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`صورة ${index + 1}`}
                        className="h-20 w-full rounded-lg object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* الخدمات الإضافية */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                الخدمات الإضافية
              </label>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.insurance}
                    onChange={(e) => updateFormData('insurance', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="mr-3">
                    <div className="font-medium text-gray-900">تأمين شامل</div>
                    <div className="text-sm text-gray-600">
                      حماية السيارة ضد الأضرار أثناء النقل (+5% من التكلفة)
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.tracking}
                    onChange={(e) => updateFormData('tracking', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="mr-3">
                    <div className="font-medium text-gray-900">تتبع GPS</div>
                    <div className="text-sm text-gray-600">
                      تتبع موقع السيارة في الوقت الفعلي (+25 د.ل)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* ملاحظات إضافية */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <DocumentTextIcon className="ml-1 inline h-4 w-4" />
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="أي ملاحظات خاصة أو تعليمات للسائق..."
              />
            </div>
          </div>
        )}

        {/* الخطوة 4: تأكيد الطلب */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">مراجعة وتأكيد الطلب</h3>

            {/* ملخص معلومات العميل */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                <UserIcon className="h-5 w-5 text-blue-600" />
                معلومات العميل
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium">الاسم:</span> {formData.customerName}
                </div>
                <div>
                  <span className="font-medium">الهاتف:</span> {formData.customerPhone}
                </div>
                {/* تم إزالة عرض البريد الإلكتروني */}
              </div>
            </div>

            {/* ملخص تفاصيل النقل */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                <MapPinIcon className="h-5 w-5 text-green-600" />
                تفاصيل النقل
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="font-medium">من:</span> {formData.fromCity}
                  {formData.fromArea && ` - ${formData.fromArea}`}
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="font-medium">إلى:</span> {formData.toCity}
                  {formData.toArea && ` - ${formData.toArea}`}
                </div>
                <div>
                  <span className="font-medium">تاريخ الاستلام:</span> {formData.pickupDate}
                </div>
                {formData.pickupTime && (
                  <div>
                    <span className="font-medium">وقت الاستلام:</span>{' '}
                    {formData.pickupTime === 'morning'
                      ? 'صباحاً (8-12)'
                      : formData.pickupTime === 'afternoon'
                        ? 'بعد الظهر (12-17)'
                        : formData.pickupTime === 'evening'
                          ? 'مساءً (17-20)'
                          : formData.pickupTime}
                  </div>
                )}
                <div>
                  <span className="font-medium">الأولوية:</span>{' '}
                  {urgencyLevels.find((u) => u.value === formData.urgency)?.label}
                </div>
              </div>
            </div>

            {/* ملخص معلومات السيارة */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                <TruckIcon className="h-5 w-5 text-purple-600" />
                معلومات السيارة
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium">الماركة:</span> {formData.carBrand}
                </div>
                <div>
                  <span className="font-medium">الموديل:</span> {formData.carModel}
                </div>
                <div>
                  <span className="font-medium">السنة:</span> {formData.carYear}
                </div>
                {formData.carColor && (
                  <div>
                    <span className="font-medium">اللون:</span> {formData.carColor}
                  </div>
                )}
                <div>
                  <span className="font-medium">الحالة:</span>{' '}
                  {carConditions.find((c) => c.value === formData.carCondition)?.label}
                </div>
                {formData.carValue && (
                  <div>
                    <span className="font-medium">القيمة:</span> {formData.carValue} د.ل
                  </div>
                )}
              </div>
            </div>

            {/* الخدمات الإضافية */}
            {(formData.insurance || formData.tracking) && (
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-3 font-medium text-blue-900">الخدمات الإضافية</h4>
                <div className="space-y-1 text-sm">
                  {formData.insurance && (
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span>تأمين شامل</span>
                    </div>
                  )}
                  {formData.tracking && (
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span>تتبع GPS</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* الملاحظات */}
            {formData.notes && (
              <div className="rounded-lg bg-yellow-50 p-4">
                <h4 className="mb-2 font-medium text-yellow-900">ملاحظات إضافية</h4>
                <p className="text-sm text-yellow-800">{formData.notes}</p>
              </div>
            )}

            {/* تحذير مهم */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-orange-600" />
                <div className="text-sm">
                  <p className="mb-1 font-medium text-orange-900">ملاحظة مهمة:</p>
                  <ul className="space-y-1 text-orange-800">
                    <li>• سيتم مراجعة طلبك من قبل فريق النقل خلال 24 ساعة</li>
                    <li>• سيتم التواصل معك لتأكيد التفاصيل والسعر النهائي</li>
                    <li>• يرجى التأكد من صحة جميع البيانات قبل الإرسال</li>
                    <li>• رسوم الخدمة تختلف حسب المسافة ونوع الخدمة المطلوبة</li>
                  </ul>
                </div>
              </div>
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

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  إرسال الطلب
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportRequestForm;
