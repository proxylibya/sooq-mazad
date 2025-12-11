/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║           🌐 نظام التواصل الفوري الموحد - Unified Realtime System    ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  نظام شامل يوحد:                                                     ║
 * ║  • WebSocket / Socket.IO                                             ║
 * ║  • Real-time Notifications                                           ║
 * ║  • Chat / Messaging                                                  ║
 * ║  • Presence (Online Status)                                          ║
 * ║  • Auctions Real-time                                                ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 * 
 * @version 3.0.0 - Enterprise Grade
 * @date 2025-11-27
 */

import { io, Socket } from 'socket.io-client';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 Types & Interfaces
// ═══════════════════════════════════════════════════════════════════════════

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export type NotificationType =
    | 'info' | 'success' | 'warning' | 'error'
    | 'bid' | 'auction' | 'message' | 'system';

export type MessageType = 'text' | 'image' | 'file' | 'location' | 'voice' | 'video' | 'bid';

// Socket Events - Server to Client
export interface ServerEvents {
    // Connection
    'connect': () => void;
    'disconnect': (reason: string) => void;
    'connect_error': (error: Error) => void;

    // Notifications
    'notification:new': (data: NotificationPayload) => void;
    'notification:read': (data: { id: string; }) => void;
    'notification:unread-count': (data: { count: number; }) => void;

    // Messages/Chat
    'message:new': (data: MessagePayload) => void;
    'message:read': (data: { conversationId: string; messageIds: string[]; }) => void;
    'message:delivered': (data: { conversationId: string; messageId: string; }) => void;
    'message:typing': (data: { conversationId: string; userId: string; isTyping: boolean; }) => void;
    'message:unread-count': (data: { count: number; }) => void;

    // Presence
    'presence:update': (data: { userId: string; isOnline: boolean; lastSeen?: string; }) => void;
    'presence:list': (data: { users: Array<{ userId: string; isOnline: boolean; }>; }) => void;

    // Auctions
    'auction:bid-placed': (data: BidPayload) => void;
    'auction:bid-outbid': (data: { auctionId: string; previousBid: number; newBid: number; }) => void;
    'auction:ending-soon': (data: { auctionId: string; remainingSeconds: number; }) => void;
    'auction:ended': (data: { auctionId: string; winnerId?: string; finalPrice: number; }) => void;
    'auction:started': (data: { auctionId: string; }) => void;
    'auction:state': (data: AuctionStatePayload) => void;
    'auction:participants': (data: { auctionId: string; count: number; }) => void;

    // Calls (WebRTC)
    'call:incoming': (data: CallPayload) => void;
    'call:accepted': (data: { callId: string; }) => void;
    'call:rejected': (data: { callId: string; reason?: string; }) => void;
    'call:ended': (data: { callId: string; reason?: string; }) => void;
    'call:ice-candidate': (data: { callId: string; candidate: RTCIceCandidateInit; }) => void;
    'call:offer': (data: { callId: string; sdp: RTCSessionDescriptionInit; }) => void;
    'call:answer': (data: { callId: string; sdp: RTCSessionDescriptionInit; }) => void;
}

// Socket Events - Client to Server
export interface ClientEvents {
    // Auth
    'auth:authenticate': (data: { token: string; }) => void;

    // Rooms
    'room:join': (data: { roomId: string; roomType: 'conversation' | 'auction'; }) => void;
    'room:leave': (data: { roomId: string; }) => void;

    // Messages
    'message:send': (data: SendMessagePayload, callback: (response: MessageResponse) => void) => void;
    'message:read': (data: { conversationId: string; messageIds?: string[]; }) => void;
    'message:typing-start': (data: { conversationId: string; }) => void;
    'message:typing-stop': (data: { conversationId: string; }) => void;

    // Presence
    'presence:announce': (data: { userId: string; }) => void;

    // Auctions
    'auction:join': (data: { auctionId: string; }, callback: (response: AuctionJoinResponse) => void) => void;
    'auction:leave': (data: { auctionId: string; }) => void;
    'auction:bid': (data: { auctionId: string; amount: number; }, callback: (response: BidResponse) => void) => void;

    // Calls
    'call:start': (data: { conversationId: string; toUserId: string; media: 'video' | 'audio'; }) => void;
    'call:accept': (data: { callId: string; }) => void;
    'call:reject': (data: { callId: string; reason?: string; }) => void;
    'call:end': (data: { callId: string; }) => void;
    'call:ice-candidate': (data: { callId: string; candidate: RTCIceCandidateInit; }) => void;
    'call:offer': (data: { callId: string; sdp: RTCSessionDescriptionInit; }) => void;
    'call:answer': (data: { callId: string; sdp: RTCSessionDescriptionInit; }) => void;

    // Heartbeat
    'heartbeat': () => void;
}

// Payload Types
export interface NotificationPayload {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    data?: Record<string, unknown>;
    createdAt: string;
}

export interface MessagePayload {
    id: string;
    conversationId: string;
    senderId: string;
    senderName?: string;
    type: MessageType;
    content: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface SendMessagePayload {
    conversationId: string;
    type: MessageType;
    content: string;
    tempId?: string;
    metadata?: Record<string, unknown>;
}

export interface MessageResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface BidPayload {
    auctionId: string;
    bidderId: string;
    bidderName?: string;
    amount: number;
    timestamp: string;
}

export interface AuctionStatePayload {
    auctionId: string;
    currentPrice: number;
    totalBids: number;
    participantsCount: number;
    endTime: string;
    status: 'pending' | 'active' | 'ending_soon' | 'ended';
    lastBidder?: { id: string; name: string; };
}

export interface AuctionJoinResponse {
    success: boolean;
    state?: AuctionStatePayload;
    error?: string;
}

export interface BidResponse {
    success: boolean;
    bidId?: string;
    error?: string;
}

export interface CallPayload {
    callId: string;
    conversationId: string;
    fromUserId: string;
    fromUserName?: string;
    media: 'video' | 'audio';
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 Unified Realtime Manager Class
// ═══════════════════════════════════════════════════════════════════════════

type RealtimeSocket = Socket<ServerEvents, ClientEvents>;
type EventCallback<T = unknown> = (data: T) => void;

class UnifiedRealtimeManager {
    private static instance: UnifiedRealtimeManager;
    private socket: RealtimeSocket | null = null;
    private status: ConnectionStatus = 'disconnected';
    private userId: string | null = null;
    private token: string | null = null;

    // Event listeners
    private listeners: Map<string, Set<EventCallback>> = new Map();
    private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

    // Message queue for offline support
    private messageQueue: Array<{ event: string; data: unknown; callback?: EventCallback; }> = [];

    // Reconnection config
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 1000;
    private maxReconnectDelay = 30000;

    // Heartbeat
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private heartbeatInterval = 30000;

    // Joined rooms tracking
    private joinedRooms: Set<string> = new Set();
    private joinedAuctions: Set<string> = new Set();

    private constructor() { }

    public static getInstance(): UnifiedRealtimeManager {
        if (!UnifiedRealtimeManager.instance) {
            UnifiedRealtimeManager.instance = new UnifiedRealtimeManager();
        }
        return UnifiedRealtimeManager.instance;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔗 Connection Management
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Connect to the realtime server
     */
    public connect(options: { userId: string; token?: string; }): void {
        if (typeof window === 'undefined') return;

        if (this.socket?.connected) {
            console.log('[Realtime] Already connected');
            return;
        }

        this.userId = options.userId;
        this.token = options.token || null;
        this.updateStatus('connecting');

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            'http://localhost:3021';

        this.socket = io(socketUrl, {
            path: '/api/socketio',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            reconnectionDelayMax: this.maxReconnectDelay,
            timeout: 20000,
            auth: {
                token: this.token,
                userId: this.userId,
            },
        }) as RealtimeSocket;

        this.setupEventHandlers();
        console.log('[Realtime] Connecting to:', socketUrl);
    }

    /**
     * Disconnect from the realtime server
     */
    public disconnect(): void {
        this.stopHeartbeat();

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.joinedRooms.clear();
        this.joinedAuctions.clear();
        this.updateStatus('disconnected');
        console.log('[Realtime] Disconnected');
    }

    /**
     * Get current connection status
     */
    public getStatus(): ConnectionStatus {
        return this.status;
    }

    /**
     * Check if connected
     */
    public isConnected(): boolean {
        return this.socket?.connected === true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 Event Handlers Setup
    // ═══════════════════════════════════════════════════════════════════════════

    private setupEventHandlers(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('[Realtime] ✅ Connected');
            this.updateStatus('connected');
            this.reconnectAttempts = 0;
            this.startHeartbeat();

            // Authenticate
            if (this.token) {
                this.socket?.emit('auth:authenticate', { token: this.token });
            }

            // Announce presence
            if (this.userId) {
                this.socket?.emit('presence:announce', { userId: this.userId });
            }

            // Rejoin rooms
            this.rejoinRooms();

            // Flush queued messages
            this.flushMessageQueue();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[Realtime] ⚠️ Disconnected:', reason);
            this.updateStatus('disconnected');
            this.stopHeartbeat();

            if (reason === 'io server disconnect') {
                this.attemptReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Realtime] ❌ Connection error:', error.message);
            this.updateStatus('error');
        });

        // Forward all events to listeners
        this.forwardEvents();
    }

    private forwardEvents(): void {
        if (!this.socket) return;

        // Notification events
        this.socket.on('notification:new', (data) => this.emit('notification:new', data));
        this.socket.on('notification:read', (data) => this.emit('notification:read', data));
        this.socket.on('notification:unread-count', (data) => this.emit('notification:unread-count', data));

        // Message events
        this.socket.on('message:new', (data) => this.emit('message:new', data));
        this.socket.on('message:read', (data) => this.emit('message:read', data));
        this.socket.on('message:delivered', (data) => this.emit('message:delivered', data));
        this.socket.on('message:typing', (data) => this.emit('message:typing', data));
        this.socket.on('message:unread-count', (data) => this.emit('message:unread-count', data));

        // Presence events
        this.socket.on('presence:update', (data) => this.emit('presence:update', data));
        this.socket.on('presence:list', (data) => this.emit('presence:list', data));

        // Auction events
        this.socket.on('auction:bid-placed', (data) => this.emit('auction:bid-placed', data));
        this.socket.on('auction:bid-outbid', (data) => this.emit('auction:bid-outbid', data));
        this.socket.on('auction:ending-soon', (data) => this.emit('auction:ending-soon', data));
        this.socket.on('auction:ended', (data) => this.emit('auction:ended', data));
        this.socket.on('auction:started', (data) => this.emit('auction:started', data));
        this.socket.on('auction:state', (data) => this.emit('auction:state', data));
        this.socket.on('auction:participants', (data) => this.emit('auction:participants', data));

        // Call events
        this.socket.on('call:incoming', (data) => this.emit('call:incoming', data));
        this.socket.on('call:accepted', (data) => this.emit('call:accepted', data));
        this.socket.on('call:rejected', (data) => this.emit('call:rejected', data));
        this.socket.on('call:ended', (data) => this.emit('call:ended', data));
        this.socket.on('call:ice-candidate', (data) => this.emit('call:ice-candidate', data));
        this.socket.on('call:offer', (data) => this.emit('call:offer', data));
        this.socket.on('call:answer', (data) => this.emit('call:answer', data));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 💬 Chat / Messaging
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Join a conversation room
     */
    public joinConversation(conversationId: string): void {
        const roomId = `conversation:${conversationId}`;

        if (this.joinedRooms.has(roomId)) return;

        if (this.isConnected()) {
            this.socket?.emit('room:join', { roomId: conversationId, roomType: 'conversation' });
            this.joinedRooms.add(roomId);
            console.log('[Realtime] Joined conversation:', conversationId);
        } else {
            this.queueMessage('room:join', { roomId: conversationId, roomType: 'conversation' });
        }
    }

    /**
     * Leave a conversation room
     */
    public leaveConversation(conversationId: string): void {
        const roomId = `conversation:${conversationId}`;

        if (!this.joinedRooms.has(roomId)) return;

        if (this.isConnected()) {
            this.socket?.emit('room:leave', { roomId: conversationId });
        }

        this.joinedRooms.delete(roomId);
        console.log('[Realtime] Left conversation:', conversationId);
    }

    /**
     * Send a message
     */
    public async sendMessage(payload: SendMessagePayload): Promise<MessageResponse> {
        return new Promise((resolve) => {
            if (!this.isConnected()) {
                resolve({ success: false, error: 'Not connected' });
                return;
            }

            const timeout = setTimeout(() => {
                resolve({ success: false, error: 'Timeout' });
            }, 10000);

            this.socket?.emit('message:send', payload, (response) => {
                clearTimeout(timeout);
                resolve(response);
            });
        });
    }

    /**
     * Mark messages as read
     */
    public markMessagesRead(conversationId: string, messageIds?: string[]): void {
        if (this.isConnected()) {
            this.socket?.emit('message:read', { conversationId, messageIds });
        }
    }

    /**
     * Start typing indicator
     */
    public startTyping(conversationId: string): void {
        if (this.isConnected()) {
            this.socket?.emit('message:typing-start', { conversationId });
        }
    }

    /**
     * Stop typing indicator
     */
    public stopTyping(conversationId: string): void {
        if (this.isConnected()) {
            this.socket?.emit('message:typing-stop', { conversationId });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏆 Auctions
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Join an auction room
     */
    public async joinAuction(auctionId: string): Promise<AuctionJoinResponse> {
        return new Promise((resolve) => {
            if (!this.isConnected()) {
                resolve({ success: false, error: 'Not connected' });
                return;
            }

            const timeout = setTimeout(() => {
                resolve({ success: false, error: 'Timeout' });
            }, 10000);

            this.socket?.emit('auction:join', { auctionId }, (response) => {
                clearTimeout(timeout);
                if (response.success) {
                    this.joinedAuctions.add(auctionId);
                    console.log('[Realtime] Joined auction:', auctionId);
                }
                resolve(response);
            });
        });
    }

    /**
     * Leave an auction room
     */
    public leaveAuction(auctionId: string): void {
        if (!this.joinedAuctions.has(auctionId)) return;

        if (this.isConnected()) {
            this.socket?.emit('auction:leave', { auctionId });
        }

        this.joinedAuctions.delete(auctionId);
        console.log('[Realtime] Left auction:', auctionId);
    }

    /**
     * Place a bid
     */
    public async placeBid(auctionId: string, amount: number): Promise<BidResponse> {
        return new Promise((resolve) => {
            if (!this.isConnected()) {
                resolve({ success: false, error: 'Not connected' });
                return;
            }

            if (!this.joinedAuctions.has(auctionId)) {
                resolve({ success: false, error: 'Not in auction room' });
                return;
            }

            const timeout = setTimeout(() => {
                resolve({ success: false, error: 'Timeout' });
            }, 5000);

            this.socket?.emit('auction:bid', { auctionId, amount }, (response) => {
                clearTimeout(timeout);
                resolve(response);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📞 Calls (WebRTC)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Start a call
     */
    public startCall(conversationId: string, toUserId: string, media: 'video' | 'audio'): void {
        if (this.isConnected()) {
            this.socket?.emit('call:start', { conversationId, toUserId, media });
        }
    }

    /**
     * Accept a call
     */
    public acceptCall(callId: string): void {
        if (this.isConnected()) {
            this.socket?.emit('call:accept', { callId });
        }
    }

    /**
     * Reject a call
     */
    public rejectCall(callId: string, reason?: string): void {
        if (this.isConnected()) {
            this.socket?.emit('call:reject', { callId, reason });
        }
    }

    /**
     * End a call
     */
    public endCall(callId: string): void {
        if (this.isConnected()) {
            this.socket?.emit('call:end', { callId });
        }
    }

    /**
     * Send ICE candidate
     */
    public sendIceCandidate(callId: string, candidate: RTCIceCandidateInit): void {
        if (this.isConnected()) {
            this.socket?.emit('call:ice-candidate', { callId, candidate });
        }
    }

    /**
     * Send offer
     */
    public sendOffer(callId: string, sdp: RTCSessionDescriptionInit): void {
        if (this.isConnected()) {
            this.socket?.emit('call:offer', { callId, sdp });
        }
    }

    /**
     * Send answer
     */
    public sendAnswer(callId: string, sdp: RTCSessionDescriptionInit): void {
        if (this.isConnected()) {
            this.socket?.emit('call:answer', { callId, sdp });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔔 Event System
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Subscribe to an event
     */
    public on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(callback as EventCallback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event
     */
    public off<T = unknown>(event: string, callback?: EventCallback<T>): void {
        if (!callback) {
            this.listeners.delete(event);
        } else {
            this.listeners.get(event)?.delete(callback as EventCallback);
        }
    }

    /**
     * Subscribe to connection status changes
     */
    public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
        this.statusListeners.add(callback);
        callback(this.status); // Immediately call with current status

        return () => this.statusListeners.delete(callback);
    }

    /**
     * Emit an event to local listeners
     */
    private emit(event: string, data: unknown): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[Realtime] Error in ${event} handler:`, error);
                }
            });
        }
    }

    /**
     * Update connection status
     */
    private updateStatus(status: ConnectionStatus): void {
        this.status = status;
        this.statusListeners.forEach((callback) => callback(status));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔄 Reconnection & Heartbeat
    // ═══════════════════════════════════════════════════════════════════════════

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[Realtime] Max reconnection attempts reached');
            this.updateStatus('error');
            return;
        }

        this.reconnectAttempts++;
        this.updateStatus('reconnecting');

        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (this.socket && !this.socket.connected) {
                this.socket.connect();
            }
        }, delay);
    }

    private rejoinRooms(): void {
        // Rejoin conversations
        this.joinedRooms.forEach((roomId) => {
            const conversationId = roomId.replace('conversation:', '');
            this.socket?.emit('room:join', { roomId: conversationId, roomType: 'conversation' });
        });

        // Rejoin auctions
        this.joinedAuctions.forEach((auctionId) => {
            this.socket?.emit('auction:join', { auctionId }, () => { });
        });
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();

        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected()) {
                this.socket?.emit('heartbeat');
            }
        }, this.heartbeatInterval);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📦 Message Queue (Offline Support)
    // ═══════════════════════════════════════════════════════════════════════════

    private queueMessage(event: string, data: unknown, callback?: EventCallback): void {
        this.messageQueue.push({ event, data, callback });

        // Keep only last 50 messages
        if (this.messageQueue.length > 50) {
            this.messageQueue.shift();
        }
    }

    private flushMessageQueue(): void {
        if (this.messageQueue.length === 0) return;

        console.log(`[Realtime] Flushing ${this.messageQueue.length} queued messages`);

        const queue = [...this.messageQueue];
        this.messageQueue = [];

        queue.forEach(({ event, data }) => {
            if (this.socket && this.isConnected()) {
                (this.socket as Socket).emit(event, data);
            }
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📤 Exports
// ═══════════════════════════════════════════════════════════════════════════

export const realtime = UnifiedRealtimeManager.getInstance();

// Helper functions for common operations
export const realtimeHelpers = {
    connect: (userId: string, token?: string) => realtime.connect({ userId, token }),
    disconnect: () => realtime.disconnect(),
    isConnected: () => realtime.isConnected(),
    getStatus: () => realtime.getStatus(),

    // Chat
    joinConversation: (id: string) => realtime.joinConversation(id),
    leaveConversation: (id: string) => realtime.leaveConversation(id),
    sendMessage: (payload: SendMessagePayload) => realtime.sendMessage(payload),
    startTyping: (conversationId: string) => realtime.startTyping(conversationId),
    stopTyping: (conversationId: string) => realtime.stopTyping(conversationId),

    // Auctions
    joinAuction: (id: string) => realtime.joinAuction(id),
    leaveAuction: (id: string) => realtime.leaveAuction(id),
    placeBid: (auctionId: string, amount: number) => realtime.placeBid(auctionId, amount),

    // Events
    on: <T = unknown>(event: string, callback: EventCallback<T>) => realtime.on(event, callback),
    off: <T = unknown>(event: string, callback?: EventCallback<T>) => realtime.off(event, callback),
    onStatusChange: (callback: (status: ConnectionStatus) => void) => realtime.onStatusChange(callback),
};

export default realtime;
