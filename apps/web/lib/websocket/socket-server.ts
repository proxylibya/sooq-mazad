/**
 * WebSocket Server محسّن للتحديثات الفورية
 * يدعم Throttling, Batching, و Topic-based Subscriptions
 */

import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { logger } from '../logger';
import { metrics } from '../monitoring/performance-metrics';
import { createKeyDBPubSubConnection } from '../keydb-connection';

// أنواع التحديثات
export type UpdateType =
  | 'bid' // مزايدة جديدة
  | 'auction' // تحديث بيانات المزاد
  | 'auction_end' // انتهاء المزاد
  | 'car' // تحديث بيانات السيارة
  | 'user' // تحديث بيانات المستخدم
  | 'notification'; // إشعار

// هيكل التحديث
export interface Update {
  type: UpdateType;
  topic: string; // مثال: 'auction:123' أو 'showroom:456'
  data: unknown;
  timestamp: number;
}

// إعدادات Batching
const BATCH_INTERVAL = 1000; // إرسال كل ثانية
const MAX_BATCH_SIZE = 100; // حد أقصى لحجم الدفعة

/**
 * WebSocket Server Class
 */
import type Redis from 'ioredis';

export class SocketServer {
  private io: SocketIOServer | null = null;
  private redis: Redis | null = null;
  private redisSubscriber: Redis | null = null;
  private batchQueues: Map<string, Update[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private connectedClients: Set<string> = new Set();

  /**
   * تهيئة WebSocket Server
   */
  initialize(httpServer: HTTPServer): void {
    if (this.io) {
      logger.warn('WebSocket Server already initialized');
      return;
    }

    // إنشاء Socket.IO server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3021',
        credentials: true,
      },
      // تحسينات الأداء
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      // ضغط البيانات
      perMessageDeflate: {
        threshold: 1024, // ضغط الرسائل الأكبر من 1KB
      },
    });

    // الاتصال بـ KeyDB للـ Pub/Sub
    this.initializeRedis();

    // إعداد Event Handlers
    this.setupEventHandlers();

    logger.info('WebSocket Server initialized successfully');
  }

  /**
   * تهيئة KeyDB Pub/Sub
   */
  private initializeRedis(): void {
    const redisUrl = process.env.KEYDB_URL;

    // إذا لم يتم ضبط KEYDB_URL، تعطيل Pub/Sub بدون محاولة اتصال افتراضية
    if (!redisUrl) {
      logger.warn('KeyDB URL not configured; disabling Pub/Sub for SocketServer');
      return;
    }

    try {
      // Redis client للنشر
      this.redis = createKeyDBPubSubConnection(redisUrl);

      // Redis client للاشتراك
      this.redisSubscriber = createKeyDBPubSubConnection(redisUrl);

      // الاشتراك في قناة التحديثات
      this.redisSubscriber.subscribe('realtime:updates', (err) => {
        if (err) {
          logger.error('Failed to subscribe to Redis channel', err);
        } else {
          logger.info('Subscribed to realtime:updates channel');
        }
      });

      // معالجة الرسائل الواردة
      this.redisSubscriber.on('message', (channel, message) => {
        try {
          const update: Update = JSON.parse(message);
          this.queueUpdate(update);
        } catch (error) {
          logger.error('Failed to parse Redis message', error as Error);
        }
      });

      logger.info('KeyDB Pub/Sub initialized');
    } catch (error) {
      logger.error('Failed to initialize KeyDB', error as Error);
    }
  }

  /**
   * إعداد Event Handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);

      // الاشتراك في Topic
      socket.on('subscribe', (topic: string) => {
        this.handleSubscribe(socket, topic);
      });

      // إلغاء الاشتراك
      socket.on('unsubscribe', (topic: string) => {
        this.handleUnsubscribe(socket, topic);
      });

      // قطع الاتصال
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Ping/Pong للحفاظ على الاتصال
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });
    });
  }

  /**
   * معالجة اتصال جديد
   */
  private handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.add(clientId);

    logger.info('Client connected', { clientId });

    // تحديث المقاييس
    metrics.setActiveWebSocketConnections(this.connectedClients.size);

    // إرسال رسالة ترحيب
    socket.emit('connected', {
      clientId,
      timestamp: Date.now(),
      message: 'Connected to WebSocket server',
    });
  }

  /**
   * معالجة الاشتراك في Topic
   */
  private handleSubscribe(socket: Socket, topic: string): void {
    if (!topic || typeof topic !== 'string') {
      socket.emit('error', { message: 'Invalid topic' });
      return;
    }

    socket.join(topic);
    logger.debug('Client subscribed to topic', { clientId: socket.id, topic });

    socket.emit('subscribed', { topic, timestamp: Date.now() });
  }

  /**
   * معالجة إلغاء الاشتراك
   */
  private handleUnsubscribe(socket: Socket, topic: string): void {
    socket.leave(topic);
    logger.debug('Client unsubscribed from topic', {
      clientId: socket.id,
      topic,
    });

    socket.emit('unsubscribed', { topic, timestamp: Date.now() });
  }

  /**
   * معالجة قطع الاتصال
   */
  private handleDisconnect(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.delete(clientId);

    logger.info('Client disconnected', { clientId });

    // تحديث المقاييس
    metrics.setActiveWebSocketConnections(this.connectedClients.size);
  }

  /**
   * إضافة تحديث إلى Queue (Batching)
   */
  private queueUpdate(update: Update): void {
    const { topic } = update;

    // الحصول على أو إنشاء Queue للـ Topic
    if (!this.batchQueues.has(topic)) {
      this.batchQueues.set(topic, []);
    }

    const queue = this.batchQueues.get(topic)!;
    queue.push(update);

    // إرسال فوراً إذا وصلنا للحد الأقصى
    if (queue.length >= MAX_BATCH_SIZE) {
      this.flushBatch(topic);
      return;
    }

    // إعداد Timer للإرسال الدوري
    if (!this.batchTimers.has(topic)) {
      const timer = setTimeout(() => {
        this.flushBatch(topic);
      }, BATCH_INTERVAL);

      this.batchTimers.set(topic, timer);
    }
  }

  /**
   * إرسال دفعة التحديثات (Flush Batch)
   */
  private flushBatch(topic: string): void {
    const queue = this.batchQueues.get(topic);
    const timer = this.batchTimers.get(topic);

    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(topic);
    }

    if (!queue || queue.length === 0) {
      return;
    }

    // إرسال الدفعة
    this.sendBatchUpdate(topic, queue);

    // مسح Queue
    this.batchQueues.set(topic, []);
  }

  /**
   * إرسال دفعة التحديثات للـ Clients
   */
  private sendBatchUpdate(topic: string, updates: Update[]): void {
    if (!this.io) return;

    // إرسال للـ Room المحدد فقط
    this.io.to(topic).emit('batch_update', {
      topic,
      count: updates.length,
      updates,
      timestamp: Date.now(),
    });

    logger.debug('Batch update sent', {
      topic,
      count: updates.length,
    });
  }

  /**
   * نشر تحديث (من Server-side)
   */
  async publishUpdate(update: Update): Promise<void> {
    if (!this.redis) {
      // إذا لم يكن KeyDB متاح، إرسال مباشرة
      this.queueUpdate(update);
      return;
    }

    try {
      // نشر عبر KeyDB للـ Horizontal Scaling
      await this.redis.publish('realtime:updates', JSON.stringify(update));
    } catch (error) {
      logger.error('Failed to publish update to KeyDB', error as Error);
      // Fallback: إرسال مباشرة
      this.queueUpdate(update);
    }
  }

  /**
   * نشر تحديثات متعددة دفعة واحدة
   */
  async publishBatch(updates: Update[]): Promise<void> {
    await Promise.all(updates.map((update) => this.publishUpdate(update)));
  }

  /**
   * إرسال لجميع الـ Clients (Broadcast)
   */
  broadcast(event: string, data: unknown): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  /**
   * إرسال لـ Topic محدد
   */
  emitToTopic(topic: string, event: string, data: unknown): void {
    if (!this.io) return;
    this.io.to(topic).emit(event, data);
  }

  /**
   * الحصول على عدد الـ Clients المتصلين
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * الحصول على عدد المشتركين في Topic
   */
  async getTopicSubscribersCount(topic: string): Promise<number> {
    if (!this.io) return 0;

    const room = this.io.sockets.adapter.rooms.get(topic);
    return room ? room.size : 0;
  }

  /**
   * إغلاق Server
   */
  close(): void {
    // مسح جميع Timers
    this.batchTimers.forEach((timer) => clearTimeout(timer));
    this.batchTimers.clear();

    // مسح Queues
    this.batchQueues.clear();

    // إغلاق Redis
    if (this.redis) {
      this.redis.disconnect();
    }
    if (this.redisSubscriber) {
      this.redisSubscriber.disconnect();
    }

    // إغلاق Socket.IO
    if (this.io) {
      this.io.close();
    }

    logger.info('WebSocket Server closed');
  }
}

// Singleton instance
let socketServer: SocketServer | null = null;

/**
 * الحصول على Socket Server instance
 */
export function getSocketServer(): SocketServer {
  if (!socketServer) {
    socketServer = new SocketServer();
  }
  return socketServer;
}

/**
 * تهيئة Socket Server
 */
export function initializeSocketServer(httpServer: HTTPServer): SocketServer {
  const server = getSocketServer();
  server.initialize(httpServer);
  return server;
}

export default getSocketServer;
