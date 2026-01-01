// @ts-nocheck
﻿// Converted from JavaScript to TypeScript
// Original: scrollUtils.js
// Date: 2025-11-25

/**
 * أدوات مساعدة لإصلاح مشاكل السكرول في القائمة الجانبية للإدارة
 * Scroll utilities to fix admin sidebar scroll bounce issues
 */

/**
 * منع الارتداد التلقائي للسكرول
 * Prevent automatic scroll bounce
 */
export const preventScrollBounce = (element) => {
  if (!element) return;

  let lastScrollTop = 0;
  let isScrolling = false;

  const handleScroll = (e) => {
    const currentScrollTop = element.scrollTop;

    // منع الارتداد المفاجئ للأعلى
    if (currentScrollTop === 0 && lastScrollTop > 10 && !isScrolling) {
      e.preventDefault();
      element.scrollTop = lastScrollTop;
      return false;
    }

    lastScrollTop = currentScrollTop;
    isScrolling = true;

    // إعادة تعيين حالة التمرير بعد فترة قصيرة
    setTimeout(() => {
      isScrolling = false;
    }, 100);
  };

  element.addEventListener('scroll', handleScroll, { passive: false });

  // إرجاع دالة لإزالة المستمع
  return () => {
    element.removeEventListener('scroll', handleScroll);
  };
};

/**
 * حفظ واستعادة موضع السكرول
 * Save and restore scroll position
 */
export const saveScrollPosition = (element, key = 'scrollPosition') => {
  if (!element) return;

  try {
    sessionStorage.setItem(key, element.scrollTop.toString());
  } catch (error) {
    // Silent save failure
  }
};

export const restoreScrollPosition = (element, key = 'scrollPosition') => {
  if (!element) return;

  try {
    const savedPosition = sessionStorage.getItem(key);
    if (savedPosition) {
      const scrollTop = parseInt(savedPosition, 10);
      if (!isNaN(scrollTop) && scrollTop >= 0) {
        element.scrollTop = scrollTop;
      }
    }
  } catch (error) {
    // Silent restore failure
  }
};

/**
 * إصلاح شامل للسكرول
 * Comprehensive scroll fix
 */
export const fixScrollBehavior = (element) => {
  if (!element) return;

  // تطبيق الخصائص المطلوبة
  element.style.overscrollBehavior = 'contain';
  element.style.overscrollBehaviorY = 'contain';
  element.style.scrollBehavior = 'auto';
  element.style.scrollSnapType = 'none';
  element.style.WebkitOverflowScrolling = 'touch';
  element.style.touchAction = 'pan-y';
  element.style.transition = 'none';
  element.style.position = 'relative';
  element.style.overflowX = 'hidden';
  element.style.overflowY = 'auto';
  element.style.contain = 'layout style paint';
  element.style.willChange = 'scroll-position';

  // منع الارتداد
  const cleanup = preventScrollBounce(element);

  return cleanup;
};

/**
 * إعداد السكرول للقائمة الجانبية للإدارة
 * Setup scroll for admin sidebar
 */
export const setupAdminSidebarScroll = (element, scrollKey = 'adminSidebarScrollTop') => {
  if (!element) return;

  // تطبيق الإصلاحات
  const cleanup = fixScrollBehavior(element);

  // استعادة الموضع المحفوظ
  restoreScrollPosition(element, scrollKey);

  // حفظ الموضع عند التمرير
  let saveTimeout;
  const handleScroll = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveScrollPosition(element, scrollKey);
    }, 100);
  };

  element.addEventListener('scroll', handleScroll, { passive: true });

  // إرجاع دالة التنظيف
  return () => {
    if (cleanup) cleanup();
    element.removeEventListener('scroll', handleScroll);
    clearTimeout(saveTimeout);
  };
};

/**
 * إصلاح مشاكل السكرول في المتصفحات المختلفة
 * Fix scroll issues across different browsers
 */
export const applyBrowserSpecificFixes = (element) => {
  if (!element) return;

  // إصلاح خاص لـ Safari
  if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
    element.style.webkitTransform = 'translateZ(0)';
    element.style.webkitBackfaceVisibility = 'hidden';
  }

  // إصلاح خاص لـ Chrome/Edge
  if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
    element.style.webkitTransform = 'translate3d(0, 0, 0)';
  }

  // إصلاح خاص لـ Firefox
  if (navigator.userAgent.includes('Firefox')) {
    element.style.scrollbarWidth = 'thin';
    element.style.scrollbarColor = '#cbd5e1 #f8fafc';
  }
};

/**
 * مراقب تغيير حجم النافذة لإعادة تطبيق الإصلاحات
 * Window resize observer to reapply fixes
 */
export const createScrollResizeObserver = (element, callback) => {
  if (!element || !window.ResizeObserver) return;

  const observer = new ResizeObserver(() => {
    if (callback) callback();
    // إعادة تطبيق الإصلاحات عند تغيير الحجم
    fixScrollBehavior(element);
    applyBrowserSpecificFixes(element);
  });

  observer.observe(element);

  return () => observer.disconnect();
};

/**
 * إعداد شامل للقائمة الجانبية للإدارة
 * Complete setup for admin sidebar
 */
export const setupCompleteAdminSidebar = (element, options = {}) => {
  const {
    scrollKey = 'adminSidebarScrollTop',
    enableResizeObserver = true,
    enableBrowserFixes = true,
  } = options;

  if (!element) return;

  const cleanupFunctions = [];

  // إعداد السكرول الأساسي
  const scrollCleanup = setupAdminSidebarScroll(element, scrollKey);
  if (scrollCleanup) cleanupFunctions.push(scrollCleanup);

  // تطبيق إصلاحات المتصفح
  if (enableBrowserFixes) {
    applyBrowserSpecificFixes(element);
  }

  // مراقب تغيير الحجم
  if (enableResizeObserver) {
    const resizeCleanup = createScrollResizeObserver(element, () => {
      // Sidebar resized, reapplying fixes
    });
    if (resizeCleanup) cleanupFunctions.push(resizeCleanup);
  }

  // إرجاع دالة تنظيف شاملة
  return () => {
    cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        // Silent cleanup failure
      }
    });
  };
};

// تصدير افتراضي
export default {
  preventScrollBounce,
  saveScrollPosition,
  restoreScrollPosition,
  fixScrollBehavior,
  setupAdminSidebarScroll,
  applyBrowserSpecificFixes,
  createScrollResizeObserver,
  setupCompleteAdminSidebar,
};
