/**
 * 🔔 مدير الإشعارات الموحد المتقدم
 * 
 * نظام شامل يدمج:
 * - UnifiedNotificationService (قاعدة البيانات)
 * - EnhancedNotificationSystem (UI)
 * - AuctionNotificationSystem (المزادات)
 * - notificationManager (Push Notifications)
 * 
 * @version 2.0.0
 * @date 2025-01-22
 */

import { notificationService } from '@/lib/services/UnifiedNotificationService';
import { notificationManager } from '@/lib/notifications/notificationManager';
import { prisma } from '@/lib/prisma';
import {
  UINotificationType,
  DBNotificationType,
  NotificationPriority,
  CreateNotificationOptions,
  uiToDBType,
  getNotificationPriority,
} from '@/types/notification.types';

// ===========================
// 📋 Types
// ===========================

export interface SendNotificationOptions extends CreateNotificationOptions {
  // إشعار المتصفح
  browserNotification?: boolean;
  // إشعار Push
  pushNotification?: boolean;
  // حفظ في قاعدة البيانات
  saveToDatabase?: boolean;
  // مدة عرض الإشعار (ms)
  duration?: number;
  // دائم (لا يختفي تلقائياً)
  persistent?: boolean;
  // أزرار الإجراءات
  actions?: Array<{
    label: string;
    onClick: () => void;
    type?: 'primary' | 'secondary' | 'danger';
  }>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

// ===========================
// 🔔 Unified Notification Manager
// ===========================

class UnifiedNotificationManager {
  private static instance: UnifiedNotificationManager;
  private eventEmitter: EventTarget;

  private constructor() {
    this.eventEmitter = new EventTarget();
    this.initializeBrowserNotifications();
  }

  public static getInstance(): UnifiedNotificationManager {
    if (!UnifiedNotificationManager.instance) {
      UnifiedNotificationManager.instance = new UnifiedNotificationManager();
    }
    return UnifiedNotificationManager.instance;
  }

  /**
   * إرسال إشعار موحد (قاعدة بيانات + UI + Push)
   */
  async send(options: SendNotificationOptions): Promise<string> {
    const {
      userId,
      type,
      title,
      message,
      priority,
      metadata,
      auctionId,
      carId,
      bidderId,
      transactionId,
      depositId,
      browserNotification = true,
      pushNotification = true,
      saveToDatabase = true,
      duration,
      persistent,
      actions,
    } = options;

    // تحديد النوع الصحيح
    const dbType = typeof type === 'string' && type in { success: true, error: true, warning: true, info: true, bid: true, auction: true }
      ? uiToDBType(type as UINotificationType)
      : (type as DBNotificationType);

    // تحديد الأولوية التلقائية
    const finalPriority = priority || getNotificationPriority(dbType);

    // إزالة الإيموجي من العنوان والرسالة
    const cleanTitle = this.stripEmoji(title);
    const cleanMessage = this.stripEmoji(message);

    const notificationId = '';

    // 1. حفظ في قاعدة البيانات
    if (saveToDatabase) {
      try {
        await notificationService.send({
          userId,
          type: dbType,
          title: cleanTitle,
          message: cleanMessage,
          metadata: {
            ...metadata,
            priority: finalPriority,
            uiType: type,
          },
          auctionId,
          carId,
          bidderId,
          transactionId,
          depositId,
        });
        console.log(`[Unified] ✅ حفظ الإشعار في قاعدة البيانات: ${dbType}`);
      } catch (error) {
        console.error('[Unified] ❌ خطأ في حفظ الإشعار:', error);
      }
    }

    // 2. إشعار المتصفح
    if (browserNotification && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new window.Notification(cleanTitle, {
            body: cleanMessage,
            icon: '/favicon.ico',
            tag: notificationId || `notif_${Date.now()}`,
          });
        } catch (error) {
          console.warn('[Unified] تحذير: فشل إشعار المتصفح:', error);
        }
      } else if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }

    // 3. إشعار Push للمستخدم
    if (pushNotification) {
      try {
        const subscriptions = await notificationManager.getUserSubscriptions(userId);
        if (subscriptions.length > 0) {
          // هنا يمكن إرسال Push Notification فعلي عبر Web Push API
          console.log(`[Unified] 📱 سيتم إرسال Push للمستخدم: ${userId}`);
        }
      } catch (error) {
        console.warn('[Unified] تحذير: فشل Push Notification:', error);
      }
    }

    // 4. إطلاق حدث للـ UI
    this.emit('notification', {
      id: notificationId || `notif_${Date.now()}`,
      type: dbType,
      uiType: type,
      title: cleanTitle,
      message: cleanMessage,
      priority: finalPriority,
      duration: persistent ? 0 : duration,
      actions,
      metadata: {
        ...metadata,
        auctionId,
        carId,
        bidderId,
        transactionId,
        depositId,
      },
    });

    return notificationId;
  }

  /**
   * إرسال إشعارات متعددة
   */
  async sendBulk(notifications: SendNotificationOptions[]): Promise<void> {
    const promises = notifications.map((notif) => this.send(notif));
    await Promise.all(promises);
  }

  /**
   * جلب إشعارات المستخدم
   */
  async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      isRead?: boolean;
      type?: DBNotificationType;
    }
  ) {
    return notificationService.getByUser(userId, options);
  }

  /**
   * جلب إحصائيات الإشعارات
   */
  async getStats(userId: string): Promise<NotificationStats> {
    const dbStats = await notificationService.getStats(userId);
    
    // حساب الإحصائيات حسب الأولوية
    const byPriority: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    const notifications = await this.getUserNotifications(userId, { limit: 1000 });
    notifications.forEach((notif: any) => {
      const priority = getNotificationPriority(notif.type);
      byPriority[priority]++;
    });

    return {
      ...dbStats,
      byPriority,
    };
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(notificationId: string): Promise<void> {
    await notificationService.markAsRead(notificationId);
    this.emit('notification-read', { id: notificationId });
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: string): Promise<void> {
    await notificationService.markAllAsRead(userId);
    this.emit('all-notifications-read', { userId });
  }

  /**
   * حذف إشعار
   */
  async delete(notificationId: string): Promise<void> {
    await notificationService.delete(notificationId);
    this.emit('notification-deleted', { id: notificationId });
  }

  /**
   * تنظيف الإشعارات القديمة
   */
  async cleanup(days: number = 30): Promise<number> {
    const count = await notificationService.cleanupOld(days);
    console.log(`[Unified] 🧹 تم حذف ${count} إشعار قديم`);
    return count;
  }

  // ===========================
  // 🎯 إشعارات المزادات المحددة
  // ===========================

  /**
   * إشعار الفوز بالمزاد
   */
  async notifyAuctionWon(params: {
    auctionId: string;
    winnerId: string;
    winnerName: string;
    amount: number;
    carTitle: string;
  }): Promise<void> {
    await this.send({
      userId: params.winnerId,
      type: 'AUCTION_WON',
      title: 'مبروك! فزت بالمزاد',
      message: `تهانينا! فزت بمزاد ${params.carTitle} بمبلغ ${this.formatCurrency(params.amount)} دينار ليبي.`,
      priority: 'urgent',
      auctionId: params.auctionId,
      metadata: {
        amount: params.amount,
        carTitle: params.carTitle,
      },
    });
  }

  /**
   * إشعار تأكيد البيع
   */
  async notifySaleConfirmed(params: {
    auctionId: string;
    userId: string;
    role: 'winner' | 'seller';
    otherPartyName: string;
    amount: number;
    carTitle: string;
  }): Promise<void> {
    const isWinner = params.role === 'winner';
    
    await this.send({
      userId: params.userId,
      type: 'SALE_CONFIRMED',
      title: 'تم تأكيد البيع',
      message: isWinner
        ? `تم تأكيد بيع ${params.carTitle} لك من قبل البائع ${params.otherPartyName}. المبلغ النهائي: ${this.formatCurrency(params.amount)} دينار.`
        : `تم تأكيد بيع ${params.carTitle} إلى ${params.otherPartyName} بمبلغ ${this.formatCurrency(params.amount)} دينار.`,
      priority: 'urgent',
      auctionId: params.auctionId,
      metadata: {
        role: params.role,
        amount: params.amount,
        carTitle: params.carTitle,
      },
    });
  }

  /**
   * إشعار مزايدة جديدة
   */
  async notifyNewBid(params: {
    auctionId: string;
    sellerId: string;
    bidderName: string;
    amount: number;
    carTitle: string;
    bidCount: number;
  }): Promise<void> {
    await this.send({
      userId: params.sellerId,
      type: 'NEW_BID_ON_YOUR_AUCTION',
      title: 'مزايدة جديدة على مزادك',
      message: `مزايدة جديدة من ${params.bidderName} على ${params.carTitle} بمبلغ ${this.formatCurrency(params.amount)} دينار. عدد المزايدات: ${params.bidCount}`,
      priority: 'high',
      auctionId: params.auctionId,
      metadata: {
        amount: params.amount,
        carTitle: params.carTitle,
        bidCount: params.bidCount,
      },
    });
  }

  /**
   * إشعار تجاوز المزايدة
   */
  async notifyBidOutbid(params: {
    auctionId: string;
    bidderId: string;
    previousBid: number;
    newBid: number;
    carTitle: string;
  }): Promise<void> {
    await this.send({
      userId: params.bidderId,
      type: 'BID_OUTBID',
      title: 'تم تجاوز مزايدتك',
      message: `تم تجاوز مزايدتك على ${params.carTitle}. مزايدتك السابقة: ${this.formatCurrency(params.previousBid)} دينار. المزايدة الجديدة: ${this.formatCurrency(params.newBid)} دينار.`,
      priority: 'high',
      auctionId: params.auctionId,
      metadata: {
        previousBid: params.previousBid,
        newBid: params.newBid,
        carTitle: params.carTitle,
      },
    });
  }

  /**
   * إشعار اقتراب نهاية المزاد
   */
  async notifyAuctionEnding(params: {
    auctionId: string;
    userId: string;
    carTitle: string;
    timeRemaining: string;
    currentBid: number;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: 'AUCTION_ENDING',
      title: 'المزاد ينتهي قريباً',
      message: `المزاد على ${params.carTitle} ينتهي خلال ${params.timeRemaining}. السعر الحالي: ${this.formatCurrency(params.currentBid)} دينار.`,
      priority: 'high',
      auctionId: params.auctionId,
      metadata: {
        carTitle: params.carTitle,
        timeRemaining: params.timeRemaining,
        currentBid: params.currentBid,
      },
    });
  }

  // ===========================
  // 🔧 Event System
  // ===========================

  /**
   * الاستماع لحدث
   */
  on(event: string, callback: (data: any) => void): void {
    this.eventEmitter.addEventListener(event, ((e: CustomEvent) => {
      callback(e.detail);
    }) as EventListener);
  }

  /**
   * إيقاف الاستماع لحدث
   */
  off(event: string, callback: (data: any) => void): void {
    this.eventEmitter.removeEventListener(event, callback as EventListener);
  }

  /**
   * إطلاق حدث
   */
  private emit(event: string, data: any): void {
    this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  // ===========================
  // 🛠️ Helper Functions
  // ===========================

  private stripEmoji(text: string): string {
    return text.replace(
      /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}]/gu,
      ''
    );
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-LY', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  private async initializeBrowserNotifications(): Promise<void> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }
}

// ===========================
// 📤 Export Singleton
// ===========================

export const unifiedNotificationManager = UnifiedNotificationManager.getInstance();
