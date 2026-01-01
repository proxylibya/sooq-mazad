/**
 * صفحة إيداع عبر Payeer
 * Payeer Deposit Page
 */
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { OpensooqNavbar } from '../../../../components/common';

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M2.25 8.25A2.75 2.75 0 0 1 5 5.5h14A2.75 2.75 0 0 1 21.75 8.25v7.5A2.75 2.75 0 0 1 19 18.5H5A2.75 2.75 0 0 1 2.25 15.75v-7.5Zm2.75-.75c-.69 0-1.25.56-1.25 1.25v7.5c0 .69.56 1.25 1.25 1.25h14c.69 0 1.25-.56 1.25-1.25v-7.5c0-.69-.56-1.25-1.25-1.25H5Z" />
    <path d="M16.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
  </svg>
);

export default function PayeerDepositPage() {
  const [amount, setAmount] = useState('');
  const [payeerAccount, setPayeerAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const amountNum = Number(amount || 0);
  const isValidAmount = amountNum >= 5;
  const isValidAccount = payeerAccount.length >= 5;
  const isValid = isValidAmount && isValidAccount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/deposit/payeer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum, payeerAccount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في إنشاء طلب الإيداع');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Head>
          <title>تم إرسال الطلب | سوق مزاد</title>
        </Head>
        <OpensooqNavbar />
        <main className="mx-auto max-w-lg px-4 py-16">
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">تم إرسال طلب الإيداع!</h1>
            <p className="mb-4 text-gray-600">سيتم إرسال تفاصيل التحويل لحساب Payeer الخاص بك</p>
            <div className="mb-6 rounded-lg bg-purple-50 p-4 text-sm text-purple-800">
              <p className="font-semibold">المبلغ المطلوب: ${amountNum}</p>
              <p>حساب Payeer: {payeerAccount}</p>
            </div>
            <Link
              href="/wallet"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              العودة للمحفظة
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>إيداع عبر Payeer | سوق مزاد</title>
      </Head>
      <OpensooqNavbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/wallet" className="hover:text-blue-600">
            المحفظة
          </Link>
          <span className="mx-2">/</span>
          <Link href="/wallet/deposit/global" className="hover:text-blue-600">
            إيداع عالمي
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Payeer</span>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
            <WalletIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إيداع عبر Payeer</h1>
          <p className="mt-2 text-gray-600">محفظة رقمية دولية للتحويلات السريعة</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">المبلغ (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ بالدولار"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                min="5"
              />
              {amount && !isValidAmount && (
                <p className="mt-2 text-sm text-red-600">الحد الأدنى للإيداع هو $5</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                رقم حساب Payeer
              </label>
              <input
                type="text"
                value={payeerAccount}
                onChange={(e) => setPayeerAccount(e.target.value)}
                placeholder="P1234567890"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                dir="ltr"
              />
              {payeerAccount && !isValidAccount && (
                <p className="mt-2 text-sm text-red-600">رقم الحساب غير صحيح</p>
              )}
            </div>

            {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

            {/* معلومات */}
            <div className="rounded-lg bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-800">مميزات Payeer:</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-purple-700">
                <li>رسوم تحويل منخفضة</li>
                <li>سرعة في التحويل</li>
                <li>دعم عملات متعددة</li>
                <li>الحد الأدنى $5 فقط</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 font-bold text-white transition-all hover:from-purple-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'جاري الإرسال...' : 'طلب إيداع'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/wallet/deposit/global" className="text-sm text-gray-500 hover:text-blue-600">
            ← العودة لخيارات الإيداع العالمي
          </Link>
        </div>
      </main>
    </div>
  );
}
