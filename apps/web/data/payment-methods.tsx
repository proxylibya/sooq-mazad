import React from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  logo?: string;
  category: 'local' | 'international' | 'wallet' | 'bank';
  isActive: boolean;
  minAmount?: number;
  maxAmount?: number;
}

// وسائل الدفع المحلية الليبية
export const libyanPaymentMethods: PaymentMethod[] = [
  {
    id: 'libyana',
    name: 'Libyana Card',
    nameAr: 'كروت ليبيانا',
    icon: (
      <img
        src="/images/payment-logos/libyana-logo-circular.svg"
        alt="ليبيانا"
        className="h-6 w-6 rounded-full object-contain"
      />
    ),
    description: 'ادفع باستخدام كرت ليبيانا',
    processingTime: 'فوري',
    fees: 'بدون رسوم',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    logo: '/images/payment-logos/libyana-logo-circular.svg',
    category: 'local',
    isActive: true,
    minAmount: 10,
    maxAmount: 5000,
  },
  {
    id: 'madar',
    name: 'Al-Madar Card',
    nameAr: 'كروت مدار',
    icon: (
      <img
        src="/images/payment-logos/almadar-logo-circular.svg"
        alt="مدار"
        className="h-6 w-6 rounded-full object-contain"
      />
    ),
    description: 'ادفع باستخدام كرت مدار',
    processingTime: 'فوري',
    fees: 'بدون رسوم',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    logo: '/images/payment-logos/almadar-logo-circular.svg',
    category: 'local',
    isActive: true,
    minAmount: 10,
    maxAmount: 5000,
  },
];

// وسائل الدفع الدولية
export const internationalPaymentMethods: PaymentMethod[] = [
  {
    id: 'visa',
    name: 'Visa Card',
    nameAr: 'بطاقة فيزا',
    icon: <CreditCardIcon className="h-6 w-6 text-blue-600" />,
    description: 'ادفع باستخدام بطاقة فيزا العالمية',
    processingTime: 'فوري',
    fees: '3% + 10 د.ل',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    category: 'international',
    isActive: true,
    minAmount: 50,
    maxAmount: 10000,
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    nameAr: 'بطاقة ماستركارد',
    icon: <CreditCardIcon className="h-6 w-6 text-orange-600" />,
    description: 'ادفع باستخدام بطاقة ماستركارد',
    processingTime: 'فوري',
    fees: '3% + 10 د.ل',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    category: 'international',
    isActive: true,
    minAmount: 50,
    maxAmount: 10000,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameAr: 'باي بال',
    icon: <ShieldCheckIcon className="h-6 w-6 text-blue-600" />,
    description: 'ادفع باستخدام حساب باي بال الآمن',
    processingTime: 'فوري',
    fees: '3.5% + 15 د.ل',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    category: 'international',
    isActive: true,
    minAmount: 25,
    maxAmount: 15000,
  },
];

// محفظة النظام
export const walletPaymentMethods: PaymentMethod[] = [
  {
    id: 'wallet',
    name: 'Wallet Balance',
    nameAr: 'رصيد المحفظة',
    icon: <CurrencyDollarIcon className="h-6 w-6 text-green-600" />,
    description: 'استخدم رصيد محفظتك الإلكترونية',
    processingTime: 'فوري',
    fees: 'بدون رسوم',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    category: 'wallet',
    isActive: true,
    minAmount: 1,
    maxAmount: 50000,
  },
];

// البنوك الليبية
export const libyanBankMethods: PaymentMethod[] = [
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    nameAr: 'تحويل بنكي',
    icon: <BuildingLibraryIcon className="h-6 w-6 text-gray-600" />,
    description: 'تحويل من حسابك البنكي',
    processingTime: '1-3 أيام عمل',
    fees: '2% + 5 د.ل',
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700',
    category: 'bank',
    isActive: true,
    minAmount: 100,
    maxAmount: 25000,
  },
];

// جميع وسائل الدفع
export const allPaymentMethods: PaymentMethod[] = [
  ...libyanPaymentMethods,
  ...walletPaymentMethods,
  ...internationalPaymentMethods,
  ...libyanBankMethods,
];

// دوال مساعدة
export const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
  return allPaymentMethods.find((method) => method.id === id);
};

export const getPaymentMethodsByCategory = (
  category: PaymentMethod['category'],
): PaymentMethod[] => {
  return allPaymentMethods.filter((method) => method.category === category && method.isActive);
};

export const getActivePaymentMethods = (): PaymentMethod[] => {
  return allPaymentMethods.filter((method) => method.isActive);
};

export const getLocalPaymentMethods = (): PaymentMethod[] => {
  return [...libyanPaymentMethods, ...walletPaymentMethods].filter((method) => method.isActive);
};

export const getInternationalPaymentMethods = (): PaymentMethod[] => {
  return internationalPaymentMethods.filter((method) => method.isActive);
};

// تحقق من صحة المبلغ لوسيلة دفع معينة
export const validateAmountForPaymentMethod = (
  methodId: string,
  amount: number,
): {
  isValid: boolean;
  error?: string;
} => {
  const method = getPaymentMethodById(methodId);

  if (!method) {
    return { isValid: false, error: 'وسيلة الدفع غير موجودة' };
  }

  if (method.minAmount && amount < method.minAmount) {
    return {
      isValid: false,
      error: `الحد الأدنى للمبلغ هو ${method.minAmount} د.ل`,
    };
  }

  if (method.maxAmount && amount > method.maxAmount) {
    return {
      isValid: false,
      error: `الحد الأقصى للمبلغ هو ${method.maxAmount} د.ل`,
    };
  }

  return { isValid: true };
};

// حساب الرسوم
export const calculateFees = (methodId: string, amount: number): number => {
  const method = getPaymentMethodById(methodId);

  if (!method || method.fees === 'بدون رسوم') {
    return 0;
  }

  // تحليل نص الرسوم وحساب القيمة
  const feesText = method.fees;

  if (feesText.includes('%')) {
    const percentMatch = feesText.match(/(\d+(?:\.\d+)?)%/);
    const fixedMatch = feesText.match(/(\d+(?:\.\d+)?)\s*د\.ل/);

    let totalFees = 0;

    if (percentMatch) {
      const percentage = parseFloat(percentMatch[1]);
      totalFees += (amount * percentage) / 100;
    }

    if (fixedMatch) {
      const fixedFee = parseFloat(fixedMatch[1]);
      totalFees += fixedFee;
    }

    return totalFees;
  }

  return 0;
};

export default allPaymentMethods;
