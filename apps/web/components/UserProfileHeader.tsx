import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import Link from 'next/link';
import React from 'react';
import AccountTypeBadgeNavbar from './AccountTypeBadgeNavbar';
import UserAvatar from './UserAvatar';
import { displayUserData } from '../utils/apiResponseHelper';

interface UserProfileHeaderProps {
  user: {
    id?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    phoneNumber?: string;
    profileImage?: string | null;
    accountType?: string;
  };
  onClose?: () => void;
  showTransportDashboard?: boolean;
  className?: string;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  onClose,
  showTransportDashboard = true,
  className = '',
}) => {
  // فك تشفير بيانات المستخدم للعرض
  const displayUser = displayUserData({
    id: user.id || '',
    name: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'مستخدم',
    phone: user.phone || user.phoneNumber || '',
    accountType: user.accountType || 'REGULAR_USER',
    profileImage: user.profileImage || null
  });
  
  // تحديد اسم المستخدم
  const displayName = displayUser.name;

  // تحديد رقم الهاتف
  const displayPhone = user.phone || user.phoneNumber;

  // تحديد معلومات نوع الحساب
  const getAccountTypeInfo = (accountType: string) => {
    switch (accountType) {
      case 'REGULAR_USER':
        return {
          label: 'مستخدم عادي',
          icon: UserIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
      case 'TRANSPORT_OWNER':
        return {
          label: 'صاحب ساحبة - نقل',
          icon: TruckIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'SHOWROOM':
        return {
          label: 'معرض سيارات',
          icon: BuildingStorefrontIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'COMPANY':
        return {
          label: 'شركة',
          icon: BuildingOfficeIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        };
      default:
        return {
          label: 'مستخدم عادي',
          icon: UserIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const accountInfo = getAccountTypeInfo(user.accountType || 'REGULAR_USER');

  return (
    <div className={className}>
      {/* معلومات المستخدم الرئيسية - قابل للنقر */}
      <Link
        href="/my-account"
        onClick={onClose}
        className="group block rounded-t-lg border-b bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 shadow-sm transition-all duration-300 hover:from-blue-50 hover:to-blue-100 hover:shadow-md"
      >
        {/* الصف الأول: صورة المستخدم والمعلومات الأساسية */}
        <div className="mb-2 flex items-center gap-2">
          {/* صورة المستخدم بإطار دائري بسيط */}
          <div className="relative">
            <UserAvatar
              src={user.profileImage}
              alt="صورة الملف الشخصي"
              size="sm"
              accountType={user.accountType}
              className="rounded-full"
            />
          </div>

          {/* معلومات المستخدم */}
          <div className="min-w-0 flex-1">
            {/* الاسم الكامل */}
            <h3 className="mb-0.5 truncate text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
              {displayName}
            </h3>

            {/* رقم الهاتف */}
            {displayPhone && (
              <div className="mb-1 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-3 w-3 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                  />
                </svg>
                <span className="text-xs font-medium text-gray-600">{displayPhone}</span>
              </div>
            )}

            {/* نوع الحساب مع أيقونة */}
            <div className="flex items-center gap-1">
              {React.createElement(accountInfo.icon, {
                className: `w-3 h-3 ${accountInfo.color}`,
              })}
              <span
                className={`text-xs font-medium ${
                  user.accountType === 'TRANSPORT_OWNER'
                    ? 'text-blue-700'
                    : user.accountType === 'COMPANY'
                      ? 'text-purple-700'
                      : user.accountType === 'SHOWROOM'
                        ? 'text-green-700'
                        : 'text-gray-700'
                }`}
              >
                {accountInfo.label}
              </span>
            </div>
          </div>

          {/* شارة نوع الحساب وسهم */}
          <div className="flex flex-shrink-0 flex-col items-center gap-1">
            <AccountTypeBadgeNavbar
              accountType={user.accountType}
              size="sm"
              showText={false}
              className="shadow-sm"
            />
            <ChevronDownIcon className="rotate-270 h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-blue-600" />
          </div>
        </div>

        {/* الصف الثاني: رابط عرض الملف الشخصي */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-1">
          <div className="flex items-center gap-1 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-3 w-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <span className="text-xs font-medium">الملف الشخصي</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-500 transition-colors duration-300 group-hover:text-blue-600">
            عرض التفاصيل
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="rtl-arrow h-3 w-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </span>
        </div>
      </Link>

      {/* رابط لوحة النقل للحسابات الخاصة */}
      {showTransportDashboard && user.accountType === 'TRANSPORT_OWNER' && (
        <Link
          href="/transport/dashboard"
          className="block border-b px-2 py-1 text-xs text-blue-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-800"
          onClick={onClose}
        >
          <div className="flex items-center gap-1">
            <TruckIcon className="h-3 w-3" />
            <span>لوحة النقل</span>
            <ChevronDownIcon className="rotate-270 h-3 w-3" />
          </div>
        </Link>
      )}

      {/* رابط لوحة تحكم الشركة */}
      {showTransportDashboard && user.accountType === 'COMPANY' && (
        <Link
          href="/company-dashboard"
          className="block border-b px-4 py-2 text-xs text-purple-600 transition-colors duration-200 hover:bg-purple-50 hover:text-purple-800"
          onClick={onClose}
        >
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-3 w-3" />
            <span>لوحة تحكم الشركة</span>
            <ChevronDownIcon className="rotate-270 h-3 w-3" />
          </div>
        </Link>
      )}

      {/* رابط لوحة المعرض */}
      {showTransportDashboard && user.accountType === 'SHOWROOM' && (
        <Link
          href="/showroom-dashboard"
          className="block border-b px-4 py-2 text-xs text-green-600 transition-colors duration-200 hover:bg-green-50 hover:text-green-800"
          onClick={onClose}
        >
          <div className="flex items-center gap-2">
            <BuildingStorefrontIcon className="h-3 w-3" />
            <span>لوحة تحكم المعرض</span>
            <ChevronDownIcon className="rotate-270 h-3 w-3" />
          </div>
        </Link>
      )}
    </div>
  );
};

export default UserProfileHeader;
