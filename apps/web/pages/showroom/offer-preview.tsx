import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '../../components/common';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import GiftIcon from '@heroicons/react/24/outline/GiftIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';

interface OfferData {
  title: string;
  description: string;
  discountPercentage: string;
  originalPrice: string;
  discountedPrice: string;
  startDate: string;
  endDate: string;
  terms: string;
  applicableCars: string;
  offerType: string;
}

const OfferPreviewPage = () => {
  const router = useRouter();
  const [offerData, setOfferData] = useState<OfferData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('offerData');
    if (savedData) {
      setOfferData(JSON.parse(savedData));
    } else {
      router.push('/showroom/add-offer');
    }
  }, [router]);

  const getOfferTypeInfo = (type: string) => {
    switch (type) {
      case 'discount':
        return {
          title: 'عرض خصم',
          icon: <TagIcon className="h-6 w-6 text-red-600" />,
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'special':
        return {
          title: 'عرض خاص',
          icon: <SparklesIcon className="h-6 w-6 text-purple-600" />,
          color: 'purple',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        };
      case 'seasonal':
        return {
          title: 'عرض موسمي',
          icon: <GiftIcon className="h-6 w-6 text-green-600" />,
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      default:
        return {
          title: 'عرض',
          icon: <TagIcon className="h-6 w-6 text-blue-600" />,
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ar-LY').format(Number(price));
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear saved data
    localStorage.removeItem('offerData');

    // Redirect to success page or showroom dashboard
    router.push('/showroom/offers?success=true');
  };

  const handleEdit = () => {
    router.push('/showroom/offer-details?type=' + offerData?.offerType);
  };

  const handleBack = () => {
    router.push('/showroom/offer-details?type=' + offerData?.offerType);
  };

  if (!offerData) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
        </div>
      </Layout>
    );
  }

  const offerInfo = getOfferTypeInfo(offerData.offerType);

  return (
    <Layout title="معاينة العرض - تأكيد النشر" description="راجع تفاصيل عرضك قبل النشر">
      <Head>
        <title>معاينة العرض - تأكيد النشر</title>
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
                <ArrowLeftIcon className="h-5 w-5" />
                <span>العودة للتعديل</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">معاينة العرض</h1>
                <p className="text-gray-600">راجع تفاصيل عرضك قبل النشر</p>
              </div>
            </div>
          </div>

          {/* Offer Preview Card */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white shadow-lg">
            {/* Offer Header */}
            <div
              className={`rounded-t-xl p-6 ${offerInfo.bgColor} ${offerInfo.borderColor} border-b`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {offerInfo.icon}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{offerData.title}</h2>
                    <p className={`text-sm font-medium text-${offerInfo.color}-700`}>
                      {offerInfo.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4" />
                  تعديل
                </button>
              </div>
            </div>

            {/* Offer Content */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">وصف العرض</h3>
                <p className="leading-relaxed text-gray-700">{offerData.description}</p>
              </div>

              {/* Pricing (for discount offers) */}
              {offerData.offerType === 'discount' && (
                <div className="mb-6 rounded-lg bg-green-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                    تفاصيل الخصم
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {offerData.discountPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">نسبة الخصم</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg text-gray-500 line-through">
                        {formatPrice(offerData.originalPrice)} د.ل
                      </div>
                      <div className="text-sm text-gray-600">السعر الأصلي</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(offerData.discountedPrice)} د.ل
                      </div>
                      <div className="text-sm text-gray-600">السعر بعد الخصم</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                  مدة العرض
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-sm text-gray-600">تاريخ البداية</div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(offerData.startDate)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-sm text-gray-600">تاريخ النهاية</div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(offerData.endDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicable Cars */}
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">السيارات المشمولة</h3>
                <div className="rounded-lg bg-blue-50 p-3">
                  <span className="font-medium text-blue-900">
                    {offerData.applicableCars === 'all'
                      ? 'جميع السيارات'
                      : offerData.applicableCars === 'specific'
                        ? 'سيارات محددة'
                        : 'ماركة محددة'}
                  </span>
                </div>
              </div>

              {/* Terms and Conditions */}
              {offerData.terms && (
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">الشروط والأحكام</h3>
                  <div className="rounded-lg bg-yellow-50 p-3">
                    <p className="text-sm leading-relaxed text-gray-700">{offerData.terms}</p>
                  </div>
                </div>
              )}

              {/* Showroom Info */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <BuildingStorefrontIcon className="h-6 w-6 text-gray-600" />
                  <div>
                    <div className="font-semibold text-gray-900">معرض الأناقة للسيارات</div>
                    <div className="text-sm text-gray-600">طرابلس، شارع الجمهورية</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>العودة للتعديل</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`flex items-center gap-2 rounded-lg px-8 py-3 text-white transition-all ${
                isPublishing
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              {isPublishing ? (
                <>
                  <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>نشر العرض</span>
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              بعد النشر، سيظهر عرضك للعملاء ويمكنك إدارته من لوحة التحكم
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OfferPreviewPage;
