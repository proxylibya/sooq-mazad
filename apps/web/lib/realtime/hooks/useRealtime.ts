/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║              🪝 React Hook للتواصل الفوري الموحد                      ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  Hook شامل يوفر:                                                     ║
 * ║  • useRealtime - الاتصال الأساسي                                     ║
 * ║  • useNotifications - الإشعارات                                      ║
 * ║  • useChat - الدردشة                                                 ║
 * ║  • useAuction - المزادات الحية                                       ║
 * ║  • usePresence - حالة الاتصال                                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { NotificationOptions, NotificationRecord, NotificationStats, notificationService } from '../unified-notification-service';
import { AuctionStatePayload, BidPayload, ConnectionStatus, MessagePayload, NotificationPayload, SendMessagePayload, realtime } from '../unified-realtime-system';

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 useRealtime - Core Connection Hook
// ═══════════════════════════════════════════════════════════════════════════

export interface UseRealtimeOptions {
    userId?: string;
    token?: string;
    autoConnect?: boolean;
}

export interface UseRealtimeReturn {
    status: ConnectionStatus;
    isConnected: boolean;
    connect: (userId: string, token?: string) => void;
    disconnect: () => void;
}

export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
    const { userId, token, autoConnect = true } = options;
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const connectedRef = useRef(false);

    useEffect(() => {
        const unsubscribe = realtime.onStatusChange(setStatus);
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (autoConnect && userId && !connectedRef.current) {
            realtime.connect({ userId, token });
            connectedRef.current = true;
        }

        return () => {
            if (connectedRef.current) {
                // Don't disconnect on unmount - let the app manage this
            }
        };
    }, [userId, token, autoConnect]);

    const connect = useCallback((newUserId: string, newToken?: string) => {
        realtime.connect({ userId: newUserId, token: newToken });
        connectedRef.current = true;
    }, []);

    const disconnect = useCallback(() => {
        realtime.disconnect();
        connectedRef.current = false;
    }, []);

    return {
        status,
        isConnected: status === 'connected',
        connect,
        disconnect,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔔 useNotifications - Notifications Hook
// ═══════════════════════════════════════════════════════════════════════════

export interface UseNotificationsOptions {
    userId: string;
    autoFetch?: boolean;
    limit?: number;
}

export interface UseNotificationsReturn {
    notifications: NotificationRecord[];
    unreadCount: number;
    stats: NotificationStats | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    send: (options: Omit<NotificationOptions, 'userId'>) => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
    const { userId, autoFetch = true, limit = 50 } = options;

    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const [notifs, count, statsData] = await Promise.all([
                notificationService.getNotifications(userId, { limit }),
                notificationService.getUnreadCount(userId),
                notificationService.getStats(userId),
            ]);

            setNotifications(notifs);
            setUnreadCount(count);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [userId, limit]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch && userId) {
            fetchNotifications();
        }
    }, [autoFetch, userId, fetchNotifications]);

    // Listen for real-time notifications
    useEffect(() => {
        const unsubscribe = realtime.on<NotificationPayload>('notification:new', (notification) => {
            // Add to beginning of list
            setNotifications(prev => [{
                id: notification.id,
                userId,
                type: notification.type as NotificationRecord['type'],
                title: notification.title,
                message: notification.message,
                priority: notification.priority || 'medium',
                isRead: false,
                metadata: notification.data,
                createdAt: new Date(notification.createdAt),
            }, ...prev]);

            setUnreadCount(prev => prev + 1);
        });

        return unsubscribe;
    }, [userId]);

    // Listen for unread count updates
    useEffect(() => {
        const unsubscribe = realtime.on<{ count: number; }>('notification:unread-count', (data) => {
            setUnreadCount(data.count);
        });

        return unsubscribe;
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(async () => {
        await notificationService.markAllAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })));
        setUnreadCount(0);
    }, [userId]);

    const deleteNotification = useCallback(async (id: string) => {
        await notificationService.delete(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const send = useCallback(async (options: Omit<NotificationOptions, 'userId'>) => {
        await notificationService.send({ ...options, userId });
    }, [userId]);

    return {
        notifications,
        unreadCount,
        stats,
        loading,
        error,
        refresh: fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        send,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 💬 useChat - Chat/Messaging Hook
// ═══════════════════════════════════════════════════════════════════════════

export interface UseChatOptions {
    conversationId: string;
    autoJoin?: boolean;
}

export interface UseChatReturn {
    messages: MessagePayload[];
    typingUsers: string[];
    isConnected: boolean;
    sendMessage: (content: string, type?: MessagePayload['type']) => Promise<boolean>;
    startTyping: () => void;
    stopTyping: () => void;
    markAsRead: (messageIds?: string[]) => void;
}

export function useChat(options: UseChatOptions): UseChatReturn {
    const { conversationId, autoJoin = true } = options;

    const [messages, setMessages] = useState<MessagePayload[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Join conversation
    useEffect(() => {
        if (autoJoin && conversationId) {
            realtime.joinConversation(conversationId);
        }

        return () => {
            if (conversationId) {
                realtime.leaveConversation(conversationId);
            }
        };
    }, [conversationId, autoJoin]);

    // Track connection status
    useEffect(() => {
        const unsubscribe = realtime.onStatusChange((status) => {
            setIsConnected(status === 'connected');
        });
        return unsubscribe;
    }, []);

    // Listen for new messages
    useEffect(() => {
        const unsubscribe = realtime.on<MessagePayload>('message:new', (message) => {
            if (message.conversationId === conversationId) {
                setMessages(prev => [...prev, message]);
            }
        });

        return unsubscribe;
    }, [conversationId]);

    // Listen for typing indicators
    useEffect(() => {
        const unsubscribe = realtime.on<{ conversationId: string; userId: string; isTyping: boolean; }>(
            'message:typing',
            (data) => {
                if (data.conversationId === conversationId) {
                    setTypingUsers(prev => {
                        if (data.isTyping) {
                            return prev.includes(data.userId) ? prev : [...prev, data.userId];
                        } else {
                            return prev.filter(id => id !== data.userId);
                        }
                    });
                }
            }
        );

        return unsubscribe;
    }, [conversationId]);

    const sendMessage = useCallback(async (content: string, type: MessagePayload['type'] = 'text'): Promise<boolean> => {
        const payload: SendMessagePayload = {
            conversationId,
            type,
            content,
            tempId: `temp_${Date.now()}`,
        };

        const response = await realtime.sendMessage(payload);
        return response.success;
    }, [conversationId]);

    const startTyping = useCallback(() => {
        realtime.startTyping(conversationId);

        // Auto-stop after 3 seconds
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            realtime.stopTyping(conversationId);
        }, 3000);
    }, [conversationId]);

    const stopTyping = useCallback(() => {
        realtime.stopTyping(conversationId);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    }, [conversationId]);

    const markAsRead = useCallback((messageIds?: string[]) => {
        realtime.markMessagesRead(conversationId, messageIds);
    }, [conversationId]);

    return {
        messages,
        typingUsers,
        isConnected,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🏆 useAuction - Live Auction Hook
// ═══════════════════════════════════════════════════════════════════════════

export interface UseAuctionOptions {
    auctionId: string;
    autoJoin?: boolean;
}

export interface UseAuctionReturn {
    state: AuctionStatePayload | null;
    bids: BidPayload[];
    participantsCount: number;
    isJoined: boolean;
    isConnected: boolean;
    join: () => Promise<boolean>;
    leave: () => void;
    placeBid: (amount: number) => Promise<{ success: boolean; error?: string; }>;
}

export function useAuction(options: UseAuctionOptions): UseAuctionReturn {
    const { auctionId, autoJoin = true } = options;

    const [state, setState] = useState<AuctionStatePayload | null>(null);
    const [bids, setBids] = useState<BidPayload[]>([]);
    const [participantsCount, setParticipantsCount] = useState(0);
    const [isJoined, setIsJoined] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Track connection status
    useEffect(() => {
        const unsubscribe = realtime.onStatusChange((status) => {
            setIsConnected(status === 'connected');
        });
        return unsubscribe;
    }, []);

    // Auto-join auction
    useEffect(() => {
        if (autoJoin && auctionId && isConnected) {
            realtime.joinAuction(auctionId).then((response) => {
                if (response.success && response.state) {
                    setState(response.state);
                    setIsJoined(true);
                    setParticipantsCount(response.state.participantsCount);
                }
            });
        }

        return () => {
            if (auctionId) {
                realtime.leaveAuction(auctionId);
                setIsJoined(false);
            }
        };
    }, [auctionId, autoJoin, isConnected]);

    // Listen for auction state updates
    useEffect(() => {
        const unsubscribe = realtime.on<AuctionStatePayload>('auction:state', (newState) => {
            if (newState.auctionId === auctionId) {
                setState(newState);
                setParticipantsCount(newState.participantsCount);
            }
        });

        return unsubscribe;
    }, [auctionId]);

    // Listen for new bids
    useEffect(() => {
        const unsubscribe = realtime.on<BidPayload>('auction:bid-placed', (bid) => {
            if (bid.auctionId === auctionId) {
                setBids(prev => [...prev, bid]);
                setState(prev => prev ? { ...prev, currentPrice: bid.amount, totalBids: prev.totalBids + 1 } : prev);
            }
        });

        return unsubscribe;
    }, [auctionId]);

    // Listen for participant count updates
    useEffect(() => {
        const unsubscribe = realtime.on<{ auctionId: string; count: number; }>('auction:participants', (data) => {
            if (data.auctionId === auctionId) {
                setParticipantsCount(data.count);
            }
        });

        return unsubscribe;
    }, [auctionId]);

    const join = useCallback(async (): Promise<boolean> => {
        const response = await realtime.joinAuction(auctionId);
        if (response.success && response.state) {
            setState(response.state);
            setIsJoined(true);
            return true;
        }
        return false;
    }, [auctionId]);

    const leave = useCallback(() => {
        realtime.leaveAuction(auctionId);
        setIsJoined(false);
    }, [auctionId]);

    const placeBid = useCallback(async (amount: number) => {
        return realtime.placeBid(auctionId, amount);
    }, [auctionId]);

    return {
        state,
        bids,
        participantsCount,
        isJoined,
        isConnected,
        join,
        leave,
        placeBid,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 👥 usePresence - Online Status Hook
// ═══════════════════════════════════════════════════════════════════════════

export interface UsePresenceReturn {
    onlineUsers: Map<string, boolean>;
    isUserOnline: (userId: string) => boolean;
}

export function usePresence(): UsePresenceReturn {
    const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(new Map());

    useEffect(() => {
        // Listen for presence updates
        const unsubscribe1 = realtime.on<{ userId: string; isOnline: boolean; }>('presence:update', (data) => {
            setOnlineUsers(prev => {
                const next = new Map(prev);
                next.set(data.userId, data.isOnline);
                return next;
            });
        });

        // Listen for presence list
        const unsubscribe2 = realtime.on<{ users: Array<{ userId: string; isOnline: boolean; }>; }>('presence:list', (data) => {
            setOnlineUsers(new Map(data.users.map(u => [u.userId, u.isOnline])));
        });

        return () => {
            unsubscribe1();
            unsubscribe2();
        };
    }, []);

    const isUserOnline = useCallback((userId: string): boolean => {
        return onlineUsers.get(userId) || false;
    }, [onlineUsers]);

    return {
        onlineUsers,
        isUserOnline,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 📤 Exports
// ═══════════════════════════════════════════════════════════════════════════

export default {
    useRealtime,
    useNotifications,
    useChat,
    useAuction,
    usePresence,
};
