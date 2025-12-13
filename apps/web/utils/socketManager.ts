/**
 * Socket Connection Manager
 * مدير اتصالات Socket للمزادات المباشرة
 */

import { io, Socket } from 'socket.io-client';
import {
  AuctionState,
  BidData,
  ClientToServerEvents,
  ConnectionState,
  ServerToClientEvents,
  SocketErrorCodes,
} from '../types/socket';

// Interface for socket event handlers
interface SocketEventHandlers {
  [event: string]: ((...args: unknown[]) => void)[];
}

// Enterprise-only client->server events
interface EnterpriseClientToServerEvents {
  'join:conversation': (conversationId: string) => void;
  'leave:conversation': (conversationId: string) => void;
  'typing:start': (conversationId: string) => void;
  'typing:stop': (conversationId: string) => void;
  'message:mark-read': (data: { conversationId: string; messageIds: string[]; }) => void;
  // presence announce (alternative overload used by enterprise server)
  'presence:announce': (userId: string) => void;
}

// Type for event listener function
type EventListener = (...args: unknown[]) => void;

// Client-side Socket type
type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Enterprise-only server->client events (from enterprise-socket-server)
interface EnterpriseServerToClientEvents {
  'user:online': { userId: string; status: 'online'; };
  'user:offline': { userId: string; status: 'offline'; lastSeen?: string; };
  'chat:typing:start': { conversationId: string; userId: string; userName: string; };
  'chat:typing:stop': { conversationId: string; userId: string; userName: string; };
  'chat:message:read': {
    conversationId: string;
    messageId: string;
    userId: string;
    status: 'read';
    timestamp: string;
  };
}

export class SocketManager {
  private socket: ClientSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentAuction: string | null = null;
  private eventHandlers: SocketEventHandlers = {};
  private connectionState: ConnectionState = 'disconnected';
  private eventListeners: Map<string, EventListener[]> = new Map();
  private hasLoggedConnectionError = false; // لتقليل console spam
  private joinedConversations: Set<string> = new Set();
  private conversationTokens: Map<string, string> = new Map();

  // Connection status callbacks
  private onConnectionChange?: (state: ConnectionState) => void;
  private onError?: (error: { code: string; message: string; }) => void;
  constructor() {
    if (typeof window === 'undefined') {
      // Server-side rendering check
      return;
    }

    this.initializeSocket();
  }

  /**
   * Initialize Socket.IO connection
   */
  private initializeSocket(): void {
    try {
      // اجعل عنوان الخادم ديناميكياً لتفادي تعارض المنافذ في التطوير
      const envUrl =
        (typeof window !== 'undefined'
          ? (window as unknown as { __SOCKET_URL__?: string; }).__SOCKET_URL__
          : undefined) || process.env.NEXT_PUBLIC_SOCKET_URL;
      const socketUrl =
        envUrl ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3021');

      // تعطيل الاتصال التلقائي في التطوير لتقليل الضوضاء
      const isDev = process.env.NODE_ENV !== 'production';

      this.socket = io(socketUrl, {
        path: '/socket.io', // ✅ Standard Socket.IO path for external server
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: !isDev, // إعادة الاتصال فقط في الإنتاج
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelayMax: 10000, // الحد الأقصى 10 ثواني
        forceNew: false,
        upgrade: true,
        autoConnect: false, // ❌ تعطيل الاتصال التلقائي - سيتم الاتصال عند الحاجة فقط
      });

      this.setupEventHandlers();

      if (isDev) {
        console.log('[Socket.IO] Socket manager initialized (manual connect mode for dev)');
      } else {
        console.log('[Socket.IO] Socket manager initialized with auto-connect');
      }
    } catch (error) {
      console.error('خطأ في تهيئة Socket:', error);
      this.handleError(SocketErrorCodes.CONNECTION_ERROR, 'Failed to initialize socket');
    }
  }

  /**
   * Setup core socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Typed enterprise socket for additional events
    const eSocket = this.socket as unknown as Socket<
      ServerToClientEvents & EnterpriseServerToClientEvents,
      ClientToServerEvents & EnterpriseClientToServerEvents
    >;

    // Connection events
    this.socket.on('connect', () => {
      console.log('[Socket.IO] متصل');
      this.setConnectionState('connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.hasLoggedConnectionError = false; // إعادة تعيين للمحاولات القادمة
      this.startHeartbeat();

      // Re-join all previously joined conversations after reconnect
      try {
        this.joinedConversations.forEach((cid) => {
          const token = this.conversationTokens.get(String(cid)) || '';
          this.socket?.emit('chat:join', { conversationId: cid, userToken: token });
          // Enterprise server: join
          eSocket.emit('join:conversation', String(cid));
        });
      } catch (_) {
        // ignore
      }
    });

    this.socket.on('disconnect', (reason) => {
      // فقط إذا كان متصلاً من قبل
      if (this.connectionState === 'connected') {
        console.log('[Socket.IO] انقطع الاتصال', reason);
      }
      this.setConnectionState('disconnected');
      this.stopHeartbeat();

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      const isDev = process.env.NODE_ENV !== 'production';

      // تجاهل الأخطاء تماماً في التطوير مع autoConnect: false
      if (isDev) {
        // لا نفعل شيء - WebSocket غير مطلوب في التطوير
        return;
      }

      // في الإنتاج فقط: معالجة الأخطاء
      if (!this.hasLoggedConnectionError) {
        console.error('[Socket.IO] خطأ في الاتصال:', error.message);
        this.hasLoggedConnectionError = true;
        this.attemptReconnect();
      }

      this.setConnectionState('error');
      this.handleError(SocketErrorCodes.CONNECTION_ERROR, error.message);
    });

    // Auction-specific events
    this.socket.on('auction:joined', (data) => {
      console.log('[انضمام] تم الانضمام للمزاد:', data.auction?.auctionId || 'unknown');
      this.currentAuction = data.auction?.auctionId || null;
      this.emit('auction:joined', data);
    });

    this.socket.on('auction:left', (data) => {
      console.log('[مغادرة] مغادرة مشارك:', data.userId);
      this.emit('auction:left', data);
    });

    this.socket.on('bid:placed', (bid) => {
      console.log('[مزايدة] عرض جديد:', bid);
      this.emit('bid:placed', bid);
    });

    this.socket.on('bid:rejected', (data) => {
      console.log('[مرفوض] عرض مرفوض:', data.reason);
      this.emit('bid:rejected', data);
    });

    this.socket.on('bid:outbid', (data) => {
      console.log('[تجاوز] تم تجاوز عرضك:', data);
      this.emit('bid:outbid', data);
    });

    this.socket.on('auction:state-updated', (auction) => {
      this.emit('auction:state-updated', auction);
    });

    this.socket.on('auction:started', (auction) => {
      console.log('[بدء] بدء المزاد:', (auction as AuctionState)?.auctionId || 'unknown');
      this.emit('auction:started', auction);
    });

    this.socket.on('auction:ending-soon', (data) => {
      console.log('[تحذير] المزاد ينتهي قريباً:', data.remainingSeconds);
      this.emit('auction:ending-soon', data);
    });

    this.socket.on('auction:ended', (data) => {
      console.log('[انتهى] انتهى المزاد:', data);
      this.emit('auction:ended', data);
      this.currentAuction = null;
    });

    this.socket.on('auction:extended', (data) => {
      console.log('[تمديد] تمديد المزاد:', data);
      this.emit('auction:extended', data);
    });

    // Notification events
    this.socket.on('notification:info', (data) => {
      this.emit('notification:info', data);
    });

    this.socket.on('notification:auction', (data) => {
      this.emit('notification:auction', data);
    });

    // Error handling
    this.socket.on('error:auction', (error) => {
      console.error('خطأ في المزاد:', error);
      this.handleError(error.code, error.error);
    });

    // Connection status updates
    this.socket.on('connection:status', (data) => {
      if (data.status === 'connected') {
        this.setConnectionState('connected');
      }
      this.emit('connection:status', data);
    });

    // Presence & Chat events
    this.socket.on('presence:update', (data) => {
      this.emit('presence:update', data);
    });

    // 🔁 Bridging enterprise presence events to unified event used by UI (permissive typing)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('user:online', (data: any) => {
      try {
        this.emit('presence:update', { userId: String(data?.userId), isOnline: true });
      } catch (_) { }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('user:offline', (data: any) => {
      try {
        this.emit('presence:update', { userId: String(data?.userId), isOnline: false });
      } catch (_) { }
    });

    this.socket.on('chat:typing', (data) => {
      this.emit('chat:typing', data);
    });
    // 🔁 Bridging typing start/stop (enterprise) to unified 'chat:typing' (permissive typing)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('chat:typing:start', (data: any) => {
      try {
        const payload = {
          conversationId: String(data?.conversationId),
          userId: String(data?.userId),
          typing: true,
        };
        this.emit('chat:typing', payload);
      } catch (_) { }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('chat:typing:stop', (data: any) => {
      try {
        const payload = {
          conversationId: String(data?.conversationId),
          userId: String(data?.userId),
          typing: false,
        };
        this.emit('chat:typing', payload);
      } catch (_) { }
    });

    this.socket.on('chat:message:new', (data) => {
      this.emit('chat:message:new', data);
    });

    this.socket.on('chat:messages:read', (data) => {
      this.emit('chat:messages:read', data);
    });
    // 🔁 Bridging single-message read (enterprise) to bulk read event used by UI (permissive typing)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('chat:message:read', (data: any) => {
      try {
        const payload = {
          conversationId: String(data?.conversationId),
          readerId: String(data?.userId || data?.readerId || ''),
          readAt: String(data?.timestamp || data?.readAt || new Date().toISOString()),
        };
        this.emit('chat:messages:read', payload);
      } catch (_) { }
    });

    this.socket.on('chat:message:delivered', (data) => {
      this.emit('chat:message:delivered', data);
    });

    // 🔔 Messages unread count update
    this.socket.on('messages:unread-update', (data) => {
      this.emit('messages:unread-update', data);
    });

    // ===== Calls (WebRTC signaling) =====
    // Incoming ring
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:ring', (data: any) => {
      try {
        this.emit('call:ring', data);
      } catch (_) { }
    });

    // Call accepted/rejected
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:accepted', (data: any) => {
      try {
        this.emit('call:accepted', data);
      } catch (_) { }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:rejected', (data: any) => {
      try {
        this.emit('call:rejected', data);
      } catch (_) { }
    });

    // SDP exchange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:offer', (data: any) => {
      try {
        this.emit('call:offer', data);
      } catch (_) { }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:answer', (data: any) => {
      try {
        this.emit('call:answer', data);
      } catch (_) { }
    });

    // ICE candidates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:ice-candidate', (data: any) => {
      try {
        this.emit('call:ice-candidate', data);
      } catch (_) { }
    });

    // Call ended/busy/error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:ended', (data: any) => {
      try {
        this.emit('call:ended', data);
      } catch (_) { }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:busy', (data: any) => {
      try {
        this.emit('call:busy', data);
      } catch (_) { }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.socket as unknown as any).on('call:error', (data: any) => {
      try {
        this.emit('call:error', data);
      } catch (_) { }
    });
  }

  /**
   * Join an auction room
   */
  public async joinAuction(
    auctionId: string,
    userToken: string,
  ): Promise<{ success: boolean; error?: string; auction?: AuctionState; }> {
    return new Promise((resolve) => {
      // محاولة الاتصال إذا لم يكن متصلاً
      if (!this.socket) {
        resolve({ success: false, error: 'Socket not initialized' });
        return;
      }

      if (!this.isConnected()) {
        // اتصل أولاً في وضع التطوير
        this.socket.connect();
        this.setConnectionState('connecting');

        // انتظر الاتصال أو timeout
        const connectTimeout = setTimeout(() => {
          resolve({ success: false, error: 'Socket not connected' });
        }, 3000);

        this.socket.once('connect', () => {
          clearTimeout(connectTimeout);
          // الآن يمكن الانضمام للمزاد
          this.joinAuctionInternal(auctionId, userToken, resolve);
        });

        return;
      }

      this.joinAuctionInternal(auctionId, userToken, resolve);
    });
  }

  /**
   * Internal method for joining auction after connection
   */
  private joinAuctionInternal(
    auctionId: string,
    userToken: string,
    resolve: (value: { success: boolean; error?: string; auction?: AuctionState; }) => void,
  ): void {
    if (!this.socket) {
      resolve({ success: false, error: 'Socket not available' });
      return;
    }

    const timeout = setTimeout(() => {
      resolve({ success: false, error: 'Connection timeout' });
    }, 10000);

    this.socket.emit('auction:join', { auctionId, userToken }, (response) => {
      clearTimeout(timeout);
      resolve(response);
    });
  }

  /**
   * Leave auction room
   */
  public leaveAuction(auctionId: string): void {
    if (!this.socket || !this.isConnected()) return;

    this.socket.emit('auction:leave', { auctionId });
    this.currentAuction = null;
  }

  /**
   * Place a bid
   */
  public async placeBid(
    auctionId: string,
    amount: number,
  ): Promise<{ success: boolean; error?: string; bid?: BidData; }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected()) {
        resolve({ success: false, error: 'Socket not connected' });
        return;
      }

      if (!this.currentAuction || this.currentAuction !== auctionId) {
        resolve({ success: false, error: 'Not in auction room' });
        return;
      }

      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Bid timeout' });
      }, 5000);

      this.socket.emit('bid:place', { auctionId, amount }, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  /**
   * Start heartbeat to maintain connection
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing interval

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected()) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt reconnection with exponential backoff
   */
  private attemptReconnect(): void {
    const isDev = process.env.NODE_ENV !== 'production';

    // في التطوير: لا نحاول إعادة الاتصال تلقائياً لتجنب الضوضاء
    if (isDev) {
      this.setConnectionState('error');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('تجاوز الحد الأقصى لمحاولات إعادة الاتصال');
      this.setConnectionState('error');
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionState('reconnecting');

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(
      `محاولة إعادة الاتصال ${this.reconnectAttempts}/${this.maxReconnectAttempts} خلال ${delay}ms`,
    );

    setTimeout(() => {
      if (this.socket && !this.isConnected()) {
        this.socket.connect();
      }
    }, delay);
  }

  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    if (this.onConnectionChange) {
      this.onConnectionChange(state);
    }
  }

  /**
   * Handle errors
   */
  private handleError(code: string, message: string): void {
    if (this.onError) {
      this.onError({ code, message });
    }
    this.emit('error', { code, message });
  }

  /**
   * Event listener management
   */
  public on(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  public off(event: string, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`خطأ في معالج الحدث ${event}:`, error);
        }
      });
    }
  }

  /**
   * Public getters and utilities
   */
  public isConnected(): boolean {
    // الاعتماد على حالة socket الفعلية لتجنب سباقات الحالة
    return this.socket?.connected === true;
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get the underlying Socket.IO client instance (typed)
   */
  public getClientSocket(): ClientSocket | null {
    return this.socket;
  }

  public getCurrentAuction(): string | null {
    return this.currentAuction;
  }

  public setConnectionChangeCallback(callback: (state: ConnectionState) => void): void {
    this.onConnectionChange = callback;
  }

  public setErrorCallback(callback: (error: { code: string; message: string; }) => void): void {
    this.onError = callback;
  }

  /**
   * Clean up connections
   */
  public disconnect(): void {
    this.stopHeartbeat();

    if (this.currentAuction && this.socket) {
      this.leaveAuction(this.currentAuction);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.setConnectionState('disconnected');
    this.eventListeners.clear();
    console.log('[تنظيف] تم قطع الاتصال وتنظيف الموارد');
  }

  // ===== Presence & Chat helpers =====
  public announcePresence(userToken: string): void {
    if (!this.socket) return;

    const eSocket = this.socket as unknown as Socket<
      ServerToClientEvents & EnterpriseServerToClientEvents,
      ClientToServerEvents & EnterpriseClientToServerEvents
    >;

    // ⚠️ WebSocket ليس ضرورياً في التطوير - الرسائل تعمل عبر HTTP
    // تمكين الإعلان عن الحضور في جميع البيئات
    if (!this.isConnected()) {
      try {
        this.socket.connect();
        this.setConnectionState('connecting');
        this.socket.once('connect', () => {
          // Legacy server expects object { userToken }
          this.socket?.emit('presence:announce', { userToken });
          // Enterprise server expects userId: إذا تم تمرير معرف المستخدم بدلاً من التوكن
          // سنرسل أيضاً كسلسلة عندما لا يبدو أنه JWT
          if (userToken && typeof userToken === 'string' && userToken.split('.').length < 3) {
            // likely a plain userId
            eSocket.emit('presence:announce', String(userToken));
          }
        });
      } catch (_) {
        // تجاهل أخطاء الاتصال
      }
      return;
    }
    this.socket.emit('presence:announce', { userToken });
    if (userToken && typeof userToken === 'string' && userToken.split('.').length < 3) {
      eSocket.emit('presence:announce', String(userToken));
    }
  }

  public joinChat(conversationId: string, userToken: string): void {
    if (!this.socket) return;

    const eSocket = this.socket as unknown as Socket<
      ServerToClientEvents & EnterpriseServerToClientEvents,
      ClientToServerEvents & EnterpriseClientToServerEvents
    >;

    // إذا لم نكن متصلين، قم بالاتصال أولاً ثم انضم
    if (!this.isConnected()) {
      try {
        this.socket.connect();
        this.setConnectionState('connecting');
        this.socket.once('connect', () => {
          // Legacy server join
          this.socket?.emit('chat:join', { conversationId, userToken });
          // Enterprise server join
          eSocket.emit('join:conversation', String(conversationId));
          this.joinedConversations.add(String(conversationId));
          this.conversationTokens.set(String(conversationId), String(userToken));
        });
      } catch (_) {
        // تجاهل أخطاء الاتصال
      }
      return;
    }
    // إذا كنا متصلين بالفعل
    this.socket.emit('chat:join', { conversationId, userToken });
    eSocket.emit('join:conversation', String(conversationId));
    this.joinedConversations.add(String(conversationId));
    this.conversationTokens.set(String(conversationId), String(userToken));
  }

  public leaveChat(conversationId: string): void {
    if (!this.socket) return;
    const eSocket = this.socket as unknown as Socket<
      ServerToClientEvents & EnterpriseServerToClientEvents,
      ClientToServerEvents & EnterpriseClientToServerEvents
    >;
    this.socket.emit('chat:leave', { conversationId });
    // Enterprise compatibility
    eSocket.emit('leave:conversation', String(conversationId));
    this.joinedConversations.delete(String(conversationId));
    this.conversationTokens.delete(String(conversationId));
  }

  public typingStart(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('chat:typing:start', { conversationId });
    // Enterprise compatibility
    const eSocket = this.socket as unknown as Socket<
      ServerToClientEvents & EnterpriseServerToClientEvents,
      ClientToServerEvents & EnterpriseClientToServerEvents
    >;
    eSocket.emit('typing:start', String(conversationId));
  }

  public typingStop(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('chat:typing:stop', { conversationId });
    // Enterprise compatibility
    const eSocket = this.socket as unknown as Socket<
      ServerToClientEvents & EnterpriseServerToClientEvents,
      ClientToServerEvents & EnterpriseClientToServerEvents
    >;
    eSocket.emit('typing:stop', String(conversationId));
  }

  public deliveredAck(conversationId: string, messageId: string): void {
    if (!this.socket) return;
    this.socket.emit('chat:message:delivered', { conversationId, messageId });
  }

  public readAck(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('chat:message:read', { conversationId });
    // Enterprise compatibility: expect message:mark-read with messageIds array
    // سنرسل كقراءة مجمعة بدون تحديد معرفات (السيرفر قد يتجاهلها إن لم يدعم)
    const eSocket = this.socket as unknown as Socket<
      ServerToClientEvents & EnterpriseServerToClientEvents,
      ClientToServerEvents & EnterpriseClientToServerEvents
    >;
    eSocket.emit('message:mark-read', { conversationId: String(conversationId), messageIds: [] });
  }

  // ===== Calls (WebRTC signaling) API =====
  public startCall(
    conversationId: string,
    toUserId: string,
    media: 'video' | 'audio' = 'video',
    callId?: string,
  ): void {
    if (!this.socket) return;
    const id = callId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.socket.emit('call:start', { conversationId, toUserId, media, callId: id });
  }

  public acceptCall(conversationId: string, callId: string): void {
    if (!this.socket) return;
    this.socket.emit('call:accept', { conversationId, callId });
  }

  public rejectCall(conversationId: string, callId: string, reason?: string): void {
    if (!this.socket) return;
    this.socket.emit('call:reject', { conversationId, callId, reason });
  }

  public cancelCall(conversationId: string, callId: string): void {
    if (!this.socket) return;
    this.socket.emit('call:cancel', { conversationId, callId });
  }

  public endCall(conversationId: string, callId: string, reason?: string): void {
    if (!this.socket) return;
    this.socket.emit('call:ended', { conversationId, callId, reason });
  }

  public sendOffer(conversationId: string, callId: string, sdp: RTCSessionDescriptionInit): void {
    if (!this.socket) return;
    this.socket.emit('call:offer', { conversationId, callId, sdp });
  }

  public sendAnswer(conversationId: string, callId: string, sdp: RTCSessionDescriptionInit): void {
    if (!this.socket) return;
    this.socket.emit('call:answer', { conversationId, callId, sdp });
  }

  public sendIceCandidate(
    conversationId: string,
    callId: string,
    candidate: RTCIceCandidateInit,
  ): void {
    if (!this.socket) return;
    this.socket.emit('call:ice-candidate', { conversationId, callId, candidate });
  }
}

// Singleton instance for global use
let socketManagerInstance: SocketManager | null = null;

export function getSocketManager(): SocketManager {
  if (typeof window === 'undefined') {
    // Server-side rendering - return mock
    return {} as SocketManager;
  }

  if (!socketManagerInstance) {
    socketManagerInstance = new SocketManager();
  }

  return socketManagerInstance;
}

export function destroySocketManager(): void {
  if (socketManagerInstance) {
    socketManagerInstance.disconnect();
    socketManagerInstance = null;
  }
}
