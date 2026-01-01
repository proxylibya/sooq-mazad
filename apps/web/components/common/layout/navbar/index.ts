/**
 * Navbar Components - High Performance
 * مكونات شريط التنقل المحسنة للأداء العالي
 *
 * تم تقسيم OpensooqNavbar.tsx إلى مكونات أصغر:
 * - تحسين الأداء وتقليل حجم الـ Bundle
 * - React.memo للمكونات الفرعية
 * - useCallback و useMemo لتجنب re-renders
 * - Dynamic imports للمكونات الثقيلة
 * - سهولة الصيانة والاختبار
 */

// Components
export { default as NavbarMobileMenu } from './NavbarMobileMenu';
export { NavbarSearchBar } from './NavbarSearchBar';
export { NavbarTopBar } from './NavbarTopBar';
export { default as NavbarUserDropdown } from './NavbarUserDropdown';

// Icons (centralized for tree shaking)
export * from './NavbarIcons';

// Hooks
export { useNavbarLogic } from './useNavbarLogic';

// Types
export * from './types';

