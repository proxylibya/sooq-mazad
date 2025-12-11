import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useBadgeCounts } from '../../hooks/useBadgeCounts';
import useAuth from '../../hooks/useAuth';
import EnhancedBadge from '../ui/EnhancedBadge';
import { getSocketManager } from '@/utils/socketManager';

interface MessagesBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
  refreshInterval?: number; // بالميلي ثانية
}

const MessagesBadge: React.FC<MessagesBadgeProps> = ({
  size = 'md',
  position = 'top-left',
  className = '',
  refreshInterval = 30000, // 30 ثانية
}) => {
  const { user } = useAuth();
  const { messages: badgeCount, setMessagesCount, incrementMessages, decrementMessages } = useBadgeCounts();
  
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
  const fetchMessagesCount = useCallback(async () => {
    if (!user?.id) return;

    // التحقق من التخزين المؤقت أولاً
    const cacheKey = `messages_unread_${user.id}`;
    const cachedCount = cache.get(cacheKey);
    if (cachedCount !== null) {
      setMessagesCount(cachedCount);
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
        `/api/messages/unread-count?userId=${encodeURIComponent(user.id)}`,
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
        setMessagesCount(count);
        
        // حفظ في التخزين المؤقت
        cache.set(cacheKey, count, 30000);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('فشل تحديث عداد الرسائل:', error);
      }
    }
  }, [user?.id, setMessagesCount, cache]);

  // 🔔 نظام التحديث اللحظي مع Socket.IO
  useEffect(() => {
    if (user?.id) {
      const cacheKey = `messages_unread_${user.id}`;
      fetchMessagesCount();

      // 🔌 الاتصال بنظام Socket.IO للتحديثات اللحظية
      const sm = getSocketManager();
      
      // معالج تحديث عداد الرسائل اللحظي
      const handleUnreadUpdate: (...args: unknown[]) => void = (...args) => {
        const data = (args?.[0] || {}) as { userId: string; increment?: number; decrement?: number };
        if (!data || !('userId' in data)) return;
        
        // تحديث فقط للمستخدم الحالي
        if (String(data.userId) === String(user.id)) {
          if (data.increment) {
            // زيادة العداد
            for (let i = 0; i < data.increment; i++) {
              incrementMessages();
            }
            cache.delete(cacheKey);
            console.log('🔔 [تحديث لحظي] رسالة جديدة +', data.increment);
          } else if (data.decrement) {
            // تقليل العداد (عند القراءة)
            for (let i = 0; i < data.decrement; i++) {
              decrementMessages();
            }
            cache.delete(cacheKey);
            console.log('🔔 [تحديث لحظي] قراءة رسائل -', data.decrement);
          }
        }
      };
      
      // تسجيل المستمع
      sm.on('messages:unread-update', handleUnreadUpdate);

      // تحديث دوري احتياطي (كل دقيقة فقط كبديل)
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchMessagesCount();
        }
      }, refreshInterval * 2); // مضاعفة الوقت لأن Socket.IO يحدث لحظياً

      // استمع لأحداث التركيز
      const handleFocus = () => {
        if (!document.hidden) {
          fetchMessagesCount();
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);
      
      // استمع لأحداث مخصصة (للتوافق الخلفي)
      const handleMessagesUpdate = () => {
        cache.delete(cacheKey);
        fetchMessagesCount();
      };
      
      window.addEventListener('messagesUpdated', handleMessagesUpdate);
      window.addEventListener('newMessage', handleMessagesUpdate);
      window.addEventListener('messageRead', handleMessagesUpdate);

      return () => {
        clearInterval(interval);
        sm.off('messages:unread-update', handleUnreadUpdate);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
        window.removeEventListener('messagesUpdated', handleMessagesUpdate);
        window.removeEventListener('newMessage', handleMessagesUpdate);
        window.removeEventListener('messageRead', handleMessagesUpdate);
      };
    }
  }, [user?.id, fetchMessagesCount, refreshInterval, cache, setMessagesCount]);

  // إذا لم يكن المستخدم مسجل الدخول، لا نعرض العداد
  if (!user) return null;

  // ✅ تم تفعيل عداد الرسائل - نظام الرسائل جاهز
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

export default MessagesBadge;
