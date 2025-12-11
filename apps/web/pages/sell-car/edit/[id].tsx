import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import PaintBrushIcon from '@heroicons/react/24/outline/PaintBrushIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BackButton, Layout } from '../../../components/common';
import { useUserContext } from '../../../contexts/UserContext';

interface CarData {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  mileage?: number;
  location: string;
  description?: string;
  features: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  interiorColor?: string;
  seatCount?: string;
  images: string;
  contactPhone?: string;
  sellerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const EditCarPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadCarData();
    }
  }, [id]);

  // ملء رقم الهاتف تلقائياً من بيانات المستخدم إذا لم يكن موجوداً
  useEffect(() => {
    const fillPhoneNumber = async () => {
      if (!carData || carData.contactPhone) return; // إذا كان رقم الهاتف موجود بالفعل، لا نغيره

      try {
        // أولاً: استخدام UserContext إذا كان المستخدم مسجل دخول
        if (user && user.phone) {
          const cleanPhone = user.phone.replace(/^\+218/, '').replace(/^\+/, '');
          setCarData((prev) => (prev ? { ...prev, contactPhone: cleanPhone } : null));
          return;
        }

        // ثانياً: محاولة جلب من localStorage
        const savedUserData = localStorage.getItem('user');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          if (userData.phone) {
            const cleanPhone = userData.phone.replace(/^\+218/, '').replace(/^\+/, '');
            setCarData((prev) => (prev ? { ...prev, contactPhone: cleanPhone } : null));
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
              setCarData((prev) => (prev ? { ...prev, contactPhone: cleanPhone } : null));
            }
          }
        }
      } catch (error) {
        console.log('[تحذير] لا يمكن جلب رقم الهاتف تلقائياً:', error);
      }
    };

    fillPhoneNumber();
  }, [user, carData]);

  const loadCarData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cars/${id}`);

      if (response.ok) {
        const result = await response.json();
        setCarData(result.data);
      } else {
        throw new Error('فشل في تحميل بيانات السيارة');
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات السيارة:', error);
      alert('حدث خطأ في تحميل بيانات السيارة');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CarData, value: string | number) => {
    if (carData) {
      setCarData({
        ...carData,
        [field]: value,
      });

      // إزالة رسالة الخطأ عند التعديل
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // التحقق من العنوان
    if (!carData?.title?.trim()) {
      newErrors.title = 'عنوان الإعلان مطلوب';
    } else if (carData.title.trim().length < 10) {
      newErrors.title = 'عنوان الإعلان يجب أن يكون 10 أحرف على الأقل';
    } else if (carData.title.trim().length > 100) {
      newErrors.title = 'عنوان الإعلان يجب أن يكون أقل من 100 حرف';
    }

    // التحقق من الماركة
    if (!carData?.brand?.trim()) {
      newErrors.brand = 'الماركة مطلوبة';
    } else if (carData.brand.trim().length < 2) {
      newErrors.brand = 'اسم الماركة قصير جداً';
    }

    // التحقق من الموديل
    if (!carData?.model?.trim()) {
      newErrors.model = 'الموديل مطلوب';
    } else if (carData.model.trim().length < 2) {
      newErrors.model = 'اسم الموديل قصير جداً';
    }

    // التحقق من سنة الصنع
    const currentYear = new Date().getFullYear();
    if (!carData?.year) {
      newErrors.year = 'سنة الصنع مطلوبة';
    } else if (carData.year < 1900) {
      newErrors.year = 'سنة الصنع لا يمكن أن تكون قبل 1900';
    } else if (carData.year > currentYear + 1) {
      newErrors.year = `سنة الصنع لا يمكن أن تكون بعد ${currentYear + 1}`;
    }

    // التحقق من السعر
    if (!carData?.price) {
      newErrors.price = 'السعر مطلوب';
    } else if (carData.price <= 0) {
      newErrors.price = 'السعر يجب أن يكون أكبر من صفر';
    } else if (carData.price < 1000) {
      newErrors.price = 'السعر منخفض جداً (أقل من 1000 دينار)';
    } else if (carData.price > 10000000) {
      newErrors.price = 'السعر مرتفع جداً (أكثر من 10 مليون دينار)';
    }

    // التحقق من حالة السيارة
    if (!carData?.condition?.trim()) {
      newErrors.condition = 'حالة السيارة مطلوبة';
    }

    // التحقق من الموقع
    if (!carData?.location?.trim()) {
      newErrors.location = 'الموقع مطلوب';
    } else if (carData.location.trim().length < 3) {
      newErrors.location = 'الموقع قصير جداً';
    }

    // التحقق من المسافة المقطوعة (إذا تم إدخالها)
    if (carData?.mileage && carData.mileage < 0) {
      newErrors.mileage = 'المسافة المقطوعة لا يمكن أن تكون سالبة';
    } else if (carData?.mileage && carData.mileage > 1000000) {
      newErrors.mileage = 'المسافة المقطوعة مرتفعة جداً';
    }

    // التحقق من رقم الهاتف (إذا تم إدخاله)
    if (carData?.contactPhone?.trim()) {
      const phoneRegex = /^(09|02|05)\d{8}$/;
      if (!phoneRegex.test(carData.contactPhone.trim())) {
        newErrors.contactPhone = 'رقم الهاتف غير صحيح (مثال: 0912345678)';
      }
    }

    // التحقق من الوصف (إذا تم إدخاله)
    if (carData?.description?.trim() && carData.description.trim().length > 1000) {
      newErrors.description = 'الوصف طويل جداً (أكثر من 1000 حرف)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // إزالة رسائل النجاح السابقة
    setShowSuccess(false);
    setSuccessMessage('');

    if (!validateForm()) {
      // التمرير إلى أول خطأ
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...carData,
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage('تم حفظ التعديلات بنجاح! سيتم توجيهك لصفحة السيارة...');
        setShowSuccess(true);

        // التوجيه بعد 2 ثانية
        setTimeout(() => {
          router.push(`/marketplace/${id}`);
        }, 2000);
      } else {
        throw new Error(result.error || 'فشل في حفظ التعديلات');
      }
    } catch (error) {
      console.error('خطأ في حفظ التعديلات:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'حدث خطأ في حفظ التعديلات',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/marketplace/${id}`);
  };

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  if (!carData) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">السيارة غير موجودة</h1>
            <p className="mb-6 text-gray-600">لم يتم العثور على السيارة المطلوبة</p>
            <button
              onClick={() => router.push('/marketplace')}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              العودة للسوق
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`تعديل ${carData.title}`}>
      <Head>
        <title>تعديل {carData.title} - سوق مزاد</title>
        <meta name="description" content={`تعديل بيانات ${carData.title}`} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* رأس الصفحة */}
          <div className="mb-8">
            <BackButton href={`/marketplace/${id}`} text="العودة للسيارة" variant="blue" />

            <div className="mt-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <PencilIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">تعديل السيارة</h1>
              <p className="mt-2 text-gray-600">قم بتحديث بيانات سيارتك حسب الحاجة</p>
            </div>
          </div>

          {/* رسائل النجاح والخطأ */}
          {showSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="ml-2 h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="ml-2 h-5 w-5 text-red-600" />
                <p className="font-medium text-red-800">{errors.general}</p>
              </div>
            </div>
          )}

          {/* نموذج التعديل */}
          <div className="space-y-8">
            {/* المعلومات الأساسية */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  المعلومات الأساسية
                </h3>
              </div>

              <div className="space-y-6 p-6">
                {/* عنوان الإعلان */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    عنوان الإعلان *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={carData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="مثال: تويوتا كامري 2020 فل كامل"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* الماركة والموديل */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      الماركة *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={carData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                        errors.brand ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="مثال: تويوتا"
                    />
                    {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      الموديل *
                    </label>
                    <input
                      type="text"
                      value={carData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                        errors.model ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="مثال: كامري"
                    />
                    {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                  </div>
                  {/* السنة والسعر */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        سنة الصنع *
                      </label>
                      <input
                        type="number"
                        value={carData.year}
                        onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                        className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                          errors.year ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                      {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        السعر (دينار ليبي) *
                      </label>
                      <input
                        type="number"
                        value={carData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="50000"
                        min="0"
                        step="100"
                      />
                      {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>
                  </div>

                  {/* الحالة والمسافة المقطوعة */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        حالة السيارة *
                      </label>
                      <select
                        value={carData.condition}
                        onChange={(e) => handleInputChange('condition', e.target.value)}
                        className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                          errors.condition ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">اختر الحالة</option>
                        <option value="جديد">جديد</option>
                        <option value="مستعمل">مستعمل</option>
                      </select>
                      {errors.condition && (
                        <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        المسافة المقطوعة (كم)
                      </label>
                      <input
                        type="number"
                        value={carData.mileage || ''}
                        onChange={(e) =>
                          handleInputChange('mileage', parseInt(e.target.value) || 0)
                        }
                        className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                          errors.mileage ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="100000"
                        min="0"
                      />
                      {errors.mileage && (
                        <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>
                      )}
                    </div>
                  </div>

                  {/* الموقع */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">الموقع *</label>
                    <input
                      type="text"
                      value={carData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="مثال: طرابلس - حي الأندلس"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* المواصفات التقنية */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CogIcon className="h-5 w-5 text-blue-600" />
                  المواصفات التقنية
                </h3>
              </div>

              <div className="space-y-6 p-6">
                {/* نوع الوقود وناقل الحركة */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      نوع الوقود
                    </label>
                    <select
                      value={carData.fuelType || ''}
                      onChange={(e) => handleInputChange('fuelType', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">اختر نوع الوقود</option>
                      <option value="بنزين">بنزين</option>
                      <option value="ديزل">ديزل</option>
                      <option value="هايبرد">هايبرد</option>
                      <option value="كهربائي">كهربائي</option>
                      <option value="غاز طبيعي">غاز طبيعي</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      ناقل الحركة
                    </label>
                    <select
                      value={carData.transmission || ''}
                      onChange={(e) => handleInputChange('transmission', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">اختر ناقل الحركة</option>
                      <option value="أوتوماتيك">أوتوماتيك</option>
                      <option value="يدوي">يدوي</option>
                      <option value="CVT">CVT</option>
                      <option value="نصف أوتوماتيك">نصف أوتوماتيك</option>
                    </select>
                  </div>
                </div>

                {/* نوع الهيكل وعدد المقاعد */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      نوع الهيكل
                    </label>
                    <select
                      value={carData.bodyType || ''}
                      onChange={(e) => handleInputChange('bodyType', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">اختر نوع الهيكل</option>
                      <option value="سيدان">سيدان</option>
                      <option value="هاتشباك">هاتشباك</option>
                      <option value="SUV">SUV</option>
                      <option value="كوبيه">كوبيه</option>
                      <option value="كونفرتيبل">كونفرتيبل</option>
                      <option value="ستيشن واجن">ستيشن واجن</option>
                      <option value="بيك أب">بيك أب</option>
                      <option value="فان">فان</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      عدد المقاعد
                    </label>
                    <select
                      value={carData.seatCount || ''}
                      onChange={(e) => handleInputChange('seatCount', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">اختر عدد المقاعد</option>
                      <option value="2">2 مقعد</option>
                      <option value="4">4 مقاعد</option>
                      <option value="5">5 مقاعد</option>
                      <option value="7">7 مقاعد</option>
                      <option value="8">8 مقاعد</option>
                      <option value="9">9 مقاعد</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* الألوان */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <PaintBrushIcon className="h-5 w-5 text-blue-600" />
                  الألوان
                </h3>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      لون السيارة الخارجي
                    </label>
                    <input
                      type="text"
                      value={carData.color || ''}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="مثال: أبيض لؤلؤي"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      لون المقصورة الداخلية
                    </label>
                    <input
                      type="text"
                      value={carData.interiorColor || ''}
                      onChange={(e) => handleInputChange('interiorColor', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="مثال: أسود جلد"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* الوصف والمميزات */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <StarIcon className="h-5 w-5 text-blue-600" />
                  الوصف والمميزات
                </h3>
              </div>

              <div className="space-y-6 p-6">
                {/* الوصف */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    وصف السيارة
                  </label>
                  <textarea
                    value={carData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="اكتب وصفاً مفصلاً عن السيارة، حالتها، والمميزات الإضافية..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {carData.description?.length || 0}/1000 حرف
                  </p>
                </div>

                {/* المميزات */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    المميزات والكماليات
                  </label>
                  <textarea
                    value={carData.features || ''}
                    onChange={(e) => handleInputChange('features', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="مثال: مكيف، نوافذ كهربائية، مقاعد جلد، نظام ملاحة..."
                  />
                  <p className="mt-1 text-sm text-gray-500">اكتب المميزات مفصولة بفواصل</p>
                </div>

                {/* رقم الهاتف */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    رقم الهاتف للتواصل
                  </label>
                  <input
                    type="tel"
                    value={carData.contactPhone || ''}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className={`w-full rounded-lg border px-4 py-3 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="مثال: 0912345678"
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    يجب أن يبدأ بـ 09 أو 02 أو 05 ويتكون من 10 أرقام
                  </p>
                </div>
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-lg">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    حفظ التعديلات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditCarPage;
