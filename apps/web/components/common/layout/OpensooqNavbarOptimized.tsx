/**
 * OpensooqNavbar المحسّن
 * تم تقسيمه وتحسينه للأداء العالي
 * محدث لاستخدام نظام إدارة المحتوى الجديد
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

// استيرادات ثابتة (صغيرة)
import useAuth from '../../../hooks/useAuth';
import { useFavorites } from '../../../hooks/useFavorites';
import { quickDecodeName } from '../../../utils/universalNameDecoder';
import ProjectLogo from '../ProjectLogo';

// نظام إدارة المحتوى - روابط ديناميكية
import { DesktopNavLinks } from './navbar/SmartNavLinks';

// استيرادات Icons
import {
  Bars3Icon,
  BellIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// التحميل الديناميكي للمكونات الثقيلة
const LoginModal = dynamic(() => import('../../auth/LoginModal'), {
  ssr: false,
});

const NavbarUserMenu = dynamic(() => import('./navbar/NavbarUserMenu'), {
  ssr: false,
});

const NavbarMobileMenu = dynamic(() => import('./navbar/NavbarMobileMenu'), {
  ssr: false,
});

// NotificationBadge مضمنة لتجنب الأخطاء
const NavbarNotificationBadge = ({ count }: { count?: number }) => {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
};

/**
 * روابط التنقل الرئيسية
 * تم استبدالها بـ DesktopNavLinks من نظام إدارة المحتوى
 */
const MainLinks = DesktopNavLinks;

/**
 * شريط البحث
 */
const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hidden max-w-xl flex-1 lg:flex">
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن سيارات، مزادات..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      </div>
    </form>
  );
};

/**
 * أيقونات المستخدم
 */
interface UserActionsProps {
  user: any;
  isLoadingAuth: boolean;
  favoritesCount: number;
  onLoginClick: () => void;
  onUserMenuToggle: () => void;
  showUserMenu: boolean;
}

const UserActions = React.memo(
  ({
    user,
    isLoadingAuth,
    favoritesCount,
    onLoginClick,
    onUserMenuToggle,
    showUserMenu,
  }: UserActionsProps) => {
    if (isLoadingAuth) {
      return (
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            تسجيل الدخول
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        {/* المفضلة */}
        <Link
          href="/favorites"
          className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
        >
          <HeartIcon className="h-6 w-6" />
          {favoritesCount > 0 && (
            <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {favoritesCount > 9 ? '9+' : favoritesCount}
            </span>
          )}
        </Link>

        {/* الإشعارات */}
        <Link
          href="/notifications"
          className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
        >
          <BellIcon className="h-6 w-6" />
          <NavbarNotificationBadge count={0} />
        </Link>

        {/* قائمة المستخدم */}
        <div className="relative">
          <button
            onClick={onUserMenuToggle}
            className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={quickDecodeName(user.name)}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-8 w-8 text-gray-700" />
            )}
          </button>

          {showUserMenu && (
            <NavbarUserMenu user={user} onLogout={() => {}} onClose={() => onUserMenuToggle()} />
          )}
        </div>
      </div>
    );
  },
);

UserActions.displayName = 'UserActions';

/**
 * المكون الرئيسي
 */
export default function OpensooqNavbarOptimized() {
  const router = useRouter();
  const { user, loading: isLoadingAuth, logout } = useAuth();
  const { favoritesCount } = useFavorites();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // البحث
  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  // الاستماع لأحداث المصادقة
  useEffect(() => {
    const handleOpenAuth = () => setShowAuthModal(true);
    const handleLoginSuccess = () => setShowAuthModal(false);

    window.addEventListener('openAuthModal', handleOpenAuth);
    window.addEventListener('loginSuccess', handleLoginSuccess as EventListener);

    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuth);
      window.removeEventListener('loginSuccess', handleLoginSuccess as EventListener);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <ProjectLogo />
            </Link>

            {/* الروابط الرئيسية */}
            <MainLinks />

            {/* البحث */}
            <SearchBar onSearch={handleSearch} />

            {/* أيقونات المستخدم */}
            <UserActions
              user={user}
              isLoadingAuth={isLoadingAuth}
              favoritesCount={favoritesCount}
              onLoginClick={() => setShowAuthModal(true)}
              onUserMenuToggle={() => setShowUserMenu(!showUserMenu)}
              showUserMenu={showUserMenu}
            />

            {/* قائمة الموبايل */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
              aria-label="القائمة"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal تسجيل الدخول */}
      {showAuthModal && (
        <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}

      {/* قائمة الموبايل */}
      <NavbarMobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
