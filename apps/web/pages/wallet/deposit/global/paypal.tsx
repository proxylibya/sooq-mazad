import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../../../components/common';

// Enhanced QR Code component with better styling
const QRCode = ({ value, size = 180 }: { value: string; size?: number }) => (
  <div className="flex flex-col items-center">
    <div
      className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl"
      style={{ width: size + 48, height: size + 48 }}
    >
      {/* Decorative corners */}
      <div className="absolute left-2 top-2 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-blue-500"></div>
      <div className="absolute right-2 top-2 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-blue-500"></div>
      <div className="absolute bottom-2 left-2 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-blue-500"></div>
      <div className="absolute bottom-2 right-2 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-blue-500"></div>

      <div
        className="relative rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800"
        style={{
          width: size,
          height: size,
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='qr-pattern' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1.5) rotate(0)'%3e%3crect x='0' y='0' width='100%25' height='100%25' fill='%23000000'/%3e%3cpath d='m0 10h10v10h-10zm10 0h10v10h-10z' stroke-width='0' fill='%23ffffff'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23qr-pattern)'/%3e%3c/svg%3e")`,
          backgroundSize: '15px 15px',
        }}
      >
        {/* PayPal logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-white p-3 shadow-lg">
            <svg viewBox="0 0 24 24" fill="#003087" className="h-8 w-8">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-4 text-center">
      <p className="mb-1 text-sm font-semibold text-gray-700">امسح الكود للدفع السريع</p>
      <p className="text-xs text-gray-500">أو انقر على "فتح PayPal" أدناه</p>
    </div>
  </div>
);

export default function PayPalDepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'payment' | 'confirmation'>('form');
  const [transactionId, setTransactionId] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  const paypalEmail = 'payments@sooq-mazad.com';
  const fees = amount ? (parseFloat(amount) * 0.029 + 0.3).toFixed(2) : '0.00';
  const total = amount ? (parseFloat(amount) + parseFloat(fees)).toFixed(2) : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const txId = 'PP' + Date.now().toString().slice(-8);
      setTransactionId(txId);
      setPaymentUrl(`https://paypal.me/sooqmazad/${amount}USD`);
      setStep('payment');
      setIsLoading(false);
    }, 2000);
  };

  const handleConfirmPayment = () => {
    setStep('confirmation');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Head>
        <title>إيداع PayPal | سوق مزاد</title>
        <meta name="description" content="أودع الأموال في محفظتك باستخدام PayPal بأمان وسرعة" />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav aria-label="breadcrumbs" className="mb-4 text-sm text-gray-500">
            <Link href="/wallet" className="transition-colors hover:text-blue-600">
              المحفظة
            </Link>
            <span className="mx-2">/</span>
            <Link href="/wallet/deposit/global" className="transition-colors hover:text-blue-600">
              وسائل الإيداع العالمية
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900">PayPal</span>
          </nav>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إيداع PayPal</h1>
              <p className="text-gray-600">أودع الأموال باستخدام PayPal بأمان وسرعة</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div
                className={`flex items-center ${step === 'form' ? 'text-blue-600' : step === 'payment' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'form' ? 'bg-blue-600 text-white' : step === 'payment' || step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  1
                </div>
                <span className="mr-2 font-medium">إدخال البيانات</span>
              </div>
              <div
                className={`h-1 w-8 ${step === 'payment' || step === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}
              ></div>
              <div
                className={`flex items-center ${step === 'payment' ? 'text-blue-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'payment' ? 'bg-blue-600 text-white' : step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  2
                </div>
                <span className="mr-2 font-medium">الدفع</span>
              </div>
              <div
                className={`h-1 w-8 ${step === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}
              ></div>
              <div
                className={`flex items-center ${step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  3
                </div>
                <span className="mr-2 font-medium">التأكيد</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'form' && (
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">تفاصيل الإيداع</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="amount" className="mb-2 block text-sm font-bold text-gray-900">
                      المبلغ (USD)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="10"
                        max="10000"
                        step="0.01"
                        required
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold transition-colors focus:border-blue-500 focus:outline-none"
                        placeholder="أدخل المبلغ"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 transform font-bold text-gray-500">
                        $
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      الحد الأدنى: $10 | الحد الأقصى: $10,000
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-bold text-gray-900">
                      بريدك الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none"
                      placeholder="example@email.com"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      سنرسل تأكيد المعاملة إلى هذا البريد
                    </p>
                  </div>

                  {amount && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                      <h3 className="mb-4 font-bold text-blue-900">ملخص المعاملة</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-700">المبلغ:</span>
                          <span className="font-bold text-blue-900">${amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">رسوم PayPal (2.9% + $0.30):</span>
                          <span className="font-bold text-blue-900">${fees}</span>
                        </div>
                        <div className="flex justify-between border-t border-blue-200 pt-2">
                          <span className="font-bold text-blue-900">المجموع:</span>
                          <span className="text-lg font-bold text-blue-900">${total}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!amount || !email || isLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        جاري المعالجة...
                      </div>
                    ) : (
                      'متابعة إلى PayPal'
                    )}
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-center text-white shadow-lg">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg
                      className="h-6 w-6 text-white"
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
                  <h2 className="mb-2 text-xl font-bold">أكمل الدفع عبر PayPal</h2>
                  <p className="text-sm text-blue-100">
                    رقم المعاملة: <span className="font-bold text-white">{transactionId}</span>
                  </p>
                </div>

                {/* Instructions Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white">تعليمات الدفع</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-xl bg-gray-50 p-3 text-center">
                        <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-bold text-blue-600">1</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          أرسل المبلغ إلى البريد الإلكتروني
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 text-center">
                        <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-bold text-blue-600">2</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          اكتب رقم المعاملة في الملاحظة
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 text-center">
                        <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-bold text-blue-600">3</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          استخدم "Goods & Services"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details & QR Code */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Payment Details */}
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-6 text-center text-xl font-bold text-gray-900">
                      تفاصيل الدفع
                    </h3>

                    <div className="space-y-4">
                      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                        <div className="text-center">
                          <p className="mb-2 text-sm text-gray-600">أرسل إلى:</p>
                          <div className="mb-4 flex items-center justify-center gap-3">
                            <svg viewBox="0 0 24 24" fill="#003087" className="h-8 w-8">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
                            </svg>
                            <div className="text-lg font-bold text-gray-900">{paypalEmail}</div>
                          </div>

                          <div className="rounded-xl bg-white p-4 shadow-inner">
                            <div className="mb-2 text-2xl font-bold text-blue-600">${total}</div>
                            <div className="text-sm text-gray-600">
                              رقم المرجع:{' '}
                              <span className="font-bold text-gray-900">{transactionId}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-3 font-bold text-blue-900">ملخص المبلغ</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">المبلغ الأساسي:</span>
                            <span className="font-bold text-blue-900">${amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">رسوم PayPal:</span>
                            <span className="font-bold text-blue-900">${fees}</span>
                          </div>
                          <div className="flex justify-between border-t border-blue-200 pt-2">
                            <span className="font-bold text-blue-900">المجموع:</span>
                            <span className="text-lg font-bold text-blue-900">${total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-6 text-center text-xl font-bold text-gray-900">
                      الدفع السريع
                    </h3>
                    <div className="flex justify-center">
                      <QRCode value={paymentUrl} size={160} />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group transform rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-center font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
                        </svg>
                        <span>فتح PayPal</span>
                        <svg
                          className="h-5 w-5 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </a>
                    <button
                      onClick={handleConfirmPayment}
                      className="group transform rounded-2xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-green-700 hover:to-green-800 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>تم الدفع</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-10 w-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">تم استلام طلب الإيداع</h2>
                <p className="mb-6 text-gray-600">
                  سنقوم بمراجعة دفعتك وإضافة المبلغ إلى محفظتك خلال 5-15 دقيقة
                </p>

                <div className="mb-6 rounded-2xl bg-gray-50 p-6">
                  <h3 className="mb-4 font-bold text-gray-900">تفاصيل المعاملة</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>رقم المعاملة:</span>
                      <span className="font-bold">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المبلغ:</span>
                      <span className="font-bold">${amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الطريقة:</span>
                      <span className="font-bold">PayPal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الحالة:</span>
                      <span className="font-bold text-yellow-600">قيد المراجعة</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    href="/wallet/transactions"
                    className="flex-1 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    سجل المعاملات
                  </Link>
                  <Link
                    href="/wallet"
                    className="flex-1 rounded-xl bg-gray-600 px-6 py-3 font-bold text-white transition-colors hover:bg-gray-700"
                  >
                    العودة للمحفظة
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Info */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
              <h3 className="mb-4 font-bold text-gray-900">معلومات PayPal</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">وقت المعالجة:</span>
                  <span className="font-semibold">فوري - 5 دقائق</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الرسوم:</span>
                  <span className="font-semibold">2.9% + $0.30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحد الأدنى:</span>
                  <span className="font-semibold">$10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحد الأقصى:</span>
                  <span className="font-semibold">$10,000</span>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-5 w-5 text-green-600"
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
                <h3 className="font-bold text-green-900">آمن ومضمون</h3>
              </div>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  حماية المشتري من PayPal
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  تشفير SSL 256-bit
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  مراقبة الاحتيال 24/7
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 font-bold text-blue-900">تحتاج مساعدة؟</h3>
              <p className="mb-4 text-sm text-blue-700">
                فريق الدعم متاح 24/7 لمساعدتك في أي استفسار
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:support@sooq-mazad.com"
                  className="flex items-center gap-3 text-sm text-blue-600 transition-colors hover:text-blue-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  support@sooq-mazad.com
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 text-sm text-blue-600 transition-colors hover:text-blue-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +123 456 7890
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
