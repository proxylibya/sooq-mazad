import React, { useState, useEffect } from 'react';
import { CreditCardIcon, DevicePhoneMobileIcon, BanknotesIcon } from '@heroicons/react/24/outline';

interface PaymentGateway {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  description: string;
  fees: string;
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies: string[];
  processingTime: string;
  features: string[];
}

interface PaymentGatewaySelectorProps {
  amount: number;
  currency: string;
  onGatewaySelect: (gateway: string) => void;
  onPaymentInitiate: (gatewayId: string, paymentData: any) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  amount,
  currency,
  onGatewaySelect,
  onPaymentInitiate,
  loading = false,
  disabled = false,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [availableGateways, setAvailableGateways] = useState<PaymentGateway[]>([]);

  // بوابات الدفع المتاحة
  const paymentGateways: PaymentGateway[] = [
    {
      id: 'MOYASAR',
      name: 'Moyasar',
      nameAr: 'ميسار',
      icon: <CreditCardIcon className="h-6 w-6" />,
      description: 'دفع بالفيزا والماستركارد ومدى',
      fees: '2.9% + 1 ريال',
      minAmount: 1,
      maxAmount: 100000,
      supportedCurrencies: ['SAR', 'USD', 'AED'],
      processingTime: 'فوري',
      features: ['آمن ومشفر', 'دعم جميع البنوك', 'استرداد فوري'],
    },
    {
      id: 'STC_PAY',
      name: 'STCPay',
      nameAr: 'STC باي',
      icon: <DevicePhoneMobileIcon className="h-6 w-6" />,
      description: 'دفع عبر محفظة STC الرقمية',
      fees: '2.5%',
      minAmount: 1,
      maxAmount: 50000,
      supportedCurrencies: ['SAR'],
      processingTime: 'فوري',
      features: ['بدون بطاقة مصرفية', 'دفع بالجوال', 'سريع وآمن'],
    },
    {
      id: 'TABBY',
      name: 'Tabby',
      nameAr: 'تابي',
      icon: <BanknotesIcon className="h-6 w-6" />,
      description: 'ادفع على 4 دفعات بدون فوائد',
      fees: 'مجاني للمستخدم',
      minAmount: 3,
      maxAmount: 20000,
      supportedCurrencies: ['SAR', 'AED', 'KWD'],
      processingTime: 'فوري',
      features: ['تقسيط بدون فوائد', 'موافقة فورية', 'لا توجد رسوم إضافية'],
    },
  ];

  // فلترة البوابات المتاحة بناءً على المبلغ والعملة
  useEffect(() => {
    const filtered = paymentGateways.filter((gateway) => {
      const meetsMinAmount = !gateway.minAmount || amount >= gateway.minAmount;
      const meetsMaxAmount = !gateway.maxAmount || amount <= gateway.maxAmount;
      const supportsCurrency = gateway.supportedCurrencies.includes(currency);

      return meetsMinAmount && meetsMaxAmount && supportsCurrency;
    });

    setAvailableGateways(filtered);

    // اختيار أول بوابة متاحة تلقائياً
    if (filtered.length > 0 && !selectedGateway) {
      setSelectedGateway(filtered[0].id);
      onGatewaySelect(filtered[0].id);
    }
  }, [amount, currency, selectedGateway, onGatewaySelect]);

  const handleGatewaySelect = (gatewayId: string) => {
    setSelectedGateway(gatewayId);
    onGatewaySelect(gatewayId);
  };

  const handlePaymentClick = async () => {
    if (!selectedGateway) return;

    const selectedGatewayData = availableGateways.find((g) => g.id === selectedGateway);

    await onPaymentInitiate(selectedGateway, {
      gateway: selectedGateway,
      amount,
      currency,
    });
  };

  if (availableGateways.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 text-gray-500">لا توجد بوابات دفع متاحة للمبلغ المحدد</div>
        <div className="text-sm text-gray-400">
          المبلغ: {amount} {currency}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">اختر طريقة الدفع</h3>

      {/* عرض المبلغ */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">المبلغ المطلوب:</span>
          <span className="text-xl font-bold text-blue-600">
            {amount.toLocaleString('ar-SA')} {currency}
          </span>
        </div>
      </div>

      {/* قائمة بوابات الدفع */}
      <div className="space-y-3">
        {availableGateways.map((gateway) => (
          <div
            key={gateway.id}
            className={`cursor-pointer rounded-lg border p-4 transition-all ${
              selectedGateway === gateway.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleGatewaySelect(gateway.id)}
          >
            <div className="flex items-start space-x-4 space-x-reverse">
              <div
                className={`rounded-lg p-2 ${
                  selectedGateway === gateway.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                {gateway.icon}
              </div>

              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{gateway.nameAr}</h4>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={selectedGateway === gateway.id}
                      onChange={() => handleGatewaySelect(gateway.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <p className="mb-2 text-sm text-gray-600">{gateway.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>الرسوم: {gateway.fees}</span>
                  <span>المعالجة: {gateway.processingTime}</span>
                </div>

                {/* الميزات */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {gateway.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* معلومات إضافية */}
      {selectedGateway && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h5 className="mb-2 font-medium text-gray-900">معلومات مهمة:</h5>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• جميع المعاملات مشفرة وآمنة</li>
            <li>• ستتلقى تأكيد الدفع فور إتمام العملية</li>
            <li>• يمكنك طلب استرداد المبلغ خلال 24 ساعة</li>
            {selectedGateway === 'TABBY' && <li>• سيتم تقسيم المبلغ على 4 دفعات متساوية</li>}
          </ul>
        </div>
      )}

      {/* زر الدفع */}
      <button
        onClick={handlePaymentClick}
        disabled={!selectedGateway || loading || disabled}
        className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
          !selectedGateway || loading || disabled
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="ml-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            جاري المعالجة...
          </div>
        ) : (
          `ادفع ${amount.toLocaleString('ar-SA')} ${currency}`
        )}
      </button>

      {/* تحذير الأمان */}
      <div className="text-center text-xs text-gray-500">
        <div className="mb-1 flex items-center justify-center">
          <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          دفع آمن ومشفر
        </div>
        <p>نحن لا نحفظ أو نشارك بياناتك المصرفية مع أي طرف ثالث</p>
      </div>
    </div>
  );
};
