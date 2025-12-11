import React, { ReactNode } from 'react';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';

interface EnhancedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
}) => {
  // تحديد أنماط الألوان حسب النوع
  const getVariantClasses = () => {
    const baseClasses =
      'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md`;
      case 'secondary':
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-sm hover:shadow-md`;
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm hover:shadow-md`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-sm hover:shadow-md`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md`;
      case 'info':
        return `${baseClasses} bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500 shadow-sm hover:shadow-md`;
      case 'outline':
        return `${baseClasses} bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 shadow-sm hover:shadow-md`;
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md`;
    }
  };

  // تحديد أحجام الزر
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2.5 py-1.5 text-xs rounded-md';
      case 'sm':
        return 'px-3 py-2 text-sm rounded-md';
      case 'md':
        return 'px-4 py-2.5 text-sm rounded-lg';
      case 'lg':
        return 'px-6 py-3 text-base rounded-lg';
      case 'xl':
        return 'px-8 py-4 text-lg rounded-xl';
      default:
        return 'px-4 py-2.5 text-sm rounded-lg';
    }
  };

  // تحديد حجم الأيقونة حسب حجم الزر
  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      case 'xl':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  // أنماط الحالة المعطلة
  const getDisabledClasses = () => {
    if (variant === 'outline') {
      return 'bg-gray-50 border-gray-300 text-gray-400 cursor-not-allowed';
    }
    return 'bg-gray-400 text-gray-200 cursor-not-allowed';
  };

  // دمج جميع الأنماط
  const buttonClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? getDisabledClasses() : getVariantClasses()}
    ${getSizeClasses()}
    ${className}
    flex items-center justify-center gap-2
    relative overflow-hidden
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={buttonClasses}>
      {/* أيقونة التحميل */}
      {loading && <ArrowPathIcon className={`${getIconSize()} animate-spin`} />}

      {/* الأيقونة اليسرى */}
      {!loading && icon && iconPosition === 'left' && <span className={getIconSize()}>{icon}</span>}

      {/* النص */}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>

      {/* الأيقونة اليمنى */}
      {!loading && icon && iconPosition === 'right' && (
        <span className={getIconSize()}>{icon}</span>
      )}
    </button>
  );
};

export default EnhancedButton;
