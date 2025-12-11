/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║              🌐 نظام التواصل الفوري الموحد - Unified Exports          ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  استيراد موحد لجميع وظائف التواصل الفوري                             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 * 
 * Usage:
 * ```typescript
 * // Import everything
 * import { realtime, notify, useRealtime, useChat, useAuction } from '@/lib/realtime';
 * 
 * // Or import specific modules
 * import { realtime } from '@/lib/realtime/unified-realtime-system';
 * import { notify } from '@/lib/realtime/unified-notification-service';
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📡 Realtime System
// ═══════════════════════════════════════════════════════════════════════════

export {
    default as realtime,
    realtimeHelpers, type AuctionJoinResponse, type AuctionStatePayload, type BidPayload, type BidResponse,
    type CallPayload, type ClientEvents, type ConnectionStatus, type MessagePayload, type MessageResponse, type MessageType, type NotificationPayload, type NotificationType, type SendMessagePayload, type ServerEvents
} from './unified-realtime-system';

// ═══════════════════════════════════════════════════════════════════════════
// 🔔 Notification Service
// ═══════════════════════════════════════════════════════════════════════════

export {
    default as notificationService, notificationThemes, notify, type NotificationAction, type NotificationChannel, type NotificationOptions, type NotificationPriority, type NotificationRecord,
    type NotificationStats
} from './unified-notification-service';

// ═══════════════════════════════════════════════════════════════════════════
// 🪝 React Hooks
// ═══════════════════════════════════════════════════════════════════════════

export {
    useAuction, useChat, useNotifications, usePresence, useRealtime, type UseAuctionOptions,
    type UseAuctionReturn, type UseChatOptions,
    type UseChatReturn, type UseNotificationsOptions,
    type UseNotificationsReturn, type UsePresenceReturn, type UseRealtimeOptions,
    type UseRealtimeReturn
} from './hooks/useRealtime';

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 Quick Access
// ═══════════════════════════════════════════════════════════════════════════

// Re-export commonly used functions at top level
import { realtimeHelpers as _helpers } from './unified-realtime-system';

/**
 * Quick connect to realtime server
 * @example
 * ```typescript
 * import { connect } from '@/lib/realtime';
 * connect(userId, token);
 * ```
 */
export const connect = _helpers.connect;

/**
 * Quick disconnect from realtime server
 */
export const disconnect = _helpers.disconnect;

/**
 * Check if connected to realtime server
 */
export const isConnected = _helpers.isConnected;

/**
 * Get current connection status
 */
export const getStatus = _helpers.getStatus;

/**
 * Join a conversation room
 */
export const joinConversation = _helpers.joinConversation;

/**
 * Leave a conversation room
 */
export const leaveConversation = _helpers.leaveConversation;

/**
 * Join an auction room
 */
export const joinAuction = _helpers.joinAuction;

/**
 * Leave an auction room
 */
export const leaveAuction = _helpers.leaveAuction;

/**
 * Place a bid in an auction
 */
export const placeBid = _helpers.placeBid;

/**
 * Subscribe to realtime events
 */
export const on = _helpers.on;

/**
 * Unsubscribe from realtime events
 */
export const off = _helpers.off;

/**
 * Subscribe to connection status changes
 */
export const onStatusChange = _helpers.onStatusChange;

// ═══════════════════════════════════════════════════════════════════════════
// 📖 Documentation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * # نظام التواصل الفوري الموحد
 * 
 * ## الاستخدام الأساسي
 * 
 * ```typescript
 * import { realtime, notify, useChat, useAuction } from '@/lib/realtime';
 * 
 * // الاتصال بالخادم
 * realtime.connect({ userId: 'user123', token: 'jwt-token' });
 * 
 * // إرسال إشعار
 * await notify.success('user123', 'مرحباً', 'تم تسجيل الدخول بنجاح');
 * 
 * // استخدام Hook للدردشة
 * const { messages, sendMessage, typingUsers } = useChat({ conversationId: 'conv123' });
 * 
 * // استخدام Hook للمزادات
 * const { state, placeBid, bids } = useAuction({ auctionId: 'auction123' });
 * ```
 * 
 * ## الأحداث المتاحة
 * 
 * ### الإشعارات
 * - `notification:new` - إشعار جديد
 * - `notification:read` - تم قراءة إشعار
 * - `notification:unread-count` - تحديث عدد الإشعارات غير المقروءة
 * 
 * ### الرسائل
 * - `message:new` - رسالة جديدة
 * - `message:read` - تم قراءة الرسائل
 * - `message:typing` - مؤشر الكتابة
 * 
 * ### المزادات
 * - `auction:bid-placed` - مزايدة جديدة
 * - `auction:bid-outbid` - تم تجاوز المزايدة
 * - `auction:ending-soon` - المزاد ينتهي قريباً
 * - `auction:ended` - انتهى المزاد
 * - `auction:state` - تحديث حالة المزاد
 * 
 * ### الحضور
 * - `presence:update` - تحديث حالة المستخدم
 * - `presence:list` - قائمة المستخدمين المتصلين
 */
