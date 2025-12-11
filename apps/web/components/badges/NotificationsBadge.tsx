import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useBadgeCounts } from '../../hooks/useBadgeCounts';
import useAuth from '../../hooks/useAuth';
import EnhancedBadge from '../ui/EnhancedBadge';
import { getSocketManager } from '@/utils/socketManager';

interface NotificationsBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
  refreshInterval?: number; // بالميلي ثانية
}

const NotificationsBadge: React.FC<NotificationsBadgeProps> = ({
  size = 'md',
  position = 'top-left',
  className = '',
  refreshInterval = 30000, // 30 ثانية
}) => {
  const { user } = useAuth();
  const { notifications: badgeCount, setNotificationsCount, incrementNotifications, decrementNotifications } = useBadgeCounts();
  
  // نظام منع الطلبات المتكررة
  const lastFetchTimeRef = useRef(0);
  const FETCH_COOLDOWN = 5000; // 5 ثوان

  // نظام التخزين المؤقت
  const cache = useMemo(() => {
    const cacheMap = new Map<string, { data: number; timestamp: number; ttl: number }>();

    return {
      get: (key: string) => {
        const item = cacheMap.get(key);
        if (!item) return null;

        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
          cacheMap.delete(key);
          return null;
        }

        return item.data;
      },
      set: (key: string, data: number, ttl: number = 15000) => {
        cacheMap.set(key, { data, timestamp: Date.now(), ttl });
      },
      delete: (key: string) => {
        cacheMap.delete(key);
      },
    };
  }, []);

  // تحديث العداد من API
  const fetchNotificationsCount = useCallback(async () => {
    if (!user?.id) return;

    // التحقق من التخزين المؤقت أولاً
    const cacheKey = `notifications_unread_${user.id}`;
    const cachedCount = cache.get(cacheKey);
    if (cachedCount !== null) {
      setNotificationsCount(cachedCount);
      return;
    }

    // منع الطلبات المتكررة السريعة
    const now = Date.now();
    if (now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
      return;
    }
    lastFetchTimeRef.current = now;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      const response = await fetch(
        `/api/notifications?userId=${encodeURIComponent(user.id)}&unreadOnly=true&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const count = Number(data?.unreadCount || 0);
        setNotificationsCount(count);
        
        // حفظ في التخزين المؤقت
        cache.set(cacheKey, count, 30000);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('فشل تحديث عداد الإشعارات:', error);
      }
    }
  }, [user?.id, setNotificationsCount, cache]);

  // 🔔 نظام التحديث اللحظي مع Socket.IO
  useEffect(() => {
    if (user?.id) {
      const cacheKey = `notifications_unread_${user.id}`;
      fetchNotificationsCount();

      // 🔌 الاتصال بنظام Socket.IO للتحديثات اللحظية
      const sm = getSocketManager();
      
      // معالج تحديث عداد الإشعارات اللحظي
      const handleUnreadUpdate: (...args: unknown[]) => void = (...args) => {
        const data = (args?.[0] || {}) as { userId: string; increment?: number; decrement?: number };
        if (!data || !('userId' in data)) return;
        
        // تحديث فقط للمستخدم الحالي
        if (String(data.userId) === String(user.id)) {
          if (data.increment) {
            // زيادة العداد
            for (let i = 0; i < data.increment; i++) {
              incrementNotifications();
            }
            cache.delete(cacheKey);
            console.log('🔔 [تحديث لحظي] إشعار جديد +', data.increment);
          } else if (data.decrement) {
            // تقليل العداد (عند القراءة)
            for (let i = 0; i < data.decrement; i++) {
              decrementNotifications();
            }
            cache.delete(cacheKey);
            console.log('🔔 [تحديث لحظي] قراءة إشعارات -', data.decrement);
          }
        }
      };
      
      // تسجيل المستمع
      sm.on('notifications:unread-update', handleUnreadUpdate);

      // تحديث دوري احتياطي (مضاعف لأن Socket.IO يحدث لحظياً)
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchNotificationsCount();
        }
      }, refreshInterval * 2);

      // استمع لأحداث التركيز
      const handleFocus = () => {
        if (!document.hidden) {
          fetchNotificationsCount();
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);
      
      // استمع لأحداث مخصصة (للتوافق الخلفي)
      const handleNotificationsUpdate = () => {
        cache.delete(cacheKey);
        fetchNotificationsCount();
      };
      
      window.addEventListener('notificationsUpdated', handleNotificationsUpdate);
      window.addEventListener('newNotification', handleNotificationsUpdate);
      window.addEventListener('notificationRead', handleNotificationsUpdate);

      return () => {
        clearInterval(interval);
        sm.off('notifications:unread-update', handleUnreadUpdate);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
        window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
        window.removeEventListener('newNotification', handleNotificationsUpdate);
        window.removeEventListener('notificationRead', handleNotificationsUpdate);
      };
    }
  }, [user?.id, fetchNotificationsCount, refreshInterval, cache, setNotificationsCount]);

  // إذا لم يكن المستخدم مسجل الدخول، لا نعرض العداد
  if (!user) return null;

  return (
    <EnhancedBadge
      count={badgeCount}
      size={size}
      position={position}
      color="red"
      animate={true}
      className={className}
    />
  );
};

export default NotificationsBadge;
