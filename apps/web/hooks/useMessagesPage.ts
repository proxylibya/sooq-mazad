/**
 * useMessagesPage - High Performance Hook
 * Hook محسن لصفحة الرسائل
 * يجمع كل منطق الرسائل في مكان واحد
 * 
 * @description يوفر إدارة موحدة للمحادثات والرسائل
 * محسن لتحمل مئات الآلاف من الزيارات
 */

import { getSocketManager } from '@/utils/socketManager';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from './useAuth';

// ============ Types ============

export interface UiConversation {
    id: string;
    title: string;
    subtitle?: string;
    avatar?: string;
    lastMessage?: string;
    lastTime?: string;
    unread?: number;
    otherUserId?: string;
    otherUserPhone?: string;
}

export interface UiMessage {
    id: string;
    senderId: string;
    type: 'text' | 'image' | 'file' | 'voice' | 'location' | 'bid' | 'video';
    content: string;
    createdAt: string;
    status?: 'sent' | 'delivered' | 'read';
    imageUrl?: string;
}

export interface MessagesState {
    conversations: UiConversation[];
    messages: UiMessage[];
    selectedConversation: UiConversation | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
    isMobileView: boolean;
    showMobileConversation: boolean;
}

// ============ Helpers ============

export const formatRelativeTime = (ts: string | Date): string => {
    try {
        const dt = ts instanceof Date ? ts : new Date(ts);
        const now = Date.now();
        const diff = Math.max(0, now - dt.getTime());
        const m = Math.floor(diff / (1000 * 60));
        const h = Math.floor(diff / (1000 * 60 * 60));
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (m < 1) return 'الآن';
        if (m < 60) return `منذ ${m} دقيقة`;
        if (h < 24) return `منذ ${h} ساعة`;
        return `منذ ${d} يوم`;
    } catch {
        return '';
    }
};

export const normalizeMessageType = (type: string): UiMessage['type'] => {
    const lower = type.toLowerCase();
    return ['text', 'image', 'file', 'voice', 'location', 'bid', 'video'].includes(lower)
        ? (lower as UiMessage['type'])
        : 'text';
};

export const normalizeMessageStatus = (status?: string): UiMessage['status'] => {
    if (!status) return 'sent';
    const lower = status.toLowerCase();
    if (lower === 'read') return 'read';
    if (lower === 'delivered') return 'delivered';
    return 'sent';
};

// ============ Main Hook ============

export function useMessagesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ========== State ==========
    const [conversations, setConversations] = useState<UiConversation[]>([]);
    const [messages, setMessages] = useState<UiMessage[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [showMobileConversation, setShowMobileConversation] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);

    // ========== Computed Values ==========
    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter(
            c => c.title.toLowerCase().includes(q) || c.subtitle?.toLowerCase().includes(q)
        );
    }, [conversations, searchQuery]);

    const totalUnread = useMemo(() => {
        return conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
    }, [conversations]);

    // ========== Fetch Conversations ==========
    const fetchConversations = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/conversations');
            if (!response.ok) throw new Error('فشل في تحميل المحادثات');

            const data = await response.json();
            const convs: UiConversation[] = (data.conversations || data || []).map((c: any) => ({
                id: String(c.id),
                title: c.title || c.otherUser?.name || 'محادثة',
                subtitle: c.carTitle || c.cars?.title || c.auctions?.title,
                avatar: c.otherUser?.profileImage,
                lastMessage: c.lastMessage,
                lastTime: c.updatedAt ? formatRelativeTime(c.updatedAt) : '',
                unread: Number(c.unread) || 0,
                otherUserId: c.otherUserId || c.otherUser?.id,
                otherUserPhone: c.otherUser?.phone,
            }));

            setConversations(convs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطأ في تحميل المحادثات');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // ========== Fetch Messages ==========
    const fetchMessages = useCallback(async (conversationId: string) => {
        if (!conversationId) return;

        try {
            setMessagesLoading(true);

            const response = await fetch(`/api/conversations/${conversationId}/messages`);
            if (!response.ok) throw new Error('فشل في تحميل الرسائل');

            const data = await response.json();
            const msgs: UiMessage[] = (data.messages || data || []).map((m: any) => ({
                id: String(m.id),
                senderId: String(m.senderId),
                type: normalizeMessageType(m.type || 'text'),
                content: m.content || '',
                createdAt: m.createdAt,
                status: normalizeMessageStatus(m.status),
                imageUrl: m.type === 'image' ? m.content : undefined,
            }));

            setMessages(msgs);

            // Mark as read
            fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' }).catch(() => { });
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setMessagesLoading(false);
        }
    }, []);

    // ========== Send Message ==========
    const sendMessage = useCallback(async (content: string, type: UiMessage['type'] = 'text') => {
        if (!selectedConversationId || !content.trim() || !user?.id) return;

        const tempId = `temp-${Date.now()}`;
        const newMessage: UiMessage = {
            id: tempId,
            senderId: String(user.id),
            type,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            status: 'sent',
        };

        // Optimistic update
        setMessages(prev => [...prev, newMessage]);

        try {
            const response = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content.trim(), type }),
            });

            if (!response.ok) throw new Error('فشل في إرسال الرسالة');

            const data = await response.json();

            // Replace temp message with real one
            setMessages(prev => prev.map(m =>
                m.id === tempId
                    ? { ...m, id: String(data.message?.id || data.id), status: 'delivered' as const }
                    : m
            ));

            // Update conversation's last message
            setConversations(prev => prev.map(c =>
                c.id === selectedConversationId
                    ? { ...c, lastMessage: content.trim(), lastTime: 'الآن' }
                    : c
            ));

            return { success: true };
        } catch (err) {
            // Remove failed message
            setMessages(prev => prev.filter(m => m.id !== tempId));
            return { success: false, error: err instanceof Error ? err.message : 'خطأ' };
        }
    }, [selectedConversationId, user?.id]);

    // ========== Select Conversation ==========
    const selectConversation = useCallback((conversationId: string) => {
        setSelectedConversationId(conversationId);
        setShowMobileConversation(true);
        fetchMessages(conversationId);

        // Clear unread count
        setConversations(prev => prev.map(c =>
            c.id === conversationId ? { ...c, unread: 0 } : c
        ));
    }, [fetchMessages]);

    // ========== Back to List (Mobile) ==========
    const goBackToList = useCallback(() => {
        setShowMobileConversation(false);
        setSelectedConversationId(null);
        setMessages([]);
    }, []);

    // ========== Socket Connection ==========
    useEffect(() => {
        if (!user?.id) return;

        const socketManager = getSocketManager();

        const handleNewMessage = (data: any) => {
            const msg: UiMessage = {
                id: String(data.id || data.messageId),
                senderId: String(data.senderId),
                type: normalizeMessageType(data.type || 'text'),
                content: data.content || '',
                createdAt: data.createdAt || new Date().toISOString(),
                status: 'delivered',
            };

            // Add message if in current conversation
            if (String(data.conversationId) === selectedConversationId) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === msg.id);
                    return exists ? prev : [...prev, msg];
                });
            }

            // Update conversation list
            setConversations(prev => prev.map(c =>
                String(c.id) === String(data.conversationId)
                    ? {
                        ...c,
                        lastMessage: msg.content,
                        lastTime: 'الآن',
                        unread: String(data.conversationId) !== selectedConversationId
                            ? (c.unread || 0) + 1
                            : c.unread,
                    }
                    : c
            ));
        };

        const handleTyping = (data: any) => {
            if (String(data.conversationId) === selectedConversationId) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        };

        socketManager.on('chat:message:new', handleNewMessage);
        socketManager.on('chat:typing', handleTyping);

        return () => {
            socketManager.off('chat:message:new', handleNewMessage);
            socketManager.off('chat:typing', handleTyping);
        };
    }, [user?.id, selectedConversationId]);

    // ========== Initial Load ==========
    useEffect(() => {
        if (user?.id && !authLoading) {
            fetchConversations();
        }
    }, [user?.id, authLoading, fetchConversations]);

    // ========== Handle URL Conversation ID ==========
    useEffect(() => {
        const { conversationId } = router.query;
        if (conversationId && typeof conversationId === 'string' && conversations.length > 0) {
            selectConversation(conversationId);
        }
    }, [router.query, conversations.length, selectConversation]);

    // ========== Mobile Detection ==========
    useEffect(() => {
        const checkMobile = () => setIsMobileView(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ========== Scroll to Bottom ==========
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ========== Return ==========
    return {
        // Auth
        user,
        authLoading,

        // State
        conversations: filteredConversations,
        allConversations: conversations,
        messages,
        selectedConversation,
        selectedConversationId,
        loading,
        messagesLoading,
        error,
        searchQuery,
        isMobileView,
        showMobileConversation,
        isTyping,
        totalUnread,
        showNewConversationModal,

        // Refs
        messagesEndRef,

        // Actions
        setSearchQuery,
        selectConversation,
        goBackToList,
        sendMessage,
        fetchConversations,
        fetchMessages,
        setShowNewConversationModal,
        setConversations,
        setMessages,
    };
}

export default useMessagesPage;
