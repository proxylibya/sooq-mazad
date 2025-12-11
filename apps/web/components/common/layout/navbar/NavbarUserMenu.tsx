/**
 * قائمة المستخدم المنسدلة في Navbar
 * تم فصلها لتحسين Code Splitting
 */

import {
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  HomeIcon,
  TruckIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { forwardRef } from 'react';
import { quickDecodeName } from '../../../../utils/universalNameDecoder';
import UserAvatar from '../../../UserAvatar';

interface NavbarUserMenuProps {
  user: any;
  onLogout: () => void;
  onClose: () => void;
}

const NavbarUserMenu = forwardRef<HTMLDivElement, NavbarUserMenuProps>(
  ({ user, onLogout, onClose }, ref) => {
    const menuItems = [
      { href: '/', icon: HomeIcon, label: 'الصفحة الرئيسية' },
      { href: '/profile', icon: HeartIcon, label: 'حسابي' },
      { href: '/my-ads', icon: ClipboardDocumentListIcon, label: 'إعلاناتي' },
      { href: '/wallet', icon: WalletIcon, label: 'المحفظة' },
      { href: '/messages', icon: ChatBubbleLeftIcon, label: 'الرسائل' },
    ];

    // إضافة عناصر حسب نوع الحساب
    if (user?.accountType === 'COMPANY') {
      menuItems.push({
        href: '/company/dashboard',
        icon: BuildingOfficeIcon,
        label: 'لوحة الشركة',
      });
    }

    if (user?.accountType === 'SHOWROOM') {
      menuItems.push({
        href: '/showroom/dashboard',
        icon: BuildingStorefrontIcon,
        label: 'لوحة المعرض',
      });
    }

    if (user?.accountType === 'TRANSPORT_OWNER') {
      menuItems.push({
        href: '/transport/dashboard',
        icon: TruckIcon,
        label: 'خدمات النقل',
      });
    }

    return (
      <div
        ref={ref}
        className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
      >
        {/* معلومات المستخدم */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <UserAvatar src={user?.profileImage} alt={user?.name || 'المستخدم'} size="md" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-semibold text-gray-900">{quickDecodeName(user?.name)}</p>
              <p className="truncate text-sm text-gray-500">{user?.phone || user?.email}</p>
            </div>
          </div>
        </div>

        {/* القائمة */}
        <div className="py-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* تسجيل الخروج */}
        <div className="border-t border-gray-200 pt-2">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    );
  },
);

NavbarUserMenu.displayName = 'NavbarUserMenu';

export default NavbarUserMenu;
