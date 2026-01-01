/**
 * تحسينات خاصة بـ Next.js للتطوير
 * Next.js Development Optimizations
 */

/**
 * تحسين Hot Module Replacement (HMR)
 */
export function optimizeHMR(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  // تقليل إعادة التحميل غير الضرورية
  if (typeof window !== 'undefined' && 'webpackHotUpdate' in window) {
    const originalWebpackHotUpdate = (window as any).webpackHotUpdate;

    (window as any).webpackHotUpdate = function (chunkId: string, moreModules: any) {
      // تجنب إعادة التحميل للتغييرات البسيطة
      if (moreModules && Object.keys(moreModules).length === 1) {
        const moduleId = Object.keys(moreModules)[0];
        const module = moreModules[moduleId];

        // تجاهل تحديثات CSS فقط
        if (typeof module === 'string' && module.includes('css-loader')) {
          return originalWebpackHotUpdate.call(this, chunkId, moreModules);
        }
      }

      return originalWebpackHotUpdate.call(this, chunkId, moreModules);
    };
  }
}

/**
 * تحسين Router في التطوير
 */
export function optimizeRouter(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  // تقليل تحديثات Router غير الضرورية
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  let lastUrl = window.location.href;
  let lastChangeTime = Date.now();
  const ROUTER_THROTTLE_MS = 100; // 100ms

  history.pushState = function (state: any, title: string, url?: string | URL | null) {
    const now = Date.now();
    const currentUrl = url ? url.toString() : window.location.href;

    // تجنب التغييرات المتكررة لنفس الرابط
    if (currentUrl === lastUrl && now - lastChangeTime < ROUTER_THROTTLE_MS) {
      return;
    }

    lastUrl = currentUrl;
    lastChangeTime = now;

    return originalPushState.call(this, state, title, url);
  };

  history.replaceState = function (state: any, title: string, url?: string | URL | null) {
    const now = Date.now();
    const currentUrl = url ? url.toString() : window.location.href;

    // تجنب التغييرات المتكررة لنفس الرابط
    if (currentUrl === lastUrl && now - lastChangeTime < ROUTER_THROTTLE_MS) {
      return;
    }

    lastUrl = currentUrl;
    lastChangeTime = now;

    return originalReplaceState.call(this, state, title, url);
  };
}

/**
 * تحسين تحميل الصور في التطوير
 */
export function optimizeImages(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  // تحسين تحميل الصور
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    // تأجيل تحميل الصور غير المرئية
    if ('loading' in img && !img.loading) {
      img.loading = 'lazy';
    }

    // تحسين معالجة أخطاء الصور
    img.onerror = function () {
      // استبدال الصور المكسورة بصورة افتراضية
      if (!img.src.includes('placeholder')) {
        img.src = '/placeholder.svg';
      }
    };
  });
}

/**
 * تحسين معالجة الأحداث في Next.js
 */
export function optimizeEvents(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  // تحسين أحداث التمرير
  let scrollTimeout: NodeJS.Timeout;
  const originalAddEventListener = window.addEventListener;

  window.addEventListener = function (type: string, listener: any, options?: any) {
    if (type === 'scroll') {
      // تجميع أحداث التمرير
      const throttledListener = function (event: Event) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          listener(event);
        }, 16); // 60fps
      };

      return originalAddEventListener.call(this, type, throttledListener, options);
    }

    if (type === 'resize') {
      // تجميع أحداث تغيير الحجم
      let resizeTimeout: NodeJS.Timeout;
      const throttledListener = function (event: Event) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          listener(event);
        }, 100);
      };

      return originalAddEventListener.call(this, type, throttledListener, options);
    }

    return originalAddEventListener.call(this, type, listener, options);
  };
}

/**
 * تحسين الذاكرة في التطوير
 */
export function optimizeMemory(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  // تنظيف الذاكرة كل 5 دقائق
  setInterval(() => {
    // تنظيف المتغيرات العامة غير المستخدمة
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch (error) {
        // تجاهل أخطاء garbage collection
      }
    }

    // تنظيف localStorage من البيانات القديمة
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if ((key && key.startsWith('temp_')) || key?.includes('cache_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      // تجاهل أخطاء localStorage
    }
  }, 300000); // كل 5 دقائق
}

/**
 * تحسين CSS في التطوير
 */
export function optimizeCSS(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  // تحسين تحميل CSS
  const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');

  styleSheets.forEach((link) => {
    const linkElement = link as HTMLLinkElement;

    // تأجيل تحميل CSS غير الحرج
    if (!linkElement.href.includes('globals.css') && !linkElement.href.includes('components.css')) {
      linkElement.media = 'print';
      linkElement.onload = function () {
        linkElement.media = 'all';
      };
    }
  });
}

/**
 * تطبيق جميع تحسينات Next.js
 */
export function applyNextOptimizations(): void {
  if (process.env.NODE_ENV !== 'development') return;

  try {
    optimizeHMR();
    optimizeRouter();
    optimizeImages();
    optimizeEvents();
    optimizeMemory();
    optimizeCSS();

    // تقليل رسائل الكونسول في وضع التطوير
    if (process.env.NODE_ENV !== 'development') {
      console.log('تم بنجاح تم تطبيق تحسينات Next.js للتطوير');
    }
  } catch (error) {
    console.warn('تحذير: فشل في تطبيق بعض تحسينات Next.js:', error);
  }
}

/**
 * مراقبة الأداء في التطوير
 */
export function monitorPerformance(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  // مراقبة أداء التطبيق
  if ('performance' in window && 'mark' in performance) {
    performance.mark('app-start');

    window.addEventListener('load', () => {
      performance.mark('app-loaded');

      try {
        performance.measure('app-load-time', 'app-start', 'app-loaded');
        const measure = performance.getEntriesByName('app-load-time')[0];

        if (measure.duration > 3000) {
          // أكثر من 3 ثوانٍ
          console.warn(`تحذير تحذير: وقت تحميل التطبيق بطيء: ${Math.round(measure.duration)}ms`);
        }
      } catch (error) {
        // تجاهل أخطاء القياس
      }
    });
  }
}
