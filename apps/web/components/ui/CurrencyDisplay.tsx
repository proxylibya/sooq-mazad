import React from 'react';

interface CurrencyDisplayProps {
  amount: string | number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'gray' | 'amber' | 'orange' | 'white';
  variant?: 'standard' | 'compact';
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  size = 'md',
  color = 'blue',
  variant = 'standard',
  className = ''
}) => {
  // تنسيق المبلغ
  const formatAmount = (num: string | number): string => {
    const numStr = typeof num === 'string' ? num : num.toString();
    const cleanNum = numStr.replace(/[,\s]/g, '');
    const parsedNum = parseFloat(cleanNum);
    
    if (isNaN(parsedNum)) return '0';
    return parsedNum.toLocaleString('en-US');
  };

  // تحديد أحجام النصوص
  const getSizes = () => {
    switch (size) {
      case 'sm':
        return {
          amount: 'text-sm font-semibold',
          currency: 'text-xs font-medium px-1.5 py-0.5'
        };
      case 'md':
        return {
          amount: 'text-lg font-bold',
          currency: 'text-xs font-medium px-2 py-0.5'
        };
      case 'lg':
        return {
          amount: 'text-2xl font-bold',
          currency: 'text-sm font-medium px-2 py-0.5'
        };
      case 'xl':
        return {
          amount: 'text-4xl font-black',
          currency: 'text-lg font-bold px-3 py-1'
        };
      default:
        return {
          amount: 'text-lg font-bold',
          currency: 'text-xs font-medium px-2 py-0.5'
        };
    }
  };

  // تحديد ألوان العناصر
  const getColors = () => {
    switch (color) {
      case 'blue':
        return {
          amount: 'text-blue-700',
          currency: 'bg-blue-100 text-blue-600'
        };
      case 'green':
        return {
          amount: 'text-green-600',
          currency: 'bg-green-100 text-green-600'
        };
      case 'red':
        return {
          amount: 'text-red-600',
          currency: 'bg-red-100 text-red-600'
        };
      case 'gray':
        return {
          amount: 'text-gray-700',
          currency: 'bg-gray-100 text-gray-600'
        };
      case 'amber':
        return {
          amount: 'text-amber-700',
          currency: 'bg-amber-100 text-amber-600'
        };
      case 'orange':
        return {
          amount: 'text-orange-600',
          currency: 'bg-orange-100 text-orange-600'
        };
      case 'white':
        return {
          amount: 'text-white',
          currency: 'bg-white/20 text-white backdrop-blur-sm'
        };
      default:
        return {
          amount: 'text-blue-700',
          currency: 'bg-blue-100 text-blue-600'
        };
    }
  };

  const sizes = getSizes();
  const colors = getColors();

  if (variant === 'compact') {
    // شكل مضغوط للمساحات الصغيرة
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <span className={`${sizes.amount} ${colors.amount}`}>
          {formatAmount(amount)}
        </span>
        <span className={`${sizes.currency} rounded text-xs ${colors.currency}`}>
          د.ل
        </span>
      </div>
    );
  }

  // الشكل القياسي (الشكل الخامس)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`${sizes.amount} ${colors.amount}`}>
        {formatAmount(amount)}
      </span>
      <div className={`${sizes.currency} rounded-lg ${colors.currency}`}>
        {size === 'xl' ? 'د.ل' : 'دينار'}
      </div>
    </div>
  );
};

export default CurrencyDisplay;
