/**
 * صفحة إيداع عبر Payoneer
 * Payoneer Deposit Page
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

const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z" />
  </svg>
);

export default function PayoneerDepositPage() {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const amountNum = Number(amount || 0);
  const isValidAmount = amountNum >= 10;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = isValidAmount && isValidEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/deposit/payoneer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum, email }),
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
            <p className="mb-4 text-gray-600">
              سيتم التواصل معك عبر البريد الإلكتروني لإتمام عملية التحويل
            </p>
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">المبلغ المطلوب: ${amountNum}</p>
              <p>البريد الإلكتروني: {email}</p>
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
        <title>إيداع عبر Payoneer | سوق مزاد</title>
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
          <span className="text-gray-900">Payoneer</span>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
            <GlobeAltIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إيداع عبر Payoneer</h1>
          <p className="mt-2 text-gray-600">تحويل من حساب Payoneer للمحفظة العالمية</p>
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
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-colors focus:border-orange-500 focus:outline-none"
                min="10"
              />
              {amount && !isValidAmount && (
                <p className="mt-2 text-sm text-red-600">الحد الأدنى للإيداع هو $10</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                بريد Payoneer الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-colors focus:border-orange-500 focus:outline-none"
                dir="ltr"
              />
              {email && !isValidEmail && (
                <p className="mt-2 text-sm text-red-600">البريد الإلكتروني غير صحيح</p>
              )}
            </div>

            {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

            {/* معلومات */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-800">خطوات الإيداع:</h3>
              <ol className="list-inside list-decimal space-y-1 text-sm text-blue-700">
                <li>أدخل المبلغ وبريد Payoneer</li>
                <li>سنرسل لك تفاصيل التحويل</li>
                <li>قم بالتحويل من حساب Payoneer</li>
                <li>سيتم إضافة الرصيد خلال 24 ساعة</li>
              </ol>
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 font-bold text-white transition-all hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
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
