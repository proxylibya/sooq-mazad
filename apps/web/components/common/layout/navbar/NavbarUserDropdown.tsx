/**
 * NavbarUserDropdown - High Performance User Menu
 * قائمة المستخدم المنسدلة - محسنة للأداء العالي
 */

import Link from 'next/link';
import { memo, RefObject, useState } from 'react';
import UserAvatar from '../../../UserAvatar';
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CogIcon,
  SparklesIcon,
  TruckIcon,
  UserIcon,
  WalletIcon,
} from './NavbarIcons';

interface User {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  accountType?: 'REGULAR_USER' | 'TRANSPORT_OWNER' | 'SHOWROOM' | 'COMPANY';
}

interface NavbarUserDropdownProps {
  user: User | null;
  showUserMenu: boolean;
  setShowUserMenu: (value: boolean) => void;
  handleSignOut: () => Promise<void>;
  isTransportOwner: boolean;
  isShowroom: boolean;
  userMenuRef: RefObject<HTMLDivElement>;
}

const NavbarUserDropdown = memo(function NavbarUserDropdown({
  user,
  showUserMenu,
  setShowUserMenu,
  handleSignOut,
  isTransportOwner,
  isShowroom,
  userMenuRef,
}: NavbarUserDropdownProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <div className="relative z-[100001]" ref={userMenuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-3 text-gray-700 transition-colors hover:text-blue-600"
      >
        <div className="relative flex-shrink-0">
          <UserAvatar
            src={user?.profileImage || undefined}
            alt="صورة الملف الشخصي"
            size="sm"
            accountType={user?.accountType}
          />
          {user?.accountType === 'TRANSPORT_OWNER' && (
            <div className="absolute -bottom-1 -right-1 flex-shrink-0 rounded-full border-2 border-white bg-blue-600 p-1 shadow-sm">
              <TruckIcon className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span className="font-medium">{user?.name || 'مستخدم'}</span>
        </div>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {showUserMenu && (
        <>
          {/* Overlay للشاشات الصغيرة */}
          <div
            className="fixed inset-0 z-[99999] bg-black/50 sm:hidden"
            onClick={() => setShowUserMenu(false)}
          />

          <div
            className="user-profile-dropdown fixed left-4 right-4 top-20 z-[100000] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:left-0 sm:right-auto sm:top-auto sm:mt-2 sm:max-h-[600px] sm:w-80 md:w-96"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس الملف الشخصي */}
            <Link
              href="/my-account"
              onClick={() => setShowUserMenu(false)}
              className="group block bg-gradient-to-br from-blue-500 to-blue-600 p-5 transition-all hover:from-blue-600 hover:to-blue-700"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <UserAvatar
                    src={user?.profileImage || undefined}
                    alt="صورة الملف الشخصي"
                    size="lg"
                    accountType={user?.accountType}
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"></div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-white">
                    {user?.name || 'مستخدم'}
                  </h3>
                  <p className="text-xs text-blue-100">{user?.phone || user?.email}</p>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {user?.accountType === 'SHOWROOM' && (
                      <>
                        <BuildingStorefrontIcon className="h-3 w-3" />
                        <span>معرض</span>
                      </>
                    )}
                    {user?.accountType === 'COMPANY' && (
                      <>
                        <BuildingOfficeIcon className="h-3 w-3" />
                        <span>شركة</span>
                      </>
                    )}
                    {user?.accountType === 'TRANSPORT_OWNER' && (
                      <>
                        <TruckIcon className="h-3 w-3" />
                        <span>نقل</span>
                      </>
                    )}
                    {user?.accountType === 'REGULAR_USER' && (
                      <>
                        <UserIcon className="h-3 w-3" />
                        <span>مستخدم</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20">
                      <span className="text-[10px] font-medium text-blue-100">ID:</span>
                      <span
                        className="font-mono text-xs font-bold tracking-wider text-white"
                        dir="ltr"
                      >
                        {user?.id
                          ? user.id.length > 12
                            ? user.id.substring(0, 12) + '...'
                            : user.id
                          : '---'}
                      </span>
                      <button
                        onClick={handleCopyId}
                        className={`ml-1 rounded p-0.5 transition-all ${
                          copySuccess
                            ? 'bg-green-400/20 text-green-300'
                            : 'text-blue-200 hover:text-white'
                        }`}
                        title={copySuccess ? 'تم النسخ' : 'نسخ رقم الحساب'}
                      >
                        {copySuccess ? (
                          <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" />
                        ) : (
                          <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <ChevronLeftIcon className="h-4 w-4 text-white/80 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* الخيارات */}
            <div className="p-2">
              {isShowroom && (
                <Link
                  href="/showroom/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setShowUserMenu(false)}
                >
                  <ChartBarSquareIcon className="h-5 w-5" />
                  <span>لوحة التحكم</span>
                </Link>
              )}

              {isTransportOwner && (
                <Link
                  href="/transport/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setShowUserMenu(false)}
                >
                  <TruckIcon className="h-5 w-5" />
                  <span>لوحة النقل</span>
                </Link>
              )}

              <Link
                href="/wallet"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setShowUserMenu(false)}
              >
                <WalletIcon className="h-5 w-5" />
                <span>المحفظة</span>
              </Link>

              <Link
                href="/notifications"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setShowUserMenu(false)}
              >
                <BellIcon className="h-5 w-5" />
                <span>الإشعارات</span>
              </Link>

              <Link
                href="/my-account?tab=listings"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setShowUserMenu(false)}
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>إعلاناتي</span>
              </Link>

              <Link
                href="/promotions"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-600 transition-all hover:bg-amber-50"
                onClick={() => setShowUserMenu(false)}
              >
                <SparklesIcon className="h-5 w-5" />
                <span>ترويج الإعلانات</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-600">
                  جديد
                </span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setShowUserMenu(false)}
              >
                <CogIcon className="h-5 w-5" />
                <span>الإعدادات</span>
              </Link>

              <hr className="my-2 border-gray-200" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

NavbarUserDropdown.displayName = 'NavbarUserDropdown';

export default NavbarUserDropdown;
