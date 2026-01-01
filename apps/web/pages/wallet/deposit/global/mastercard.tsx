import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../../../components/common';

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function MastercardDepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [step, setStep] = useState<'form' | 'processing' | 'confirmation'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [errors, setErrors] = useState<Partial<CardDetails>>({});

  const fees = amount ? (parseFloat(amount) * 0.034 + 0.3).toFixed(2) : '0.00';
  const total = amount ? (parseFloat(amount) + parseFloat(fees)).toFixed(2) : '0.00';

  const validateCard = () => {
    const newErrors: Partial<CardDetails> = {};

    // Validate card number (basic Mastercard validation)
    const cardNum = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cardNum || cardNum.length !== 16 || !cardNum.startsWith('5')) {
      newErrors.cardNumber = 'رقم بطاقة Mastercard غير صحيح';
    }

    // Validate expiry date
    if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'تاريخ انتهاء الصلاحية غير صحيح';
    }

    // Validate CVV
    if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
      newErrors.cvv = 'رمز الأمان يجب أن يكون 3 أرقام';
    }

    // Validate cardholder name
    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'اسم حامل البطاقة مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field: keyof CardDetails, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }

    setCardDetails((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !email || !validateCard()) return;

    setIsLoading(true);
    setStep('processing');

    // Simulate payment processing
    const txId = 'MC' + Date.now().toString().slice(-8);
    setTransactionId(txId);

    setTimeout(() => {
      setStep('confirmation');
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <Head>
        <title>إيداع Mastercard | سوق مزاد</title>
        <meta name="description" content="أودع الأموال باستخدام بطاقة Mastercard بأمان وسرعة" />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav aria-label="breadcrumbs" className="mb-4 text-sm text-gray-500">
            <Link href="/wallet" className="transition-colors hover:text-red-600">
              المحفظة
            </Link>
            <span className="mx-2">/</span>
            <Link href="/wallet/deposit/global" className="transition-colors hover:text-red-600">
              وسائل الإيداع العالمية
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900">Mastercard</span>
          </nav>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                <circle cx="9" cy="12" r="6" opacity="0.7" />
                <circle cx="15" cy="12" r="6" opacity="0.7" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إيداع Mastercard</h1>
              <p className="text-gray-600">دفع آمن ومعالجة فورية</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div
                className={`flex items-center ${step === 'form' ? 'text-red-600' : step === 'processing' || step === 'confirmation' ? 'text-red-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'form' ? 'bg-red-600 text-white' : step === 'processing' || step === 'confirmation' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  1
                </div>
                <span className="mr-2 font-medium">بيانات البطاقة</span>
              </div>
              <div
                className={`h-1 w-8 ${step === 'processing' || step === 'confirmation' ? 'bg-red-600' : 'bg-gray-200'}`}
              ></div>
              <div
                className={`flex items-center ${step === 'processing' ? 'text-red-600' : step === 'confirmation' ? 'text-red-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'processing' ? 'bg-red-600 text-white' : step === 'confirmation' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  2
                </div>
                <span className="mr-2 font-medium">المعالجة</span>
              </div>
              <div
                className={`h-1 w-8 ${step === 'confirmation' ? 'bg-red-600' : 'bg-gray-200'}`}
              ></div>
              <div
                className={`flex items-center ${step === 'confirmation' ? 'text-red-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'confirmation' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}
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
                <h2 className="mb-6 text-2xl font-bold text-gray-900">بيانات الدفع</h2>

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
                        min="5"
                        max="5000"
                        step="0.01"
                        required
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold transition-colors focus:border-red-500 focus:outline-none"
                        placeholder="أدخل المبلغ"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 transform font-bold text-gray-500">
                        $
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      الحد الأدنى: $5 | الحد الأقصى: $5,000
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
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg transition-colors focus:border-red-500 focus:outline-none"
                      placeholder="example@email.com"
                    />
                  </div>

                  {/* Card Details */}
                  <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h3 className="font-bold text-red-900">بيانات بطاقة Mastercard</h3>

                    <div>
                      <label
                        htmlFor="cardNumber"
                        className="mb-2 block text-sm font-bold text-gray-900"
                      >
                        رقم البطاقة
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                        maxLength={19}
                        required
                        className={`w-full rounded-xl border-2 px-4 py-3 font-mono text-lg transition-colors focus:outline-none ${
                          errors.cardNumber
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-red-500'
                        }`}
                        placeholder="5555 1234 5678 9012"
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="expiryDate"
                          className="mb-2 block text-sm font-bold text-gray-900"
                        >
                          تاريخ الانتهاء
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          value={cardDetails.expiryDate}
                          onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                          maxLength={5}
                          required
                          className={`w-full rounded-xl border-2 px-4 py-3 font-mono text-lg transition-colors focus:outline-none ${
                            errors.expiryDate
                              ? 'border-red-500'
                              : 'border-gray-200 focus:border-red-500'
                          }`}
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cvv" className="mb-2 block text-sm font-bold text-gray-900">
                          رمز الأمان (CVV)
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          value={cardDetails.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                          maxLength={3}
                          required
                          className={`w-full rounded-xl border-2 px-4 py-3 font-mono text-lg transition-colors focus:outline-none ${
                            errors.cvv ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                          }`}
                          placeholder="123"
                        />
                        {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="cardholderName"
                        className="mb-2 block text-sm font-bold text-gray-900"
                      >
                        اسم حامل البطاقة
                      </label>
                      <input
                        type="text"
                        id="cardholderName"
                        value={cardDetails.cardholderName}
                        onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                        required
                        className={`w-full rounded-xl border-2 px-4 py-3 text-lg transition-colors focus:outline-none ${
                          errors.cardholderName
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-red-500'
                        }`}
                        placeholder="JOHN SMITH"
                      />
                      {errors.cardholderName && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
                      )}
                    </div>
                  </div>

                  {amount && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                      <h3 className="mb-4 font-bold text-red-900">ملخص الدفع</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-red-700">المبلغ:</span>
                          <span className="font-bold text-red-900">${amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">رسوم المعالجة (3.4% + $0.30):</span>
                          <span className="font-bold text-red-900">${fees}</span>
                        </div>
                        <div className="flex justify-between border-t border-red-200 pt-2">
                          <span className="font-bold text-red-900">المجموع:</span>
                          <span className="text-lg font-bold text-red-900">${total}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!amount || !email || isLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:from-red-700 hover:to-orange-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? 'جاري المعالجة...' : 'دفع الآن'}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
                <h3 className="mb-4 font-bold text-gray-900">مميزات Mastercard</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <svg
                        className="h-4 w-4 text-red-600"
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
                    <span className="text-sm text-gray-700">معالجة فورية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <svg
                        className="h-4 w-4 text-red-600"
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
                    <span className="text-sm text-gray-700">حماية متقدمة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <svg
                        className="h-4 w-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">مقبولة عالمياً</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
                <h3 className="mb-4 font-bold text-gray-900">الأمان والحماية</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• تشفير SSL 256-bit</p>
                  <p>• حماية 3D Secure</p>
                  <p>• مراقبة الاحتيال</p>
                  <p>• عدم حفظ بيانات البطاقة</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-red-200 border-t-red-600"></div>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">جاري معالجة الدفع</h2>
              <p className="text-gray-600">يرجى الانتظار، لا تغلق هذه الصفحة</p>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                  <svg
                    className="h-8 w-8 text-white"
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
              </div>
              <h2 className="mb-4 text-2xl font-bold text-green-900">تم الدفع بنجاح!</h2>
              <p className="mb-6 text-green-700">تم إيداع ${amount} في محفظتك بنجاح</p>
              <div className="mb-6 rounded-xl bg-white p-4">
                <p className="text-sm text-gray-600">رقم المعاملة</p>
                <p className="font-mono text-lg font-bold text-gray-900">{transactionId}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/wallet"
                  className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700"
                >
                  العودة للمحفظة
                </Link>
                <Link
                  href="/wallet/transactions"
                  className="rounded-xl border border-green-600 px-6 py-3 font-bold text-green-600 transition-colors hover:bg-green-50"
                >
                  عرض المعاملات
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
