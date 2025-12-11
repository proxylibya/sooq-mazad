/**
 * 🔌 useRealtimeConnection Hook
 * Hook لإدارة الاتصال الفوري بشكل تلقائي
 */

import { getSocketManager } from '@/utils/socketManager';
import { useCallback, useEffect, useRef, useState } from 'react';
import useAuth from './useAuth';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface UseRealtimeConnectionOptions {
  /** هل يتم الاتصال تلقائياً؟ */
  autoConnect?: boolean;
  /** هل يتم الإعلان عن الحضور؟ */
  announcePresence?: boolean;
  /** Callback عند تغير حالة الاتصال */
  onConnectionChange?: (status: ConnectionStatus) => void;
}

interface UseRealtimeConnectionReturn {
  /** حالة الاتصال الحالية */
  status: ConnectionStatus;
  /** هل متصل؟ */
  isConnected: boolean;
  /** محاولة الاتصال يدوياً */
  connect: () => void;
  /** قطع الاتصال */
  disconnect: () => void;
  /** الانضمام لمحادثة */
  joinConversation: (conversationId: string) => void;
  /** مغادرة محادثة */
  leaveConversation: (conversationId: string) => void;
}

/**
 * Hook لإدارة الاتصال الفوري
 */
export function useRealtimeConnection(
  options: UseRealtimeConnectionOptions = {}
): UseRealtimeConnectionReturn {
  const {
    autoConnect = true,
    announcePresence = true,
    onConnectionChange,
  } = options;

  const { user, getToken } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const socketManagerRef = useRef(getSocketManager());
  const hasConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 2; // تقليل المحاولات لتجنب spam في console
  const hasAttemptedAutoConnectRef = useRef(false); // منع المحاولات المتكررة

  /**
   * تحديث حالة الاتصال
   */
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus((prev) => {
      if (prev === newStatus) return prev; // منع تحديثات غير ضرورية
      onConnectionChange?.(newStatus);
      return newStatus;
    });
  }, [onConnectionChange]);

  /**
   * محاولة الاتصال
   */
  const connect = useCallback(() => {
    const sm = socketManagerRef.current;
    if (!sm || hasConnectedRef.current) return;

    // إذا وصلنا للحد الأقصى، لا نحاول مرة أخرى
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      return;
    }

    updateStatus('connecting');

    try {
      // الاتصال بـ Socket
      if (typeof sm.isConnected === 'function' && !sm.isConnected()) {
        const socket = sm.getClientSocket();
        if (socket && typeof socket.connect === 'function') {
          socket.connect();
        }
      }

      // الإعلان عن الحضور
      if (announcePresence && user?.id) {
        const token = getToken?.();
        if (token) {
          setTimeout(() => {
            sm.announcePresence(token);
            sm.announcePresence(String(user.id));
          }, 500);
        }
      }
    } catch {
      // التحويل الهادئ لـ polling mode بدون أخطاء
      reconnectAttemptsRef.current = maxReconnectAttempts;
      updateStatus('error');
    }
  }, [user, getToken, announcePresence, updateStatus]);

  /**
   * قطع الاتصال
   */
  const disconnect = useCallback(() => {
    const sm = socketManagerRef.current;
    if (!sm) return;

    // قطع الاتصال بهدوء

    // مسح أي محاولات إعادة اتصال معلقة
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // إعادة تعيين عداد المحاولات والـ flags
    reconnectAttemptsRef.current = 0;
    hasAttemptedAutoConnectRef.current = false;

    // قطع اتصال الـ Socket فعلياً إذا كان موجوداً
    try {
      const socket = sm.getClientSocket?.();
      if (socket && typeof socket.disconnect === 'function') {
        socket.disconnect();
      }
    } catch {
      // تجاهل أي خطأ عند محاولة قطع الاتصال
    }

    hasConnectedRef.current = false;
    updateStatus('disconnected');
  }, [updateStatus]);

  /**
   * الانضمام لمحادثة
   */
  const joinConversation = useCallback((conversationId: string) => {
    const sm = socketManagerRef.current;
    if (!sm) return;

    const token = getToken?.();
    if (!token) return;
    sm.joinChat(conversationId, token);
  }, [getToken]);

  /**
   * مغادرة محادثة
   */
  const leaveConversation = useCallback((conversationId: string) => {
    const sm = socketManagerRef.current;
    if (!sm) return;

    // مغادرة المحادثة بهدوء
    sm.leaveChat(conversationId);
  }, []);

  /**
   * مراقبة حالة الاتصال
   */
  useEffect(() => {
    const sm = socketManagerRef.current;
    if (!sm) return;

    // الحصول على الـ socket الداخلي
    const socket = sm.getClientSocket();
    if (!socket) return;

    // معالجات الأحداث
    const handleConnect = () => {
      hasConnectedRef.current = true;
      reconnectAttemptsRef.current = 0; // إعادة تعيين العداد عند الاتصال الناجح
      updateStatus('connected');
    };

    const handleDisconnect = () => {
      hasConnectedRef.current = false;
      updateStatus('disconnected');
    };

    const handleConnectError = () => {
      // تقليل spam في console - لا نسجل أي شيء
      reconnectAttemptsRef.current += 1;

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        // التحويل الهادئ لـ polling mode
        if (process.env.NODE_ENV !== 'production') {
          console.log('[useRealtimeConnection] Switching to polling mode (WebSocket unavailable)');
        }
        updateStatus('error');
      }
    };

    // تسجيل المستمعات
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // إذا كان متصلاً بالفعل
    if (socket.connected && !hasConnectedRef.current) {
      handleConnect();
    }

    // التنظيف
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      // no extra reserved reconnect listeners to avoid typing issues
    };
  }, [updateStatus]);

  /**
   * الاتصال التلقائي عند تسجيل الدخول
   */
  useEffect(() => {
    // فقط نحاول الاتصال مرة واحدة عند تسجيل دخول المستخدم
    if (autoConnect && user?.id && !hasConnectedRef.current && !hasAttemptedAutoConnectRef.current) {
      hasAttemptedAutoConnectRef.current = true;
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, user?.id]); // إزالة connect من dependencies لمنع الحلقة اللانهائية

  return {
    status,
    isConnected: status === 'connected',
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
  };
}
