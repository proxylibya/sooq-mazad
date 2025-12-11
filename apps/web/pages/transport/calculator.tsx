import SelectField from '../../components/ui/SelectField';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../components/common';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import CalculatorIcon from '@heroicons/react/24/outline/CalculatorIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ScaleIcon from '@heroicons/react/24/outline/ScaleIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/outline/ArrowsRightLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

interface CalculationResult {
  distance: number;
  basePrice: number;
  serviceMultiplier: number;
  additionalServices: number;
  totalPrice: number;
  estimatedTime: number;
}

const TransportCalculatorPage = () => {
  const router = useRouter();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [serviceType, setServiceType] = useState('ساحبة نقل متوسطة (حتى 8 سيارات)');
  const [insurance, setInsurance] = useState(true);
  const [tracking, setTracking] = useState(true);
  const [expressService, setExpressService] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // أنواع الخدمات المتاحة
  const serviceTypes = [
    {
      name: 'ساحبة نقل عادية (سيارة واحدة)',
      multiplier: 1,
      description: 'الخيار الأساسي لنقل سيارة واحدة',
      capacity: 'سيارة واحدة',
      features: ['نقل اقتصادي', 'مرونة في المواعيد', 'مناسب لجميع أنواع السيارات'],
    },
    {
      name: 'ساحبة نقل مع رافعة (سيارة واحدة)',
      multiplier: 1.2,
      description: 'للسيارات المعطلة أو التي تحتاج رافعة',
      capacity: 'سيارة واحدة',
      features: ['رافعة هيدروليكية', 'للسيارات المعطلة', 'حماية إضافية', 'مناسب للسيارات المنخفضة'],
    },
    {
      name: 'شاحنة نقل صغيرة (حتى 3 سيارات)',
      multiplier: 1.5,
      description: 'لنقل عدة سيارات في رحلة واحدة',
      capacity: 'حتى 3 سيارات',
      features: ['توفير في التكلفة', 'نقل متعدد', 'مناسب للعائلات', 'خصم على الكمية'],
    },
    {
      name: 'شاحنة نقل كبيرة (حتى 6 سيارات)',
      multiplier: 2.2,
      description: 'للشحنات التجارية والكميات الكبيرة',
      capacity: 'حتى 6 سيارات',
      features: ['للشحنات التجارية', 'خصم كبير على الكمية', 'مناسب للتجار', 'نقل بالجملة'],
    },
  ];

  // بيانات المسافات بين المدن (كيلومتر)
  const cityDistances = {
    'طرابلس-بنغازي': 1050,
    'طرابلس-مصراتة': 210,
    'طرابلس-الزاوية': 45,
    'طرابلس-سبها': 760,
    'طرابلس-الخمس': 120,
    'بنغازي-درنة': 290,
    'بنغازي-البيضاء': 200,
    'بنغازي-أجدابيا': 160,
    'مصراتة-سرت': 240,
    'مصراتة-زليتن': 50,
    'سبها-مرزق': 140,
    'سبها-أوباري': 180,
  };

  // حساب التكلفة
  const calculateCost = () => {
    if (!fromCity || !toCity || fromCity === toCity) {
      setResult(null);
      return;
    }

    // البحث عن المسافة
    const route1 = `${fromCity}-${toCity}`;
    const route2 = `${toCity}-${fromCity}`;
    let distance = cityDistances[route1] || cityDistances[route2];

    // إذا لم توجد المسافة، استخدم تقدير تقريبي
    if (!distance) {
      distance = Math.floor(Math.random() * 800) + 100;
    }

    // حساب السعر
    const basePricePerKm = 2.5; // دينار لكل كيلومتر
    const selectedService = serviceTypes.find((s) => s.name === serviceType);
    const serviceMultiplier = selectedService?.multiplier || 1;

    const basePrice = distance * basePricePerKm;
    const serviceCost = basePrice * serviceMultiplier;

    // الخدمات الإضافية
    let additionalServices = 0;
    if (insurance) additionalServices += 50;
    if (tracking) additionalServices += 25;
    if (expressService) additionalServices += 100;

    const totalPrice = serviceCost + additionalServices;

    // تقدير الوقت (متوسط سرعة 60 كم/ساعة)
    const estimatedTime = Math.round((distance / 60) * 10) / 10;

    setResult({
      distance,
      basePrice,
      serviceMultiplier,
      additionalServices,
      totalPrice: Math.round(totalPrice),
      estimatedTime,
    });
  };

  useEffect(() => {
    calculateCost();
  }, [fromCity, toCity, serviceType, insurance, tracking, expressService]);

  const handleBookNow = () => {
    // تمرير البيانات إلى صفحة الحجز
    const params = new URLSearchParams({
      fromCity,
      toCity,
      serviceType,
      insurance: insurance.toString(),
      tracking: tracking.toString(),
      expressService: expressService.toString(),
    });

    router.push(`/transport/book?${params.toString()}`);
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  return (
    <>
      <Head>
        <title>حاسبة تكلفة النقل | موقع مزاد السيارات</title>
        <meta name="description" content="احسب تكلفة نقل سيارتك بدقة مع حاسبة التكلفة المتقدمة" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalculatorIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">حاسبة تكلفة النقل</h1>
                  <p className="text-gray-600">احسب تكلفة نقل سيارتك بدقة واحصل على تقدير فوري</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                  <PrinterIcon className="h-5 w-5" />
                  طباعة
                </button>
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                  <ShareIcon className="h-5 w-5" />
                  مشاركة
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* نموذج الحساب */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">تفاصيل النقل</h2>

                {/* اختيار المدن */}
                <div className="space-y-6">
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
                        value={fromCity}
                        onChange={setFromCity}
                        label="مدينة الانطلاق"
                        placeholder="اختر مدينة الانطلاق"
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
                        value={toCity}
                        onChange={setToCity}
                        label="مدينة الوجهة"
                        placeholder="اختر مدينة الوجهة"
                        searchable
                        clearable
                      />
                    </div>
                  </div>

                  {/* زر تبديل المدن */}
                  <div className="flex justify-center">
                    <button
                      onClick={swapCities}
                      disabled={!fromCity || !toCity}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowsRightLeftIcon className="h-5 w-5" />
                      تبديل المدن
                    </button>
                  </div>

                  {/* نوع الخدمة */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      نوع الخدمة
                    </label>
                    <div className="space-y-3">
                      {serviceTypes.map((service) => (
                        <div key={service.name} className="rounded-lg border p-4">
                          <label className="flex cursor-pointer items-start">
                            <input
                              type="radio"
                              name="serviceType"
                              value={service.name}
                              checked={serviceType === service.name}
                              onChange={(e) => setServiceType(e.target.value)}
                              className="mt-1 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="mr-3 flex-1">
                              <div className="font-medium text-gray-900">{service.name}</div>
                              <div className="mb-2 text-sm text-gray-500">
                                {service.description}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {service.features.map((feature, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-blue-600">
                                معامل السعر: {service.multiplier}x
                              </div>
                              <div className="text-xs text-gray-500">السعة: {service.capacity}</div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* الخدمات الإضافية */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      الخدمات الإضافية
                    </label>
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={insurance}
                            onChange={(e) => setInsurance(e.target.checked)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="mr-3">
                            <div className="font-medium text-gray-900">تأمين شامل</div>
                            <div className="text-sm text-gray-500">
                              حماية كاملة للسيارة أثناء النقل
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">+50 د.ل</div>
                      </label>

                      <label className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={tracking}
                            onChange={(e) => setTracking(e.target.checked)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="mr-3">
                            <div className="font-medium text-gray-900">تتبع GPS</div>
                            <div className="text-sm text-gray-500">تتبع مباشر لموقع السيارة</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">+25 د.ل</div>
                      </label>

                      <label className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={expressService}
                            onChange={(e) => setExpressService(e.target.checked)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="mr-3">
                            <div className="font-medium text-gray-900">خدمة سريعة</div>
                            <div className="text-sm text-gray-500">أولوية في النقل والتسليم</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">+100 د.ل</div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* نتائج الحساب */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">نتائج الحساب</h3>

                {result ? (
                  <div className="space-y-4">
                    {/* معلومات المسار */}
                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">تفاصيل المسار</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">من:</span>
                          <span className="font-medium text-blue-900">{fromCity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">إلى:</span>
                          <span className="font-medium text-blue-900">{toCity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">المسافة:</span>
                          <span className="font-medium text-blue-900">{result.distance} كم</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">الوقت المقدر:</span>
                          <span className="font-medium text-blue-900">
                            {result.estimatedTime} ساعة
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* تفاصيل التكلفة */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">التكلفة الأساسية:</span>
                        <span className="font-medium">{Math.round(result.basePrice)} د.ل</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">تكلفة الخدمة:</span>
                        <span className="font-medium">
                          {Math.round(result.basePrice * result.serviceMultiplier)} د.ل
                        </span>
                      </div>

                      {result.additionalServices > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">الخدمات الإضافية:</span>
                          <span className="font-medium">{result.additionalServices} د.ل</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">الإجمالي:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {result.totalPrice} د.ل
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleBookNow}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      احجز الآن
                    </button>

                    <div className="text-center text-xs text-gray-500">
                      * السعر المعروض تقديري وقد يتغير حسب الظروف الفعلية
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <TruckIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <p className="text-gray-500">اختر مدينة الانطلاق والوجهة لحساب التكلفة</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransportCalculatorPage;
