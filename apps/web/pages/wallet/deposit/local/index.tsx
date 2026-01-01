import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../../../../components/common';
import BankLogo from '../../../../components/BankLogo';
import { libyanBanks, getBanksByPopularity } from '../../../../data/libyan-banks';

// Currency formatter
const formatAmount = (amount: number, _currency: 'LYD' = 'LYD') => {
  const symbol = 'د.ل';
  return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

// Icon components
const BankIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2 3 7v2h18V7l-9-5Zm-7 9h2v8H5v-8Zm4 0h2v8H9v-8Zm4 0h2v8h-2v-8Zm4 0h2v8h-2v-8ZM3 21h18v1H3v-1Z" />
  </svg>
);

const CardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2 6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75v10.5A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75ZM4 9h16V7H4v2Zm0 2v6.25c0 .414.336.75.75.75h14.5a.75.75 0 0 0 .75-.75V11H4Z" />
  </svg>
);

const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2.75 8A2.75 2.75 0 0 1 5.5 5.25h13a2.75 2.75 0 0 1 2.75 2.75v8A2.75 2.75 0 0 1 18.5 18.75h-13A2.75 2.75 0 0 1 2.75 16V8Zm2.75-.75A.75.75 0 0 0 4.75 8v8c0 .414.336.75.75.75h13a.75.75 0 0 0 .75-.75v-1.25H16a2.75 2.75 0 0 1 0-5.5h3.25V8a.75.75 0 0 0-.75-.75h-13ZM16 12.75h4a1.25 1.25 0 1 1 0 2.5h-4a1.25 1.25 0 1 1 0-2.5Z" />
  </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
      clipRule="evenodd"
    />
  </svg>
);

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path
      fillRule="evenodd"
      d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.814 3.720 10.764 9.155 12.559a.75.75 0 0 0 1.19 0C18.030 20.514 21.75 15.564 21.75 9.75a12.74 12.74 0 0 0-.635-3.985.75.75 0 0 0-.722-.515 11.209 11.209 0 0 1-7.877-3.08ZM15.75 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-.75-2.25a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-.75-.75Z"
      clipRule="evenodd"
    />
  </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path
      fillRule="evenodd"
      d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
      clipRule="evenodd"
    />
  </svg>
);

export default function LocalDepositPage() {
  const [localBalance] = useState<number>(1250.75);
  const [query, setQuery] = useState('');

  // Get banks data
  const banks = useMemo(() => {
    const base = getBanksByPopularity();
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (b) =>
        b.nameAr.toLowerCase().includes(q) ||
        b.nameEn.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q),
    );
  }, [query]);

  // Card deposit methods
  const cardMethods = [
    {
      id: 'libyana-cards',
      title: 'شحن كروت ليبيانا',
      description: 'استخدم بطاقة تعبئة ليبيانا لإضافة رصيد فوري',
      icon: CardIcon,
      href: '/wallet/deposit/local/libyana',
      badge: 'كروت',
      badgeColor: 'bg-purple-100 text-purple-800',
      borderColor: 'hover:border-purple-500',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      processingTime: 'فوري',
      fees: '0%',
    },
    {
      id: 'madar-cards',
      title: 'شحن كروت المدار',
      description: 'استخدم بطاقة تعبئة المدار لإضافة رصيد فوري',
      icon: CardIcon,
      href: '/wallet/deposit/local/madar',
      badge: 'كروت',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      borderColor: 'hover:border-emerald-500',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      processingTime: 'فوري',
      fees: '0%',
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>المحفظة المحلية - وسائل الإيداع | سوق مزاد</title>
        <meta
          name="description"
          content="اختر من بين وسائل الإيداع المحلية المتنوعة: شحن كروت ليبيانا، شحن كروت المدار، أو الإيداع عبر البنوك الليبية"
        />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <nav aria-label="breadcrumbs" className="text-xs text-gray-500">
                <Link href="/wallet" className="hover:text-gray-700">
                  المحفظة
                </Link>
                <span className="mx-2">/</span>
                <span>الإيداع المحلي</span>
              </nav>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
                المحفظة المحلية
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                اختر وسيلة الإيداع المناسبة لك من الخيارات المحلية المتاحة
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                العودة للمحفظة
              </Link>
              <Link
                href="/wallet/transactions"
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                سجل المعاملات
              </Link>
            </div>
          </div>
        </header>

        {/* Current Balance Card */}
        <section className="mb-10">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <WalletIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">رصيدك الحالي</h2>
                  <p className="text-sm text-gray-600">المحفظة المحلية - الدينار الليبي</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-gray-900">
                  {formatAmount(localBalance)}
                </div>
                <p className="text-sm text-gray-600">LYD</p>
              </div>
            </div>
          </div>
        </section>

        {/* Card Deposit Methods */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">شحن الكروت</h2>
            <p className="text-gray-600">استخدم كروت التعبئة للإيداع الفوري</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {cardMethods.map((method) => (
              <Link
                key={method.id}
                href={method.href}
                className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-2 hover:border-blue-300"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-full bg-gray-50 p-3 transition-colors group-hover:bg-gray-100">
                    <method.icon className="h-8 w-8 text-gray-700" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${method.badgeColor}`}
                  >
                    {method.badge}
                  </span>
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900">{method.title}</h3>
                <p className="mb-4 text-sm text-gray-600">{method.description}</p>

                {/* Details */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>وقت المعالجة</span>
                    </div>
                    <span className="font-medium text-gray-900">{method.processingTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span>الرسوم</span>
                    </div>
                    <span className="font-medium text-gray-900">{method.fees}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div
                  className={`rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition-colors ${method.buttonColor}`}
                >
                  ابدأ الشحن الآن
                </div>

                {/* Hover Effect */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>

        {/* Bank Deposit Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">الإيداع عبر البنوك الليبية</h2>
            <p className="text-gray-600">اختر البنك المناسب لك من البنوك المعتمدة</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن بنك بالاسم أو الكود..."
                className="block w-full rounded-xl border border-gray-300 py-3 pl-3 pr-12 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Banks Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {banks.map((bank) => {
              return (
                <div
                  key={bank.id}
                  className="group relative min-h-[200px] rounded-2xl border-2 border-gray-200 bg-white p-4 text-center transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex h-full flex-col items-center justify-between gap-2">
                    {/* Bank Logo and Info - Non-clickable */}
                    <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
                      {/* Bank Logo */}
                      <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <BankLogo bankName={bank.nameAr} size="medium" />
                      </div>

                      {/* Bank Name */}
                      <div className="text-center">
                        <div className="mb-1 text-xs font-extrabold leading-tight text-gray-900">
                          {bank.nameAr}
                        </div>
                        <div className="font-mono text-[10px] font-semibold text-gray-600">
                          {bank.code}
                        </div>
                      </div>
                    </div>

                    {/* Deposit Button - Only clickable element */}
                    <div className="w-full">
                      <Link
                        href={`/wallet/deposit/local/banks?bank=${bank.id}`}
                        className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-1.5 text-center text-[10px] font-bold text-white shadow-sm transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-95"
                      >
                        إيداع
                      </Link>
                    </div>
                  </div>

                  {/* Bank Type Badge */}
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm ${
                      bank.type === 'government'
                        ? 'bg-blue-100 text-blue-800'
                        : bank.type === 'islamic'
                          ? 'bg-green-100 text-green-800'
                          : bank.type === 'commercial'
                            ? 'bg-gray-100 text-gray-800'
                            : bank.type === 'investment'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {bank.type === 'government'
                      ? 'حكومي'
                      : bank.type === 'islamic'
                        ? 'إسلامي'
                        : bank.type === 'commercial'
                          ? 'تجاري'
                          : bank.type === 'investment'
                            ? 'استثماري'
                            : 'تنموي'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* No Banks Found */}
          {banks.length === 0 && (
            <div className="py-12 text-center">
              <BankIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">لم يتم العثور على بنوك</h3>
              <p className="text-gray-600">جرب البحث بكلمات مختلفة أو امسح مربع البحث</p>
            </div>
          )}
        </section>

        {/* Help Section */}
        <section className="mb-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">تحتاج مساعدة؟</h3>
              <p className="mb-4 text-gray-600">
                فريق الدعم متاح لمساعدتك في اختيار وسيلة الإيداع المناسبة أو حل أي مشكلة قد تواجهها
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  تواصل مع الدعم
                </Link>
                <Link
                  href="/help/deposits"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  دليل الإيداع
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Security Notice */}
        <section className="mb-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <div>
                <h4 className="mb-1 text-sm font-semibold text-amber-800">ملاحظة أمنية مهمة</h4>
                <p className="text-sm text-amber-700">
                  تأكد من استخدام الروابط الرسمية فقط ولا تشارك بيانات بطاقاتك مع أي شخص. جميع
                  المعاملات محمية بأعلى معايير الأمان.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
