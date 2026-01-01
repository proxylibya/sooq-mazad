import React from 'react';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';

interface UserAccountIconProps {
  accountType: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

const UserAccountIcon: React.FC<UserAccountIconProps> = ({
  accountType,
  size = 'md',
  className = '',
  showBadge = true,
}) => {
  // الحصول على معلومات نوع الحساب
  const getAccountTypeInfo = (type: string) => {
    switch (type) {
      case 'REGULAR_USER':
        return {
          icon: UserIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          badgeColor: 'bg-gray-500',
        };
      case 'TRANSPORT_OWNER':
        return {
          icon: TruckIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          badgeColor: 'bg-blue-500',
        };
      case 'COMPANY':
        return {
          icon: BuildingOfficeIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          badgeColor: 'bg-green-500',
        };
      case 'SHOWROOM':
        return {
          icon: BuildingStorefrontIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          badgeColor: 'bg-purple-500',
        };
      default:
        return {
          icon: UserIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          badgeColor: 'bg-gray-500',
        };
    }
  };

  // الحصول على أحجام المكون
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-8 h-8',
          icon: 'w-4 h-4',
          badge: 'w-3 h-3 -top-1 -right-1',
        };
      case 'lg':
        return {
          container: 'w-12 h-12',
          icon: 'w-6 h-6',
          badge: 'w-4 h-4 -top-1 -right-1',
        };
      case 'xl':
        return {
          container: 'w-16 h-16',
          icon: 'w-8 h-8',
          badge: 'w-5 h-5 -top-1 -right-1',
        };
      default: // md
        return {
          container: 'w-10 h-10',
          icon: 'w-5 h-5',
          badge: 'w-3.5 h-3.5 -top-1 -right-1',
        };
    }
  };

  const accountInfo = getAccountTypeInfo(accountType);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = accountInfo.icon;

  return (
    <div className={`relative ${className}`}>
      {/* الأيقونة الرئيسية */}
      <div
        className={` ${sizeClasses.container} ${accountInfo.bgColor} flex items-center justify-center rounded-full transition-colors`}
      >
        <IconComponent className={`${sizeClasses.icon} ${accountInfo.color}`} />
      </div>

      {/* علامة نوع الحساب */}
      {showBadge && accountType !== 'REGULAR_USER' && (
        <div
          className={`absolute ${sizeClasses.badge} ${accountInfo.badgeColor} rounded-full border-2 border-white shadow-sm`}
          title={
            accountType === 'TRANSPORT_OWNER'
              ? 'خدمة نقل - ساحبة'
              : accountType === 'COMPANY'
                ? 'شركة'
                : accountType === 'SHOWROOM'
                  ? 'معرض'
                  : ''
          }
        />
      )}
    </div>
  );
};

export default UserAccountIcon;
