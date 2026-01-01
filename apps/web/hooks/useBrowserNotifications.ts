import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuickNotifications } from '../components/ui/EnhancedNotificationSystem';

export type BrowserPermission = 'default' | 'granted' | 'denied' | 'unsupported';

interface NotifyOptions {
  body?: string;
  tag?: string;
  icon?: string;
  data?: any;
}

interface UseBrowserNotificationsOptions {
  askOnMount?: boolean;
  registerSwOnMount?: boolean;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = typeof window === 'undefined' ? '' : window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useBrowserNotifications(options: UseBrowserNotificationsOptions = {}) {
  const { askOnMount = false, registerSwOnMount = false } = options;
  const [permission, setPermission] = useState<BrowserPermission>('default');
  const [hasServiceWorker, setHasServiceWorker] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const swTriedRef = useRef(false);
  const { info, warning, error } = useQuickNotifications();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    try {
      setPermission(Notification.permission as BrowserPermission);
    } catch {
      setPermission('default');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (swTriedRef.current) return;

    if (registerSwOnMount) {
      registerServiceWorker().catch(() => {
        /* ignore */
      });
    }
  }, [registerSwOnMount]);

  useEffect(() => {
    if (!askOnMount) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      // قد ترفض بعض المتصفحات هذا النداء دون تفاعل المستخدم
      Notification.requestPermission()
        .then((p) => setPermission(p as BrowserPermission))
        .catch(() => {});
    } else {
      setPermission(Notification.permission as BrowserPermission);
    }
  }, [askOnMount]);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return 'unsupported' as BrowserPermission;
    if (!('Notification' in window)) return 'unsupported' as BrowserPermission;
    try {
      const p = await Notification.requestPermission();
      setPermission(p as BrowserPermission);
      return p as BrowserPermission;
    } catch {
      return permission;
    }
  }, [permission]);

  const notify = useCallback(
    (title: string, message: string, opts: NotifyOptions = {}) => {
      // تنظيف العنوان من أي رموز غير مسموحة (مثل الإيموجي)
      const cleanTitle = title.replace(
        /[\p{Extended_Pictographic}\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}]/gu,
        '',
      );

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(cleanTitle, {
            body: opts.body ?? message,
            tag: opts.tag,
            icon: opts.icon ?? '/favicon.ico',
            data: opts.data,
          });
          return true;
        } catch (err) {
          // فشل إشعار النظام -> استخدم إشعار داخل الصفحة
          info(cleanTitle, message);
          return false;
        }
      }
      // fallback داخل الصفحة
      info(cleanTitle, message);
      return false;
    },
    [info],
  );

  const registerServiceWorker = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    if (!('serviceWorker' in navigator)) return null;
    swTriedRef.current = true;

    try {
      // محاولات متعددة لأسماء ملفات شائعة
      let reg = await navigator.serviceWorker.register('/service-worker.js').catch(() => null);
      if (!reg) reg = await navigator.serviceWorker.register('/sw.js').catch(() => null);
      if (!reg)
        reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => null);
      if (reg) {
        setRegistration(reg);
        setHasServiceWorker(true);
        return reg;
      }
      setHasServiceWorker(false);
      return null;
    } catch {
      setHasServiceWorker(false);
      return null;
    }
  }, []);

  const subscribePush = useCallback(
    async (vapidPublicKey: string, userId?: string) => {
      if (!registration) return { ok: false, reason: 'NO_SW' as const };
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // إرسال الاشتراك للخادم
        try {
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, subscription }),
          });
        } catch {
          // تجاهل فشل الحفظ؛ ما زال الاشتراك فعالاً محلياً
        }

        return { ok: true as const, subscription };
      } catch (e) {
        return {
          ok: false as const,
          reason: 'SUBSCRIBE_FAILED',
          error: (e as Error).message,
        };
      }
    },
    [registration],
  );

  return {
    permission,
    hasServiceWorker,
    registration,
    requestPermission,
    notify,
    registerServiceWorker,
    subscribePush,
  } as const;
}

export default useBrowserNotifications;
