/**
 * نظام الأحداث الموحد لتحديث عدادات الشارات (Badges)
 * يوفر طريقة سهلة لتحديث العدادات بشكل فوري عند حدوث تغييرات
 */

// أنواع الأحداث المدعومة
export type BadgeEventType =
  | 'messagesUpdated'
  | 'newMessage'
  | 'messageRead'
  | 'notificationsUpdated'
  | 'newNotification'
  | 'notificationRead'
  | 'favoritesUpdated'
  | 'favoriteAdded'
  | 'favoriteRemoved';

// واجهة بيانات الحدث
export interface BadgeEventData {
  userId?: string;
  count?: number;
  timestamp?: number;
  [key: string]: any;
}

/**
 * إطلاق حدث تحديث الشارة
 * @param eventType نوع الحدث
 * @param data البيانات الإضافية (اختياري)
 */
export const emitBadgeEvent = (
  eventType: BadgeEventType,
  data?: BadgeEventData
): void => {
  if (typeof window === 'undefined') return;

  const eventData = {
    ...data,
    timestamp: Date.now(),
  };

  const event = new CustomEvent(eventType, {
    detail: eventData,
    bubbles: true,
  });

  window.dispatchEvent(event);

  // تسجيل في وضع التطوير
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Badge Event] ${eventType}`, eventData);
  }
};

/**
 * إطلاق حدث تحديث الرسائل
 */
export const emitMessagesUpdate = (data?: BadgeEventData): void => {
  emitBadgeEvent('messagesUpdated', data);
};

/**
 * إطلاق حدث رسالة جديدة
 */
export const emitNewMessage = (data?: BadgeEventData): void => {
  emitBadgeEvent('newMessage', data);
};

/**
 * إطلاق حدث قراءة رسالة
 */
export const emitMessageRead = (data?: BadgeEventData): void => {
  emitBadgeEvent('messageRead', data);
};

/**
 * إطلاق حدث تحديث الإشعارات
 */
export const emitNotificationsUpdate = (data?: BadgeEventData): void => {
  emitBadgeEvent('notificationsUpdated', data);
};

/**
 * إطلاق حدث إشعار جديد
 */
export const emitNewNotification = (data?: BadgeEventData): void => {
  emitBadgeEvent('newNotification', data);
};

/**
 * إطلاق حدث قراءة إشعار
 */
export const emitNotificationRead = (data?: BadgeEventData): void => {
  emitBadgeEvent('notificationRead', data);
};

/**
 * إطلاق حدث تحديث المفضلة
 */
export const emitFavoritesUpdate = (data?: BadgeEventData): void => {
  emitBadgeEvent('favoritesUpdated', data);
};

/**
 * إطلاق حدث إضافة للمفضلة
 */
export const emitFavoriteAdded = (data?: BadgeEventData): void => {
  emitBadgeEvent('favoriteAdded', data);
};

/**
 * إطلاق حدث حذف من المفضلة
 */
export const emitFavoriteRemoved = (data?: BadgeEventData): void => {
  emitBadgeEvent('favoriteRemoved', data);
};

/**
 * الاستماع لحدث شارة معين
 * @param eventType نوع الحدث
 * @param callback دالة رد النداء
 * @returns دالة لإلغاء الاستماع
 */
export const onBadgeEvent = (
  eventType: BadgeEventType,
  callback: (data?: BadgeEventData) => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<BadgeEventData>;
    callback(customEvent.detail);
  };

  window.addEventListener(eventType, handler);

  // إرجاع دالة لإلغاء الاستماع
  return () => {
    window.removeEventListener(eventType, handler);
  };
};

export default {
  emit: emitBadgeEvent,
  emitMessagesUpdate,
  emitNewMessage,
  emitMessageRead,
  emitNotificationsUpdate,
  emitNewNotification,
  emitNotificationRead,
  emitFavoritesUpdate,
  emitFavoriteAdded,
  emitFavoriteRemoved,
  on: onBadgeEvent,
};
