import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import NavigationButtons from '../../components/add-listing/NavigationButtons';
import LoginModal from '../../components/auth/LoginModal';
import { Layout } from '../../components/common';
import useAuth from '../../hooks/useAuth';

const AddListingHome = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'auction' | 'instant' | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const ensureCallbackUrl = (target: string) => {
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('callbackUrl', target);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl, undefined, { shallow: true });
    } catch {
      // Fallback to history API if needed
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('callbackUrl', target);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  const handleContinue = () => {
    if (!selectedType) return;
    const target = `/add-listing/car-details?type=${selectedType}`;
    if (!user) {
      ensureCallbackUrl(target);
      setShowLoginModal(true);
      return;
    }
    router.push(target);
  };

  const listingTypes = [
    {
      id: 'auction',
      title: 'سوق المزاد',
      description: 'بيع سيارتك بأعلى سعر من خلال المزايدة',
      icon: <ClockIcon className="h-8 w-8 text-blue-600" />,
      features: ['مزايدة لمدة محددة', 'أعلى سعر مضمون', 'شفافية كاملة', 'رسوم أقل'],
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:border-blue-400',
    },
    {
      id: 'instant',
      title: 'سوق الفوري',
      description: 'بيع سيارتك فوراً بسعر ثابت',
      icon: <BoltIcon className="h-8 w-8 text-green-600" />,
      features: ['بيع فوري', 'سعر ثابت', 'تحكم كامل', 'سهولة الإدارة'],
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:border-green-400',
    },
  ];

  return (
    <Layout
      title="إضافة إعلان جديد - اختر نوع البيع"
      description="اختر طريقة بيع سيارتك - سوق المزاد أو السوق الفوري"
    >
      <Head>
        <title>إضافة إعلان جديد - اختر نوع البيع</title>
      </Head>

      <div className="min-h-screen select-none bg-gray-50 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">إضافة إعلان جديد</h1>
            <p className="text-base text-gray-600">اختر طريقة بيع سيارتك المناسبة لك</p>
            <div className="mt-3 text-sm text-gray-500">
              اضغط هنا لاختيار نوع البيع المناسب لسيارتك
            </div>
          </div>

          {/* Listing Type Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {listingTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => {
                  const chosen = type.id as 'auction' | 'instant';
                  setSelectedType(chosen);
                  const target = `/add-listing/car-details?type=${chosen}`;
                  if (!user) {
                    ensureCallbackUrl(target);
                    setShowLoginModal(true);
                    return;
                  }
                }}
                className={`group relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-[1.02] ${
                  selectedType === type.id
                    ? `${type.borderColor.replace('200', '500')} ${type.bgColor} shadow-lg`
                    : `${type.borderColor} bg-white ${type.hoverColor} hover:shadow-md`
                } `}
              >
                {/* Selection Indicator */}
                {selectedType === type.id && (
                  <div className="absolute left-3 top-3">
                    <CheckCircleIcon className={`h-5 w-5 text-${type.color}-600`} />
                  </div>
                )}

                {/* Icon */}
                <div className="mb-3 flex justify-center">
                  <div className={`rounded-full p-2 ${type.bgColor}`}>
                    {React.cloneElement(type.icon, {
                      className: `h-6 w-6 text-${type.color}-600`,
                    })}
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-center text-lg font-bold text-gray-900">{type.title}</h3>

                {/* Description */}
                <p className="mb-3 text-center text-xs text-gray-600">{type.description}</p>

                {/* Features */}
                <ul className="space-y-1.5">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-xs text-gray-700">
                      <CheckCircleIcon
                        className={`h-3 w-3 text-${type.color}-600 ml-1.5 flex-shrink-0`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover hint */}
                <div className="mt-3 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="text-xs text-gray-500">اضغط للاختيار</span>
                </div>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">يمكنك تغيير نوع البيع لاحقاً من إعدادات الإعلان</p>
            {!selectedType && (
              <p className="mt-2 text-xs text-orange-600">اختر نوع البيع أولاً للمتابعة</p>
            )}
          </div>

          {/* مساحة للأزرار الثابتة */}
          <div className="h-24" />
        </div>
      </div>

      {/* أزرار التنقل الثابتة */}
      <NavigationButtons onNext={handleContinue} canContinue={!!selectedType} showBack={false} />

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Layout>
  );
};

export default AddListingHome;
