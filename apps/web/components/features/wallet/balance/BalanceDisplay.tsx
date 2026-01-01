import React from 'react';

interface BalanceDisplayProps {
  balance: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'success' | 'info' | 'warning';
  showIcon?: boolean;
  className?: string;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  label = 'الرصيد',
  size = 'medium',
  variant = 'default',
  showIcon = true,
  className = '',
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl',
  };

  const variantClasses = {
    default: 'bg-gray-50 border-gray-200 text-gray-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  const iconColors = {
    default: 'text-gray-600',
    success: 'text-green-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <svg
          className={`h-4 w-4 ${iconColors[variant]}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      )}
      <span className="whitespace-nowrap font-medium">
        {label}: {balance.toLocaleString('ar-LY')} د.ل
      </span>
    </div>
  );
};

export default BalanceDisplay;
