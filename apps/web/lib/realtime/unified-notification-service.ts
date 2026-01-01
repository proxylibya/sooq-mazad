/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║         🔔 نظام الإشعارات الموحد - Unified Notification Service      ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  نظام شامل للإشعارات يدعم:                                           ║
 * ║  • Database Notifications                                            ║
 * ║  • Browser Push                                                      ║
 * ║  • In-App Toast                                                      ║
 * ║  • Real-time WebSocket                                               ║
 * ║  • Email & SMS Templates                                             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 * 
 * @version 3.0.0
 * @date 2025-11-27
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📋 Types & Interfaces
// ═══════════════════════════════════════════════════════════════════════════

export type NotificationChannel = 'database' | 'browser' | 'toast' | 'websocket' | 'email' | 'sms';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType =
    // UI Types
    | 'info' | 'success' | 'warning' | 'error'
    // Auction Types
    | 'auction_started' | 'auction_ending' | 'auction_ended' | 'auction_won'
    | 'new_bid' | 'bid_outbid' | 'bid_accepted'
    // Transaction Types  
    | 'deposit_initiated' | 'deposit_completed' | 'deposit_failed'
    | 'payment_received' | 'payment_reminder' | 'sale_confirmed'
    // System Types
    | 'system_maintenance' | 'admin_message' | 'verification_required';

export interface NotificationOptions {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    metadata?: Record<string, unknown>;
    // Related entities
    auctionId?: string;
    carId?: string;
    bidderId?: string;
    transactionId?: string;
    depositId?: string;
    // UI options
    duration?: number;
    persistent?: boolean;
    actions?: NotificationAction[];
}

export interface NotificationAction {
    label: string;
    onClick?: () => void;
    href?: string;
    type?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationRecord {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    isRead: boolean;
    readAt?: Date;
    metadata?: Record<string, unknown>;
    auctionId?: string;
    carId?: string;
    createdAt: Date;
}

export interface NotificationStats {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 Notification Themes & Icons
// ═══════════════════════════════════════════════════════════════════════════

export const notificationThemes: Record<NotificationType, {
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    // UI Types
    info: { icon: '📢', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    success: { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    warning: { icon: '⚠️', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    error: { icon: '❌', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },

    // Auction Types
    auction_started: { icon: '🚀', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    auction_ending: { icon: '⏰', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    auction_ended: { icon: '🏁', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
    auction_won: { icon: '🏆', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    new_bid: { icon: '💰', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    bid_outbid: { icon: '📈', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    bid_accepted: { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },

    // Transaction Types
    deposit_initiated: { icon: '💳', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    deposit_completed: { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    deposit_failed: { icon: '❌', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    payment_received: { icon: '💵', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    payment_reminder: { icon: '🔔', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    sale_confirmed: { icon: '🎉', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },

    // System Types
    system_maintenance: { icon: '🔧', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
    admin_message: { icon: '📬', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    verification_required: { icon: '🔐', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔔 Unified Notification Service Class
// ═══════════════════════════════════════════════════════════════════════════

type NotificationCallback = (notification: NotificationOptions) => void;

class UnifiedNotificationService {
    private static instance: UnifiedNotificationService;
    private listeners: Set<NotificationCallback> = new Set();
    private toastQueue: NotificationOptions[] = [];
    private browserPermission: NotificationPermission = 'default';

    private constructor() {
        if (typeof window !== 'undefined') {
            this.initializeBrowserPermission();
        }
    }

    public static getInstance(): UnifiedNotificationService {
        if (!UnifiedNotificationService.instance) {
            UnifiedNotificationService.instance = new UnifiedNotificationService();
        }
        return UnifiedNotificationService.instance;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 Main Send Method
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Send a notification through specified channels
     */
    public async send(options: NotificationOptions): Promise<{ success: boolean; id?: string; }> {
        const {
            channels = ['database', 'toast'],
            priority = this.getPriorityByType(options.type),
            ...notificationData
        } = options;

        const fullNotification: NotificationOptions = {
            ...notificationData,
            priority,
            channels,
        };

        const results: boolean[] = [];

        // Process each channel
        for (const channel of channels) {
            try {
                switch (channel) {
                    case 'database':
                        results.push(await this.sendToDatabase(fullNotification));
                        break;
                    case 'browser':
                        results.push(await this.sendBrowserNotification(fullNotification));
                        break;
                    case 'toast':
                        results.push(this.sendToast(fullNotification));
                        break;
                    case 'websocket':
                        results.push(await this.sendWebSocket(fullNotification));
                        break;
                    case 'email':
                        results.push(await this.sendEmail(fullNotification));
                        break;
                    case 'sms':
                        results.push(await this.sendSMS(fullNotification));
                        break;
                }
            } catch (error) {
                console.error(`[Notification] Error sending to ${channel}:`, error);
                results.push(false);
            }
        }

        return {
            success: results.some(r => r),
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 Channel Implementations
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Save notification to database
     */
    private async sendToDatabase(notification: NotificationOptions): Promise<boolean> {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: notification.userId,
                    type: notification.type.toUpperCase(),
                    title: notification.title,
                    message: notification.message,
                    metadata: notification.metadata,
                    auctionId: notification.auctionId,
                    carId: notification.carId,
                    bidderId: notification.bidderId,
                    transactionId: notification.transactionId,
                    depositId: notification.depositId,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('[Notification] Database error:', error);
            return false;
        }
    }

    /**
     * Send browser push notification
     */
    private async sendBrowserNotification(notification: NotificationOptions): Promise<boolean> {
        if (typeof window === 'undefined') return false;
        if (!('Notification' in window)) return false;

        if (this.browserPermission !== 'granted') {
            return false;
        }

        try {
            const theme = notificationThemes[notification.type];

            new window.Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `notification_${Date.now()}`,
                data: notification.metadata,
            });

            return true;
        } catch (error) {
            console.error('[Notification] Browser notification error:', error);
            return false;
        }
    }

    /**
     * Show toast notification (emits to listeners)
     */
    private sendToast(notification: NotificationOptions): boolean {
        this.listeners.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                console.error('[Notification] Toast callback error:', error);
            }
        });
        return true;
    }

    /**
     * Send via WebSocket
     */
    private async sendWebSocket(notification: NotificationOptions): Promise<boolean> {
        try {
            // Import realtime dynamically to avoid circular dependencies
            const { realtime } = await import('./unified-realtime-system');

            if (!realtime.isConnected()) {
                return false;
            }

            // WebSocket notification is handled by server
            return true;
        } catch (error) {
            console.error('[Notification] WebSocket error:', error);
            return false;
        }
    }

    /**
     * Send email notification
     */
    private async sendEmail(notification: NotificationOptions): Promise<boolean> {
        try {
            const response = await fetch('/api/notifications/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: notification.userId,
                    subject: notification.title,
                    body: notification.message,
                    type: notification.type,
                    metadata: notification.metadata,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('[Notification] Email error:', error);
            return false;
        }
    }

    /**
     * Send SMS notification
     */
    private async sendSMS(notification: NotificationOptions): Promise<boolean> {
        try {
            const response = await fetch('/api/notifications/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: notification.userId,
                    message: notification.message,
                    type: notification.type,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('[Notification] SMS error:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📥 Fetch Methods
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get user notifications from database
     */
    public async getNotifications(userId: string, options?: {
        limit?: number;
        offset?: number;
        unreadOnly?: boolean;
        type?: NotificationType;
    }): Promise<NotificationRecord[]> {
        try {
            const params = new URLSearchParams();
            params.set('userId', userId);
            if (options?.limit) params.set('limit', String(options.limit));
            if (options?.offset) params.set('offset', String(options.offset));
            if (options?.unreadOnly) params.set('unreadOnly', 'true');
            if (options?.type) params.set('type', options.type);

            const response = await fetch(`/api/notifications?${params}`);
            if (!response.ok) return [];

            const data = await response.json();
            return data.notifications || [];
        } catch (error) {
            console.error('[Notification] Fetch error:', error);
            return [];
        }
    }

    /**
     * Get unread count
     */
    public async getUnreadCount(userId: string): Promise<number> {
        try {
            const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
            if (!response.ok) return 0;

            const data = await response.json();
            return data.count || 0;
        } catch (error) {
            console.error('[Notification] Unread count error:', error);
            return 0;
        }
    }

    /**
     * Get notification stats
     */
    public async getStats(userId: string): Promise<NotificationStats> {
        try {
            const response = await fetch(`/api/notifications/stats?userId=${userId}`);
            if (!response.ok) {
                return { total: 0, unread: 0, byType: {}, byPriority: {} };
            }

            return await response.json();
        } catch (error) {
            console.error('[Notification] Stats error:', error);
            return { total: 0, unread: 0, byType: {}, byPriority: {} };
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ✏️ Update Methods
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Mark notification as read
     */
    public async markAsRead(notificationId: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
            });
            return response.ok;
        } catch (error) {
            console.error('[Notification] Mark read error:', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read
     */
    public async markAllAsRead(userId: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            return response.ok;
        } catch (error) {
            console.error('[Notification] Mark all read error:', error);
            return false;
        }
    }

    /**
     * Delete notification
     */
    public async delete(notificationId: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('[Notification] Delete error:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🎧 Event Listeners
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Subscribe to toast notifications
     */
    public onNotification(callback: NotificationCallback): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔧 Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Request browser notification permission
     */
    public async requestPermission(): Promise<NotificationPermission> {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return 'denied';
        }

        if (Notification.permission === 'default') {
            this.browserPermission = await Notification.requestPermission();
        } else {
            this.browserPermission = Notification.permission;
        }

        return this.browserPermission;
    }

    private initializeBrowserPermission(): void {
        if ('Notification' in window) {
            this.browserPermission = Notification.permission;
        }
    }

    /**
     * Get default priority by notification type
     */
    private getPriorityByType(type: NotificationType): NotificationPriority {
        const urgentTypes: NotificationType[] = ['auction_won', 'verification_required', 'sale_confirmed'];
        const highTypes: NotificationType[] = ['new_bid', 'bid_outbid', 'auction_ending', 'payment_reminder'];
        const lowTypes: NotificationType[] = ['info', 'system_maintenance'];

        if (urgentTypes.includes(type)) return 'urgent';
        if (highTypes.includes(type)) return 'high';
        if (lowTypes.includes(type)) return 'low';
        return 'medium';
    }

    /**
     * Get theme for notification type
     */
    public getTheme(type: NotificationType) {
        return notificationThemes[type] || notificationThemes.info;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📤 Exports
// ═══════════════════════════════════════════════════════════════════════════

export const notificationService = UnifiedNotificationService.getInstance();

// Shorthand helpers
export const notify = {
    send: (options: NotificationOptions) => notificationService.send(options),

    // Quick methods
    success: (userId: string, title: string, message: string, options?: Partial<NotificationOptions>) =>
        notificationService.send({ userId, type: 'success', title, message, ...options }),

    error: (userId: string, title: string, message: string, options?: Partial<NotificationOptions>) =>
        notificationService.send({ userId, type: 'error', title, message, ...options }),

    warning: (userId: string, title: string, message: string, options?: Partial<NotificationOptions>) =>
        notificationService.send({ userId, type: 'warning', title, message, ...options }),

    info: (userId: string, title: string, message: string, options?: Partial<NotificationOptions>) =>
        notificationService.send({ userId, type: 'info', title, message, ...options }),

    // Auction notifications
    auctionWon: (userId: string, auctionTitle: string, amount: number, auctionId: string) =>
        notificationService.send({
            userId,
            type: 'auction_won',
            title: 'مبروك! فزت بالمزاد',
            message: `تهانينا! فزت بمزاد ${auctionTitle} بمبلغ ${amount.toLocaleString('ar-LY')} دينار.`,
            priority: 'urgent',
            auctionId,
            channels: ['database', 'browser', 'toast', 'email'],
        }),

    newBid: (userId: string, bidderName: string, amount: number, carTitle: string, auctionId: string) =>
        notificationService.send({
            userId,
            type: 'new_bid',
            title: 'مزايدة جديدة',
            message: `مزايدة جديدة من ${bidderName} بمبلغ ${amount.toLocaleString('ar-LY')} دينار على ${carTitle}.`,
            priority: 'high',
            auctionId,
            channels: ['database', 'toast', 'websocket'],
        }),

    bidOutbid: (userId: string, carTitle: string, newAmount: number, auctionId: string) =>
        notificationService.send({
            userId,
            type: 'bid_outbid',
            title: 'تم تجاوز مزايدتك',
            message: `تم تجاوز مزايدتك على ${carTitle}. المزايدة الجديدة: ${newAmount.toLocaleString('ar-LY')} دينار.`,
            priority: 'high',
            auctionId,
            channels: ['database', 'browser', 'toast'],
        }),

    // Fetch methods
    getNotifications: (userId: string, options?: Parameters<typeof notificationService.getNotifications>[1]) =>
        notificationService.getNotifications(userId, options),

    getUnreadCount: (userId: string) => notificationService.getUnreadCount(userId),
    getStats: (userId: string) => notificationService.getStats(userId),
    markAsRead: (id: string) => notificationService.markAsRead(id),
    markAllAsRead: (userId: string) => notificationService.markAllAsRead(userId),

    // Event listener
    onNotification: (callback: NotificationCallback) => notificationService.onNotification(callback),

    // Permission
    requestPermission: () => notificationService.requestPermission(),
    getTheme: (type: NotificationType) => notificationService.getTheme(type),
};

export default notificationService;
