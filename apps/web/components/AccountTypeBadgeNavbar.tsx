import React from 'react';
import { getAccountTypeInfo, getAccountTypeShortText } from '../utils/accountTypeUtils';

interface AccountTypeBadgeNavbarProps {
  accountType: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
}

const AccountTypeBadgeNavbar: React.FC<AccountTypeBadgeNavbarProps> = ({
  accountType,
  size = 'sm',
  showText = true,
  showIcon = true,
  className = '',
}) => {
  // تحديد أحجام المكون
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          gap: 'gap-1',
        };
      case 'md':
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
          gap: 'gap-1.5',
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-5 h-5',
          gap: 'gap-2',
        };
      default:
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          gap: 'gap-1',
        };
    }
  };

  const accountInfo = getAccountTypeInfo(accountType);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = accountInfo.icon;

  // استخدام النص المختصر للشريط العلوي
  const displayText = getAccountTypeShortText(accountType);

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses.container} ${sizeClasses.gap} ${accountInfo.color} ${className} `}
    >
      {showIcon && <IconComponent className={`${sizeClasses.icon} ${accountInfo.iconColor}`} />}
      {showText && <span>{displayText}</span>}
    </span>
  );
};

export default AccountTypeBadgeNavbar;
