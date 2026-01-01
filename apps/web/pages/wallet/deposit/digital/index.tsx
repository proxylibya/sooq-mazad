/**
 * صفحة اختيار شبكة الإيداع الرقمي
 * Digital Deposit Network Selection Page
 */
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { OpensooqNavbar } from '../../../../components/common';

const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const IconBolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const IconGlobe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconCrypto = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const networks = [
  {
    id: 'trc20',
    name: 'TRC20 (TRON)',
    description: 'شبكة TRON - الأكثر استقراراً',
    href: '/wallet/deposit/digital/usdt-trc20',
    icon: IconCrypto,
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    badge: 'مستقر',
    badgeColor: 'bg-blue-100 text-blue-700',
    features: ['رسوم ~$1', 'تأكيد 5-15 دقيقة', 'الأكثر استخداماً'],
    minDeposit: '10 USDT',
  },
  {
    id: 'solana',
    name: 'Solana',
    description: 'شبكة Solana - سرعة فائقة',
    href: '/wallet/deposit/digital/usdt-solana',
    icon: IconBolt,
    color: 'from-purple-500 to-indigo-600',
    hoverColor: 'hover:from-purple-600 hover:to-indigo-700',
    badge: 'الأسرع',
    badgeColor: 'bg-purple-100 text-purple-700',
    features: ['رسوم < $0.01', 'تأكيد ثوانٍ', 'سرعة فائقة'],
    minDeposit: '5 USDT',
  },
  {
    id: 'bep20',
    name: 'BEP20 (BNB Chain)',
    description: 'شبكة Binance Smart Chain - الأوسع انتشاراً',
    href: '/wallet/deposit/digital/usdt-bep20',
    icon: IconGlobe,
    color: 'from-amber-400 to-yellow-500',
    hoverColor: 'hover:from-amber-500 hover:to-yellow-600',
    badge: 'شائع',
    badgeColor: 'bg-amber-100 text-amber-700',
    features: ['رسوم ~$0.10', 'تأكيد 1-3 دقائق', 'الأكثر شعبية'],
    minDeposit: '10 USDT',
  },
];

export default function DigitalDepositIndexPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>إيداع USDT - اختيار الشبكة | سوق مزاد</title>
        <meta name="description" content="اختر شبكة الإيداع المناسبة لك - TRC20, Solana, BEP20" />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/wallet" className="hover:text-blue-600">
            المحفظة
          </Link>
          <span className="mx-2">/</span>
          <Link href="/wallet/deposit" className="hover:text-blue-600">
            إيداع
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">إيداع رقمي (USDT)</span>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <IconCrypto className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">إيداع USDT</h1>
          <p className="mt-2 text-gray-600">اختر الشبكة المناسبة لإيداع عملة USDT</p>
        </div>

        {/* Network Selection */}
        <div className="grid gap-6 md:grid-cols-3">
          {networks.map((network) => {
            const Icon = network.icon;
            return (
              <Link
                key={network.id}
                href={network.href}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
              >
                {/* Badge */}
                <span
                  className={`absolute left-4 top-4 rounded-full px-2 py-1 text-xs font-bold ${network.badgeColor}`}
                >
                  {network.badge}
                </span>

                {/* Icon */}
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${network.color} shadow-lg transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-bold text-gray-900">{network.name}</h3>
                <p className="mb-4 text-sm text-gray-600">{network.description}</p>

                {/* Features */}
                <div className="mb-4 space-y-2">
                  {network.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="h-4 w-4 text-green-500"
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

                {/* Min Deposit */}
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <span className="text-sm text-gray-500">الحد الأدنى:</span>
                  <span className="mr-2 font-bold text-gray-900">{network.minDeposit}</span>
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

        {/* Comparison Table */}
        <div className="mt-10 rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-bold text-gray-900">مقارنة الشبكات</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-gray-900">الشبكة</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">الرسوم</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">السرعة</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">الحد الأدنى</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-blue-600">TRC20 (TRON)</td>
                  <td className="px-4 py-3 text-gray-600">~$1</td>
                  <td className="px-4 py-3 text-gray-600">5-15 دقيقة</td>
                  <td className="px-4 py-3 text-gray-600">10 USDT</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-purple-600">Solana</td>
                  <td className="px-4 py-3 text-gray-600">&lt; $0.01</td>
                  <td className="px-4 py-3 text-gray-600">ثوانٍ</td>
                  <td className="px-4 py-3 text-gray-600">5 USDT</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-amber-600">BEP20 (BNB)</td>
                  <td className="px-4 py-3 text-gray-600">~$0.10</td>
                  <td className="px-4 py-3 text-gray-600">1-3 دقائق</td>
                  <td className="px-4 py-3 text-gray-600">10 USDT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 rounded-xl bg-indigo-50 p-6 text-center">
          <h3 className="mb-2 font-semibold text-indigo-800">لا تعرف أي شبكة تختار؟</h3>
          <p className="mb-4 text-sm text-indigo-700">
            إذا كانت محفظتك تدعم Solana، ننصح بها للسرعة الفائقة والرسوم المنخفضة جداً.
            <br />
            أما إذا كنت تستخدم Binance أو Trust Wallet، فاختر BEP20.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            تواصل مع الدعم للمساعدة
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/wallet/deposit"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
          >
            <IconArrowLeft className="h-4 w-4" />
            العودة لخيارات الإيداع
          </Link>
        </div>
      </main>
    </div>
  );
}
