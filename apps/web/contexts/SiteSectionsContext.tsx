/**
 * ============================================================
 * SiteSectionsContext - Compatibility Layer
 * ============================================================
 *
 * ⚠️ ملف توافقية - DEPRECATED
 *
 * هذا الملف موجود للتوافق مع الكود القديم فقط.
 * جميع الوظائف تعيد تصدير من النظام الموحد:
 * @see lib/content-visibility/ContentVisibilityContext.tsx
 *
 * للاستخدام الجديد، استورد مباشرة من:
 * import { useContentVisibility } from '@/lib/content-visibility/ContentVisibilityContext';
 *
 * @version 3.0.0 - Compatibility Layer
 * @deprecated Use ContentVisibilityContext directly
 */

// ============================================
// إعادة تصدير من النظام الموحد
// ============================================

export {
  ContentVisibilityContext as SiteSectionsContext,
  ContentVisibilityProvider as SiteSectionsProvider,
  // Context & Provider
  ContentVisibilityContext as default,
  // Main Hooks
  useContentVisibility,
  useElementVisibility,
  useFooterSections,
  useHomepageSections,
  useMobileSections,
  // Specialized Hooks
  useNavbarSections,
  useSection,
  useSectionVisibility,
  useSiteSections,
  type ContentVisibilityConfig,
  type SectionStatus,
  type SiteElement,
  // Types
  type SiteSection,
  type ContentVisibilityContextType as SiteSectionsContextType,
} from '../lib/content-visibility/ContentVisibilityContext';
