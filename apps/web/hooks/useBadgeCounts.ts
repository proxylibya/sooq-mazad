import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface BadgeCountsState {
  favorites: number;
  messages: number;
  notifications: number;

  // الإجراءات
  setFavoritesCount: (count: number) => void;
  setMessagesCount: (count: number) => void;
  setNotificationsCount: (count: number) => void;

  // إجراءات التحديث
  incrementFavorites: () => void;
  decrementFavorites: () => void;
  incrementMessages: () => void;
  decrementMessages: () => void;
  incrementNotifications: () => void;
  decrementNotifications: () => void;

  // إعادة تعيين
  resetCounts: () => void;

  // تحديث فوري من API
  refreshFromAPI: (userId?: string) => Promise<void>;
}

export const useBadgeCounts = create<BadgeCountsState>()(
  subscribeWithSelector((set, get) => ({
    // الحالة الأولية
    favorites: 0,
    messages: 0,
    notifications: 0,

    // تعيين القيم مباشرة
    setFavoritesCount: (count: number) => {
      const newCount = Math.max(0, count);
      set({ favorites: newCount });

      // حفظ في التخزين المحلي
      if (typeof window !== 'undefined') {
        localStorage.setItem('badge_favorites_count', newCount.toString());
      }
    },

    setMessagesCount: (count: number) => {
      const newCount = Math.max(0, count);
      set({ messages: newCount });

      if (typeof window !== 'undefined') {
        localStorage.setItem('badge_messages_count', newCount.toString());
      }
    },

    setNotificationsCount: (count: number) => {
      const newCount = Math.max(0, count);
      set({ notifications: newCount });

      if (typeof window !== 'undefined') {
        localStorage.setItem('badge_notifications_count', newCount.toString());
      }
    },

    // زيادة العدادات
    incrementFavorites: () => {
      const currentCount = get().favorites;
      const newCount = currentCount + 1;
      get().setFavoritesCount(newCount);
    },

    decrementFavorites: () => {
      const currentCount = get().favorites;
      const newCount = Math.max(0, currentCount - 1);
      get().setFavoritesCount(newCount);
    },

    incrementMessages: () => {
      const currentCount = get().messages;
      const newCount = currentCount + 1;
      get().setMessagesCount(newCount);
    },

    decrementMessages: () => {
      const currentCount = get().messages;
      const newCount = Math.max(0, currentCount - 1);
      get().setMessagesCount(newCount);
    },

    incrementNotifications: () => {
      const currentCount = get().notifications;
      const newCount = currentCount + 1;
      get().setNotificationsCount(newCount);
    },

    decrementNotifications: () => {
      const currentCount = get().notifications;
      const newCount = Math.max(0, currentCount - 1);
      get().setNotificationsCount(newCount);
    },

    // إعادة تعيين جميع العدادات
    resetCounts: () => {
      set({ favorites: 0, messages: 0, notifications: 0 });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('badge_favorites_count');
        localStorage.removeItem('badge_messages_count');
        localStorage.removeItem('badge_notifications_count');
      }
    },

    // تحديث فوري من API
    refreshFromAPI: async (userId?: string) => {
      if (!userId || typeof window === 'undefined') return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // تحديث المفضلة
        try {
          const favResponse = await fetch('/api/favorites/count', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (favResponse.ok) {
            const favData = await favResponse.json();
            if (favData.success && typeof favData.count === 'number') {
              get().setFavoritesCount(favData.count);
            }
          }
        } catch (error) {
          console.warn('فشل تحديث عداد المفضلة:', error);
        }

        // تحديث الإشعارات
        try {
          const notifResponse = await fetch(
            `/api/notifications?userId=${encodeURIComponent(userId)}&unreadOnly=true&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          if (notifResponse.ok) {
            const notifData = await notifResponse.json();
            if (typeof notifData.unreadCount === 'number') {
              get().setNotificationsCount(notifData.unreadCount);
            }
          }
        } catch (error) {
          console.warn('فشل تحديث عداد الإشعارات:', error);
        }

        // تحديث الرسائل (عندما يتم تطبيقها)
        // يمكن إضافة API للرسائل هنا لاحقاً
      } catch (error) {
        console.error('خطأ في تحديث العدادات من API:', error);
      }
    },
  })),
);

// استعادة العدادات من التخزين المحلي عند التحميل
if (typeof window !== 'undefined') {
  const savedFavorites = localStorage.getItem('badge_favorites_count');
  const savedMessages = localStorage.getItem('badge_messages_count');
  const savedNotifications = localStorage.getItem('badge_notifications_count');

  if (savedFavorites) {
    const count = parseInt(savedFavorites, 10);
    if (!isNaN(count)) {
      useBadgeCounts.getState().setFavoritesCount(count);
    }
  }

  if (savedMessages) {
    const count = parseInt(savedMessages, 10);
    if (!isNaN(count)) {
      useBadgeCounts.getState().setMessagesCount(count);
    }
  }

  if (savedNotifications) {
    const count = parseInt(savedNotifications, 10);
    if (!isNaN(count)) {
      useBadgeCounts.getState().setNotificationsCount(count);
    }
  }
}

export default useBadgeCounts;
