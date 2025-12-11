/**
 * صفحة ترويج خدمات النقل - تصميم مطابق لصفحة الترويج الموحدة
 * Transport Services Promotion Payment Page
 */

import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Layout } from '../../components/common';
import { LoadingButton } from '../../components/ui/LoadingButton';
import { Toaster } from '../../components/ui/toaster';
import { toast } from '../../hooks/use-toast';

interface WalletBalance {
  local: number;
  global: number;
  crypto: number;
}

type PromotionPackage = 'basic' | 'premium' | 'vip';

// باقات الترويج
const PACKAGES = [
  {
    id: 'basic' as const,
    name: 'الباقة الأساسية',
    price: 50,
    days: 7,
    viewsMultiplier: 3,
    features: ['ظهور في الصفحة الرئيسية', 'شارة مميز', 'أولوية في البحث'],
  },
  {
    id: 'premium' as const,
    name: 'الباقة المتقدمة',
    price: 100,
    days: 14,
    viewsMultiplier: 5,
    popular: true,
    features: [
      'كل مميزات الأساسية',
      'ظهور في أعلى النتائج',
      'إشعارات للمهتمين',
      'تقارير المشاهدات',
    ],
  },
  {
    id: 'vip' as const,
    name: 'باقة VIP',
    price: 200,
    days: 30,
    viewsMultiplier: 10,
    features: ['كل مميزات المتقدمة', 'ظهور دائم في المقدمة', 'دعم فني مخصص', 'ترويج على السوشيال'],
  },
];

export default function TransportPaymentPage() {
  const router = useRouter();
  const { serviceId, package: initialPackage, amount } = router.query;

  const [selectedPackage, setSelectedPackage] = useState<PromotionPackage>('premium');
  const [selectedPayment, setSelectedPayment] = useState<'wallet' | 'libyana' | 'madar'>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    local: 0,
    global: 0,
    crypto: 0,
  });
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // جلب رصيد المحفظة
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/wallet/balance');
        if (response.ok) {
          const data = await response.json();
          setWalletBalance({
            local: data.totalBalance?.local || 0,
            global: data.totalBalance?.global || 0,
            crypto: data.totalBalance?.crypto || 0,
          });
        }
      } catch (error) {
        console.error('خطأ في جلب رصيد المحفظة:', error);
      } finally {
        setIsLoadingBalance(false);
      }
    };
    fetchBalance();
  }, []);

  // تحديد الباقة المبدئية
  useEffect(() => {
    if (initialPackage && ['basic', 'premium', 'vip'].includes(initialPackage as string)) {
      setSelectedPackage(initialPackage as PromotionPackage);
    }
  }, [initialPackage]);

  const selectedPackageData = PACKAGES.find((p) => p.id === selectedPackage);
  const canPayWithWallet = selectedPackageData && walletBalance.local >= selectedPackageData.price;

  // معالجة الترويج
  const handlePromote = async () => {
    if (!selectedPackageData || !serviceId) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'transport',
          entityId: serviceId,
          packageType: selectedPackage,
          paymentMethod: selectedPayment,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'INSUFFICIENT_BALANCE') {
          toast({
            title: 'رصيد غير كافٍ',
            description: `تحتاج ${result.required} د.ل ولديك ${result.available} د.ل فقط`,
            variant: 'destructive',
          });
          return;
        }
        throw new Error(result.error || 'فشل في الترويج');
      }

      toast({
        title: 'تم الترويج بنجاح!',
        description: `ستظهر خدمتك كمميزة لمدة ${selectedPackageData.days} يوم`,
        variant: 'success',
      });

      // التوجيه للوحة التحكم
      setTimeout(() => router.push('/transport/dashboard'), 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'حدث خطأ، يرجى المحاولة مرة أخرى';
      toast({
        title: 'فشل الترويج',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageIcon = (pkgId: string, size = 'h-5 w-5') => {
    switch (pkgId) {
      case 'vip':
        return <TrophyIcon className={size} />;
      case 'premium':
        return <SparklesIcon className={size} />;
      default:
        return <StarIcon className={size} />;
    }
  };

  // دالة التخطي والذهاب للوحة التحكم
  const handleSkip = () => {
    router.push('/transport/dashboard');
  };

  return (
    <Layout title="ترويج خدمة النقل" description="اجعل خدمتك مميزة واحصل على عملاء أكثر">
      <Toaster />
      <Head>
        <title>ترويج خدمة النقل | سوق مزاد</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        {/* Header مضغوط */}
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              {/* العودة */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30"
              >
                <svg
                  className="h-4 w-4 rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                رجوع
              </button>

              {/* الرصيد */}
              <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500">
                  <WalletIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-gray-900">
                  {isLoadingBalance ? '...' : walletBalance.local.toLocaleString('en-US')}
                </span>
                <span className="text-xs font-semibold text-blue-600">د.ل</span>
                <button
                  onClick={() => router.push('/wallet/topup')}
                  className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-green-600"
                >
                  + شحن
                </button>
              </div>
            </div>

            {/* العنوان */}
            <div className="mt-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">روّج خدمة النقل</h1>
              <p className="text-sm text-white/80">عملاء أكثر بـ 5 مرات</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-4">
          {/* رسالة النجاح بارزة */}
          {initialPackage && initialPackage !== 'free' && (
            <div className="mx-auto mb-6 max-w-lg">
              <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-green-200">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-green-800">تم إنشاء الخدمة بنجاح!</h3>
                  <p className="mt-2 text-base text-green-700">أكمل الدفع لتفعيل باقة الترويج</p>
                </div>
              </div>
            </div>
          )}

          {/* باقات الترويج - تصميم مضغوط */}
          <div className="mb-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
              <TrophyIcon className="h-5 w-5 text-amber-500" />
              اختر الباقة
            </h2>

            {/* الباقات في صف واحد */}
            <div className="grid grid-cols-4 gap-2">
              {/* مجاني */}
              <button
                onClick={handleSkip}
                className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center transition-all hover:border-gray-400 hover:bg-gray-100"
              >
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-400 text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-600">بدون ترويج</p>
                <p className="mt-1 text-lg font-black text-gray-700">
                  0 <span className="text-xs">د.ل</span>
                </p>
                <p className="mt-1 text-[10px] text-gray-500">نشر عادي</p>
              </button>

              {/* الباقات المدفوعة */}
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                const colors = {
                  basic: {
                    bg: 'bg-blue-500',
                    border: 'border-blue-500',
                    ring: 'ring-blue-200',
                    light: 'bg-blue-50',
                  },
                  premium: {
                    bg: 'bg-green-500',
                    border: 'border-green-500',
                    ring: 'ring-green-200',
                    light: 'bg-green-50',
                  },
                  vip: {
                    bg: 'bg-amber-500',
                    border: 'border-amber-500',
                    ring: 'ring-amber-200',
                    light: 'bg-amber-50',
                  },
                };
                const c = colors[pkg.id];

                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative rounded-xl border-2 p-3 text-center transition-all ${
                      isSelected
                        ? `${c.border} ${c.light} ring-2 ${c.ring}`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-[9px] font-bold text-white">
                        الأفضل
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg ${c.bg} text-white`}
                    >
                      {getPackageIcon(pkg.id, 'h-4 w-4')}
                    </div>
                    <p className="text-xs font-medium text-gray-700">{pkg.name}</p>
                    <p className="mt-1 text-lg font-black text-gray-900">
                      {pkg.price} <span className="text-xs">د.ل</span>
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {pkg.days} يوم | x{pkg.viewsMultiplier}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* ميزات الباقة المختارة */}
            {selectedPackageData && (
              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex flex-wrap gap-2">
                  {selectedPackageData.features.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* طرق الدفع - مضغوطة */}
          <div className="mb-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
              <CreditCardIcon className="h-5 w-5 text-blue-500" />
              طريقة الدفع
            </h2>

            <div className="flex gap-2">
              {/* المحفظة */}
              <button
                onClick={() => canPayWithWallet && setSelectedPayment('wallet')}
                disabled={!canPayWithWallet}
                className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                  selectedPayment === 'wallet'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : canPayWithWallet
                      ? 'border-gray-200 bg-white hover:border-blue-300'
                      : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${selectedPayment === 'wallet' ? 'bg-blue-500' : 'bg-blue-100'}`}
                >
                  <WalletIcon
                    className={`h-5 w-5 ${selectedPayment === 'wallet' ? 'text-white' : 'text-blue-600'}`}
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">المحفظة</p>
                  <p className="text-xs text-gray-500">
                    {canPayWithWallet ? `${walletBalance.local} د.ل` : 'غير كافٍ'}
                  </p>
                </div>
              </button>

              {/* ليبيانا */}
              <button
                onClick={() => setSelectedPayment('libyana')}
                className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                  selectedPayment === 'libyana'
                    ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                    : 'border-gray-200 bg-white hover:border-red-300'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${selectedPayment === 'libyana' ? 'bg-red-500' : 'bg-red-100'}`}
                >
                  <CreditCardIcon
                    className={`h-5 w-5 ${selectedPayment === 'libyana' ? 'text-white' : 'text-red-600'}`}
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">ليبيانا</p>
                  <p className="text-xs text-gray-500">كرت شحن</p>
                </div>
              </button>

              {/* مدار */}
              <button
                onClick={() => setSelectedPayment('madar')}
                className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                  selectedPayment === 'madar'
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${selectedPayment === 'madar' ? 'bg-orange-500' : 'bg-orange-100'}`}
                >
                  <CreditCardIcon
                    className={`h-5 w-5 ${selectedPayment === 'madar' ? 'text-white' : 'text-orange-600'}`}
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">مدار</p>
                  <p className="text-xs text-gray-500">كرت شحن</p>
                </div>
              </button>
            </div>

            {/* تحذير الرصيد - مضغوط */}
            {!canPayWithWallet && selectedPayment === 'wallet' && selectedPackageData && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-amber-50 p-2 text-sm">
                <span className="text-amber-800">
                  ينقصك{' '}
                  <strong>
                    {(selectedPackageData.price - walletBalance.local).toFixed(0)} د.ل
                  </strong>
                </span>
                <button
                  onClick={() => router.push('/wallet/topup')}
                  className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white hover:bg-amber-600"
                >
                  شحن الآن
                </button>
              </div>
            )}
          </div>
        </div>

        {/* شريط الأزرار الثابت في الأسفل - مضغوط */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* ملخص السعر */}
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-gray-900">
                    {selectedPackageData?.price || 0}
                  </span>
                  <span className="text-sm text-gray-500">د.ل</span>
                </div>
                <p className="text-xs text-gray-500">
                  {selectedPackageData?.name} - {selectedPackageData?.days} يوم
                </p>
              </div>

              {/* أزرار العمل */}
              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  تخطي
                </button>
                <LoadingButton
                  onClick={handlePromote}
                  isLoading={isLoading}
                  disabled={selectedPayment === 'wallet' && !canPayWithWallet}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      جاري...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      ادفع وروّج
                    </>
                  )}
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
