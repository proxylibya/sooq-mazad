import React, { useState } from 'react';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import useAuth from '../../../../hooks/useAuth';

interface CardTopupFormProps {
  cardType: 'libyana' | 'madar';
  onSuccess?: (amount: number) => void;
  onError?: (error: string) => void;
}

const CardTopupForm: React.FC<CardTopupFormProps> = ({ cardType, onSuccess, onError }) => {
  const { user } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const cardInfo = {
    libyana: {
      name: 'ليبيانا',
      color: 'purple',
      placeholder: 'أدخل رقم كارت ليبيانا (14 رقم)',
      pattern: /^\d{12,16}$/,
      icon: DevicePhoneMobileIcon,
      logo: '/images/payment/logo-libyana.jpg',
      apiEndpoint: '/api/wallet/topup/libyana',
    },
    madar: {
      name: 'المدار',
      color: 'green',
      placeholder: 'أدخل رقم كارت المدار (16 رقم)',
      pattern: /^\d{12,16}$/,
      icon: DevicePhoneMobileIcon,
      logo: '/images/payment/logo-almadar.png',
      apiEndpoint: '/api/wallet/topup/madar',
    },
  };

  const currentCard = cardInfo[cardType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!user) {
      const errorMsg = 'يجب تسجيل الدخول أولاً';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // التحقق من صحة رقم الكارت
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!currentCard.pattern.test(cleanCardNumber)) {
      const errorMsg = `رقم كارت ${currentCard.name} غير صحيح`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(currentCard.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          cardNumber: cleanCardNumber,
          provider: cardType.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'فشل في معالجة الكرت');
      }

      if (data.success) {
        setSuccess(true);
        setCardNumber('');
        onSuccess?.(data.data.amount);
      } else {
        throw new Error(data.error || 'فشل في تعبئة الكرت');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // إزالة جميع الأحرف غير الرقمية
    const numbers = value.replace(/\D/g, '');

    // تحديد الحد الأقصى للأرقام
    const maxLength = cardType === 'libyana' ? 14 : 16;
    const truncated = numbers.slice(0, maxLength);

    // تنسيق الأرقام بمسافات
    if (cardType === 'libyana') {
      // تنسيق ليبيانا: XXXX XXXX XXXXXX
      return truncated.replace(/(\d{4})(\d{4})(\d{0,6})/, '$1 $2 $3').trim();
    } else {
      // تنسيق المدار: XXXX XXXX XXXX XXXX
      return truncated.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setError('');
    setSuccess(false);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <img
            src={currentCard.logo}
            alt={`شعار ${currentCard.name}`}
            className="h-8 w-8 object-contain"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">تعبئة كارت {currentCard.name}</h2>
          <p className="text-gray-600">أدخل رقم الكارت لتعبئة رصيدك</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">تم تعبئة الرصيد بنجاح!</p>
              <p className="text-sm text-green-700">تم إضافة المبلغ إلى محفظتك</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">خطأ في التعبئة</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="cardNumber" className="mb-2 block text-sm font-medium text-gray-700">
            رقم الكارت
          </label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder={currentCard.placeholder}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-lg focus:border-transparent focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            dir="ltr"
          />
          <p className="mt-2 text-sm text-gray-500">
            {cardType === 'libyana' ? 'مثال: 1234 5678 901234' : 'مثال: 1234 5678 9012 3456'}
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !cardNumber.trim()}
          className={`w-full rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 ${
            isLoading || !cardNumber.trim()
              ? 'cursor-not-allowed bg-gray-400'
              : `bg-${currentCard.color}-600 hover:bg-${currentCard.color}-700 hover:shadow-lg`
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
              <span>جاري التعبئة...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5" />
              <span>تعبئة الرصيد</span>
            </div>
          )}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-900">معلومات مهمة:</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• تأكد من صحة رقم الكارت قبل التعبئة</li>
          <li>• لا يتطلب رقم سري - فقط رقم الكارت</li>
          <li>• سيتم إضافة الرصيد فوراً بعد التأكيد</li>
          <li>• الحد الأدنى للايداع هو 50 دينار</li>
          <li>• كل كارت يستخدم مرة واحدة فقط</li>
          <li>• في حالة وجود مشكلة، تواصل مع الدعم الفني</li>
        </ul>
      </div>
    </div>
  );
};

export default CardTopupForm;
