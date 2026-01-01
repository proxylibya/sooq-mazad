/**
 * ============================================================
 * نظام إدارة المحتوى الموحد - Unified Content Visibility System
 * ============================================================
 *
 * النظام الرئيسي والوحيد للتحكم في إظهار/إخفاء أقسام وعناصر الموقع
 * يدعم SSR + Client-side مع تخزين مؤقت متقدم
 *
 * المميزات:
 * - نظام موحد بدون تكرار
 * - دعم كامل لـ SSR (Server Side Rendering)
 * - تخزين مؤقت ذكي
 * - لا يسبب infinite loops
 * - Hooks متخصصة لكل حالة استخدام
 *
 * @version 3.0.0 - Unified Edition
 * @author Sooq Mazad Team
 */

'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ContentVisibilityConfig, SectionStatus, SiteElement, SiteSection } from './index';
import {
  DEFAULT_ELEMENTS,
  DEFAULT_SECTIONS,
  isElementVisible as checkElementVisible,
  isSectionActive as checkSectionActive,
  isSectionVisible as checkSectionVisible,
  filterSections,
  getSection as findSection,
} from './index';

// ============================================
// Module-level State - حالة على مستوى الوحدة
// ============================================

// متغير عالمي لمنع الجلب المتكرر عبر جميع instances
let globalHasFetched = false;
let globalFetchPromise: Promise<void> | null = null;

// مفتاح التخزين المحلي
const STORAGE_KEY = 'sooq-mazad-content-visibility';
const STORAGE_VERSION = 'v2'; // تغيير هذا لإعادة تحميل الإعدادات

/**
 * إعادة تعيين حالة الجلب (للاختبارات فقط)
 */
export function resetFetchState(): void {
  globalHasFetched = false;
  globalFetchPromise = null;
}

/**
 * تحميل الإعدادات من localStorage
 * يُستخدم كحالة أولية لمنع الوميض
 */
function loadFromStorage(): { sections: SiteSection[]; elements: SiteElement[] } | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    // التحقق من صحة البيانات وإصدارها
    if (
      data.version === STORAGE_VERSION &&
      data.sections?.length > 0 &&
      Date.now() - data.timestamp < 24 * 60 * 60 * 1000 // صالح لمدة 24 ساعة
    ) {
      return { sections: data.sections, elements: data.elements || DEFAULT_ELEMENTS };
    }
  } catch {
    // تجاهل أخطاء التخزين
  }
  return null;
}

/**
 * حفظ الإعدادات في localStorage
 */
function saveToStorage(sections: SiteSection[], elements: SiteElement[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        sections,
        elements,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // تجاهل أخطاء التخزين
  }
}

/**
 * مسح الكاش المحلي - يُستدعى عند تحديث الإعدادات من لوحة التحكم
 * استخدم هذه الدالة لإجبار إعادة تحميل الإعدادات
 */
export function clearLocalStorageCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    globalHasFetched = false;
    globalFetchPromise = null;
  } catch {
    // تجاهل أخطاء التخزين
  }
}

// ============================================
// Context Types - أنواع البيانات
// ============================================

export interface ContentVisibilityContextType {
  // البيانات الأساسية
  sections: SiteSection[];
  elements: SiteElement[];
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  source: 'database' | 'cache' | 'default' | 'api';

  // دوال التحقق من الأقسام
  isSectionActive: (slug: string) => boolean;
  isSectionVisible: (
    slug: string,
    location: 'navbar' | 'mobile' | 'footer' | 'homepage' | 'button' | 'card',
  ) => boolean;
  getSectionStatus: (slug: string) => SectionStatus | null;
  getSectionMessage: (slug: string) => string | null;
  getSection: (slug: string) => SiteSection | null;

  // دوال التحقق من العناصر
  isElementVisible: (key: string) => boolean;
  isElementInteractive: (key: string) => boolean;
  getElement: (key: string) => SiteElement | null;

  // دوال الحصول على الأقسام المفلترة
  getNavbarSections: () => SiteSection[];
  getMobileSections: () => SiteSection[];
  getFooterSections: () => SiteSection[];
  getHomepageSections: () => SiteSection[];

  // تحديث البيانات
  refreshData: () => Promise<void>;
}

// ============================================
// Create Context
// ============================================

const ContentVisibilityContext = createContext<ContentVisibilityContextType | null>(null);

// تصدير الـ Context للاستخدام المباشر إذا لزم الأمر
export { ContentVisibilityContext };

// ============================================
// Provider Props
// ============================================

interface ContentVisibilityProviderProps {
  children: ReactNode;
  initialData?: ContentVisibilityConfig | null;
}

// ============================================
// Provider Component - المكون الرئيسي
// ============================================

export function ContentVisibilityProvider({
  children,
  initialData,
}: ContentVisibilityProviderProps) {
  // ===== تحميل البيانات المبدئية =====
  // الأولوية: initialData (SSR) > localStorage > DEFAULT_SECTIONS
  const getInitialState = (): {
    sections: SiteSection[];
    elements: SiteElement[];
    isReady: boolean;
    source: 'database' | 'cache' | 'default' | 'api';
  } => {
    // إذا كان هناك بيانات من SSR، استخدمها
    if (initialData?.sections && initialData.sections.length > 0) {
      return {
        sections: initialData.sections,
        elements: initialData.elements || DEFAULT_ELEMENTS,
        isReady: true, // جاهز فوراً
        source: (initialData.source as 'database' | 'cache' | 'default' | 'api') || 'database',
      };
    }

    // محاولة التحميل من localStorage
    const stored = loadFromStorage();
    if (stored) {
      return {
        sections: stored.sections,
        elements: stored.elements,
        isReady: true, // جاهز فوراً من الكاش
        source: 'cache',
      };
    }

    // استخدام البيانات الافتراضية - لكن غير جاهز!
    return {
      sections: DEFAULT_SECTIONS,
      elements: DEFAULT_ELEMENTS,
      isReady: false, // ⚠️ غير جاهز - انتظر الـ API
      source: 'default',
    };
  };

  const initial = getInitialState();

  // ===== State Management =====
  const [sections, setSections] = useState<SiteSection[]>(initial.sections);
  const [elements, setElements] = useState<SiteElement[]>(initial.elements);
  const [isReady, setIsReady] = useState(initial.isReady);
  const [isLoading, setIsLoading] = useState(!initial.isReady); // loading إذا لم يكن جاهز
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'cache' | 'default' | 'api'>(initial.source);

  // Ref لتتبع ما إذا كان هذا المكون قد بدأ الجلب
  const hasInitiatedFetch = useRef(false);

  // ===== Data Fetching =====
  const fetchData = useCallback(
    async (force = false): Promise<void> => {
      // تجنب الجلب المتكرر (إلا إذا كان force)
      if (!force && globalHasFetched) {
        // إذا كانت البيانات موجودة بالفعل، اجعلها جاهزة
        setIsReady(true);
        setIsLoading(false);
        return;
      }
      if (globalFetchPromise) return globalFetchPromise;

      // إنشاء promise جديد
      globalFetchPromise = (async () => {
        try {
          globalHasFetched = true;
          setIsLoading(true);
          setError(null);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch('/api/site-sections', {
            headers: {
              'Cache-Control': 'no-cache',
              Accept: 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            const newSections = data.sections?.length > 0 ? data.sections : sections;
            const newElements = data.elements?.length > 0 ? data.elements : elements;

            setSections(newSections);
            setElements(newElements);
            setSource(data.source || 'api');

            // حفظ في localStorage للتحميل السريع في المرة القادمة
            saveToStorage(newSections, newElements);
          }
        } catch (err) {
          // البيانات الافتراضية موجودة، لا حاجة لعرض خطأ
          if (err instanceof Error && err.name !== 'AbortError') {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
          setIsReady(true); // ✅ الآن جاهز - سواء نجح الجلب أم لا
          globalFetchPromise = null;
        }
      })();

      return globalFetchPromise;
    },
    [sections, elements],
  );

  // ===== Initial Fetch Effect =====
  useEffect(() => {
    // جلب البيانات مرة واحدة فقط عند التحميل الأول
    if (!hasInitiatedFetch.current && !globalHasFetched) {
      hasInitiatedFetch.current = true;

      // إذا كانت البيانات من SSR أو localStorage، اجعلها جاهزة فوراً
      if (initial.isReady) {
        setIsReady(true);
        setIsLoading(false);
      }

      // دائماً حاول جلب البيانات الجديدة في الخلفية
      fetchData();
    }
  }, [fetchData, initial.isReady]);

  // ===== Memoized Section Helpers =====
  const isSectionActive = useCallback(
    (slug: string): boolean => checkSectionActive(sections, slug),
    [sections],
  );

  const isSectionVisible = useCallback(
    (
      slug: string,
      location: 'navbar' | 'mobile' | 'footer' | 'homepage' | 'button' | 'card',
    ): boolean => checkSectionVisible(sections, slug, location),
    [sections],
  );

  const getSectionStatus = useCallback(
    (slug: string): SectionStatus | null => {
      const section = sections.find((s) => s.slug === slug);
      return section?.status || null;
    },
    [sections],
  );

  const getSectionMessage = useCallback(
    (slug: string): string | null => {
      const section = sections.find((s) => s.slug === slug);
      return section?.message || null;
    },
    [sections],
  );

  const getSection = useCallback(
    (slug: string): SiteSection | null => findSection(sections, slug),
    [sections],
  );

  // ===== Memoized Element Helpers =====
  const isElementVisible = useCallback(
    (key: string): boolean => checkElementVisible(elements, key),
    [elements],
  );

  const isElementInteractive = useCallback(
    (key: string): boolean => {
      const element = elements.find((e) => e.key === key);
      return element?.isInteractive ?? true;
    },
    [elements],
  );

  const getElement = useCallback(
    (key: string): SiteElement | null => {
      return elements.find((e) => e.key === key) || null;
    },
    [elements],
  );

  // ===== Memoized Filtered Sections =====
  const getNavbarSections = useCallback(() => filterSections(sections, 'navbar'), [sections]);

  const getMobileSections = useCallback(() => filterSections(sections, 'mobile'), [sections]);

  const getFooterSections = useCallback(() => filterSections(sections, 'footer'), [sections]);

  const getHomepageSections = useCallback(() => filterSections(sections, 'homepage'), [sections]);

  // ===== Context Value =====
  const value = useMemo<ContentVisibilityContextType>(
    () => ({
      // Data
      sections,
      elements,
      isReady,
      isLoading,
      error,
      source,
      // Section helpers
      isSectionActive,
      isSectionVisible,
      getSectionStatus,
      getSectionMessage,
      getSection,
      // Element helpers
      isElementVisible,
      isElementInteractive,
      getElement,
      // Filtered sections
      getNavbarSections,
      getMobileSections,
      getFooterSections,
      getHomepageSections,
      // Actions
      refreshData: async () => {
        // مسح الكاش المحلي قبل إعادة الجلب
        clearLocalStorageCache();
        await fetchData(true);
      },
    }),
    [
      sections,
      elements,
      isReady,
      isLoading,
      error,
      source,
      isSectionActive,
      isSectionVisible,
      getSectionStatus,
      getSectionMessage,
      getSection,
      isElementVisible,
      isElementInteractive,
      getElement,
      getNavbarSections,
      getMobileSections,
      getFooterSections,
      getHomepageSections,
      fetchData,
    ],
  );

  return (
    <ContentVisibilityContext.Provider value={value}>{children}</ContentVisibilityContext.Provider>
  );
}

// ============================================
// Main Hook - الـ Hook الرئيسي
// ============================================

/**
 * Hook رئيسي للوصول لنظام إدارة المحتوى
 * @throws Error إذا تم استخدامه خارج ContentVisibilityProvider
 */
export function useContentVisibility(): ContentVisibilityContextType {
  const context = useContext(ContentVisibilityContext);

  if (!context) {
    throw new Error(
      '[ContentVisibility] useContentVisibility must be used within ContentVisibilityProvider. ' +
        'Make sure ContentVisibilityProvider is in your component tree.',
    );
  }

  return context;
}

// ============================================
// Alias Hooks - للتوافق مع الكود القديم
// ============================================

/**
 * Alias لـ useContentVisibility للتوافق مع SiteSectionsContext
 * @deprecated استخدم useContentVisibility بدلاً منه
 */
export const useSiteSections = useContentVisibility;

// ============================================
// Specialized Hooks - Hooks متخصصة
// ============================================

/**
 * Hook للحصول على أقسام النافبار
 */
export function useNavbarSections(): SiteSection[] {
  const { getNavbarSections, isReady } = useContentVisibility();
  return useMemo(() => (isReady ? getNavbarSections() : []), [getNavbarSections, isReady]);
}

/**
 * Hook للحصول على أقسام القائمة الجانبية للموبايل
 */
export function useMobileSections(): SiteSection[] {
  const { getMobileSections, isReady } = useContentVisibility();
  return useMemo(() => (isReady ? getMobileSections() : []), [getMobileSections, isReady]);
}

/**
 * Hook للحصول على أقسام الفوتر
 */
export function useFooterSections(): SiteSection[] {
  const { getFooterSections, isReady } = useContentVisibility();
  return useMemo(() => (isReady ? getFooterSections() : []), [getFooterSections, isReady]);
}

/**
 * Hook للحصول على أقسام الصفحة الرئيسية
 */
export function useHomepageSections(): SiteSection[] {
  const { getHomepageSections, isReady } = useContentVisibility();
  return useMemo(() => (isReady ? getHomepageSections() : []), [getHomepageSections, isReady]);
}

/**
 * Hook للتحقق من قسم معين بكل تفاصيله
 */
export function useSectionVisibility(slug: string) {
  const {
    getSection,
    isSectionActive,
    isSectionVisible,
    getSectionStatus,
    getSectionMessage,
    isReady,
  } = useContentVisibility();

  return useMemo(
    () => ({
      section: getSection(slug),
      isActive: isSectionActive(slug),
      status: getSectionStatus(slug),
      message: getSectionMessage(slug),
      showInNavbar: isSectionVisible(slug, 'navbar'),
      showInMobile: isSectionVisible(slug, 'mobile'),
      showInFooter: isSectionVisible(slug, 'footer'),
      showInHomepage: isSectionVisible(slug, 'homepage'),
      showButton: isSectionVisible(slug, 'button'),
      showCard: isSectionVisible(slug, 'card'),
      isReady,
    }),
    [
      slug,
      getSection,
      isSectionActive,
      isSectionVisible,
      getSectionStatus,
      getSectionMessage,
      isReady,
    ],
  );
}

/**
 * Hook مختصر للتحقق من قسم معين (alias)
 * @deprecated استخدم useSectionVisibility بدلاً منه
 */
export const useSection = useSectionVisibility;

/**
 * Hook للتحقق من عنصر معين
 */
export function useElementVisibility(key: string) {
  const { isElementVisible, isElementInteractive, getElement, isReady } = useContentVisibility();

  return useMemo(
    () => ({
      element: getElement(key),
      isVisible: isElementVisible(key),
      isInteractive: isElementInteractive(key),
      isReady,
    }),
    [key, isElementVisible, isElementInteractive, getElement, isReady],
  );
}

// ============================================
// Re-export Types
// ============================================

export type { ContentVisibilityConfig, SectionStatus, SiteElement, SiteSection };

// ============================================
// Default Export
// ============================================

export default ContentVisibilityContext;
