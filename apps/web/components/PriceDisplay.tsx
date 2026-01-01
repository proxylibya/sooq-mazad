import React from 'react';
import { formatNumber } from '../utils/numberUtils';

interface PriceDisplayProps {
  /** المبلغ المراد عرضه */
  amount: number | string;
  /** العملة (افتراضي: LYD) */
  currency?: string;
  /** رمز العملة (افتراضي: د.ل) */
  currencySymbol?: string;
  /** حجم النص */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /** لون النص */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'gray';
  /** إظهار العملة */
  showCurrency?: boolean;
  /** كلاسات CSS إضافية */
  className?: string;
  /** محاذاة النص */
  align?: 'left' | 'center' | 'right';
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  currency = 'LYD',
  currencySymbol = 'د.ل',
  size = 'medium',
  color = 'default',
  showCurrency = true,
  className = '',
  align = 'left',
}) => {
  // تحويل المبلغ إلى رقم
  const numericAmount = (() => {
    if (typeof amount === 'string') {
      const cleaned = amount.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  })();

  // تنسيق الرقم
  const formattedAmount = formatNumber(numericAmount);

  // أحجام النص
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
    xlarge: 'text-3xl',
  };

  // ألوان النص
  const colorClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    gray: 'text-gray-600',
  };

  // محاذاة النص
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // حجم العملة (أصغر من الرقم)
  const currencySize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg',
  };

  return (
    <div className={`price-display ${alignClasses[align]} ${className}`} dir="ltr">
      <span className={`price-value font-bold ${sizeClasses[size]} ${colorClasses[color]} `}>
        {formattedAmount}
        {showCurrency && (
          <>
            {' '}
            <span
              className={`currency-symbol font-medium ${currencySize[size]} ${colorClasses[color]} `}
            >
              {currencySymbol}
            </span>
          </>
        )}
      </span>
    </div>
  );
};

export default PriceDisplay;

// مكونات مساعدة للاستخدام السريع
export const SmallPrice: React.FC<{
  amount: number | string;
  className?: string;
  color?: PriceDisplayProps['color'];
}> = ({ amount, className = '', color = 'default' }) => (
  <PriceDisplay amount={amount} size="small" color={color} className={className} />
);

export const MediumPrice: React.FC<{
  amount: number | string;
  className?: string;
  color?: PriceDisplayProps['color'];
}> = ({ amount, className = '', color = 'default' }) => (
  <PriceDisplay amount={amount} size="medium" color={color} className={className} />
);

export const LargePrice: React.FC<{
  amount: number | string;
  className?: string;
  color?: PriceDisplayProps['color'];
}> = ({ amount, className = '', color = 'default' }) => (
  <PriceDisplay amount={amount} size="large" color={color} className={className} />
);

export const XLargePrice: React.FC<{
  amount: number | string;
  className?: string;
  color?: PriceDisplayProps['color'];
}> = ({ amount, className = '', color = 'default' }) => (
  <PriceDisplay amount={amount} size="xlarge" color={color} className={className} />
);

// مكونات للمزادات
export const AuctionPrice: React.FC<{
  amount: number | string;
  status: 'live' | 'upcoming' | 'ended';
  className?: string;
}> = ({ amount, status, className = '' }) => {
  const colorMap = {
    live: 'primary' as const,
    upcoming: 'warning' as const,
    ended: 'gray' as const,
  };

  return (
    <PriceDisplay amount={amount} size="xlarge" color={colorMap[status]} className={className} />
  );
};

// مكون للأسعار في البطاقات
export const CardPrice: React.FC<{
  amount: number | string;
  className?: string;
  color?: PriceDisplayProps['color'];
}> = ({ amount, className = '', color = 'success' }) => (
  <PriceDisplay amount={amount} size="large" color={color} className={className} />
);
