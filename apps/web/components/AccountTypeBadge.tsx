import React from 'react';
import { getAccountTypeInfo } from '../utils/accountTypeUtils';

interface AccountTypeBadgeProps {
  accountType: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

const AccountTypeBadge: React.FC<AccountTypeBadgeProps> = ({
  accountType,
  size = 'md',
  showIcon = true,
  showText = true,
  className = '',
}) => {
  // الحصول على أحجام المكون
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          gap: 'gap-1',
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-5 h-5',
          gap: 'gap-2',
        };
      default: // md
        return {
          container: 'px-3 py-1 text-sm',
          icon: 'w-4 h-4',
          gap: 'gap-1.5',
        };
    }
  };

  const accountInfo = getAccountTypeInfo(accountType);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = accountInfo.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${accountInfo.color} ${sizeClasses.container} ${sizeClasses.gap} ${className} `}
    >
      {showIcon && <IconComponent className={`${sizeClasses.icon} ${accountInfo.iconColor}`} />}
      {showText && accountInfo.text}
    </span>
  );
};

export default AccountTypeBadge;
