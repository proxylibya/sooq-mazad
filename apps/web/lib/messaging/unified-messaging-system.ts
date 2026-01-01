/**
 * نظام المراسلة الموحد - Sooq Mazad
 * نظام متكامل للرسائل النصية والصوتية والمكالمات
 * مستوحى من تصميم واتساب
 */

import { getSocketManager } from '@/utils/socketManager';

// ==================== الأنواع ====================

export type MessageType =
    | 'TEXT'
    | 'IMAGE'
    | 'FILE'
    | 'LOCATION'
    | 'VOICE'
    | 'VIDEO'
    | 'BID'
    | 'CALL_STARTED'
    | 'CALL_ENDED'
    | 'CALL_MISSED';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type CallType = 'VOICE' | 'VIDEO';
export type CallStatus = 'RINGING' | 'ANSWERED' | 'ENDED' | 'MISSED' | 'DECLINED' | 'BUSY' | 'FAILED';

export interface User {
    id: string;
    name: string;
    phone?: string | null;
    profileImage?: string | null;
    verified?: boolean;
    isOnline?: boolean;
    lastSeen?: Date | null;
}

export interface Message {
    id: string;
    content: string;
    type: MessageType;
    senderId: string;
    conversationId: string;
    status: MessageStatus;
    createdAt: Date;
    updatedAt?: Date;
    metadata?: {
        duration?: number; // للرسائل الصوتية
        fileName?: string; // للملفات
        fileSize?: number;
        mimeType?: string;
        thumbnailUrl?: string;
        location?: { lat: number; lng: number; address?: string; };
        callId?: string;
        callDuration?: number;
    };
    sender?: User;
}

export interface Conversation {
    id: string;
    title?: string;
    type: 'DIRECT' | 'GROUP';
    participants: User[];
    lastMessage?: Message;
    lastMessageAt?: Date;
    unreadCount: number;
    carId?: string;
    auctionId?: string;
    transportServiceId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Call {
    id: string;
    conversationId: string;
    callerId: string;
    calleeId: string;
    type: CallType;
    status: CallStatus;
    startedAt?: Date;
    endedAt?: Date;
    duration?: number;
    caller?: User;
    callee?: User;
}

// ==================== الخدمة الموحدة ====================

class UnifiedMessagingSystem {
    private static instance: UnifiedMessagingSystem;
    private token: string | null = null;
    private currentUserId: string | null = null;
    private eventHandlers: Map<string, Set<Function>> = new Map();

    private constructor() { }

    static getInstance(): UnifiedMessagingSystem {
        if (!UnifiedMessagingSystem.instance) {
            UnifiedMessagingSystem.instance = new UnifiedMessagingSystem();
        }
        return UnifiedMessagingSystem.instance;
    }

    /**
     * تهيئة النظام
     */
    initialize(userId: string, token: string) {
        this.currentUserId = userId;
        this.token = token;
        this.setupSocketListeners();
    }

    /**
     * إعداد مستمعي Socket
     */
    private setupSocketListeners() {
        try {
            const socketManager = getSocketManager();

            // رسالة جديدة
            socketManager.on('chat:message:new', (data: unknown) => {
                this.emit('message:new', data);
            });

            // تحديث حالة الرسالة
            socketManager.on('chat:message:status', (data: unknown) => {
                this.emit('message:status', data);
            });

            // مكالمة واردة
            socketManager.on('call:incoming', (data: unknown) => {
                this.emit('call:incoming', data);
            });

            // انتهاء المكالمة
            socketManager.on('call:ended', (data: unknown) => {
                this.emit('call:ended', data);
            });

            // الكتابة...
            socketManager.on('chat:typing', (data: unknown) => {
                this.emit('typing', data);
            });

            // الحالة عبر الإنترنت
            socketManager.on('user:online', (data: unknown) => {
                this.emit('user:online', data);
            });

            socketManager.on('user:offline', (data: unknown) => {
                this.emit('user:offline', data);
            });
        } catch (error) {
            console.error('[UnifiedMessaging] Failed to setup socket listeners:', error);
        }
    }

    /**
     * الاشتراك في الأحداث
     */
    on(event: string, handler: Function) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
        return () => this.off(event, handler);
    }

    /**
     * إلغاء الاشتراك
     */
    off(event: string, handler: Function) {
        this.eventHandlers.get(event)?.delete(handler);
    }

    /**
     * إطلاق حدث
     */
    private emit(event: string, data: unknown) {
        this.eventHandlers.get(event)?.forEach(handler => handler(data));
    }

    // ==================== المحادثات ====================

    /**
     * جلب جميع المحادثات
     */
    async getConversations(): Promise<Conversation[]> {
        try {
            const response = await fetch('/api/conversations', {
                headers: this.getHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch conversations');

            const data = await response.json();
            return data.data || data.conversations || [];
        } catch (error) {
            console.error('[UnifiedMessaging] getConversations error:', error);
            return [];
        }
    }

    /**
     * جلب محادثة محددة
     */
    async getConversation(conversationId: string): Promise<Conversation | null> {
        try {
            const response = await fetch(`/api/conversations/${conversationId}`, {
                headers: this.getHeaders(),
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.data || data.conversation || null;
        } catch (error) {
            console.error('[UnifiedMessaging] getConversation error:', error);
            return null;
        }
    }

    /**
     * إنشاء أو الحصول على محادثة
     */
    async getOrCreateConversation(
        otherUserId: string,
        options?: {
            carId?: string;
            auctionId?: string;
            transportServiceId?: string;
        }
    ): Promise<Conversation | null> {
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    participantId: otherUserId,
                    ...options,
                }),
            });

            if (!response.ok) throw new Error('Failed to create conversation');

            const data = await response.json();
            return data.data || data.conversation || null;
        } catch (error) {
            console.error('[UnifiedMessaging] getOrCreateConversation error:', error);
            return null;
        }
    }

    // ==================== الرسائل ====================

    /**
     * جلب رسائل محادثة
     */
    async getMessages(conversationId: string, options?: {
        limit?: number;
        before?: string;
        after?: string;
    }): Promise<Message[]> {
        try {
            const params = new URLSearchParams({
                conversationId,
                ...(options?.limit && { limit: String(options.limit) }),
                ...(options?.before && { before: options.before }),
                ...(options?.after && { after: options.after }),
            });

            const response = await fetch(`/api/messages?${params}`, {
                headers: this.getHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();
            return data.data || data.messages || [];
        } catch (error) {
            console.error('[UnifiedMessaging] getMessages error:', error);
            return [];
        }
    }

    /**
     * إرسال رسالة نصية
     */
    async sendTextMessage(conversationId: string, content: string): Promise<Message | null> {
        return this.sendMessage(conversationId, content, 'TEXT');
    }

    /**
     * إرسال رسالة
     */
    async sendMessage(
        conversationId: string,
        content: string,
        type: MessageType = 'TEXT',
        metadata?: Record<string, unknown>
    ): Promise<Message | null> {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    conversationId,
                    content,
                    type,
                    senderId: this.currentUserId,
                    metadata,
                }),
            });

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();
            return data.data || data.message || null;
        } catch (error) {
            console.error('[UnifiedMessaging] sendMessage error:', error);
            return null;
        }
    }

    /**
     * إرسال رسالة صوتية
     */
    async sendVoiceMessage(conversationId: string, audioBlob: Blob, duration: number): Promise<Message | null> {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, `voice-${Date.now()}.webm`);
            formData.append('conversationId', conversationId);
            formData.append('type', 'VOICE');
            formData.append('duration', String(duration));

            const response = await fetch('/api/messages/upload-voice', {
                method: 'POST',
                headers: {
                    ...(this.token && { Authorization: `Bearer ${this.token}` }),
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to send voice message');

            const data = await response.json();
            return data.data || data.message || null;
        } catch (error) {
            console.error('[UnifiedMessaging] sendVoiceMessage error:', error);
            return null;
        }
    }

    /**
     * إرسال صورة
     */
    async sendImage(conversationId: string, imageFile: File): Promise<Message | null> {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('conversationId', conversationId);
            formData.append('type', 'IMAGE');

            const response = await fetch('/api/messages/upload-image', {
                method: 'POST',
                headers: {
                    ...(this.token && { Authorization: `Bearer ${this.token}` }),
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to send image');

            const data = await response.json();
            return data.data || data.message || null;
        } catch (error) {
            console.error('[UnifiedMessaging] sendImage error:', error);
            return null;
        }
    }

    /**
     * إرسال موقع
     */
    async sendLocation(conversationId: string, lat: number, lng: number, address?: string): Promise<Message | null> {
        const locationData = { lat, lng, address };
        return this.sendMessage(conversationId, JSON.stringify(locationData), 'LOCATION', { location: locationData });
    }

    /**
     * وضع علامة مقروء
     */
    async markAsRead(conversationId: string): Promise<void> {
        try {
            await fetch('/api/messages', {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    action: 'markAsRead',
                    conversationId,
                }),
            });

            // إرسال عبر Socket
            try {
                const socketManager = getSocketManager();
                socketManager.readAck(conversationId);
            } catch (e) {
                // تجاهل
            }
        } catch (error) {
            console.error('[UnifiedMessaging] markAsRead error:', error);
        }
    }

    /**
     * إرسال حالة الكتابة
     */
    sendTyping(conversationId: string) {
        try {
            const socketManager = getSocketManager();
            socketManager.typingStart(conversationId);
        } catch (e) {
            // تجاهل
        }
    }

    /**
     * إيقاف حالة الكتابة
     */
    stopTyping(conversationId: string) {
        try {
            const socketManager = getSocketManager();
            socketManager.typingStop(conversationId);
        } catch (e) {
            // تجاهل
        }
    }

    // ==================== المكالمات ====================

    /**
     * بدء مكالمة
     */
    async startCall(conversationId: string, calleeId: string, type: CallType): Promise<Call | null> {
        try {
            const response = await fetch('/api/calls', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    conversationId,
                    calleeId,
                    type,
                }),
            });

            if (!response.ok) throw new Error('Failed to start call');

            const data = await response.json();
            const call = data.data || data.call || null;

            // إرسال عبر Socket
            if (call?.id) {
                try {
                    const socketManager = getSocketManager();
                    const media = type === 'VIDEO' ? 'video' : 'audio';
                    socketManager.startCall(conversationId, calleeId, media, call.id);
                } catch (e) {
                    // تجاهل
                }
            }

            return call;
        } catch (error) {
            console.error('[UnifiedMessaging] startCall error:', error);
            return null;
        }
    }

    /**
     * الرد على مكالمة
     */
    async answerCall(callId: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/calls/${callId}/answer`, {
                method: 'POST',
                headers: this.getHeaders(),
            });

            if (!response.ok) return false;

            return true;
        } catch (error) {
            console.error('[UnifiedMessaging] answerCall error:', error);
            return false;
        }
    }

    /**
     * إنهاء مكالمة
     */
    async endCall(callId: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/calls/${callId}/end`, {
                method: 'POST',
                headers: this.getHeaders(),
            });

            if (!response.ok) return false;

            return true;
        } catch (error) {
            console.error('[UnifiedMessaging] endCall error:', error);
            return false;
        }
    }

    /**
     * رفض مكالمة
     */
    async declineCall(callId: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/calls/${callId}/decline`, {
                method: 'POST',
                headers: this.getHeaders(),
            });

            if (!response.ok) return false;

            return true;
        } catch (error) {
            console.error('[UnifiedMessaging] declineCall error:', error);
            return false;
        }
    }

    // ==================== أدوات مساعدة ====================

    private getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
        };
    }

    /**
     * الحصول على معرف المستخدم الحالي
     */
    getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    /**
     * تنسيق وقت الرسالة
     */
    formatMessageTime(date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;

        return d.toLocaleDateString('ar-LY', {
            day: 'numeric',
            month: 'short',
            year: days > 365 ? 'numeric' : undefined,
        });
    }

    /**
     * تنسيق مدة المكالمة
     */
    formatCallDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// التصدير
export const messagingSystem = UnifiedMessagingSystem.getInstance();
export default messagingSystem;
