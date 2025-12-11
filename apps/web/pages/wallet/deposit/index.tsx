/**
 * صفحة الإيداع الرئيسية - اختيار طريقة الإيداع
 * Main Deposit Page - Choose deposit method
 */
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { OpensooqNavbar } from '../../../components/common';

const BankIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2 3 7v2h18V7l-9-5Zm-7 9h2v8H5v-8Zm4 0h2v8H9v-8Zm4 0h2v8h-2v-8Zm4 0h2v8h-2v-8ZM3 21h18v1H3v-1Z" />
  </svg>
);

const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm7.176 9a7.5 7.5 0 0 0-14.352 0h14.352Zm-14.352 1.5a7.5 7.5 0 0 0 14.352 0H4.824Z" />
  </svg>
);

const CryptoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.25 3 7.5v9l9 5.25 9-5.25v-9L12 2.25Zm0 2.309L19.5 9v6L12 19.441 4.5 15V9L12 4.559Z" />
  </svg>
);

const depositMethods = [
  {
    id: 'local',
    title: 'إيداع محلي',
    description: 'البنوك الليبية، كروت ليبيانا ومدار',
    icon: BankIcon,
    href: '/wallet/deposit/local',
    color: 'from-emerald-500 to-teal-600',
    badge: 'LYD',
    features: ['تحويل بنكي', 'كروت شحن', 'فوري'],
  },
  {
    id: 'global',
    title: 'إيداع عالمي',
    description: 'PayPal, Payoneer, Wise, Payeer',
    icon: GlobeIcon,
    href: '/wallet/deposit/global',
    color: 'from-sky-500 to-blue-600',
    badge: 'USD',
    features: ['بايبال', 'بايونير', 'وايز'],
  },
  {
    id: 'digital',
    title: 'إيداع رقمي',
    description: 'USDT على شبكة TRC20',
    icon: CryptoIcon,
    href: '/wallet/deposit/digital/usdt-trc20',
    color: 'from-indigo-500 to-violet-600',
    badge: 'USDT',
    features: ['عنوان مخصص', 'تلقائي', 'سريع'],
  },
];

export default function DepositIndexPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>إيداع رصيد | سوق مزاد</title>
      </Head>
      <OpensooqNavbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/wallet" className="hover:text-blue-600">
            المحفظة
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">إيداع</span>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">إيداع رصيد</h1>
          <p className="mt-2 text-gray-600">اختر طريقة الإيداع المناسبة لك</p>
        </div>

        {/* Deposit Methods */}
        <div className="grid gap-6 md:grid-cols-3">
          {depositMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Link
                key={method.id}
                href={method.href}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
              >
                {/* Badge */}
                <span className="absolute left-4 top-4 rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                  {method.badge}
                </span>

                {/* Icon */}
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${method.color} shadow-lg transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-bold text-gray-900">{method.title}</h3>
                <p className="mb-4 text-sm text-gray-600">{method.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {method.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="absolute bottom-4 left-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg
                    className="h-6 w-6 rotate-180 text-gray-400"
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
                </div>
              </Link>
            );
          })}
        </div>

        {/* Help */}
        <div className="mt-8 rounded-xl bg-blue-50 p-6 text-center">
          <h3 className="mb-2 font-semibold text-blue-800">تحتاج مساعدة؟</h3>
          <p className="text-sm text-blue-700">
            تواصل معنا عبر الدعم الفني لأي استفسار حول طرق الإيداع
          </p>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/wallet" className="text-sm text-gray-500 hover:text-blue-600">
            ← العودة للمحفظة
          </Link>
        </div>
      </main>
    </div>
  );
}
