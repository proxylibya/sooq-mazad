import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../../../components/common';

interface BankDetails {
  beneficiaryName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  bankName: string;
  bankAddress: string;
  routingNumber?: string;
  reference: string;
}

export default function WiseDepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'details' | 'confirmation'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD'>('USD');

  const fees = amount ? (parseFloat(amount) * 0.01).toFixed(2) : '0.00';
  const total = amount ? (parseFloat(amount) + parseFloat(fees)).toFixed(2) : '0.00';

  const bankDetails: Record<string, BankDetails> = {
    USD: {
      beneficiaryName: 'Sooq Mazad LLC',
      accountNumber: '20400123456789',
      iban: 'US64WISE20400123456789',
      swift: 'TRWIUS33',
      bankName: 'Wise US Inc.',
      bankAddress: '30 W. 26th Street, Sixth Floor, New York NY 10010, United States',
      routingNumber: '026073150',
      reference: '',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !email) return;

    setIsLoading(true);

    // Generate reference number
    const reference = 'WISE' + Date.now().toString().slice(-8);
    setTransactionId(reference);

    // Update bank details with reference
    bankDetails[selectedCurrency].reference = reference;

    setTimeout(() => {
      setStep('details');
      setIsLoading(false);
    }, 2000);
  };

  const handleConfirmTransfer = () => {
    setStep('confirmation');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const currentBankDetails = bankDetails[selectedCurrency];

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Head>
        <title>إيداع Wise | سوق مزاد</title>
        <meta name="description" content="أودع الأموال عبر التحويل المصرفي الدولي باستخدام Wise" />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav aria-label="breadcrumbs" className="mb-4 text-sm text-gray-500">
            <Link href="/wallet" className="transition-colors hover:text-green-600">
              المحفظة
            </Link>
            <span className="mx-2">/</span>
            <Link href="/wallet/deposit/global" className="transition-colors hover:text-green-600">
              وسائل الإيداع العالمية
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900">Wise</span>
          </nav>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إيداع Wise</h1>
              <p className="text-gray-600">تحويل مصرفي دولي بأسعار الصرف الحقيقية</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div
                className={`flex items-center ${step === 'form' ? 'text-green-600' : step === 'details' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'form' ? 'bg-green-600 text-white' : step === 'details' || step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  1
                </div>
                <span className="mr-2 font-medium">تفاصيل التحويل</span>
              </div>
              <div
                className={`h-1 w-8 ${step === 'details' || step === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}
              ></div>
              <div
                className={`flex items-center ${step === 'details' ? 'text-green-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'details' ? 'bg-green-600 text-white' : step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  2
                </div>
                <span className="mr-2 font-medium">بيانات البنك</span>
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

        {step === 'form' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">تفاصيل التحويل</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-900">العملة</label>
                    <div className="rounded-xl border-2 border-green-500 bg-green-50 p-4 text-green-700">
                      <div className="mb-1 text-2xl font-bold">$</div>
                      <div className="text-sm font-semibold">USD</div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="amount" className="mb-2 block text-sm font-bold text-gray-900">
                      المبلغ ({selectedCurrency})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="20"
                        max="50000"
                        step="0.01"
                        required
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold transition-colors focus:border-green-500 focus:outline-none"
                        placeholder="أدخل المبلغ"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 transform font-bold text-gray-500">
                        $
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      الحد الأدنى: $20 | الحد الأقصى: $50,000
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-bold text-gray-900">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg transition-colors focus:border-green-500 focus:outline-none"
                      placeholder="example@email.com"
                    />
                    <p className="mt-2 text-sm text-gray-500">سنرسل تأكيد التحويل إلى هذا البريد</p>
                  </div>

                  {amount && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                      <h3 className="mb-4 font-bold text-green-900">ملخص التحويل</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-green-700">المبلغ:</span>
                          <span className="font-bold text-green-900">${amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">رسوم Wise (1%):</span>
                          <span className="font-bold text-green-900">${fees}</span>
                        </div>
                        <div className="flex justify-between border-t border-green-200 pt-2">
                          <span className="font-bold text-green-900">المجموع:</span>
                          <span className="text-lg font-bold text-green-900">${total}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!amount || !email || isLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
                        جاري إنشاء بيانات التحويل...
                      </div>
                    ) : (
                      'الحصول على بيانات التحويل'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
                <h3 className="mb-4 font-bold text-gray-900">مميزات Wise</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">أسعار صرف حقيقية</span>
                  </div>
                  <div className="flex items-center gap-3">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">رسوم منخفضة وشفافة</span>
                  </div>
                  <div className="flex items-center gap-3">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">تتبع مباشر للتحويل</span>
                  </div>
                  <div className="flex items-center gap-3">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">آمن ومنظم</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                <h3 className="mb-4 font-bold text-blue-900">معلومات مهمة</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• وقت المعالجة: 1-2 أيام عمل</li>
                  <li>• الرسوم: 1% من المبلغ</li>
                  <li>• يجب إدراج رقم المرجع</li>
                  <li>• التحويل من حسابك الشخصي فقط</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">بيانات التحويل المصرفي</h2>
                <p className="text-gray-600">استخدم هذه البيانات لإجراء التحويل من بنكك</p>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Bank Details */}
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gray-50 p-6">
                    <h3 className="mb-4 font-bold text-gray-900">بيانات المستفيد</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                          اسم المستفيد
                        </label>
                        <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                          <span className="font-mono text-sm">
                            {currentBankDetails.beneficiaryName}
                          </span>
                          <button
                            onClick={() => copyToClipboard(currentBankDetails.beneficiaryName)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">IBAN</label>
                        <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                          <span className="font-mono text-sm">{currentBankDetails.iban}</span>
                          <button
                            onClick={() => copyToClipboard(currentBankDetails.iban)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                          SWIFT/BIC
                        </label>
                        <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                          <span className="font-mono text-sm">{currentBankDetails.swift}</span>
                          <button
                            onClick={() => copyToClipboard(currentBankDetails.swift)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {currentBankDetails.routingNumber && (
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-600">
                            Routing Number
                          </label>
                          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                            <span className="font-mono text-sm">
                              {currentBankDetails.routingNumber}
                            </span>
                            <button
                              onClick={() => copyToClipboard(currentBankDetails.routingNumber!)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                          اسم البنك
                        </label>
                        <div className="rounded-lg border bg-white p-3">
                          <span className="text-sm">{currentBankDetails.bankName}</span>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                          عنوان البنك
                        </label>
                        <div className="rounded-lg border bg-white p-3">
                          <span className="text-sm">{currentBankDetails.bankAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transfer Details */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                    <h3 className="mb-4 font-bold text-green-900">تفاصيل التحويل</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-700">المبلغ:</span>
                        <span className="font-bold text-green-900">${amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">العملة:</span>
                        <span className="font-bold text-green-900">{selectedCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">رقم المرجع:</span>
                        <span className="font-mono font-bold text-green-900">{transactionId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
                    <div className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-6 w-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <div>
                        <h3 className="mb-2 font-bold text-yellow-800">تعليمات مهمة</h3>
                        <ul className="space-y-1 text-sm text-yellow-700">
                          <li>• يجب إدراج رقم المرجع في وصف التحويل</li>
                          <li>• التحويل من حسابك الشخصي فقط</li>
                          <li>• تأكد من صحة جميع البيانات</li>
                          <li>• احتفظ بإيصال التحويل</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                    <h3 className="mb-4 font-bold text-blue-900">الخطوات التالية</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          1
                        </div>
                        <span className="text-sm text-blue-700">اذهب إلى بنكك أو تطبيق البنك</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          2
                        </div>
                        <span className="text-sm text-blue-700">أدخل بيانات التحويل أعلاه</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          3
                        </div>
                        <span className="text-sm text-blue-700">أضف رقم المرجع ��ي الوصف</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          4
                        </div>
                        <span className="text-sm text-blue-700">أكمل التحويل واحتفظ بالإيصال</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmTransfer}
                    className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl"
                  >
                    تم إجراء التحويل
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="mx-auto max-w-2xl">
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
              <h2 className="mb-4 text-2xl font-bold text-gray-900">تم تسجيل طلب التحويل</h2>
              <p className="mb-6 text-gray-600">
                سنقوم بمراجعة التحويل وإضافة المبلغ إلى محفظتك خلال 1-2 أيام عمل بعد وصول التحويل
              </p>

              <div className="mb-6 rounded-2xl bg-gray-50 p-6">
                <h3 className="mb-4 font-bold text-gray-900">تفاصيل التحويل</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>رقم المرجع:</span>
                    <span className="font-mono font-bold">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المبلغ:</span>
                    <span className="font-bold">${amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>العملة:</span>
                    <span className="font-bold">{selectedCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الطريقة:</span>
                    <span className="font-bold">Wise</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحالة:</span>
                    <span className="font-bold text-yellow-600">في انتظار التحويل</span>
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
          </div>
        )}
      </main>
    </div>
  );
}
