/**
 * صفحة إيداع رصيد مدار
 * Madar Card Deposit Page
 */
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
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

const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
    <path
      fillRule="evenodd"
      d="M1.5 10.5v6.75a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V10.5H1.5Zm3 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"
      clipRule="evenodd"
    />
  </svg>
);

export default function MadarDepositPage() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // تنسيق رقم الكرت
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 14);
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
    setError('');
  };

  const isValidCard = cardNumber.length >= 12 && cardNumber.length <= 14;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCard) {
      setError('رقم الكرت غير صحيح');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/deposit/madar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في معالجة الكرت');
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
          <title>تم الإيداع بنجاح | سوق مزاد</title>
        </Head>
        <OpensooqNavbar />
        <main className="mx-auto max-w-lg px-4 py-16">
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">تم إرسال طلب الإيداع!</h1>
            <p className="mb-6 text-gray-600">سيتم مراجعة الكرت وإضافة الرصيد خلال دقائق</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/wallet"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                العودة للمحفظة
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCardNumber('');
                }}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                إيداع كرت آخر
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>إيداع رصيد مدار | سوق مزاد</title>
      </Head>
      <OpensooqNavbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/wallet" className="hover:text-blue-600">
            المحفظة
          </Link>
          <span className="mx-2">/</span>
          <Link href="/wallet/deposit/local" className="hover:text-blue-600">
            إيداع محلي
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">مدار</span>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
            <CreditCardIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إيداع رصيد مدار</h1>
          <p className="mt-2 text-gray-600">أدخل رقم كرت الشحن لإضافة الرصيد لمحفظتك</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                رقم كرت الشحن
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardChange}
                placeholder="أدخل رقم الكرت (12-14 رقم)"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-lg tracking-wider transition-colors focus:border-orange-500 focus:outline-none"
                dir="ltr"
                maxLength={14}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            {/* معلومات */}
            <div className="rounded-lg bg-amber-50 p-4">
              <h3 className="mb-2 font-semibold text-amber-800">ملاحظات مهمة:</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-amber-700">
                <li>تأكد من إدخال رقم الكرت بشكل صحيح</li>
                <li>الكرت يجب أن يكون غير مستخدم</li>
                <li>سيتم إضافة قيمة الكرت للمحفظة المحلية (LYD)</li>
                <li>معالجة الطلب خلال 5-15 دقيقة</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!isValidCard || isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 font-bold text-white transition-all hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  جاري المعالجة...
                </span>
              ) : (
                'إيداع الرصيد'
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/wallet/deposit/local" className="text-sm text-gray-500 hover:text-blue-600">
            ← العودة لخيارات الإيداع المحلي
          </Link>
        </div>
      </main>
    </div>
  );
}
