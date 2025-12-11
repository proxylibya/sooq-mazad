/**
 * 🚀 useEnterpriseMessages Hook
 * React Hook متقدم لإدارة الرسائل مع Socket.IO والـ Cache
 * 
 * المميزات:
 * - Real-time messaging عبر Socket.IO
 * - Smart caching للأداء
 * - Optimistic UI updates
 * - Auto-retry على الفشل
 * - Typing indicators
 * - Online presence
 * - Read receipts
 * - Message status tracking
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import smartMessageCache from '../lib/cache/smart-message-cache';
import type { ConnectionState } from '../lib/socket/enterprise-socket-client';
import enterpriseSocketClient from '../lib/socket/enterprise-socket-client';

// ============================================
// Types
// ============================================

interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location' | 'voice' | 'bid' | 'video';
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  imageUrl?: string;
  fileUrl?: string;
  tempId?: string; // للـ Optimistic UI
}

interface Conversation {
  id: string;
  title: string;
  avatar?: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  otherUserId?: string;
  isOnline?: boolean;
  isTyping?: boolean;
}

interface UseEnterpriseMessagesReturn {
  // State
  messages: Record<string, Message[]>;
  conversations: Conversation[];
  selectedConversation: string | null;
  connectionState: ConnectionState;
  isLoading: boolean;

  // Actions
  sendMessage: (conversationId: string, content: string, type?: Message['type']) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  refreshConversations: () => Promise<void>;
  refreshMessages: (conversationId: string) => Promise<void>;

  // Stats
  totalUnread: number;
  cacheStats: ReturnType<typeof smartMessageCache.getStats>;
}

// ============================================
// Hook
// ============================================

export function useEnterpriseMessages(userId: string, token?: string): UseEnterpriseMessagesReturn {
  // State
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    attempts: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const isConnectedRef = useRef(false);
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingMessagesRef = useRef<Map<string, Message>>(new Map());

  // ============================================
  // Socket.IO Connection
  // ============================================

  useEffect(() => {
    if (!userId) return;

    console.log('🔌 [Messages Hook] Connecting to Socket.IO...');

    // الاتصال
    enterpriseSocketClient.connect(userId, token);

    // مراقبة حالة الاتصال
    const unsubscribe = enterpriseSocketClient.onConnectionStateChange((state) => {
      setConnectionState(state);
      isConnectedRef.current = state.status === 'connected';

      if (state.status === 'connected') {
        console.log('✅ [Messages Hook] Connected to Socket.IO');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, token]);

  // ============================================
  // Socket Event Listeners
  // ============================================

  useEffect(() => {
    if (!userId) return;

    // معالج الرسائل الجديدة
    const unsubscribeNewMessage = enterpriseSocketClient.on('chat:message:new', (data) => {
      console.log('📨 [Messages Hook] New message received:', data);

      const newMessage: Message = {
        id: data.message.id,
        senderId: data.message.senderId,
        conversationId: data.conversationId,
        content: data.message.content,
        type: data.message.type as Message['type'],
        createdAt: data.message.createdAt,
        status: 'delivered',
        imageUrl: data.message.imageUrl,
      };

      // إضافة للـ state
      setMessages(prev => ({
        ...prev,
        [data.conversationId]: [
          ...(prev[data.conversationId] || []),
          newMessage,
        ],
      }));

      // إضافة للـ cache (بدون 'sending' و 'failed' status)
      if (newMessage.status !== 'sending' && newMessage.status !== 'failed') {
        smartMessageCache.addMessage(data.conversationId, {
          ...newMessage,
          status: newMessage.status,
        });
      }

      // تحديث المحادثة
      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.conversationId
            ? {
              ...conv,
              lastMessage: newMessage.type === 'text' ? newMessage.content : `[${newMessage.type}]`,
              lastTime: 'الآن',
              unread: newMessage.senderId !== userId ? conv.unread + 1 : conv.unread,
            }
            : conv
        )
      );

      // تشغيل صوت إشعار إذا لم يكن من المرسل
      if (newMessage.senderId !== userId) {
        playNotificationSound();
      }
    });

    // معالج حالة التوصيل
    const unsubscribeDelivered = enterpriseSocketClient.on('chat:message:delivered', (data) => {
      updateMessageStatus(data.conversationId, data.messageId, 'delivered');
    });

    // معالج حالة القراءة
    const unsubscribeRead = enterpriseSocketClient.on('chat:message:read', (data) => {
      updateMessageStatus(data.conversationId, data.messageId, 'read');
    });

    // معالج بدء الكتابة
    const unsubscribeTypingStart = enterpriseSocketClient.on('chat:typing:start', (data) => {
      if (data.userId === userId) return; // تجاهل كتابة المستخدم نفسه

      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.conversationId
            ? { ...conv, isTyping: true }
            : conv
        )
      );
    });

    // معالج إيقاف الكتابة
    const unsubscribeTypingStop = enterpriseSocketClient.on('chat:typing:stop', (data) => {
      if (data.userId === userId) return;

      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.conversationId
            ? { ...conv, isTyping: false }
            : conv
        )
      );
    });

    // معالج حالة الاتصال
    const unsubscribeUserOnline = enterpriseSocketClient.on('user:online', (data) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.otherUserId === data.userId
            ? { ...conv, isOnline: true }
            : conv
        )
      );
    });

    const unsubscribeUserOffline = enterpriseSocketClient.on('user:offline', (data) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.otherUserId === data.userId
            ? { ...conv, isOnline: false }
            : conv
        )
      );
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeDelivered();
      unsubscribeRead();
      unsubscribeTypingStart();
      unsubscribeTypingStop();
      unsubscribeUserOnline();
      unsubscribeUserOffline();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ============================================
  // Helper Functions
  // ============================================

  /**
   * تحديث حالة رسالة
   */
  const updateMessageStatus = useCallback((
    conversationId: string,
    messageId: string,
    status: 'delivered' | 'read'
  ) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));

    smartMessageCache.updateMessageStatus(messageId, status);
  }, []);

  /**
   * تشغيل صوت إشعار
   */
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // تجاهل الأخطاء (المتصفح قد يمنع التشغيل التلقائي)
      });
    } catch {
      // تجاهل
    }
  }, []);

  // ============================================
  // Actions
  // ============================================

  /**
   * إرسال رسالة
   */
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    type: Message['type'] = 'text'
  ) => {
    if (!content.trim()) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Optimistic UI: إضافة الرسالة فوراً
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      senderId: userId,
      conversationId,
      content: content.trim(),
      type,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), optimisticMessage],
    }));

    pendingMessagesRef.current.set(tempId, optimisticMessage);

    // إرسال عبر Socket.IO
    enterpriseSocketClient.sendMessage(
      {
        conversationId,
        content: content.trim(),
        type,
        tempId,
      },
      (response) => {
        if (response.success && response.messageId) {
          // تحديث الرسالة بالـ ID الحقيقي
          setMessages(prev => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map(msg =>
              msg.tempId === tempId
                ? { ...msg, id: response.messageId!, status: 'sent', tempId: undefined }
                : msg
            ),
          }));

          pendingMessagesRef.current.delete(tempId);
        } else {
          // فشل الإرسال
          setMessages(prev => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map(msg =>
              msg.tempId === tempId
                ? { ...msg, status: 'failed' }
                : msg
            ),
          }));
        }
      }
    );

    // إيقاف مؤشر الكتابة
    stopTyping(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /**
   * اختيار محادثة
   */
  const selectConversation = useCallback((conversationId: string) => {
    // مغادرة المحادثة السابقة
    if (selectedConversation) {
      enterpriseSocketClient.leaveConversation(selectedConversation);
    }

    // الانضمام للمحادثة الجديدة
    enterpriseSocketClient.joinConversation(conversationId);
    setSelectedConversation(conversationId);

    // جلب الرسائل
    refreshMessages(conversationId);

    // تأكيد القراءة
    markAsRead(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  /**
   * تأكيد قراءة الرسائل
   */
  const markAsRead = useCallback((conversationId: string) => {
    const conversationMessages = messages[conversationId] || [];
    const unreadIds = conversationMessages
      .filter(msg => msg.senderId !== userId && msg.status !== 'read')
      .map(msg => msg.id);

    if (unreadIds.length > 0) {
      enterpriseSocketClient.markMessagesAsRead(conversationId, unreadIds);

      // تحديث محلياً
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unread: 0 } : conv
        )
      );
    }
  }, [messages, userId]);

  /**
   * بدء الكتابة
   */
  const startTyping = useCallback((conversationId: string) => {
    enterpriseSocketClient.startTyping(conversationId);

    // إيقاف تلقائي بعد 3 ثوانٍ
    const existingTimer = typingTimersRef.current.get(conversationId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);

    typingTimersRef.current.set(conversationId, timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * إيقاف الكتابة
   */
  const stopTyping = useCallback((conversationId: string) => {
    enterpriseSocketClient.stopTyping(conversationId);

    const timer = typingTimersRef.current.get(conversationId);
    if (timer) {
      clearTimeout(timer);
      typingTimersRef.current.delete(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * تحديث قائمة المحادثات
   */
  const refreshConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const tokenValue = token || '';
      const res = await fetch(`/api/conversations?userId=${encodeURIComponent(userId)}`, {
        headers: tokenValue ? { Authorization: `Bearer ${tokenValue}` } : undefined,
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setConversations(data.data);

        // إضافة للـ cache
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.data.forEach((conv: any) => {
          smartMessageCache.addConversation({
            id: conv.id,
            title: conv.title,
            avatar: conv.avatar,
            lastMessage: conv.lastMessage || '',
            lastTime: conv.lastTime || '',
            unread: conv.unread || 0,
            otherUserId: conv.otherUserId,
          });
        });
      }
    } catch (error) {
      console.error('❌ [Messages Hook] Failed to refresh conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  /**
   * تحديث رسائل محادثة
   */
  const refreshMessages = useCallback(async (conversationId: string) => {
    // التحقق من الـ cache أولاً
    const cachedMessages = await smartMessageCache.getMessages(conversationId);
    if (cachedMessages && cachedMessages.length > 0) {
      setMessages(prev => ({
        ...prev,
        [conversationId]: cachedMessages as unknown as Message[],
      }));
      return;
    }

    // جلب من الـ API
    setIsLoading(true);
    try {
      const tokenValue = token || '';
      const res = await fetch(
        `/api/messages?conversationId=${encodeURIComponent(conversationId)}&userId=${encodeURIComponent(userId)}`,
        {
          headers: tokenValue ? { Authorization: `Bearer ${tokenValue}` } : undefined,
        }
      );

      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalizedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          conversationId,
          content: msg.content,
          type: msg.type || 'text',
          createdAt: msg.createdAt,
          status: msg.status || 'sent',
        }));

        setMessages(prev => ({
          ...prev,
          [conversationId]: normalizedMessages,
        }));

        // إضافة للـ cache (بدون 'sending' و 'failed')
        const cacheableMessages = normalizedMessages.filter(
          msg => msg.status !== 'sending' && msg.status !== 'failed'
        ).map(msg => ({
          ...msg,
          status: msg.status as 'sent' | 'delivered' | 'read',
        }));
        smartMessageCache.addMessages(conversationId, cacheableMessages);
      }
    } catch (error) {
      console.error('❌ [Messages Hook] Failed to refresh messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  // ============================================
  // Computed Values
  // ============================================

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);
  const cacheStats = smartMessageCache.getStats();

  // ============================================
  // Return
  // ============================================

  return {
    messages,
    conversations,
    selectedConversation,
    connectionState,
    isLoading,

    sendMessage,
    selectConversation,
    markAsRead,
    startTyping,
    stopTyping,
    refreshConversations,
    refreshMessages,

    totalUnread,
    cacheStats,
  };
}
