/**
 * إصلاح سريع لمشاكل الصور في المزادات
 */

export interface QuickFixResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * إصلاح سريع للصور المكسورة في الصفحة
 */
export function quickFixBrokenImages(): QuickFixResult {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        message: 'لا يمكن تشغيل الإصلاح في البيئة الخادمية',
      };
    }

    const images = document.querySelectorAll('img');
    let fixedCount = 0;
    const fallbackSrc = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=صورة+السيارة';

    images.forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        img.src = fallbackSrc;
        fixedCount++;
      }
    });

    return {
      success: true,
      message: `تم إصلاح ${fixedCount} صورة مكسورة`,
      details: { totalImages: images.length, fixedImages: fixedCount },
    };
  } catch (error) {
    return {
      success: false,
      message: 'خطأ في إصلاح الصور',
      details: error,
    };
  }
}

/**
 * إعادة تحميل جميع الصور في الصفحة
 */
export function reloadAllImages(): QuickFixResult {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        message: 'لا يمكن تشغيل إعادة التحميل في البيئة الخادمية',
      };
    }

    const images = document.querySelectorAll('img');
    let reloadedCount = 0;

    images.forEach((img) => {
      const originalSrc = img.src;
      if (originalSrc && !originalSrc.includes('placeholder')) {
        // إضافة timestamp لإجبار إعادة التحميل
        const separator = originalSrc.includes('?') ? '&' : '?';
        img.src = `${originalSrc}${separator}_reload=${Date.now()}`;
        reloadedCount++;
      }
    });

    return {
      success: true,
      message: `تم إعادة تحميل ${reloadedCount} صورة`,
      details: { totalImages: images.length, reloadedImages: reloadedCount },
    };
  } catch (error) {
    return {
      success: false,
      message: 'خطأ في إعادة تحميل الصور',
      details: error,
    };
  }
}

/**
 * تفعيل أسهم التنقل المعطلة
 */
export function enableNavigationArrows(): QuickFixResult {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        message: 'لا يمكن تشغيل التفعيل في البيئة الخادمية',
      };
    }

    const arrows = document.querySelectorAll('[aria-label*="الصورة"], button[class*="arrow"]');
    let enabledCount = 0;

    arrows.forEach((arrow) => {
      const button = arrow as HTMLButtonElement;
      if (button.disabled) {
        button.disabled = false;
        enabledCount++;
      }

      // إضافة مستمعي الأحداث إذا لم تكن موجودة
      if (!button.onclick) {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });
      }
    });

    return {
      success: true,
      message: `تم تفعيل ${enabledCount} سهم تنقل`,
      details: { totalArrows: arrows.length, enabledArrows: enabledCount },
    };
  } catch (error) {
    return {
      success: false,
      message: 'خطأ في تفعيل أسهم التنقل',
      details: error,
    };
  }
}

/**
 * إصلاح شامل سريع
 */
export function quickFixAll(): QuickFixResult[] {
  const results = [quickFixBrokenImages(), reloadAllImages(), enableNavigationArrows()];

  console.group('الأدوات نتائج الإصلاح السريع');
  results.forEach((result, index) => {
    const operations = ['إصلاح الصور المكسورة', 'إعادة تحميل الصور', 'تفعيل أسهم التنقل'];
    console.log(`${result.success ? 'تم بنجاح' : 'فشل'} ${operations[index]}: ${result.message}`);
    if (result.details) {
      console.log('التفاصيل:', result.details);
    }
  });
  console.groupEnd();

  return results;
}

/**
 * مراقب تلقائي للصور المكسورة
 */
export function startImageMonitor(): () => void {
  if (typeof window === 'undefined') {
    console.warn('لا يمكن بدء المراقب في البيئة الخادمية');
    return () => {};
  }

  let isMonitoring = true;

  const monitor = () => {
    if (!isMonitoring) return;

    const brokenImages = document.querySelectorAll('img').length;
    let brokenCount = 0;

    document.querySelectorAll('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        brokenCount++;
      }
    });

    if (brokenCount > 0) {
      console.warn(`🚨 تم اكتشاف ${brokenCount} صورة مكسورة`);
      quickFixBrokenImages();
    }

    // إعادة الفحص كل 5 ثوان
    setTimeout(monitor, 5000);
  };

  // بدء المراقبة
  monitor();
  console.log('البحث تم بدء مراقب الصور المكسورة');

  // إرجاع دالة إيقاف المراقبة
  return () => {
    isMonitoring = false;
    console.log('⏹️ تم إيقاف مراقب الصور المكسورة');
  };
}

/**
 * إضافة الأدوات للنافذة العامة
 */
if (typeof window !== 'undefined') {
  (window as any).quickImageFix = {
    fixBroken: quickFixBrokenImages,
    reloadAll: reloadAllImages,
    enableArrows: enableNavigationArrows,
    fixAll: quickFixAll,
    startMonitor: startImageMonitor,
  };

  console.log('🛠️ أدوات الإصلاح السريع متاحة في window.quickImageFix');
}

/**
 * تشغيل تلقائي في صفحة المزادات
 */
if (typeof window !== 'undefined' && window.location.pathname.includes('/auctions')) {
  // انتظار تحميل الصفحة ثم تشغيل الإصلاح
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        console.log('🚀 تشغيل الإصلاح التلقائي للصور...');
        quickFixAll();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      console.log('🚀 تشغيل الإصلاح التلقائي للصور...');
      quickFixAll();
    }, 1000);
  }
}
