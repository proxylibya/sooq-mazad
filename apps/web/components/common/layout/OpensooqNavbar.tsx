/**
 * OpensooqNavbar - High Performance Version
 * محسن لتحمل مئات الآلاف من الزيارات
 *
 * التحسينات المطبقة:
 * - React.memo للمكونات الفرعية
 * - useCallback و useMemo لتجنب re-renders
 * - Dynamic imports للمكونات الثقيلة
 * - تقسيم الكود لتحسين Bundle Size
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

// استيراد Hook المحسن
import { useNavbarLogic } from './navbar/useNavbarLogic';

// استيراد المكونات الأساسية
import useSiteSections from '../../../hooks/useSiteSections';
import UserAvatar from '../../UserAvatar';
import { FavoritesBadge, MessagesBadge, NotificationsBadge } from '../../badges';
import AuthGuard from '../../features/auth/guards/AuthGuard';
import ProjectLogo from '../ProjectLogo';

// استيراد الأيقونات بشكل موحد (Tree Shaking Optimized)
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BuildingLibraryIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  HeartIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
  WalletIcon,
} from './navbar/NavbarIcons';

// تحميل LoginModal بشكل ديناميكي (Lazy Loading)
const LoginModal = dynamic(() => import('../../auth/LoginModal'), {
  ssr: false,
  loading: () => null,
});

// خيارات القائمة المنسدلة "المزيد" - خارج المكون لتجنب إعادة الإنشاء
const MORE_OPTIONS = [
  {
    title: 'حاسبة التمويل',
    link: '/financing-calculator',
    isMain: true,
    iconName: 'currency',
    description: 'احسب قسط سيارتك',
  },
  {
    title: 'التقييمات',
    link: '/reviews',
    isMain: true,
    iconName: 'star',
    description: 'تقييمات العملاء والخبراء',
  },
  {
    title: 'الشراكة',
    link: '/partnership',
    isMain: true,
    iconName: 'users',
    description: 'انضم كشريك معتمد',
  },
  {
    title: 'إحصائيات الشبكة',
    link: '/network-stats',
    isMain: true,
    iconName: 'chart',
    description: 'إحصائيات شبكتنا في ليبيا',
  },
  {
    title: 'تتبع الطلبات',
    link: '/track-application',
    isMain: true,
    iconName: 'clipboard',
    description: 'تتبع طلب الشراكة',
  },
  {
    title: 'مساعدة',
    link: '/help',
    isMain: true,
    iconName: 'question',
    description: 'الأسئلة الشائعة والدعم',
  },
  {
    title: 'من نحن',
    link: '/about',
    isMain: false,
    iconName: 'building',
    description: 'تعرف على قصتنا',
  },
  {
    title: 'اتصل بنا',
    link: '/contact',
    isMain: false,
    iconName: 'phone',
    description: 'تواصل معنا',
  },
  {
    title: 'الشروط والأحكام',
    link: '/terms',
    isMain: false,
    iconName: 'document',
    description: 'شروط الاستخدام',
  },
  {
    title: 'سياسة الخصوصية',
    link: '/privacy',
    isMain: false,
    iconName: 'lock',
    description: 'حماية بياناتك',
  },
] as const;

// دالة للحصول على الأيقونة حسب الاسم
const getIcon = (name: string, size: 'sm' | 'md' = 'md') => {
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  switch (name) {
    case 'currency':
      return <CurrencyDollarIcon className={cls} />;
    case 'star':
      return <StarIcon className={cls} />;
    case 'users':
      return <UserGroupIcon className={cls} />;
    case 'chart':
      return <ChartBarIcon className={cls} />;
    case 'clipboard':
      return <ClipboardDocumentListIcon className={cls} />;
    case 'question':
      return <QuestionMarkCircleIcon className={cls} />;
    case 'building':
      return <BuildingLibraryIcon className={cls} />;
    case 'phone':
      return <PhoneIcon className={cls} />;
    case 'document':
      return <DocumentTextIcon className={cls} />;
    case 'lock':
      return <LockClosedIcon className={cls} />;
    default:
      return <StarIcon className={cls} />;
  }
};

// مكون Navbar الرئيسي - High Performance
const OpensooqNavbar = memo(function OpensooqNavbarComponent() {
  // استخدام Hook المحسن للمنطق
  const {
    isMenuOpen,
    setIsMenuOpen,
    activeDropdown,
    setActiveDropdown,
    showUserMenu,
    setShowUserMenu,
    showAuthModal,
    setShowAuthModal,
    searchQuery,
    setSearchQuery,
    userMenuRef,
    user,
    setUser,
    router,
    isTransportOwner,
    isShowroom,
    isCompany,
    safeNavigate,
    handleSignOut,
    isActivePath,
  } = useNavbarLogic();

  // استخدام hook إعدادات الأقسام
  const { isVisible } = useSiteSections();

  interface BrandingSettings {
    logoType: 'text' | 'image';
    logoImageUrl: string;
    siteName: string;
    siteDescription: string;
    showLogoInNavbar: boolean;
    showSiteNameInNavbar: boolean;
  }

  const [branding, setBranding] = useState<BrandingSettings>({
    logoType: 'text',
    logoImageUrl: '',
    siteName: 'سوق المزاد',
    siteDescription: 'منصة المزادات الأولى في ليبيا',
    showLogoInNavbar: true,
    showSiteNameInNavbar: true,
  });

  useEffect(() => {
    let cancelled = false;
    const loadBranding = async () => {
      try {
        const res = await fetch('/api/site-branding');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.settings) {
          setBranding((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      } catch {
      }
    };
    loadBranding();
    return () => {
      cancelled = true;
    };
  }, []);

  // دالة البحث - محسنة بـ useCallback
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        safeNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, safeNavigate],
  );

  // moreOptions with icons - محسن بـ useMemo
  const moreOptions = useMemo(
    () =>
      MORE_OPTIONS.map((opt) => ({
        ...opt,
        icon: getIcon(opt.iconName, opt.isMain ? 'md' : 'sm'),
      })),
    [],
  );

  return (
    <nav className="sticky top-0 z-[9999] border-b bg-white shadow-sm" dir="rtl">
      {/* Top Bar */}
      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              {/* عرض المحفظة المفصل - فقط للمستخدمين المسجلين - متجاوب بالكامل */}
              {user && (
                <Link
                  href="/wallet"
                  className="wallet-display-responsive navbar-transition flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
                  title="انقر لفتح المحفظة"
                >
                  {/* عرض كامل للشاشات الكبيرة (lg+) */}
                  <div className="wallet-full-display hidden items-center gap-3 lg:flex">
                    <span className="wallet-label text-base font-medium text-gray-800">
                      المحفظة
                    </span>
                    <div className="flex items-center gap-1.5 rounded-md border border-green-200 bg-gradient-to-r from-green-50 to-green-100 px-3 py-1.5 shadow-md transition-all duration-200 hover:shadow-lg">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                        <WalletIcon className="h-4 w-4 text-green-600" />
                      </span>
                      <span className="whitespace-nowrap text-sm font-semibold text-green-800">
                        0 دينار
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 shadow-md transition-all duration-200 hover:shadow-lg">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                        <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                      </span>
                      <span className="whitespace-nowrap text-sm font-semibold text-blue-800">
                        0 دولار
                      </span>
                    </div>
                  </div>

                  {/* عرض متوسط للتابلت (md-lg) */}
                  <div className="wallet-medium-display hidden items-center gap-2 md:flex lg:hidden">
                    <span className="wallet-label text-sm font-medium text-gray-800">المحفظة</span>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 rounded border border-green-200 bg-gradient-to-r from-green-50 to-green-100 px-2 py-1 shadow-md transition-all duration-200 hover:shadow-lg">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                          <WalletIcon className="h-3 w-3 text-green-600" />
                        </span>
                        <span className="text-xs font-semibold text-green-800">0</span>
                      </div>
                      <div className="flex items-center gap-1 rounded border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 shadow-md transition-all duration-200 hover:shadow-lg">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                          <CurrencyDollarIcon className="h-3 w-3 text-blue-600" />
                        </span>
                        <span className="text-xs font-semibold text-blue-800">0</span>
                      </div>
                    </div>
                  </div>

                  {/* عرض مصغر للموبايل (sm-md) - أيقونة واحدة فقط */}
                  <div className="wallet-mobile-display flex items-center gap-1.5 md:hidden">
                    <WalletIcon className="h-5 w-5 text-gray-700" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-green-700">0</span>
                      <span className="text-[10px] text-gray-500">/</span>
                      <span className="text-xs font-semibold text-blue-700">0</span>
                    </div>
                  </div>
                </Link>
              )}

              {/* حقل البحث في الشريط العلوي - متجاوب */}
              <div className="ml-6 hidden md:flex">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن سيارة، موديل، أو ماركة..."
                      className="search-field-responsive w-48 rounded-lg border border-gray-300 bg-white py-1.5 pl-10 pr-4 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 lg:w-72 xl:w-80"
                    />
                    <button
                      type="submit"
                      className="absolute left-2 top-1/2 -translate-y-1/2 transform rounded p-1 text-gray-400 transition-colors hover:text-blue-600"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* أيقونات المفضلة والرسائل والإشعارات واتصل بنا - متجاوبة */}
              <div className="header-icons header-icons-lg relative z-[100] flex items-center gap-2">
                {/* فاصل */}
                <div className="navbar-separator hidden h-4 w-px bg-gray-300 md:block"></div>

                {/* أيقونة المفضلة */}
                <button
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      safeNavigate('/favorites');
                    }
                  }}
                  className="icon-button-responsive navbar-transition relative flex rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="المفضلة"
                >
                  <HeartIcon className="h-5 w-5 md:h-6 md:w-6" />
                  {/* عداد المفضلة المحسن */}
                  <FavoritesBadge size="lg" position="top-right" />
                </button>

                {/* أيقونة الرسائل */}
                <button
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      safeNavigate('/messages');
                    }
                  }}
                  className="icon-button-responsive navbar-transition relative flex rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="الرسائل"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
                  {/* عداد الرسائل غير المقروءة المحسن */}
                  <MessagesBadge size="lg" position="top-left" />
                </button>

                {/* أيقونة الإشعارات */}
                <button
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      safeNavigate('/notifications');
                    }
                  }}
                  className="icon-button-responsive navbar-transition relative flex rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="الإشعارات"
                >
                  <BellIcon className="h-5 w-5 md:h-6 md:w-6" />
                  {/* عداد الإشعارات الجديدة المحسن */}
                  <NotificationsBadge size="lg" position="top-left" />
                </button>

                {/* فاصل */}
                <div className="navbar-separator h-4 w-px bg-gray-300"></div>

                {/* أيقونة اتصل بنا */}
                <Link
                  href="/advertising-contact"
                  className="icon-button-responsive navbar-transition relative flex items-center gap-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="اتصل بنا"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5 md:h-6 md:w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                  <span className="hidden min-[800px]:inline">اتصل بنا</span>
                </Link>
              </div>

              {/* فاصل */}
              <div className="navbar-separator h-4 w-px bg-gray-300"></div>

              {/* عرض بيانات المستخدم أو روابط تسجيل الدخول */}
              <AuthGuard
                fallback={
                  // المستخدم غير مسجل دخول - عرض زر تسجيل الدخول - متجاوب
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="login-button-responsive navbar-transition flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="login-full-text hidden sm:inline">
                      تسجيل الدخول أو إنشاء حساب
                    </span>
                    <span className="login-short-text sm:hidden">دخول</span>
                  </button>
                }
              >
                {/* المستخدم مسجل دخول */}
                <div className="relative z-[100001]" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 text-gray-700 transition-colors hover:text-blue-600"
                  >
                    {/* صورة المستخدم مع تصميم محسن */}
                    <div className="relative flex-shrink-0">
                      <UserAvatar
                        src={user?.profileImage || undefined}
                        alt="صورة الملف الشخصي"
                        size="sm"
                        accountType={user?.accountType}
                      />
                      {/* أيقونة نوع الحساب للحسابات الخاصة */}
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

                  {/* قائمة المستخدم المنسدلة - تصميم متقدم ونظيف - responsive */}
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
                            {/* صورة الحساب */}
                            <div className="relative">
                              <UserAvatar
                                src={user?.profileImage || undefined}
                                alt="صورة الملف الشخصي"
                                size="lg"
                                accountType={user?.accountType}
                              />
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"></div>
                            </div>

                            {/* معلومات الحساب */}
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-base font-bold text-white">
                                {user?.name || 'مستخدم'}
                              </h3>
                              <p className="text-xs text-blue-100">{user?.phone || user?.email}</p>
                              {/* نوع الحساب */}
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
                            </div>

                            <ChevronLeftIcon className="h-4 w-4 text-white/80 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>

                        {/* الخيارات */}
                        <div className="p-2">
                          {/* لوحة التحكم للمعارض */}
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

                          {/* لوحة النقل للناقلين */}
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

                          {/* زر تسجيل الخروج */}
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
              </AuthGuard>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex items-center justify-between ${isTransportOwner ? 'h-auto min-h-16 py-3' : 'h-16'}`}
        >
          {/* زر القائمة والشعار للجوال - في الجانب الأيمن */}
          <div className="mobile-navbar-container flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`rounded-lg p-2 transition-all duration-200 ${
                isMenuOpen
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
              aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              <svg
                className={`h-6 w-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {isMenuOpen ? (
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>

            {/* الشعار للجوال */}
            <div className="mobile-logo-container">
              {branding.showLogoInNavbar || branding.showSiteNameInNavbar ? (
                <ProjectLogo
                  size="md"
                  showText={branding.showSiteNameInNavbar}
                  forceTextOnly={!branding.showLogoInNavbar && branding.showSiteNameInNavbar}
                  linkTo="/"
                />
              ) : null}
            </div>
          </div>

          {/* Logo للشاشات الكبيرة */}
          <div className="hidden items-center gap-8 lg:flex">
            {branding.showLogoInNavbar || branding.showSiteNameInNavbar ? (
              <ProjectLogo
                size="md"
                showText={branding.showSiteNameInNavbar}
                forceTextOnly={!branding.showLogoInNavbar && branding.showSiteNameInNavbar}
                linkTo="/"
              />
            ) : null}

            {/* Main Navigation Links - تستخدم إعدادات الأقسام من قاعدة البيانات */}
            <div className="hidden items-center gap-1 lg:flex">
              {isVisible('auctions', 'navbar') && (
                <Link
                  href="/auctions"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/auctions')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  سوق المزاد
                </Link>
              )}
              {isVisible('marketplace', 'navbar') && (
                <Link
                  href="/marketplace"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/marketplace')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  سوق الفوري
                </Link>
              )}
              {isVisible('transport', 'navbar') && (
                <Link
                  href="/transport"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/transport')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  خدمات النقل
                </Link>
              )}
              {isVisible('showrooms', 'navbar') && (
                <Link
                  href="/showrooms"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/showrooms')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  المعارض
                </Link>
              )}
              {isVisible('companies', 'navbar') && (
                <Link
                  href="/companies"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/companies')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  الشركات
                </Link>
              )}
              {isVisible('yards', 'navbar') && (
                <Link
                  href="/yards"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/yards')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  الساحات
                </Link>
              )}
              {user?.accountType === 'SHOWROOM' && (
                <Link
                  href="/showroom/dashboard"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/showroom/dashboard')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  لوحة المعرض
                </Link>
              )}
              {user?.accountType === 'TRANSPORT_OWNER' && (
                <Link
                  href="/transport/dashboard"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/transport/dashboard')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  لوحة التحكم
                </Link>
              )}
              {user?.accountType === 'COMPANY' && (
                <Link
                  href="/company/dashboard"
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActivePath('/company/dashboard')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  لوحة التحكم
                </Link>
              )}
              {/* المزيد - قائمة منسدلة */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('more')}
                onMouseLeave={(e) => {
                  // تأخير إخفاء القائمة للسماح بالانتقال السلس
                  const currentTarget = e.currentTarget;
                  setTimeout(() => {
                    // التحقق من أن الماوس لم يعد إلى المنطقة
                    if (currentTarget && !currentTarget.matches(':hover')) {
                      setActiveDropdown(null);
                    }
                  }, 150);
                }}
              >
                <button className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600">
                  <span>المزيد</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'more' ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* منطقة انتقالية غير مرئية لتحسين تجربة المستخدم */}
                {activeDropdown === 'more' && (
                  <div
                    className="absolute right-0 top-full h-2 w-80"
                    style={{ marginTop: '-2px' }}
                  />
                )}

                {/* Dropdown Menu - محسّن */}
                {activeDropdown === 'more' && (
                  <div
                    className="navbar-dropdown-container absolute right-0 top-full z-[9999] w-96 rounded-xl border border-gray-100 bg-white shadow-lg"
                    onMouseEnter={() => setActiveDropdown('more')}
                    onMouseLeave={(e) => {
                      // تأخير إخفاء القائمة للسماح بالانتقال السلس
                      const currentTarget = e.currentTarget;
                      setTimeout(() => {
                        // التحقق من أن الماوس لم يعد إلى المنطقة
                        if (
                          currentTarget &&
                          !currentTarget.matches(':hover') &&
                          !currentTarget.parentElement?.matches(':hover')
                        ) {
                          setActiveDropdown(null);
                        }
                      }, 100);
                    }}
                    style={{
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      backdropFilter: 'blur(8px)',
                      marginTop: '8px', // مسافة من الزر
                      maxHeight: 'calc(100vh - 120px)', // مسافة من أسفل الشاشة
                    }}
                  >
                    <div
                      className="navbar-more-dropdown overflow-y-auto"
                      style={{ maxHeight: 'calc(100vh - 140px)' }}
                    >
                      <div className="p-5">
                        {/* الخدمات الرئيسية */}
                        <div className="mb-5">
                          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            الخدمات الرئيسية
                          </h3>
                          <div className="space-y-1.5">
                            {moreOptions
                              .filter((option) => option.isMain)
                              .map((option) => (
                                <Link
                                  key={option.title}
                                  href={option.link}
                                  className="group flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-blue-50 hover:shadow-sm"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm">
                                    {option.icon || <StarIcon className="h-5 w-5" />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                                      {option.title}
                                    </div>
                                    <div className="mt-0.5 truncate text-xs leading-relaxed text-gray-500">
                                      {option.description}
                                    </div>
                                  </div>
                                  <ChevronLeftIcon className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                </Link>
                              ))}
                          </div>
                        </div>

                        {/* فاصل */}
                        <div className="my-4 border-t border-gray-200"></div>

                        {/* معلومات إضافية */}
                        <div>
                          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            معلومات إضافية
                          </h3>
                          <div className="space-y-1">
                            {moreOptions
                              .filter((option) => !option.isMain)
                              .map((option) => (
                                <Link
                                  key={option.title}
                                  href={option.link}
                                  className="group flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-gray-50"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                    {getIcon(option.iconName, 'sm')}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                      {option.title}
                                    </div>
                                  </div>
                                  <ChevronLeftIcon className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                </Link>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`header-icons relative z-[100] flex items-center gap-3 ${isTransportOwner ? 'transport-navbar-buttons' : ''}`}
          >
            {/* زر إضافة إعلان - برتقالي */}
            <button
              onClick={() => {
                safeNavigate('/add-listing');
              }}
              className="navbar-transition flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-orange-600 hover:shadow-md"
              title="إضافة إعلان جديد"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="full-text">إضافة إعلان</span>
              <span className="short-text">إعلان +</span>
            </button>

            {/* أزرار المعرض - للحسابات من نوع SHOWROOM فقط */}
            {isShowroom && (
              <>
                {/* زر إنشاء معرض */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    safeNavigate('/showroom/create');
                  }}
                  className="navbar-transition flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md"
                  title="إنشاء معرض جديد"
                >
                  <BuildingStorefrontIcon className="h-4 w-4" />
                  <span className="full-text">إنشاء معرض</span>
                  <span className="short-text">معرض +</span>
                </button>
              </>
            )}

            {/* زر إضافة خدمة نقل - للحسابات من نوع TRANSPORT_OWNER فقط */}
            {isTransportOwner && (
              <button
                onClick={() => {
                  safeNavigate('/transport/add-service');
                }}
                className="navbar-transition flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                title="إضافة خدمة نقل جديدة"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="full-text">إضافة خدمة نقل</span>
                <span className="short-text">خدمة نقل +</span>
              </button>
            )}

            {/* زر إنشاء صفحة شركة - للحسابات من نوع COMPANY فقط */}
            {user?.accountType === 'COMPANY' && (
              <button
                onClick={() => {
                  safeNavigate('/company/create');
                }}
                className="navbar-transition flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md"
                title="إنشاء صفحة شركة"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="full-text">إنشاء صفحة شركة</span>
                <span className="short-text">شركة +</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - تصميم احترافي نظيف */}
      {isMenuOpen && (
        <div className="mobile-menu-container max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-gray-200 bg-white shadow-xl lg:hidden">
          <div className="p-4">
            {/* قسم التنقل الرئيسي */}
            <nav className="space-y-1">
              {/* الرئيسية */}
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isActivePath('/') && router.pathname === '/'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isActivePath('/') && router.pathname === '/' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">الرئيسية</span>
              </Link>

              {/* المزاد */}
              {isVisible('auctions', 'mobileMenu') && (
                <Link
                  href="/auctions"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActivePath('/auctions')
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isActivePath('/auctions') ? 'bg-orange-100' : 'bg-gray-100'
                    }`}
                  >
                    <TrophyIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">المزادات</span>
                </Link>
              )}

              {/* السوق الفوري */}
              {isVisible('marketplace', 'mobileMenu') && (
                <Link
                  href="/marketplace"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActivePath('/marketplace')
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isActivePath('/marketplace') ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">السوق الفوري</span>
                </Link>
              )}

              {/* خدمات النقل */}
              {isVisible('transport', 'mobileMenu') && (
                <Link
                  href="/transport"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActivePath('/transport')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isActivePath('/transport') ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                  >
                    <TruckIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">خدمات النقل</span>
                </Link>
              )}

              {/* المعارض */}
              {isVisible('showrooms', 'mobileMenu') && (
                <Link
                  href="/showrooms"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActivePath('/showrooms')
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isActivePath('/showrooms') ? 'bg-purple-100' : 'bg-gray-100'
                    }`}
                  >
                    <BuildingStorefrontIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">المعارض</span>
                </Link>
              )}

              {/* الشركات */}
              {isVisible('companies', 'mobileMenu') && (
                <Link
                  href="/companies"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActivePath('/companies')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isActivePath('/companies') ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}
                  >
                    <BuildingOfficeIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">الشركات</span>
                </Link>
              )}
            </nav>

            {/* فاصل */}
            <div className="my-4 border-t border-gray-100" />

            {/* قسم المستخدم */}
            {user ? (
              <>
                {/* المحفظة */}
                <Link
                  href="/wallet"
                  onClick={() => setIsMenuOpen(false)}
                  className="mb-3 block rounded-xl bg-blue-600 p-4 text-white shadow-md transition-all hover:bg-blue-700"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <WalletIcon className="h-5 w-5" />
                    <span className="font-semibold">المحفظة</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1">
                      <span className="text-blue-100">دينار:</span>
                      <span className="font-bold">0</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1">
                      <span className="text-blue-100">دولار:</span>
                      <span className="font-bold">0</span>
                    </div>
                  </div>
                </Link>

                {/* الإجراءات السريعة */}
                <div className="mb-3 grid grid-cols-3 gap-2">
                  <Link
                    href="/favorites"
                    onClick={() => setIsMenuOpen(false)}
                    className="relative flex flex-col items-center gap-2 rounded-xl bg-gray-50 p-3 text-gray-700 transition-all hover:bg-gray-100"
                  >
                    <HeartIcon className="h-6 w-6" />
                    <span className="text-xs font-medium">المفضلة</span>
                    <FavoritesBadge size="sm" position="top-right" />
                  </Link>

                  <Link
                    href="/messages"
                    onClick={() => setIsMenuOpen(false)}
                    className="relative flex flex-col items-center gap-2 rounded-xl bg-gray-50 p-3 text-gray-700 transition-all hover:bg-gray-100"
                  >
                    <ChatBubbleLeftIcon className="h-6 w-6" />
                    <span className="text-xs font-medium">الرسائل</span>
                    <MessagesBadge size="sm" position="top-right" />
                  </Link>

                  <Link
                    href="/notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="relative flex flex-col items-center gap-2 rounded-xl bg-gray-50 p-3 text-gray-700 transition-all hover:bg-gray-100"
                  >
                    <BellIcon className="h-6 w-6" />
                    <span className="text-xs font-medium">الإشعارات</span>
                    <NotificationsBadge size="sm" position="top-right" />
                  </Link>
                </div>

                {/* روابط إضافية */}
                <div className="space-y-1">
                  <Link
                    href="/my-account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all hover:bg-gray-50"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">حسابي</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all hover:bg-gray-50"
                  >
                    <CogIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">الإعدادات</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all hover:bg-gray-50"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">اتصل بنا</span>
                  </Link>
                </div>

                {/* زر الخروج */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-red-600 transition-all hover:bg-red-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">تسجيل الخروج</span>
                  </button>
                </div>
              </>
            ) : (
              /* زر تسجيل الدخول للزوار */
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-white shadow-md transition-all hover:bg-blue-700"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="font-semibold">تسجيل الدخول</span>
                </button>

                {/* روابط للزوار */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-gray-700 transition-all hover:bg-gray-100"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">اتصل بنا</span>
                  </Link>

                  <Link
                    href="/help"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-gray-700 transition-all hover:bg-gray-100"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">المساعدة</span>
                  </Link>
                </div>
              </div>
            )}

            {/* مسافة إضافية في الأسفل */}
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
});

// تعيين اسم العرض للتصحيح
OpensooqNavbar.displayName = 'OpensooqNavbar';

export default OpensooqNavbar;
