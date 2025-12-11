import React from 'react';
import Link from 'next/link';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import UserAvatar from './UserAvatar';
import AccountTypeBadgeNavbar from './AccountTypeBadgeNavbar';
import { displayUserData } from '../utils/apiResponseHelper';

interface User {
  id?: string;
  name?: string;
  phone?: string;
  profileImage?: string | null;
  accountType?: string;
}

interface UserDropdownProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

interface MenuItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
}

const ImprovedUserDropdown: React.FC<UserDropdownProps> = ({ user, onClose, onLogout }) => {
  // فك تشفير بيانات المستخدم للعرض
  const displayUser = displayUserData({
    id: user.id || '',
    name: user.name || 'مستخدم',
    phone: user.phone || '',
    accountType: user.accountType || 'REGULAR_USER',
    profileImage: user.profileImage || null
  });
  
  // قائمة العناصر الرئيسية
  const menuItems: MenuItem[] = [
    {
      href: '/my-account',
      label: 'حسابي',
      icon: UserIcon,
    },
    {
      href: '/my-account?tab=listings',
      label: 'إعلاناتي',
      icon: DocumentTextIcon,
    },
    {
      href: '/wallet',
      label: 'المحفظة',
      icon: WalletIcon,
    },
    {
      href: '/notifications',
      label: 'الإشعارات',
      icon: BellIcon,
    },
    {
      href: '/settings',
      label: 'الإعدادات',
      icon: CogIcon,
    },
  ];

  const handleItemClick = () => {
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="user-profile-dropdown absolute left-0 z-[10000] mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
      {/* رأس الملف الشخصي */}
      <div className="rounded-t-lg border-b bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2">
        <Link
          href="/my-account"
          onClick={handleItemClick}
          className="group block transition-all duration-300 hover:from-blue-50 hover:to-blue-100"
        >
          <div className="flex items-center gap-3">
            {/* صورة المستخدم */}
            <div className="relative">
              <UserAvatar
                src={user.profileImage || undefined}
                alt="صورة الملف الشخصي"
                size="sm"
                className="h-10 w-10 rounded-full"
              />
            </div>

            {/* معلومات المستخدم */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
                {displayUser.name || 'مستخدم'}
              </h3>

              {/* رقم الهاتف */}
              {user.phone && (
                <div className="mt-1 flex items-center gap-1">
                  <PhoneIcon className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600" dir="ltr">{user.phone}</span>
                </div>
              )}

              {/* نوع الحساب */}
              <div className="mt-1 flex items-center gap-1">
                <AccountTypeBadgeNavbar accountType={user.accountType || 'REGULAR_USER'} size="xs" showIcon={true} />
              </div>
            </div>

            {/* سهم التنقل */}
            <ChevronLeftIcon className="h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-blue-600" />
          </div>
        </Link>
      </div>

      {/* قائمة العناصر */}
      <div className="py-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href || '#'}
            onClick={item.onClick || handleItemClick}
            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-blue-600"
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* خط فاصل */}
      <hr className="my-2 border-gray-200" />

      {/* زر تسجيل الخروج */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-right text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">تسجيل الخروج</span>
      </button>
    </div>
  );
};

export default ImprovedUserDropdown;
