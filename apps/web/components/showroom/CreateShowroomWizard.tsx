import {
  ArrowRightIcon,
  BuildingStorefrontIcon,
  CogIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhotoIcon,
  RectangleStackIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { libyanCities } from '../../data/libyan-cities';
import { getVehicleCountLabel } from '../../utils/vehicleCountUtils';
import LocationSelector from '../LocationSelector';
import SelectField from '../ui/SelectField';
import VehicleCountSelector from '../ui/VehicleCountSelector';

interface ShowroomFormData {
  name: string;
  description: string;
  vehicleTypes: string[];
  vehicleCount: string;
  city: string;
  area: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  detailedAddress?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface CreateShowroomWizardProps {
  initialData?: Partial<ShowroomFormData>;
  title?: string;
  continueButtonText?: string;
  onContinue?: (data: ShowroomFormData) => Promise<void> | void;
}

const CreateShowroomWizard: React.FC<CreateShowroomWizardProps> = ({
  initialData,
  title,
  continueButtonText,
  onContinue,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<ShowroomFormData>({
    name: '',
    description: '',
    vehicleTypes: [],
    vehicleCount: '',
    city: '',
    area: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Apply initial data in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // أنواع المركبات (مطابقة لصفحة /showroom/create)
  const vehicleTypes = [
    {
      value: 'cars',
      label: 'سيارات',
      icon: <RectangleStackIcon className="h-5 w-5" />,
    },
    {
      value: 'trucks',
      label: 'شاحنات',
      icon: <TruckIcon className="h-5 w-5" />,
    },
    {
      value: 'motorcycles',
      label: 'دراجات نارية',
      icon: <CogIcon className="h-5 w-5" />,
    },
    {
      value: 'bicycles',
      label: 'دراجات هوائية',
      icon: <CogIcon className="h-5 w-5" />,
    },
    { value: 'boats', label: 'قوارب', icon: <CogIcon className="h-5 w-5" /> },
    { value: 'other', label: 'أخرى', icon: <CogIcon className="h-5 w-5" /> },
  ];

  const handleInputChange = (field: keyof ShowroomFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // مسح الخطأ عند الكتابة
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // توليد العنوان تلقائياً عند اختيار المدينة والمنطقة
    if (field === 'city' || field === 'area') {
      const newFormData = { ...formData, [field]: value } as ShowroomFormData;
      if (newFormData.city && newFormData.area) {
        const generatedAddress = `${newFormData.area}، ${newFormData.city}`;
        setFormData((prev) => ({ ...prev, address: generatedAddress }));
      }
    }
  };

  const handleVehicleTypeChange = (vehicleType: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      vehicleTypes: checked
        ? [...prev.vehicleTypes, vehicleType]
        : prev.vehicleTypes.filter((type) => type !== vehicleType),
    }));

    if (errors.vehicleTypes) {
      setErrors((prev) => ({ ...prev, vehicleTypes: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المعرض مطلوب';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'اسم المعرض يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف المعرض مطلوب';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'وصف المعرض يجب أن يكون 10 أحرف على الأقل';
    }

    if (formData.vehicleTypes.length === 0) {
      newErrors.vehicleTypes = 'يجب اختيار نوع واحد على الأقل من المركبات';
    }

    if (!formData.vehicleCount) {
      newErrors.vehicleCount = 'عدد المركبات مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.city) {
      newErrors.city = 'المدينة مطلوبة';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'المنطقة أو الشارع مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocationSelect = (location: any) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
      detailedAddress: location.address,
    }));
  };

  const handleContinue = async () => {
    if (onContinue) {
      try {
        await onContinue(formData);
      } catch (e) {
        console.error('Error in onContinue:', e);
      }
      return;
    }
    // حفظ البيانات في localStorage (سلوك الإنشاء الافتراضي)
    try {
      localStorage.setItem('showroomData', JSON.stringify(formData));

      // تحديد المسار الصحيح
      const uploadPath = '/showroom/upload-images';

      // الانتقال لصفحة رفع الصور المناسبة
      router.push(uploadPath);
    } catch (e) {
      console.error('خطأ في حفظ البيانات:', e);
      alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    }
  };

  const getVehicleTypesLabel = (values: string[]) => {
    const labels = values.map((value) => {
      const type = vehicleTypes.find((t) => t.value === value);
      return type ? type.label : value;
    });
    return labels.join('، ');
  };

  return (
    <>
      <Head>
        <title>إنشاء معرض جديد</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <BuildingStorefrontIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900">{title || 'إنشاء معرض جديد'}</h1>
            <p className="text-lg text-gray-600">أنشئ معرضك الخاص وابدأ في عرض مركباتك للعملاء</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      step <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 w-16 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {currentStep === 1 && (
              <div>
                <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  معلومات المعرض الأساسية
                </h2>

                <div className="space-y-6">
                  {/* اسم المعرض */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      اسم المعرض *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                        errors.name
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="مثال: معرض الأناقة للسيارات"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* وصف المعرض */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      وصف عن المعرض *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                        errors.description
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="اكتب وصفاً مفصلاً عن معرضك وخدماتك..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* نوع المركبات */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      نوع المركبات * (يمكن اختيار أكثر من نوع)
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {vehicleTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                            formData.vehicleTypes.includes(type.value)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.vehicleTypes.includes(type.value)}
                            onChange={(e) => handleVehicleTypeChange(type.value, e.target.checked)}
                            className="rounded text-green-600 focus:ring-green-500"
                          />
                          {type.icon}
                          <span className="font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.vehicleTypes && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicleTypes}</p>
                    )}
                  </div>

                  {/* عدد المركبات */}
                  <VehicleCountSelector
                    value={formData.vehicleCount}
                    onChange={(value) => handleInputChange('vehicleCount', value)}
                    required
                    error={errors.vehicleCount}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <MapPinIcon className="h-6 w-6 text-green-600" />
                  عنوان المعرض
                </h2>

                <div className="space-y-6">
                  {/* المدينة */}
                  <SelectField
                    options={libyanCities.map((city) => city.name)}
                    value={formData.city}
                    onChange={(value) => handleInputChange('city', value)}
                    label="المدينة"
                    placeholder="اختر المدينة"
                    required={true}
                    error={errors.city}
                    searchable={true}
                    clearable={true}
                  />

                  {/* المنطقة أو الشارع */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      المنطقة أو الشارع *
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                        errors.area
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="مثال: شارع الجمهورية، منطقة الدهماني"
                    />
                    {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
                  </div>

                  {/* العنوان المُكوَّن */}
                  {formData.address && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        عنوان المعرض المُكوَّن
                      </label>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                        <p className="font-medium text-green-800">{formData.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <MapPinIcon className="h-6 w-6 text-green-600" />
                  تحديد موقع المعرض
                </h2>

                <div className="space-y-6">
                  <p className="text-gray-600">
                    حدد الموقع الدقيق لمعرضك على الخريطة لمساعدة العملاء في الوصول إليك
                  </p>

                  <LocationSelector
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={
                      formData.coordinates
                        ? {
                            lat: formData.coordinates.lat,
                            lng: formData.coordinates.lng,
                            address: formData.detailedAddress || formData.address,
                          }
                        : undefined
                    }
                    label="موقع المعرض"
                    placeholder="اضغط لتحديد موقع المعرض على الخريطة"
                  />

                  {/* ملخص البيانات */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-3 font-semibold text-gray-900">ملخص بيانات المعرض</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">اسم المعرض:</span> {formData.name}
                      </div>
                      <div>
                        <span className="font-medium">نوع المركبات:</span>{' '}
                        {getVehicleTypesLabel(formData.vehicleTypes)}
                      </div>
                      <div>
                        <span className="font-medium">عدد المركبات:</span>{' '}
                        {getVehicleCountLabel(formData.vehicleCount)}
                      </div>
                      <div>
                        <span className="font-medium">العنوان:</span> {formData.address}
                      </div>
                      {formData.coordinates && (
                        <div>
                          <span className="font-medium">الموقع:</span> محدد على الخريطة
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 transition-colors ${
                currentStep === 1
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>السابق</span>
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3 text-white transition-colors hover:bg-green-700"
              >
                <span>التالي</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3 text-white transition-colors hover:bg-green-700"
              >
                <PhotoIcon className="h-5 w-5" />
                <span>{continueButtonText || 'رفع صور المعرض'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateShowroomWizard;
