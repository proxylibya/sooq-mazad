import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Layout } from '../../components/common';
import { BackIcon, ForwardIcon } from '../../components/common/icons/RTLIcon';

interface FormData {
  title: string;
  description: string;
  discountPercentage: string;
  originalPrice: string;
  discountedPrice: string;
  startDate: string;
  endDate: string;
  terms: string;
  applicableCars: string;
}

interface FormErrors {
  [key: string]: string;
}

const OfferDetailsPage = () => {
  const router = useRouter();
  const { type } = router.query;
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    discountPercentage: '',
    originalPrice: '',
    discountedPrice: '',
    startDate: '',
    endDate: '',
    terms: '',
    applicableCars: 'all',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const getOfferTypeInfo = () => {
    switch (type) {
      case 'discount':
        return {
          title: 'عرض خصم',
          description: 'إنشاء عرض خصم على السيارات',
          color: 'red',
        };
      case 'special':
        return {
          title: 'عرض خاص',
          description: 'إنشاء عرض خاص مع خدمات إضافية',
          color: 'purple',
        };
      case 'seasonal':
        return {
          title: 'عرض موسمي',
          description: 'إنشاء عرض موسمي لفترة محددة',
          color: 'green',
        };
      default:
        return {
          title: 'عرض جديد',
          description: 'إنشاء عرض جديد',
          color: 'blue',
        };
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Auto-calculate discounted price when discount percentage or original price changes
    if (field === 'discountPercentage' || field === 'originalPrice') {
      const originalPrice =
        field === 'originalPrice' ? parseFloat(value) : parseFloat(formData.originalPrice);
      const discountPercentage =
        field === 'discountPercentage'
          ? parseFloat(value)
          : parseFloat(formData.discountPercentage);

      if (originalPrice && discountPercentage) {
        const discountedPrice = originalPrice - (originalPrice * discountPercentage) / 100;
        setFormData((prev) => ({
          ...prev,
          discountedPrice: discountedPrice.toString(),
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان العرض مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف العرض مطلوب';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'تاريخ البداية مطلوب';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية مطلوب';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
    }

    if (type === 'discount') {
      if (!formData.discountPercentage || parseFloat(formData.discountPercentage) <= 0) {
        newErrors.discountPercentage = 'نسبة الخصم مطلوبة ويجب أن تكون أكبر من صفر';
      }

      if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
        newErrors.originalPrice = 'السعر الأصلي مطلوب ويجب أن يكون أكبر من صفر';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Save form data to localStorage
      localStorage.setItem('offerData', JSON.stringify({ ...formData, offerType: type }));
      router.push('/showroom/offer-preview');
    }
  };

  const handleBack = () => {
    router.push('/showroom/add-offer');
  };

  const offerInfo = getOfferTypeInfo();

  return (
    <Layout title={`إضافة ${offerInfo.title} - تفاصيل العرض`} description={offerInfo.description}>
      <Head>
        <title>إضافة {offerInfo.title} - تفاصيل العرض</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
              >
                <BackIcon className="h-5 w-5" />
                <span>العودة</span>
              </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">تفاصيل {offerInfo.title}</h1>
            <p className="mt-2 text-gray-600">{offerInfo.description}</p>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                المعلومات الأساسية
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    عنوان العرض *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.title
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="مثال: خصم 20% على جميع سيارات BMW"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    السيارات المشمولة
                  </label>
                  <select
                    value={formData.applicableCars}
                    onChange={(e) => handleInputChange('applicableCars', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">جميع السيارات</option>
                    <option value="specific">سيارات محددة</option>
                    <option value="brand">ماركة محددة</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">وصف العرض *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.description
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="اكتب وصفاً مفصلاً للعرض..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Pricing (for discount offers) */}
            {type === 'discount' && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                  تفاصيل الأسعار
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      نسبة الخصم (%) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                        errors.discountPercentage
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="20"
                    />
                    {errors.discountPercentage && (
                      <p className="mt-1 text-sm text-red-600">{errors.discountPercentage}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      السعر الأصلي (دينار) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                        errors.originalPrice
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="50000"
                    />
                    {errors.originalPrice && (
                      <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      السعر بعد الخصم (دينار)
                    </label>
                    <input
                      type="number"
                      value={formData.discountedPrice}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                      placeholder="يتم الحساب تلقائياً"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                مدة العرض
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    تاريخ البداية *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.startDate
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    تاريخ النهاية *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.endDate
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <DocumentTextIcon className="h-5 w-5 text-orange-600" />
                الشروط والأحكام
              </h3>

              <textarea
                value={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اكتب شروط وأحكام العرض (اختياري)..."
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <BackIcon className="h-5 w-5" />
              <span>السابق</span>
            </button>

            <button
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3 text-white transition-colors hover:bg-green-700"
            >
              <span>معاينة العرض</span>
              <ForwardIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OfferDetailsPage;
