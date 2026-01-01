import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { OpensooqNavbar } from '../../../components/common';
import TransportImageUploader from '../../../components/transport/TransportImageUploader';
import useAuth from '../../../hooks/useAuth';
import { isTransportOwner } from '../../../utils/accountTypeUtils';

interface ServiceData {
  title: string;
  truckType: string;
  capacity: number;
  truckDescription: string;
  serviceRegions: string[];
  workingDays: string[];
  contactPhone: string;
  images: string[];
}

export default function EditTransportService() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [serviceData, setServiceData] = useState<ServiceData>({
    title: '',
    truckType: '',
    capacity: 1,
    truckDescription: '',
    serviceRegions: [],
    workingDays: [],
    contactPhone: '',
    images: [],
  });

  // التحقق من صلاحية الوصول
  useEffect(() => {
    if (!loading && (!user || !isTransportOwner(user.accountType))) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  // جلب بيانات الخدمة
  useEffect(() => {
    if (id && user && isTransportOwner(user.accountType)) {
      fetchService();
    }
  }, [id, user]);

  const fetchService = async () => {
    try {
      setIsLoadingService(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/transport/manage-service?serviceId=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const service = data.service;

        const workingDaysArray = Array.isArray(service.availableDays)
          ? service.availableDays
          : service.availableDays
            ? service.availableDays.split(',').map((day) => day.trim())
            : [];

        setServiceData({
          title: service.title || '',
          truckType: service.truckType,
          capacity: service.capacity,
          truckDescription: service.description || '',
          serviceRegions: Array.isArray(service.serviceArea)
            ? service.serviceArea
            : service.serviceArea
              ? service.serviceArea.split(',').map((area) => area.trim())
              : [],
          workingDays: workingDaysArray,
          contactPhone: service.contactPhone,
          images: Array.isArray(service.images)
            ? service.images
            : service.images
              ? service.images.split(',').map((img) => img.trim())
              : [],
        });
      } else {
        setError(data.error || 'فشل في جلب بيانات الخدمة');
      }
    } catch (error) {
      console.error('خطأ في جلب الخدمة:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsLoadingService(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // التحقق من الحقول المطلوبة
    if (
      !serviceData.title ||
      !serviceData.truckType ||
      !serviceData.capacity ||
      serviceData.serviceRegions.length === 0 ||
      !serviceData.contactPhone
    ) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('يجب تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }

      // تحضير البيانات للإرسال
      const { generateTransportServiceTitle } = await import('../../../utils/transportTitleUtils');

      const submitData = {
        title: generateTransportServiceTitle(serviceData.truckType, serviceData.serviceRegions),
        description:
          serviceData.truckDescription ||
          `خدمة نقل احترافية باستخدام ${serviceData.truckType} تستوعب ${serviceData.capacity} سيارة`,
        truckType: serviceData.truckType,
        capacity: serviceData.capacity,
        serviceArea: serviceData.serviceRegions.join(','),
        availableDays: serviceData.workingDays.join(','),
        contactPhone: serviceData.contactPhone,
        images: serviceData.images.join(','),
        features: '',
        pricePerKm: null,
      };

      const response = await fetch(`/api/transport/manage-service?serviceId=${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('تم تحديث الخدمة بنجاح');
        console.log('✅ [EditService] تم تحديث الخدمة بنجاح، العودة للوحة التحكم...');

        // إضافة معلمة لتحديث البيانات + timestamp لمنع cache
        setTimeout(() => {
          router.push(`/transport/dashboard?refresh=true&t=${Date.now()}`);
        }, 1500);
      } else {
        setError(data.error || 'فشل في تحديث الخدمة');
        console.error('❌ [EditService] فشل في تحديث الخدمة:', data.error);
      }
    } catch (error) {
      console.error('خطأ في تحديث الخدمة:', error);
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

  // أنواع الساحبات المتاحة
  const truckTypes = [
    { value: 'ساحبة مسطحة', label: 'ساحبة مسطحة' },
    { value: 'ناقلة سيارات', label: 'ناقلة سيارات (كاريير)' },
    { value: 'ساحبة مغلقة', label: 'ساحبة مغلقة' },
    { value: 'ساحبة ثقيلة', label: 'ساحبة ثقيلة' },
    { value: 'ونش نقل', label: 'ونش نقل' },
  ];

  // المناطق الجغرافية في ليبيا
  const libyanRegions = [
    {
      name: 'المنطقة الغربية',
      cities: ['طرابلس', 'الزاوية', 'غريان', 'صبراتة', 'العجيلات', 'زوارة', 'الخمس'],
    },
    {
      name: 'المنطقة الوسطى',
      cities: ['مصراتة', 'سرت', 'الجفرة', 'هون', 'ودان'],
    },
    {
      name: 'المنطقة الشرقية',
      cities: ['بنغازي', 'طبرق', 'البيضاء', 'درنة', 'المرج', 'شحات'],
    },
    {
      name: 'المنطقة الجنوبية',
      cities: ['سبها', 'مرزق', 'أوباري', 'الكفرة', 'غات'],
    },
  ];

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
  if (loading || isLoadingService) return null;

  if (!user || !isTransportOwner(user.accountType)) {
    return null;
  }

  return (
    <>
      <Head>
        <title>تعديل خدمة النقل | موقع مزاد السيارات</title>
        <meta name="description" content="تعديل بيانات خدمة النقل" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">تعديل خدمة النقل</h1>
                  <p className="text-gray-600">تحديث بيانات خدمة النقل الخاصة بك</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/transport/dashboard')}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowRightIcon className="h-5 w-5" />
                <span>العودة للوحة التحكم</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="mx-auto max-w-4xl px-4 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center">
                <XMarkIcon className="ml-2 h-5 w-5 text-red-400" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="ml-2 h-5 w-5 text-green-400" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="mx-auto max-w-4xl px-4 pb-8">
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
            {/* عنوان الخدمة */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">عنوان الخدمة</h2>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  عنوان الخدمة *
                </label>
                <input
                  type="text"
                  value={serviceData.title}
                  onChange={(e) => updateServiceData('title', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: خدمة نقل ساحبة مسطحة - طرابلس"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  اكتب عنواناً واضحاً ومميزاً لخدمة النقل الخاصة بك
                </p>
              </div>
            </div>

            {/* نوع الناقل والسعة */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">معلومات الناقل</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    نوع الناقل *
                  </label>
                  <select
                    value={serviceData.truckType}
                    onChange={(e) => updateServiceData('truckType', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">اختر نوع الناقل</option>
                    {truckTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    السعة (عدد السيارات) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={serviceData.capacity}
                    onChange={(e) => updateServiceData('capacity', parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="عدد السيارات التي يمكن نقلها"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  وصف الناقل (اختياري)
                </label>
                <textarea
                  value={serviceData.truckDescription}
                  onChange={(e) => updateServiceData('truckDescription', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="اكتب وصفاً مفصلاً عن الناقل والخدمة..."
                />
              </div>
            </div>

            {/* مناطق الخدمة */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">مناطق الخدمة</h2>
              <p className="mb-4 text-sm text-gray-600">اختر المناطق التي تقدم فيها خدمة النقل</p>

              <div className="space-y-4">
                {libyanRegions.map((region) => (
                  <div key={region.name} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{region.name}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const regionCities = region.cities;
                          const allSelected = regionCities.every((city) =>
                            serviceData.serviceRegions.includes(city),
                          );
                          if (allSelected) {
                            updateServiceData(
                              'serviceRegions',
                              serviceData.serviceRegions.filter(
                                (city) => !regionCities.includes(city),
                              ),
                            );
                          } else {
                            const newRegions = [
                              ...serviceData.serviceRegions,
                              ...regionCities.filter(
                                (city) => !serviceData.serviceRegions.includes(city),
                              ),
                            ];
                            updateServiceData('serviceRegions', newRegions);
                          }
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {region.cities.every((city) => serviceData.serviceRegions.includes(city))
                          ? 'إلغاء تحديد الكل'
                          : 'تحديد الكل'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {region.cities.map((city) => (
                        <label key={city} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={serviceData.serviceRegions.includes(city)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateServiceData('serviceRegions', [
                                  ...serviceData.serviceRegions,
                                  city,
                                ]);
                              } else {
                                updateServiceData(
                                  'serviceRegions',
                                  serviceData.serviceRegions.filter((region) => region !== city),
                                );
                              }
                            }}
                            className="ml-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{city}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {serviceData.serviceRegions.length === 0 && (
                <p className="mt-2 text-sm text-red-600">يجب اختيار منطقة خدمة واحدة على الأقل</p>
              )}
            </div>

            {/* أيام العمل */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">أيام العمل</h2>
              <p className="mb-4 text-sm text-gray-600">اختر الأيام المتاحة لتقديم خدمة النقل</p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                {weekDays.map((day) => (
                  <label key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={serviceData.workingDays.includes(day.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateServiceData('workingDays', [...serviceData.workingDays, day.value]);
                        } else {
                          updateServiceData(
                            'workingDays',
                            serviceData.workingDays.filter((d) => d !== day.value),
                          );
                        }
                      }}
                      className="ml-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* معلومات التواصل */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">معلومات التواصل</h2>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">رقم الهاتف *</label>
                <input
                  type="tel"
                  value={serviceData.contactPhone}
                  onChange={(e) => updateServiceData('contactPhone', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: +218912345678"
                  required
                />
              </div>
            </div>

            {/* قسم الصور - مكون محدث */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
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

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/transport/dashboard')}
                className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                    <span>جاري التحديث...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
