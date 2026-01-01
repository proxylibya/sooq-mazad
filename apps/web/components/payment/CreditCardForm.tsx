import React, { useState } from 'react';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';

interface CreditCardFormProps {
  onSubmit: (cardData: CreditCardData) => void;
  loading?: boolean;
  error?: string | null;
}

export interface CreditCardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;
  saveCard?: boolean;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSubmit, loading = false, error }) => {
  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: '',
    saveCard: false,
  });

  const [showCvv, setShowCvv] = useState(false);
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');

  // تنسيق رقم البطاقة
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

  // تحديد نوع البطاقة
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) {
      return 'visa';
    } else if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) {
      return 'mastercard';
    }
    return 'unknown';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    const type = detectCardType(formatted);
    setCardType(type);
    setCardData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cardData);
  };

  // إنشاء قائمة السنوات (السنة الحالية + 20 سنة)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear + i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* رقم البطاقة */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          رقم البطاقة <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 font-mono text-lg focus:border-transparent focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {cardType === 'visa' && (
              <div className="flex h-5 w-8 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
                VISA
              </div>
            )}
            {cardType === 'mastercard' && (
              <div className="flex h-5 w-8 items-center justify-center rounded bg-red-600 text-xs font-bold text-white">
                MC
              </div>
            )}
            {cardType === 'unknown' && <CreditCardIcon className="h-6 w-6 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* اسم حامل البطاقة */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          اسم حامل البطاقة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={cardData.cardHolderName}
          onChange={(e) =>
            setCardData((prev) => ({
              ...prev,
              cardHolderName: e.target.value.toUpperCase(),
            }))
          }
          placeholder="الاسم كما هو مكتوب على البطاقة"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase focus:border-transparent focus:ring-2 focus:ring-blue-500"
          required
          disabled={loading}
        />
      </div>

      {/* تاريخ الانتهاء و CVV */}
      <div className="grid grid-cols-3 gap-4">
        {/* شهر الانتهاء */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            الشهر <span className="text-red-500">*</span>
          </label>
          <select
            value={cardData.expiryMonth}
            onChange={(e) => setCardData((prev) => ({ ...prev, expiryMonth: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="">الشهر</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month.toString().padStart(2, '0')}>
                {month.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* سنة الانتهاء */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            السنة <span className="text-red-500">*</span>
          </label>
          <select
            value={cardData.expiryYear}
            onChange={(e) => setCardData((prev) => ({ ...prev, expiryYear: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="">السنة</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* CVV */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            CVV <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCvv ? 'text' : 'password'}
              value={cardData.cvv}
              onChange={(e) =>
                setCardData((prev) => ({
                  ...prev,
                  cvv: e.target.value.replace(/\D/g, ''),
                }))
              }
              placeholder="123"
              maxLength={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 text-center font-mono focus:border-transparent focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowCvv(!showCvv)}
              className="absolute inset-y-0 left-0 flex items-center pl-3"
            >
              {showCvv ? (
                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* حفظ البطاقة */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="saveCard"
          checked={cardData.saveCard}
          onChange={(e) => setCardData((prev) => ({ ...prev, saveCard: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={loading}
        />
        <label htmlFor="saveCard" className="mr-2 block text-sm text-gray-700">
          حفظ بيانات البطاقة للاستخدام المستقبلي (آمن ومشفر)
        </label>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* معلومات الأمان */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <svg
            className="ml-2 mt-0.5 h-5 w-5 text-blue-600"
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
          <div>
            <h4 className="mb-1 font-semibold text-blue-900">معلوماتك محمية</h4>
            <p className="text-sm text-blue-800">
              نستخدم تشفير SSL 256-bit وتقنية 3D Secure لحماية بيانات بطاقتك
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          </>
        ) : (
          <>
            <CreditCardIcon className="h-5 w-5" />
            تأكيد الدفع
          </>
        )}
      </button>
    </form>
  );
};

export default CreditCardForm;
