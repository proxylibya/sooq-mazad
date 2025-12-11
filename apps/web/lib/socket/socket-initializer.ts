/**
 * 🚀 Socket.IO Global Initializer
 * مبدئ عالمي لنظام Socket.IO لضمان التشغيل الفوري
 */

import { getSocketManager } from '@/utils/socketManager';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * تهيئة Socket.IO بشكل عالمي
 */
export async function initializeGlobalSocket(): Promise<void> {
  // منع التهيئة المتكررة
  if (isInitialized) {
    return;
  }

  // إذا كانت التهيئة جارية، انتظرها
  if (initPromise) {
    return initPromise;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Socket Init] Starting global Socket.IO initialization...');
  }

  initPromise = (async () => {
    try {
      // ملاحظة: Socket.IO يتولى /api/socketio ويرفض طلبات HTTP العادية
      // لذلك لا نحتاج لطلب التحقق - Socket.IO client يتعامل مع التهيئة تلقائياً
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket Init] Preparing Socket.IO client...');
      }

      // الخطوة 2: تجهيز Socket client
      const socketManager = getSocketManager();

      if (socketManager && typeof socketManager.isConnected === 'function') {
        isInitialized = true;
        if (process.env.NODE_ENV === 'development') {
          console.log('[Socket Init] Global Socket initialization complete!');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Socket Init] Failed to initialize Socket:', error);
      }
      // لا نرفع الخطأ - نستمر بدون Socket
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * التحقق من حالة التهيئة
 */
export function isSocketInitialized(): boolean {
  return isInitialized;
}

/**
 * إعادة تعيين حالة التهيئة (للاختبار فقط)
 */
export function resetSocketInitialization(): void {
  isInitialized = false;
  initPromise = null;
}
