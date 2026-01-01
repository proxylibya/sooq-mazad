/**
 * ⚠️ DEPRECATED - تم استبدال هذه الملفات بالنظام الموحد الجديد
 * 
 * الرجاء استخدام: @/lib/realtime
 * 
 * @deprecated Use @/lib/realtime instead
 */

// Re-export from unified system
import {
    notify as notifyHelper,
    notificationService as service,
    notificationThemes as themes,
} from '@/lib/realtime';

export const notificationService = service;
export const notify = notifyHelper;
export const notificationThemes = themes;

// Re-export types
export type {
    NotificationAction, NotificationChannel, NotificationOptions, NotificationPriority, NotificationRecord,
    NotificationStats
} from '@/lib/realtime';

// Legacy exports for backwards compatibility
export const unifiedNotificationManager = service;
export const notifications = service;
export const notificationManager = {
    savePushSubscription: async () => ({ success: true }),
    removePushSubscription: async () => ({ success: true }),
    getUserSubscriptions: async () => [],
    cleanupExpiredSubscriptions: async () => ({ success: true, deletedCount: 0 }),
};

export default notifyHelper;
