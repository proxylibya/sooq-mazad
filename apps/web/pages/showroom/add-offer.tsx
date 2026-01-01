import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '../../components/common';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import GiftIcon from '@heroicons/react/24/outline/GiftIcon';

const AddOfferPage = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'discount' | 'special' | 'seasonal' | null>(
    null,
  );

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/showroom/offer-details?type=${selectedType}`);
    }
  };

  const offerTypes = [
    {
      id: 'discount',
      title: 'عرض خصم',
      description: 'خصم على سيارة أو مجموعة سيارات محددة',
      icon: <TagIcon className="h-8 w-8 text-red-600" />,
      features: ['خصم مباشر', 'سعر مخفض', 'فترة محددة', 'جذب العملاء'],
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverColor: 'hover:border-red-400',
    },
    {
      id: 'special',
      title: 'عرض خاص',
      description: 'عرض مميز مع خدمات إضافية',
      icon: <SparklesIcon className="h-8 w-8 text-purple-600" />,
      features: ['خدمات إضافية', 'ضمان ممتد', 'صيانة مجانية', 'قيمة مضافة'],
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:border-purple-400',
    },
    {
      id: 'seasonal',
      title: 'عرض موسمي',
      description: 'عرض لفترة محددة أو مناسبة خاصة',
      icon: <GiftIcon className="h-8 w-8 text-green-600" />,
      features: ['فترة محددة', 'مناسبة خاصة', 'عرض محدود', 'إقبال كبير'],
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:border-green-400',
    },
  ];

  return (
    <Layout title="إضافة عرض جديد - اختر نوع العرض" description="اختر نوع العرض المناسب لمعرضك">
      <Head>
        <title>إضافة عرض جديد - اختر نوع العرض</title>
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
            <h1 className="mb-3 text-3xl font-bold text-gray-900">إضافة عرض جديد</h1>
            <p className="text-lg text-gray-600">اختر نوع العرض المناسب لمعرضك</p>
            <div className="mt-3 text-sm text-gray-500">
              قم بإنشاء عروض جذابة لزيادة مبيعاتك وجذب المزيد من العملاء
            </div>
          </div>

          {/* Offer Types */}
          <div className="grid gap-6 md:grid-cols-3">
            {offerTypes.map((type) => (
              <div
                key={type.id}
                className={`cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
                  selectedType === type.id
                    ? `${type.borderColor.replace('border-', 'border-')} ${type.bgColor} shadow-lg`
                    : `border-gray-200 bg-white hover:shadow-md ${type.hoverColor}`
                }`}
                onClick={() => setSelectedType(type.id as 'discount' | 'special' | 'seasonal')}
              >
                <div className="mb-4 flex justify-center">{type.icon}</div>

                <h3 className="mb-2 text-center text-xl font-bold text-gray-900">{type.title}</h3>

                <p className="mb-4 text-center text-gray-600">{type.description}</p>

                <ul className="space-y-2">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircleIcon className={`h-4 w-4 text-${type.color}-600`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {selectedType === type.id && (
                  <div className="mt-4 flex justify-center">
                    <div
                      className={`rounded-full bg-${type.color}-600 px-3 py-1 text-xs font-medium text-white`}
                    >
                      محدد
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedType}
              className={`flex items-center gap-2 rounded-lg px-8 py-3 text-lg font-medium transition-all duration-200 ${
                selectedType
                  ? 'bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
            >
              <span>متابعة</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">يمكنك تعديل تفاصيل العرض في الخطوة التالية</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddOfferPage;
