import { useRouter } from 'next/router';
import React, { useState } from 'react';
// // import { useSession } from 'next-auth/react'; // تم تعطيل نظام المصادقة مؤقتاً
import ArrowTrendingUpIcon from '@heroicons/react/24/outline/ArrowTrendingUpIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import OptimizedImage from '../../components/OptimizedImage';
import PaymentMethodCard from '../../components/PaymentMethodCard';
import { BackButton, Layout } from '../../components/common';
import { LoadingButton } from '../../components/ui/LoadingButton';
import { Toaster } from '../../components/ui/toaster';
import { getLocalPaymentMethods } from '../../data/payment-methods';
import { toast } from '../../hooks/use-toast';

interface PromotionPackage {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  duration: number;
  features: string[];
  boost: string;
  color: string;
  icon: React.ReactNode;
  popular?: boolean;
  savings?: string;
}

const PromoteListingPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const listingId = Array.isArray(id) ? id[0] : id || '';

  const [selectedPackage, setSelectedPackage] = useState<string>('premium');
  const [selectedPayment, setSelectedPayment] = useState<string>('libyana');
  const [isLoading, setIsLoading] = useState(false);

  // تم حذف البيانات التجريبية للإعلان
  const listingData: {
    id: string;
    title: string;
    price: number;
    image: string | null;
    views: number;
    favorites: number;
    location: string;
  } = {
    id: listingId,
    title: 'غير محدد',
    price: 0,
    image: null,
    views: 0,
    favorites: 0,
    location: 'غير محدد',
  };

  // تنسيق الأرقام إلى أرقام غربية (123)
  const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);

  // حزم الترويج المتاحة
  const promotionPackages: PromotionPackage[] = [
    {
      id: 'basic',
      name: 'Basic Boost',
      nameAr: 'ترويج 3 أيام',
      price: 15,
      duration: 3,
      boost: 'مشاهدات أكثر',
      color: 'from-blue-500 to-blue-600',
      icon: <EyeIcon className="h-6 w-6" />,
      features: ['ظهور في أعلى النتائج', 'مشاهدات أكثر', 'مدة 3 أيام'],
    },
    {
      id: 'premium',
      name: 'Premium Boost',
      nameAr: 'ترويج أسبوع',
      price: 35,
      duration: 7,
      boost: 'الأكثر شعبية',
      color: 'from-green-500 to-green-600',
      icon: <StarIcon className="h-6 w-6" />,
      popular: true,
      features: [
        'ظهور في أعلى النتائج',
        'ظهور في الصفحة الرئيسية',
        'مشاهدات أكثر بكثير',
        'مدة أسبوع كامل',
      ],
    },
    {
      id: 'ultimate',
      name: 'Ultimate Boost',
      nameAr: 'ترويج أسبوعين',
      price: 65,
      duration: 14,
      boost: 'الأفضل للبيع السريع',
      color: 'from-orange-500 to-red-600',
      icon: <TrophyIcon className="h-6 w-6" />,
      features: [
        'ظهور في أعلى النتائج',
        'ظهور في جميع الصفحات',
        'أكبر عدد مشاهدات',
        'مدة أسبوعين كاملين',
        'ضمان النتائج',
      ],
    },
  ];

  // وسائل الدفع المتاحة مع الألوان الرسمية
  const paymentMethods = getLocalPaymentMethods();

  const selectedPackageData = promotionPackages.find((pkg) => pkg.id === selectedPackage);
  const selectedPaymentData = paymentMethods.find((method) => method.id === selectedPayment);

  // مصدر الصورة مع بديل آمن
  const imageSrc = listingData.image ?? '/images/placeholder-car.jpg';

  const handlePromote = async () => {
    if (!selectedPackageData || !selectedPaymentData) return;

    setIsLoading(true);

    try {
      // إذا كان الدفع من المحفظة
      if (selectedPayment === 'wallet') {
        // الخصم من المحفظة
        const walletResponse = await fetch('/api/wallet/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: selectedPackageData.price,
            description: `ترويج إعلان - ${selectedPackageData.nameAr}`,
            listingId: listingId,
            packageId: selectedPackageData.id,
          }),
        });

        if (!walletResponse.ok) {
          const error = await walletResponse.json();
          throw new Error(error.message || 'رصيد المحفظة غير كافٍ');
        }
      } else {
        // معالجة وسائل الدفع الأخرى (ليبيانا، مدار)
        const paymentResponse = await fetch('/api/payments/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: selectedPackageData.price,
            paymentMethod: selectedPayment,
            listingId: listingId,
            packageId: selectedPackageData.id,
            type: 'promotion',
          }),
        });

        if (!paymentResponse.ok) {
          const error = await paymentResponse.json();
          throw new Error(error.message || 'فشل في معالجة الدفع');
        }
      }

      // تحديث حالة الإعلان في قاعدة البيانات (تعليم كـ featured)
      // دعم كل من المزادات والسوق الفوري
      const isAuction = listingId.startsWith('auction_') || listingId.startsWith('auc_');
      const updateEndpoint = isAuction
        ? `/api/auctions/${listingId}`
        : `/api/listings/${listingId}`;

      await fetch(updateEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featured: true,
          featuredUntil: new Date(Date.now() + selectedPackageData.duration * 24 * 60 * 60 * 1000),
        }),
      });

      // إظهار إشعار نجاح
      toast({
        title: 'تم الترويج بنجاح',
        description: `سيظهر إعلانك كمميز لمدة ${selectedPackageData.duration} أيام.`,
        variant: 'success',
      });

      // التوجيه لصفحة الإعلان
      const targetPath = isAuction ? `/auction/${listingId}` : `/marketplace/${listingId}`;
      router.push(`${targetPath}?promoted=true&package=${selectedPackage}`);
    } catch (error: any) {
      console.error('خطأ في عملية الترويج:', error);
      toast({
        title: 'فشل الترويج',
        description: error.message || 'حدث خطأ أثناء عملية الدفع. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      title={`ترويج الإعلان - ${listingData.title}`}
      description="عزز إعلانك واحصل على مشاهدات أكثر ومبيعات أسرع"
    >
      <Toaster />
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <BackButton
              onClick={() => router.back()}
              text="العودة"
              variant="gray"
              size="sm"
              className="mb-4"
            />

            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">ترويج الإعلان</h1>
              <p className="text-gray-600">اختر حزمة الترويج المناسبة لك</p>
            </div>
          </div>

          {/* فوائد الترويج */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">نمو أسرع</div>
                <div className="text-xs text-gray-600">ظهور أعلى في نتائج البحث</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow">
              <SparklesIcon className="h-6 w-6 text-amber-600" />
              <div>
                <div className="font-semibold text-gray-900">جاذبية أعلى</div>
                <div className="text-xs text-gray-600">شارات وتمييز بصري لافت</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow">
              <BoltIcon className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">تفاعل فوري</div>
                <div className="text-xs text-gray-600">مشاهدات ونقرات أكثر</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">نتائج قابلة للقياس</div>
                <div className="text-xs text-gray-600">تحسّن واضح في الأداء</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* معلومات الإعلان */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-bold text-gray-900">إعلانك</h3>

                <div className="space-y-4">
                  <div className="aspect-video overflow-hidden rounded-lg bg-gray-200">
                    <OptimizedImage
                      src={imageSrc}
                      alt={listingData.title}
                      width={1280}
                      height={720}
                      className="h-full w-full"
                      objectFit="cover"
                    />
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">{listingData.title}</h4>
                    <p className="mb-2 text-2xl font-bold text-blue-600">
                      {formatNumber(listingData.price)} د.ل
                    </p>
                    <p className="mb-4 text-sm text-gray-600">{listingData.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center">
                        <EyeIcon className="ml-1 h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">المشاهدات</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(listingData.views)}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 flex items-center justify-center">
                      <StarIcon className="ml-1 h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">المفضلة</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatNumber(listingData.favorites)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* حزم الترويج */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">اختر حزمة الترويج</h2>

                <div className="space-y-4" role="radiogroup" aria-label="حزم الترويج">
                  {promotionPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPackage(pkg.id);
                        }
                      }}
                      role="radio"
                      aria-checked={selectedPackage === pkg.id}
                      tabIndex={0}
                      className={`relative cursor-pointer rounded-lg border-2 bg-white p-4 shadow-md transition-all duration-200 ${
                        selectedPackage === pkg.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`bg-gradient-to-r ${pkg.color} ml-4 rounded-lg p-3`}>
                            {pkg.icon}
                            <div className="mt-1 text-center text-white">
                              <div className="text-lg font-bold">{formatNumber(pkg.price)} د.ل</div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{pkg.nameAr}</h3>
                            <p className="text-sm text-gray-600">{pkg.boost}</p>
                            <div className="mt-1 flex items-center">
                              <ClockIcon className="ml-1 h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-500">
                                {formatNumber(pkg.duration)} أيام
                              </span>
                            </div>
                          </div>
                        </div>

                        {pkg.popular && (
                          <div className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                            الأكثر شعبية
                          </div>
                        )}

                        <div
                          className={`h-5 w-5 rounded-full border-2 ${
                            selectedPackage === pkg.id
                              ? 'border-blue-500 bg-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedPackage === pkg.id && (
                            <CheckCircleIcon className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>

                      <div className="mr-20 mt-3">
                        <ul className="space-y-1">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircleIcon className="ml-2 h-3 w-3 flex-shrink-0 text-green-500" />
                              <span className="text-xs text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* وسائل الدفع */}
              <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
                <h3 className="mb-4 text-lg font-bold text-gray-900">اختر وسيلة الدفع</h3>

                <div className="space-y-3" role="radiogroup" aria-label="وسائل الدفع">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      role="radio"
                      aria-checked={selectedPayment === method.id}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPayment(method.id);
                        }
                      }}
                    >
                      <PaymentMethodCard
                        method={method}
                        isSelected={selectedPayment === method.id}
                        onSelect={setSelectedPayment}
                        variant="detailed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ملخص الطلب */}
              <div className="rounded-lg bg-white p-4 shadow-md">
                <h3 className="mb-4 text-lg font-bold text-gray-900">ملخص الطلب</h3>

                {selectedPackageData && (
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">الحزمة</span>
                      <span className="font-semibold">{selectedPackageData.nameAr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">وسيلة الدفع</span>
                      <span className="font-semibold">{selectedPaymentData?.nameAr}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-xl">
                        <span className="font-bold text-gray-900">المجموع</span>
                        <span className="font-bold text-blue-600">
                          {formatNumber(selectedPackageData.price)} د.ل
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <LoadingButton
                  onClick={handlePromote}
                  isLoading={isLoading}
                  loadingText="جاري الدفع..."
                  className="w-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
                >
                  تأكيد الترويج والدفع
                </LoadingButton>

                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">سيتم تفعيل الترويج خلال 5 دقائق من الدفع</p>
                </div>
              </div>

              {/* مساعدة بسيطة */}
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <div className="text-center">
                  <h3 className="mb-2 text-base font-bold text-gray-900">تحتاج مساعدة؟</h3>
                  <p className="mb-3 text-sm text-gray-600">تواصل معنا عبر نظام المراسلة الداخلي</p>
                  <button className="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
                    <DevicePhoneMobileIcon className="ml-2 h-4 w-4" />
                    إرسال رسالة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PromoteListingPage;
