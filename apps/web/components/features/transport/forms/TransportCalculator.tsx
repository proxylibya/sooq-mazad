import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CalculatorIcon from '@heroicons/react/24/outline/CalculatorIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/outline/ArrowsRightLeftIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import SelectField from '../ui/SelectField';

interface CalculationResult {
  distance: number;
  basePrice: number;
  serviceMultiplier: number;
  additionalServices: number;
  totalPrice: number;
  estimatedTime: number;
}

interface TransportCalculatorProps {
  onCalculationComplete?: (result: CalculationResult) => void;
  showBookingButton?: boolean;
  className?: string;
}

const TransportCalculator: React.FC<TransportCalculatorProps> = ({
  onCalculationComplete,
  showBookingButton = true,
  className = '',
}) => {
  const router = useRouter();

  // حالات النموذج
  const [fromCity, setFromCity] = useState('');
  const [fromArea, setFromArea] = useState('');
  const [toCity, setToCity] = useState('');
  const [toArea, setToArea] = useState('');
  const [serviceType, setServiceType] = useState('standard');
  const [carType, setCarType] = useState('sedan');
  const [insurance, setInsurance] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [expressService, setExpressService] = useState(false);

  // نتائج الحساب
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // المدن الليبية الرئيسية
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
    'صرمان',
    'الجميل',
    'ترهونة',
    'غريان',
    'يفرن',
    'نالوت',
  ];

  // أنواع الخدمة
  const serviceTypes = [
    {
      value: 'standard',
      label: 'نقل عادي',
      multiplier: 1,
      description: 'خدمة نقل عادية',
    },
    {
      value: 'premium',
      label: 'نقل مميز',
      multiplier: 1.3,
      description: 'خدمة نقل مع عناية إضافية',
    },
    {
      value: 'luxury',
      label: 'نقل فاخر',
      multiplier: 1.8,
      description: 'نقل للسيارات الفاخرة',
    },
    {
      value: 'enclosed',
      label: 'نقل مغلق',
      multiplier: 2.2,
      description: 'نقل في شاحنة مغلقة',
    },
  ];

  // أنواع السيارات
  const carTypes = [
    { value: 'sedan', label: 'سيارة صغيرة', multiplier: 1 },
    { value: 'suv', label: 'سيارة متوسطة/SUV', multiplier: 1.2 },
    { value: 'truck', label: 'شاحنة صغيرة', multiplier: 1.4 },
    { value: 'luxury', label: 'سيارة فاخرة', multiplier: 1.6 },
    { value: 'sports', label: 'سيارة رياضية', multiplier: 1.8 },
  ];

  // حساب المسافة التقريبية بين المدن (كيلومتر)
  const calculateDistance = (from: string, to: string): number => {
    const distances: { [key: string]: { [key: string]: number } } = {
      طرابلس: { بنغازي: 1050, مصراتة: 210, سبها: 760, الزاوية: 45 },
      بنغازي: { طرابلس: 1050, مصراتة: 840, سبها: 650, درنة: 285 },
      مصراتة: { طرابلس: 210, بنغازي: 840, سبها: 550, سرت: 240 },
      سبها: { طرابلس: 760, بنغازي: 650, مصراتة: 550 },
    };

    if (distances[from] && distances[from][to]) {
      return distances[from][to];
    }

    // حساب تقريبي للمدن غير المدرجة
    return Math.floor(Math.random() * 500) + 100;
  };

  // حساب التكلفة
  const calculateCost = () => {
    if (!fromCity || !toCity) {
      setCalculation(null);
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      const distance = calculateDistance(fromCity, toCity);
      const baseRate = 0.8; // دينار ليبي لكل كيلومتر

      const selectedService = serviceTypes.find((s) => s.value === serviceType);
      const selectedCarType = carTypes.find((c) => c.value === carType);

      const basePrice = distance * baseRate;
      const serviceMultiplier =
        (selectedService?.multiplier || 1) * (selectedCarType?.multiplier || 1);

      let additionalServices = 0;
      if (insurance) additionalServices += basePrice * 0.05; // 5% للتأمين
      if (tracking) additionalServices += 25; // 25 دينار للتتبع
      if (expressService) additionalServices += basePrice * 0.15; // 15% للخدمة السريعة

      const totalPrice = basePrice * serviceMultiplier + additionalServices;
      const estimatedTime = Math.ceil(distance / 80); // ساعات (80 كم/ساعة متوسط)

      const result: CalculationResult = {
        distance,
        basePrice,
        serviceMultiplier,
        additionalServices,
        totalPrice,
        estimatedTime,
      };

      setCalculation(result);
      setIsCalculating(false);

      if (onCalculationComplete) {
        onCalculationComplete(result);
      }
    }, 1000);
  };

  // تبديل المدن
  const swapCities = () => {
    const tempCity = fromCity;
    const tempArea = fromArea;
    setFromCity(toCity);
    setFromArea(toArea);
    setToCity(tempCity);
    setToArea(tempArea);
  };

  // الانتقال لصفحة الحجز
  const handleBookNow = () => {
    if (!calculation) return;

    const params = new URLSearchParams({
      fromCity,
      fromArea,
      toCity,
      toArea,
      serviceType,
      carType,
      insurance: insurance.toString(),
      tracking: tracking.toString(),
      expressService: expressService.toString(),
      totalPrice: calculation.totalPrice.toString(),
    });

    router.push(`/transport/book?${params.toString()}`);
  };

  useEffect(() => {
    calculateCost();
  }, [fromCity, toCity, serviceType, carType, insurance, tracking, expressService]);

  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-lg ${className}`}>
      {/* العنوان */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-2">
          <CalculatorIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">حاسبة تكلفة النقل</h2>
          <p className="text-sm text-gray-600">احسب تكلفة نقل سيارتك بدقة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* النموذج */}
        <div className="space-y-4">
          {/* المدن */}
          <div className="grid grid-cols-1 gap-4">
            {/* من */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <MapPinIcon className="ml-1 inline h-4 w-4" />
                من مدينة
              </label>
              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label=""
                  options={cities}
                  value={fromCity}
                  onChange={setFromCity}
                  placeholder="اختر المدينة"
                  className="text-sm"
                />
                <input
                  type="text"
                  placeholder="المنطقة"
                  value={fromArea}
                  onChange={(e) => setFromArea(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* زر التبديل */}
            <div className="flex justify-center">
              <button
                onClick={swapCities}
                className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                title="تبديل المدن"
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
              </button>
            </div>

            {/* إلى */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <MapPinIcon className="ml-1 inline h-4 w-4" />
                إلى مدينة
              </label>
              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label=""
                  options={cities}
                  value={toCity}
                  onChange={setToCity}
                  placeholder="اختر المدينة"
                  className="text-sm"
                />
                <input
                  type="text"
                  placeholder="المنطقة"
                  value={toArea}
                  onChange={(e) => setToArea(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* نوع الخدمة */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <TruckIcon className="ml-1 inline h-4 w-4" />
              نوع الخدمة
            </label>
            <SelectField
              label=""
              options={serviceTypes.map((service) => `${service.label} - ${service.description}`)}
              value={
                serviceTypes.find((s) => s.value === serviceType)?.label +
                  ' - ' +
                  serviceTypes.find((s) => s.value === serviceType)?.description || ''
              }
              onChange={(value) => {
                const service = serviceTypes.find((s) => `${s.label} - ${s.description}` === value);
                if (service) setServiceType(service.value);
              }}
              placeholder="اختر نوع الخدمة"
            />
          </div>

          {/* نوع السيارة */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">نوع السيارة</label>
            <SelectField
              label=""
              options={carTypes.map((type) => type.label)}
              value={carTypes.find((t) => t.value === carType)?.label || ''}
              onChange={(value) => {
                const type = carTypes.find((t) => t.label === value);
                if (type) setCarType(type.value);
              }}
              placeholder="اختر نوع السيارة"
            />
          </div>

          {/* الخدمات الإضافية */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">الخدمات الإضافية</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={insurance}
                  onChange={(e) => setInsurance(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm">تأمين شامل (+5%)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={tracking}
                  onChange={(e) => setTracking(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm">تتبع GPS (+25 د.ل)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={expressService}
                  onChange={(e) => setExpressService(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm">خدمة سريعة (+15%)</span>
              </label>
            </div>
          </div>
        </div>

        {/* النتائج */}
        <div className="rounded-xl bg-gray-50 p-4">
          {isCalculating ? (
            <div className="flex items-center justify-center py-8">
              <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
              <span className="mr-3 text-gray-600">جاري الحساب...</span>
            </div>
          ) : calculation ? (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold text-gray-900">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                تفاصيل التكلفة
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">المسافة:</span>
                  <span className="font-medium">{calculation.distance} كم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوقت المتوقع:</span>
                  <span className="font-medium">{calculation.estimatedTime} ساعة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التكلفة الأساسية:</span>
                  <span className="font-medium">{calculation.basePrice.toFixed(2)} د.ل</span>
                </div>
                {calculation.additionalServices > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الخدمات الإضافية:</span>
                    <span className="font-medium">
                      {calculation.additionalServices.toFixed(2)} د.ل
                    </span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">الإجمالي:</span>
                  <span className="text-green-600">{calculation.totalPrice.toFixed(2)} د.ل</span>
                </div>
              </div>

              {showBookingButton && (
                <button
                  onClick={handleBookNow}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  احجز الآن
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <InformationCircleIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
              <p>اختر المدن لحساب التكلفة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportCalculator;
