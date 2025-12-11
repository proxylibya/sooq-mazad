/**
 * مساعدات Leaflet لمعالجة الأخطاء الشائعة
 * Leaflet helpers to handle common errors
 */

/**
 * التحقق من أن الخريطة والحاوية جاهزة للعمليات
 * Check if map and container are ready for operations
 */
export const isMapReady = (map: any): boolean => {
  if (!map) return false;

  try {
    const container = map.getContainer();
    return !!(
      container &&
      container._leaflet_pos &&
      container.offsetWidth > 0 &&
      container.offsetHeight > 0
    );
  } catch (error) {
    console.warn('تحذير: خطأ في التحقق من جاهزية الخريطة:', error);
    return false;
  }
};

/**
 * تنفيذ invalidateSize بأمان
 * Safely execute invalidateSize
 */
export const safeInvalidateSize = (map: any, options?: any): boolean => {
  if (!isMapReady(map)) {
    // تقليل console spam - رسالة واحدة من كل 20 مرة
    if (Math.random() < 0.05) {
      console.warn('تحذير: الخريطة غير جاهزة لـ invalidateSize');
    }
    return false;
  }

  try {
    map.invalidateSize(options);
    return true;
  } catch (error) {
    console.warn('تحذير: خطأ في invalidateSize:', error);
    return false;
  }
};

/**
 * تنفيذ setView بأمان
 * Safely execute setView
 */
export const safeSetView = (
  map: any,
  latlng: [number, number],
  zoom?: number,
  options?: any,
): boolean => {
  if (!isMapReady(map)) {
    // تقليل console spam
    if (Math.random() < 0.05) {
      console.warn('تحذير: الخريطة غير جاهزة لـ setView');
    }
    return false;
  }

  try {
    map.setView(latlng, zoom, options);
    return true;
  } catch (error) {
    console.warn('تحذير: خطأ في setView:', error);
    return false;
  }
};

/**
 * إضافة طبقة بأمان
 * Safely add layer
 */
export const safeAddLayer = (map: any, layer: any): boolean => {
  if (!isMapReady(map)) {
    console.warn('تحذير: الخريطة غير جاهزة لإضافة الطبقة');
    return false;
  }

  try {
    map.addLayer(layer);
    return true;
  } catch (error) {
    console.warn('تحذير: خطأ في إضافة الطبقة:', error);
    return false;
  }
};

/**
 * إزالة طبقة بأمان
 * Safely remove layer
 */
export const safeRemoveLayer = (map: any, layer: any): boolean => {
  if (!map) {
    return false;
  }

  try {
    map.removeLayer(layer);
    return true;
  } catch (error) {
    console.warn('تحذير: خطأ في إزالة الطبقة:', error);
    return false;
  }
};

/**
 * تنظيف الخريطة بأمان
 * Safely cleanup map
 */
export const safeMapCleanup = (map: any): void => {
  if (!map) return;

  try {
    // إزالة جميع الطبقات
    map.eachLayer((layer: any) => {
      try {
        map.removeLayer(layer);
      } catch (layerError) {
        console.warn('تحذير: خطأ في إزالة الطبقة أثناء التنظيف:', layerError);
      }
    });

    // إزالة جميع event listeners
    map.off();

    // إزالة الخريطة
    map.remove();
  } catch (error) {
    console.warn('تحذير: خطأ في تنظيف الخريطة:', error);
  }
};

/**
 * انتظار جاهزية الخريطة مع timeout
 * Wait for map readiness with timeout
 */
export const waitForMapReady = (map: any, timeout: number = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkReady = () => {
      if (isMapReady(map)) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        console.warn('تحذير: انتهت مهلة انتظار جاهزية الخريطة');
        resolve(false);
        return;
      }

      setTimeout(checkReady, 50);
    };

    checkReady();
  });
};

/**
 * تنفيذ عملية مع إعادة المحاولة
 * Execute operation with retry
 */
export const retryMapOperation = async (
  operation: () => boolean,
  maxRetries: number = 3,
  delay: number = 100,
): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    if (operation()) {
      return true;
    }

    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
};

/**
 * إعداد الخريطة مع معالجة الأخطاء
 * Setup map with error handling
 */
export const setupMapSafely = (container: HTMLElement, L: any, options: any): any | null => {
  try {
    // التحقق من أن الحاوية مرئية
    if (!container.offsetParent && container.style.display !== 'block') {
      console.warn('تحذير: حاوية الخريطة غير مرئية');
      return null;
    }

    // إنشاء الخريطة
    const map = L.map(container, {
      ...options,
      // إضافة خيارات إضافية لتحسين الاستقرار
      preferCanvas: true,
      zoomAnimation: false, // تعطيل الرسوم المتحركة لتجنب مشاكل DOM
      fadeAnimation: false,
      markerZoomAnimation: false,
    });

    return map;
  } catch (error) {
    console.error('خطأ في إعداد الخريطة:', error);
    return null;
  }
};

/**
 * إضافة مؤشر بأمان
 * Safely add marker
 */
export const safeAddMarker = (
  map: any,
  L: any,
  latlng: [number, number],
  options?: any,
): any | null => {
  if (!isMapReady(map)) {
    // تقليل console spam
    if (Math.random() < 0.05) {
      console.warn('تحذير: الخريطة غير جاهزة لإضافة المؤشر');
    }
    return null;
  }

  try {
    const marker = L.marker(latlng, options);
    map.addLayer(marker);
    return marker;
  } catch (error) {
    console.warn('تحذير: خطأ في إضافة المؤشر:', error);
    return null;
  }
};

/**
 * إضافة طبقة البلاط بأمان
 * Safely add tile layer
 */
export const safeAddTileLayer = (map: any, L: any, url: string, options?: any): any | null => {
  if (!isMapReady(map)) {
    console.warn('تحذير: الخريطة غير جاهزة لإضافة طبقة البلاط');
    return null;
  }

  try {
    const tileLayer = L.tileLayer(url, options);
    map.addLayer(tileLayer);
    return tileLayer;
  } catch (error) {
    console.warn('تحذير: خطأ في إضافة طبقة البلاط:', error);
    return null;
  }
};
