import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';
import { useFavorites } from '../../../../hooks/useFavorites';

/**
 * Custom Hook لمنطق الـ Navbar - High Performance
 * محسن لتحمل مئات الآلاف من الزيارات
 * 
 * التحسينات:
 * - useCallback لمنع إعادة إنشاء الدوال
 * - useMemo للقيم المحسوبة
 * - تقليل re-renders غير الضرورية
 */
export function useNavbarLogic() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('جميع المدن');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, loading: isLoadingAuth, logout, setUser } = useAuth();
  const router = useRouter();
  const { favoritesCount } = useFavorites();

  // دالة آمنة للتنقل - محسنة بـ useCallback
  const safeNavigate = useCallback((path: string) => {
    try {
      setTimeout(() => {
        router.push(path).catch(() => {
          window.location.href = path;
        });
      }, 100);
    } catch {
      window.location.href = path;
    }
  }, [router]);

  // دوال محسنة بـ useMemo لتجنب إعادة الحساب
  const isTransportOwner = useMemo(() => user?.accountType === 'TRANSPORT_OWNER', [user?.accountType]);
  const isShowroom = useMemo(() => user?.accountType === 'SHOWROOM', [user?.accountType]);
  const isCompany = useMemo(() => user?.accountType === 'COMPANY', [user?.accountType]);

  // اسم القسم الحالي
  const getSectionDisplayName = () => {
    try {
      const path = router.pathname || '';
      if (path.startsWith('/auctions')) return 'سوق المزاد';
      if (path.startsWith('/marketplace')) return 'Sooq Alfori';
      return 'المنصة';
    } catch {
      return 'المنصة';
    }
  };

  // دالة تسجيل الخروج - محسنة بـ useCallback
  const handleSignOut = useCallback(async () => {
    setShowUserMenu(false);
    await logout();
  }, [logout]);

  // دالة تغيير المدينة - محسنة بـ useCallback
  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);

      if (city === 'جميع المدن' || city === 'all') {
        searchParams.delete('city');
      } else {
        searchParams.set('city', city);
      }

      const newUrl = currentPath + (searchParams.toString() ? '?' + searchParams.toString() : '');
      window.history.pushState({}, '', newUrl);
      window.dispatchEvent(new CustomEvent('cityChanged', { detail: { city } }));
    }
  }, []);

  // دالة للتحقق من المسار النشط - محسنة بـ useCallback
  const isActivePath = useCallback((path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  }, [router.pathname]);

  // الاستماع للأحداث المخصصة
  useEffect(() => {
    const handleOpenAuthModal = () => setShowAuthModal(true);
    const handleLoginSuccess = () => setShowAuthModal(false);
    const handleUserUpdated = (event: CustomEvent) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('User updated event received', event.detail);
      }
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    window.addEventListener('loginSuccess', handleLoginSuccess as EventListener);
    window.addEventListener('userUpdated', handleUserUpdated as EventListener);

    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
      window.removeEventListener('loginSuccess', handleLoginSuccess as EventListener);
      window.removeEventListener('userUpdated', handleUserUpdated as EventListener);
    };
  }, []);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // إغلاق قائمة الموبايل عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isMenuOpen &&
        !target.closest('.mobile-menu-container') &&
        !target.closest('button[aria-label*="القائمة"]')
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isMenuOpen]);

  return {
    // State
    isMenuOpen,
    setIsMenuOpen,
    activeDropdown,
    setActiveDropdown,
    selectedCity,
    showUserMenu,
    setShowUserMenu,
    showAuthModal,
    setShowAuthModal,
    searchQuery,
    setSearchQuery,
    userMenuRef,
    // User data
    user,
    setUser,
    isLoadingAuth,
    favoritesCount,
    // Router
    router,
    // Computed values (memoized)
    isTransportOwner,
    isShowroom,
    isCompany,
    // Functions (callback optimized)
    safeNavigate,
    getSectionDisplayName,
    handleSignOut,
    handleCityChange,
    isActivePath,
  };
}
