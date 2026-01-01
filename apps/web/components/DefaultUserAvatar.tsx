import React from 'react';

interface DefaultUserAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  accountType?: string;
}

const DefaultUserAvatar: React.FC<DefaultUserAvatarProps> = ({
  size = 'md',
  className = '',
  accountType = 'REGULAR_USER',
}) => {
  // تحديد أحجام الصورة
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  // تحديد أحجام النص
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  // تحديد الألوان حسب نوع الحساب
  const getAccountColors = (type: string) => {
    switch (type) {
      case 'TRANSPORT_OWNER':
        return {
          gradient: 'from-blue-50 via-blue-100 to-blue-150',
          text: 'text-blue-600',
          border: 'border-blue-200',
          shadow: 'shadow-blue-100',
        };
      case 'COMPANY':
        return {
          gradient: 'from-green-50 via-green-100 to-green-150',
          text: 'text-green-600',
          border: 'border-green-200',
          shadow: 'shadow-green-100',
        };
      case 'SHOWROOM':
        return {
          gradient: 'from-purple-50 via-purple-100 to-purple-150',
          text: 'text-purple-600',
          border: 'border-purple-200',
          shadow: 'shadow-purple-100',
        };
      default:
        return {
          gradient: 'from-slate-50 via-slate-100 to-slate-150',
          text: 'text-slate-600',
          border: 'border-slate-200',
          shadow: 'shadow-slate-100',
        };
    }
  };

  const colors = getAccountColors(accountType);

  return (
    <div
      className={` ${sizeClasses[size]} bg-gradient-to-br ${colors.gradient} flex items-center justify-center rounded-full ${className} `}
    >
      {/* أيقونة المستخدم الافتراضية بسيطة */}
      <div className={`${colors.text}`}>
        <svg className={`${sizeClasses[size]}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    </div>
  );
};

export default DefaultUserAvatar;
