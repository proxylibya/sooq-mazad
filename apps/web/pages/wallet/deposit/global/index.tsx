import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../../../components/common';

// Modern Payment Method Icons
const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.641.641 0 0 1-.633-.74L23.696.901C23.778.382 24.226 0 24.75 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
  </svg>
);

const WiseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const VisaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4.5 6h15c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5v-9C3 6.67 3.67 6 4.5 6zm0 2v8h15V8H4.5z" />
    <path d="M6 10h2v4H6zm3 0h2v4H9zm3 0h2v4h-2zm3 0h2v4h-2z" />
  </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="9" cy="12" r="6" opacity="0.7" />
    <circle cx="15" cy="12" r="6" opacity="0.7" />
  </svg>
);

const BankIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 3L2 8v2h20V8l-10-5zM4 18h16v2H4v-2zm0-4h3v3H4v-3zm5 0h3v3H9v-3zm5 0h3v3h-3v-3z" />
  </svg>
);

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  textColor: string;
  processingTime: string;
  fees: string;
  minAmount: string;
  maxAmount: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  isNew?: boolean;
  href: string;
  features: string[];
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'paypal',
    name: 'PayPal',
    nameAr: 'بايبال',
    description: 'الطريقة الأكثر أماناً وشيوعاً للدفع الدولي',
    icon: PayPalIcon,
    gradient: 'from-blue-500 to-blue-700',
    textColor: 'text-blue-600',
    processingTime: 'فوري - 5 دقائق',
    fees: '2.9% + $0.30',
    minAmount: '$10',
    maxAmount: '$10,000',
    isPopular: true,
    isRecommended: true,
    href: '/wallet/deposit/global/paypal',
    features: ['حماية المشتري', 'دعم 24/7', 'معالجة فورية'],
  },
  {
    id: 'wise',
    name: 'Wise',
    nameAr: 'وايز',
    description: 'تحويلات مصرفية دولية بأسعار الصرف الحقيقية',
    icon: WiseIcon,
    gradient: 'from-green-500 to-emerald-600',
    textColor: 'text-green-600',
    processingTime: '1-2 أيام عمل',
    fees: '0.5% - 1.5%',
    minAmount: '$20',
    maxAmount: '$50,000',
    isRecommended: true,
    href: '/wallet/deposit/global/wise',
    features: ['أسعار صرف حقيقية', 'رسوم منخفضة', 'تتبع مباشر'],
  },
  {
    id: 'visa',
    name: 'Visa',
    nameAr: 'فيزا',
    description: 'بطاقات فيزا الائتمانية والمدينة المقبولة عالمياً',
    icon: VisaIcon,
    gradient: 'from-blue-600 to-indigo-700',
    textColor: 'text-blue-700',
    processingTime: 'فوري',
    fees: '3.4% + $0.30',
    minAmount: '$5',
    maxAmount: '$5,000',
    isPopular: true,
    href: '/wallet/deposit/global/visa',
    features: ['معالجة فورية', 'مقبولة عالمياً', 'آمنة ومضمونة'],
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    nameAr: 'ماستركارد',
    description: 'بطاقات ماستركارد الائتمانية والمدينة',
    icon: MastercardIcon,
    gradient: 'from-red-500 to-orange-600',
    textColor: 'text-red-600',
    processingTime: 'فوري',
    fees: '3.4% + $0.30',
    minAmount: '$5',
    maxAmount: '$5,000',
    href: '/wallet/deposit/global/mastercard',
    features: ['معالجة فو��ية', 'حماية متقدمة', 'دعم عالمي'],
  },

  {
    id: 'bank',
    name: 'Bank Transfer',
    nameAr: 'التحويل المصرفي',
    description: 'تحويل مصرفي مباشر من حسابك البنكي',
    icon: BankIcon,
    gradient: 'from-gray-600 to-gray-800',
    textColor: 'text-gray-700',
    processingTime: '1-3 أيام عمل',
    fees: '$5 - $25',
    minAmount: '$100',
    maxAmount: '$100,000',
    href: '/wallet/deposit/global/bank',
    features: ['حدود عالية', 'آمن ومضمون', 'رسوم ثابتة'],
  },
];

export default function GlobalDepositPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'recommended' | 'popular' | 'new'
  >('all');

  const filteredMethods = paymentMethods.filter((method) => {
    if (selectedCategory === 'recommended') return method.isRecommended;
    if (selectedCategory === 'popular') return method.isPopular;
    if (selectedCategory === 'new') return method.isNew;
    return true;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Head>
        <title>وسائل الإيداع العالمية | سوق مزاد</title>
        <meta
          name="description"
          content="اختر من بين وسائل الإيداع العالمية المتنوعة والآمنة: PayPal، Wise، Visa، Mastercard، التحويل المصرفي"
        />
        <meta name="keywords" content="إيداع, محفظة, PayPal, Visa, Mastercard, تحويل مصرفي, Wise" />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Header Section - Compact */}
        <header className="mb-8">
          <nav aria-label="breadcrumbs" className="mb-4 text-sm text-gray-500">
            <Link href="/wallet" className="transition-colors hover:text-blue-600">
              المحفظة
            </Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="font-medium text-gray-900">وسائل الإيداع العالمية</span>
          </nav>

          <div className="mb-6 text-center">
            <h1 className="mb-3 text-3xl font-bold text-gray-900">وسائل الإيداع العالمية</h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              اختر الطريقة المناسبة لك لإيداع الأموال في محفظتك العالمية بأمان وسرعة
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/wallet"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              العودة للمحفظة
            </Link>
            <Link
              href="/wallet/transactions"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
            >
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              سجل المعاملات
            </Link>
          </div>
        </header>

        {/* Balance Display - Compact */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-md">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                      <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm7.176 9a7.5 7.5 0 0 0-14.352 0h14.352Zm-14.352 1.5a7.5 7.5 0 0 0 14.352 0H4.824Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="mb-1 text-sm text-blue-100">رصيد المحفظة العالمية</div>
                    <div className="flex items-baseline gap-2 text-2xl font-bold text-white">
                      <span dir="ltr">1,250.00</span>
                      <span className="text-lg">دولار</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-xs text-blue-200">آخر إيداع</div>
                  <div className="flex items-baseline gap-1.5 text-lg font-bold text-white">
                    <span dir="ltr">150.00</span>
                    <span className="text-sm">دولار</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs - Compact */}
        <section className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              جميع الوسائل ({paymentMethods.length})
            </button>
            <button
              onClick={() => setSelectedCategory('recommended')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'recommended'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              موصى بها ({paymentMethods.filter((m) => m.isRecommended).length})
            </button>
            <button
              onClick={() => setSelectedCategory('popular')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'popular'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              الأكثر شيوعاً ({paymentMethods.filter((m) => m.isPopular).length})
            </button>
            <button
              onClick={() => setSelectedCategory('new')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'new'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              جديد ({paymentMethods.filter((m) => m.isNew).length})
            </button>
          </div>
        </section>

        {/* Payment Methods Grid - Compact */}
        <section className="mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <Link
                  key={method.id}
                  href={method.href}
                  className="group relative block overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-md transition-all duration-200 hover:border-2 hover:border-blue-300"
                >
                  {/* Header with Icon and Badges */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg bg-gradient-to-br ${method.gradient} p-2.5 shadow-md`}
                      >
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{method.nameAr}</h3>
                        <p className="text-xs text-gray-500">{method.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {method.isRecommended && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                          موصى به
                        </span>
                      )}
                      {method.isPopular && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                          شائع
                        </span>
                      )}
                      {method.isNew && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                          جديد
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                    {method.description}
                  </p>

                  {/* Key Details - Compact */}
                  <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2.5">
                    <div className="text-center">
                      <div className="mb-0.5 text-xs text-gray-500">الرسوم</div>
                      <div className="text-sm font-bold text-gray-900">{method.fees}</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-0.5 text-xs text-gray-500">المعالجة</div>
                      <div className="text-sm font-bold text-gray-900">{method.processingTime}</div>
                    </div>
                  </div>

                  {/* Features - Compact */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {method.features.slice(0, 2).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          <svg
                            className="h-3 w-3 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button - Compact */}
                  <div className="w-full">
                    <span
                      className={`inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r ${method.gradient} px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 group-hover:shadow-md`}
                    >
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      بدء الإيداع
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Security & Trust Section - Compact */}
        <section className="mb-6">
          <div className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900">الأمان والثقة</h2>
              <p className="mx-auto max-w-xl text-sm text-gray-600">
                نحن نستخدم أحدث تقنيات التشفير والحماية لضمان أمان معاملاتك المالية
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 text-sm font-bold text-gray-900">تشفير SSL 256-bit</h3>
                <p className="text-xs text-gray-600">جميع البيانات محمية بأقوى تقنيات التشفير</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 text-sm font-bold text-gray-900">حماية من الاحتيال</h3>
                <p className="text-xs text-gray-600">نظام متقدم لكشف ومنع المعاملات المشبوهة</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 text-sm font-bold text-gray-900">دعم 24/7</h3>
                <p className="text-xs text-gray-600">فريق دعم متخصص متاح على مدار الساعة</p>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section - Compact */}
        <section className="mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-center text-xl font-bold text-gray-900">الأسئلة الشائعة</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">أوقات المعالجة</h3>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">
                  تختلف أوقات المعالجة حسب طريقة الدفع. المحافظ الرقمية والبطاقات الائتمانية عادة
                  فورية، بينما التحويلات المصرفية تستغرق 1-3 أيام عمل.
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">الرسوم والحدود</h3>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">
                  كل طريقة دفع لها رسوم وحدود مختلفة. الرسوم تتراوح من 0.5% إلى 3.4% حسب الطريقة.
                  تحقق من التفاصيل قبل اختيار الطريقة المناسبة لك.
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <svg
                      className="h-4 w-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">المساعدة والدعم</h3>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">
                  فريق الدعم متاح 24/7 لمساعدتك في أي استفسار. يمكنك التواصل معنا عبر الدردشة
                  المباشرة، البريد الإلكتروني، أو الهاتف.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
