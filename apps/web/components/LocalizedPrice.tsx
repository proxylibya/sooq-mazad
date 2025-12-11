/**
 * مكون عرض السعر مع التحويل التلقائي حسب البلد
 */

import React from 'react';
import { usePriceFormatter, useLocalization } from '../contexts/SimpleLocalizationContext';

interface LocalizedPriceProps {
  amount: number | string;
  originalCurrency?: string;
  showCurrency?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showOriginal?: boolean; // عرض السعر الأصلي أيضاً
}

const LocalizedPrice: React.FC<LocalizedPriceProps> = ({
  amount,
  originalCurrency = 'LYD',
  showCurrency = true,
  className = '',
  size = 'medium',
  showOriginal = false,
}) => {
  const { formatPrice, convertPrice } = usePriceFormatter();
  const { country } = useLocalization();

  // تحويل النص إلى رقم مع التحقق من الصحة
  const numericAmount = (() => {
    try {
      if (typeof amount === 'string') {
        const cleaned = amount.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      }
      return typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    } catch (error) {
      console.error('خطأ في تحويل المبلغ:', error);
      return 0;
    }
  })();

  // تحويل السعر إلى العملة الحالية
  const convertedAmount = (() => {
    try {
      if (country && originalCurrency !== country.currency) {
        return convertPrice(numericAmount);
      }
      return numericAmount;
    } catch (error) {
      console.error('خطأ في تحويل العملة:', error);
      return numericAmount;
    }
  })();

  // تنسيق السعر
  const formattedPrice = (() => {
    try {
      return formatPrice(convertedAmount, showCurrency);
    } catch (error) {
      console.error('خطأ في تنسيق السعر:', error);
      return showCurrency
        ? `${convertedAmount} ${country?.currencySymbol || 'د.ل'}`
        : convertedAmount.toString();
    }
  })();

  const formattedOriginal = (() => {
    try {
      if (country && originalCurrency !== country.currency) {
        return `${numericAmount.toLocaleString('en-US')} ${originalCurrency}`;
      }
      return null;
    } catch (error) {
      console.error('خطأ في تنسيق السعر الأصلي:', error);
      return null;
    }
  })();

  // أحجام النص
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg font-semibold',
  };

  return (
    <div className={`price-container ${className}`}>
      <span className={`price-value ${sizeClasses[size]} font-bold text-blue-600`}>
        {formattedPrice}
      </span>

      {showOriginal && formattedOriginal && (
        <div className="mt-1 text-xs text-gray-500">السعر الأصلي: {formattedOriginal}</div>
      )}
    </div>
  );
};

// مكون مبسط للأسعار السريعة
export const QuickPrice: React.FC<{
  amount: number | string;
  className?: string;
}> = ({ amount, className = '' }) => (
  <LocalizedPrice amount={amount} className={className} size="medium" showCurrency={true} />
);

// مكون للأسعار الكبيرة (في صفحات التفاصيل)
export const BigPrice: React.FC<{
  amount: number | string;
  originalCurrency?: string;
  className?: string;
}> = ({ amount, originalCurrency, className = '' }) => (
  <LocalizedPrice
    amount={amount}
    originalCurrency={originalCurrency}
    className={className}
    size="large"
    showCurrency={true}
    showOriginal={true}
  />
);

// مكون للأسعار الصغيرة (في القوائم)
export const SmallPrice: React.FC<{
  amount: number | string;
  className?: string;
}> = ({ amount, className = '' }) => (
  <LocalizedPrice amount={amount} className={className} size="small" showCurrency={true} />
);

export default LocalizedPrice;
