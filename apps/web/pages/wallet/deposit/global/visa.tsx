import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpensooqNavbar } from '../../../../components/common';

// Credit Card Component
const CreditCard = ({
  cardNumber,
  cardName,
  expiryDate,
  cvv,
  cardType,
}: {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  cardType: 'visa' | 'mastercard' | 'unknown';
}) => {
  const formatCardNumber = (number: string) => {
    return number
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
  };

  const getCardGradient = () => {
    switch (cardType) {
      case 'visa':
        return 'from-blue-600 to-blue-800';
      case 'mastercard':
        return 'from-red-500 to-orange-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return <div className="text-2xl font-bold text-white">VISA</div>;
      case 'mastercard':
        return (
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-red-500 opacity-80"></div>
            <div className="-ml-4 h-8 w-8 rounded-full bg-yellow-400 opacity-80"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`mx-auto h-56 w-full max-w-sm bg-gradient-to-br ${getCardGradient()} relative overflow-hidden rounded-2xl p-6 text-white shadow-2xl`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-4 top-4 h-20 w-20 rounded-full border border-white"></div>
        <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full border border-white"></div>
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="h-8 w-12 rounded bg-yellow-400 opacity-80"></div>
          {getCardIcon()}
        </div>

        <div>
          <div className="mb-4 font-mono text-2xl tracking-wider">
            {formatCardNumber(cardNumber) || '•••• •••• •••• ••••'}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="mb-1 text-xs opacity-70">اسم حامل البطاقة</div>
              <div className="text-lg font-semibold">{cardName || 'YOUR NAME'}</div>
            </div>
            <div>
              <div className="mb-1 text-xs opacity-70">تاريخ الانتهاء</div>
              <div className="font-mono text-lg">{expiryDate || 'MM/YY'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VisaDepositPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'processing' | 'confirmation'>('form');
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Transaction data
  const [transactionId, setTransactionId] = useState('');

  const fees = amount ? (parseFloat(amount) * 0.034 + 0.3).toFixed(2) : '0.00';
  const total = amount ? (parseFloat(amount) + parseFloat(fees)).toFixed(2) : '0.00';

  // Detect card type
  const getCardType = (number: string): 'visa' | 'mastercard' | 'unknown' => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    return 'unknown';
  };

  const cardType = getCardType(cardNumber);

  // Format card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (value.length <= 16) {
      setCardNumber(formattedValue);
    }
  };

  // Format expiry date
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      const formattedValue = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
      setExpiryDate(formattedValue);
    }
  };

  // Handle CVV input
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !cardNumber || !cardName || !expiryDate || !cvv || !email) return;

    setIsLoading(true);
    setStep('processing');

    // Simulate payment processing
    setTimeout(() => {
      const txId = 'VISA' + Date.now().toString().slice(-8);
      setTransactionId(txId);
      setStep('confirmation');
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Head>
        <title>إيداع بالبطاقة الائتمانية | سوق مزاد</title>
        <meta
          name="description"
          content="أودع الأموال في محفظتك باستخدام بطاقة Visa أو Mastercard بأمان"
        />
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
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
            <span className="font-medium text-gray-900">البطاقة الائتمانية</span>
          </nav>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                <path d="M4.5 6h15c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5v-9C3 6.67 3.67 6 4.5 6zm0 2v8h15V8H4.5z" />
                <path d="M6 10h2v4H6zm3 0h2v4H9zm3 0h2v4h-2zm3 0h2v4h-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إيداع بالبطاقة الائتمانية</h1>
              <p className="text-gray-600">Visa, Mastercard وبطاقات أخرى مقبولة</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div
                className={`flex items-center ${step === 'form' ? 'text-blue-600' : step === 'processing' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'form' ? 'bg-blue-600 text-white' : step === 'processing' || step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  1
                </div>
                <span className="mr-2 font-medium">بيانات البطاقة</span>
              </div>
              <div
                className={`h-1 w-8 ${step === 'processing' || step === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}
              ></div>
              <div
                className={`flex items-center ${step === 'processing' ? 'text-blue-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'processing' ? 'bg-blue-600 text-white' : step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  2
                </div>
                <span className="mr-2 font-medium">المعالجة</span>
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Card Preview */}
            <div className="order-2 lg:order-1">
              <div className="sticky top-8">
                <h2 className="mb-6 text-center text-xl font-bold text-gray-900">معاينة البطاقة</h2>
                <CreditCard
                  cardNumber={cardNumber}
                  cardName={cardName}
                  expiryDate={expiryDate}
                  cvv={cvv}
                  cardType={cardType}
                />

                {/* Accepted Cards */}
                <div className="mt-8 text-center">
                  <p className="mb-4 text-sm text-gray-600">البطاقات المقبولة:</p>
                  <div className="flex justify-center gap-4">
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
                      VISA
                    </div>
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-gradient-to-r from-red-500 to-orange-500">
                      <div className="flex gap-0.5">
                        <div className="h-2 w-2 rounded-full bg-red-600"></div>
                        <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                      </div>
                    </div>
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-blue-800 text-xs font-bold text-white">
                      AMEX
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="order-1 lg:order-2">
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
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold transition-colors focus:border-blue-500 focus:outline-none"
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
                    <label
                      htmlFor="cardNumber"
                      className="mb-2 block text-sm font-bold text-gray-900"
                    >
                      رقم البطاقة
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      required
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-mono text-lg transition-colors focus:border-blue-500 focus:outline-none"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cardName"
                      className="mb-2 block text-sm font-bold text-gray-900"
                    >
                      اسم حامل البطاقة
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      required
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none"
                      placeholder="JOHN DOE"
                    />
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
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        required
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-mono text-lg transition-colors focus:border-blue-500 focus:outline-none"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="mb-2 block text-sm font-bold text-gray-900">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        value={cvv}
                        onChange={handleCvvChange}
                        required
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-mono text-lg transition-colors focus:border-blue-500 focus:outline-none"
                        placeholder="123"
                      />
                    </div>
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
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="saveCard" className="text-sm text-gray-700">
                      حفظ بيانات البطاقة للمرات القادمة (آمن ومشفر)
                    </label>
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
                          <span className="text-blue-700">رسوم المعالجة (3.4% + $0.30):</span>
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
                    disabled={
                      !amount ||
                      !cardNumber ||
                      !cardName ||
                      !expiryDate ||
                      !cvv ||
                      !email ||
                      isLoading
                    }
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5"
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
                      دفع آمن ${total}
                    </div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-10 w-10 animate-spin text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">جاري معالجة الدفع</h2>
              <p className="mb-8 text-gray-600">
                يرجى عدم إغلاق هذه الصفحة أو الضغط على زر ال��جوع
              </p>

              <div className="rounded-2xl bg-gray-50 p-6">
                <div className="mb-4 flex items-center justify-center gap-4">
                  <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600"></div>
                  <div
                    className="h-3 w-3 animate-bounce rounded-full bg-blue-600"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="h-3 w-3 animate-bounce rounded-full bg-blue-600"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">التحقق من بيانات البطاقة وإتمام المعاملة...</p>
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
              <h2 className="mb-4 text-2xl font-bold text-gray-900">تم الدفع بنجاح!</h2>
              <p className="mb-6 text-gray-600">تم إضافة المبلغ إلى محفظتك بنجاح</p>

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
                    <span className="font-bold">
                      {cardType === 'visa'
                        ? 'Visa'
                        : cardType === 'mastercard'
                          ? 'Mastercard'
                          : 'بطاقة ائتمانية'}{' '}
                      ****{cardNumber.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحالة:</span>
                    <span className="font-bold text-green-600">مكتملة</span>
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

        {/* Security Notice */}
        {step === 'form' && (
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
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
                <h3 className="mb-2 text-xl font-bold text-green-900">معاملاتك آمنة ومحمية</h3>
                <p className="text-green-700">
                  نستخدم أحدث تقنيات الحماية لضمان أمان بياناتك المالية
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-1 font-bold text-green-900">تشفير SSL</h4>
                  <p className="text-sm text-green-700">جميع البيانات مشفرة بتقنية SSL 256-bit</p>
                </div>
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-1 font-bold text-green-900">معالجة فورية</h4>
                  <p className="text-sm text-green-700">إضافة فورية للرصيد بعد تأكيد الدفع</p>
                </div>
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
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-1 font-bold text-green-900">دعم 24/7</h4>
                  <p className="text-sm text-green-700">فريق دعم متاح على مدار الساعة</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
