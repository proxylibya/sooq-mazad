/**
 * نظام الإشعارات الموحد
 *
 * نظام موحد وشامل لإدارة جميع أنواع الإشعارات في المشروع
 * يدعم إشعارات المزادات، المعاملات، الإيداعات، والرسائل
 *
 * @version 1.0.0
 * @date 2025-10-22
 */

import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

// ===========================
// Types & Interfaces
// ===========================

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  auctionId?: string;
  carId?: string;
  bidderId?: string;
  transactionId?: string;
  depositId?: string;
}

export interface FilterOptions {
  isRead?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

// ===========================
// Unified Notification Service
// ===========================

export class UnifiedNotificationService {
  /**
   * إرسال إشعار واحد
   */
  async send(data: NotificationData): Promise<void> {
    try {
      const notificationId = this.generateId();

      await prisma.notifications.create({
        data: {
          id: notificationId,
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {},
          auctionId: data.auctionId,
          carId: data.carId,
          bidderId: data.bidderId,
          transactionId: data.transactionId,
          depositId: data.depositId,
          isRead: false,
          createdAt: new Date(),
        },
      });

      console.log(
        `[Notification] [تم بنجاح] تم إرسال إشعار: ${data.type} للمستخدم: ${data.userId}`,
      );
    } catch (error) {
      console.error('[Notification] [خطأ] خطأ في إرسال الإشعار:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعارات متعددة
   */
  async sendBulk(notifications: NotificationData[]): Promise<void> {
    try {
      const data = notifications.map((notif) => ({
        id: this.generateId(),
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        metadata: notif.metadata || {},
        auctionId: notif.auctionId,
        carId: notif.carId,
        bidderId: notif.bidderId,
        transactionId: notif.transactionId,
        depositId: notif.depositId,
        isRead: false,
        createdAt: new Date(),
      }));

      await prisma.notifications.createMany({ data });

      console.log(`[Notification] [تم بنجاح] تم إرسال ${notifications.length} إشعار`);
    } catch (error) {
      console.error('[Notification] [خطأ] خطأ في إرسال الإشعارات المتعددة:', error);
      throw error;
    }
  }

  // ===========================
  // إشعارات المزادات المحددة
  // ===========================

  /**
   * إشعار الفوز بالمزاد (للمشتري)
   */
  async sendAuctionWon(params: {
    auctionId: string;
    winnerId: string;
    winnerName: string;
    amount: number;
    carTitle: string;
  }): Promise<void> {
    await this.send({
      userId: params.winnerId,
      type: NotificationType.AUCTION_WON,
      title: 'مبروك! اشتريت المزاد',
      message: `تهانينا! لقد اشتريت ${params.carTitle} بمبلغ ${this.formatCurrency(params.amount)} دينار ليبي. سيتم التواصل معك قريباً لإتمام الصفقة.`,
      metadata: {
        auctionId: params.auctionId,
        amount: params.amount,
        carTitle: params.carTitle,
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      bidderId: params.winnerId,
    });
  }

  /**
   * إشعار تأكيد البيع (للمشتري)
   */
  async sendSaleConfirmedToWinner(params: {
    auctionId: string;
    winnerId: string;
    sellerName: string;
    sellerPhone?: string;
    amount: number;
    carTitle: string;
    carId?: string;
  }): Promise<void> {
    await this.send({
      userId: params.winnerId,
      type: NotificationType.SALE_CONFIRMED,
      title: 'تم تأكيد البيع',
      message: `تم تأكيد بيع ${params.carTitle} لك من قبل البائع ${params.sellerName}. المبلغ النهائي: ${this.formatCurrency(params.amount)} دينار.`,
      metadata: {
        auctionId: params.auctionId,
        carId: params.carId,
        amount: params.amount,
        carTitle: params.carTitle,
        sellerName: params.sellerName,
        sellerPhone: params.sellerPhone,
        actionUrl: `/auction/${params.auctionId}`,
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      carId: params.carId,
      bidderId: params.winnerId,
    });
  }

  /**
   * إشعار تأكيد البيع (للبائع)
   */
  async sendSaleConfirmedToSeller(params: {
    auctionId: string;
    sellerId: string;
    winnerName: string;
    winnerPhone?: string;
    amount: number;
    carTitle: string;
    carId?: string;
  }): Promise<void> {
    await this.send({
      userId: params.sellerId,
      type: NotificationType.SALE_CONFIRMED,
      title: 'تم تأكيد البيع بنجاح',
      message: `تم تأكيد بيع ${params.carTitle} إلى ${params.winnerName} بمبلغ ${this.formatCurrency(params.amount)} دينار.`,
      metadata: {
        auctionId: params.auctionId,
        carId: params.carId,
        amount: params.amount,
        carTitle: params.carTitle,
        winnerName: params.winnerName,
        winnerPhone: params.winnerPhone,
        actionUrl: `/auction/${params.auctionId}`,
        role: 'seller',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      carId: params.carId,
    });
  }

  /**
   * إشعار قبول المزايدة
   */
  async sendBidAccepted(params: {
    auctionId: string;
    bidderId: string;
    bidderName: string;
    amount: number;
    carTitle: string;
  }): Promise<void> {
    await this.send({
      userId: params.bidderId,
      type: NotificationType.BID_ACCEPTED,
      title: 'تم قبول مزايدتك',
      message: `تم قبول مزايدتك على ${params.carTitle} بمبلغ ${this.formatCurrency(params.amount)} دينار. أنت الآن المزايد الأعلى!`,
      metadata: {
        auctionId: params.auctionId,
        amount: params.amount,
        carTitle: params.carTitle,
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      bidderId: params.bidderId,
    });
  }

  /**
   * إشعار مزايدة جديدة للبائع
   */
  async sendNewBidToSeller(params: {
    auctionId: string;
    sellerId: string;
    bidderName: string;
    amount: number;
    carTitle: string;
    bidCount: number;
  }): Promise<void> {
    await this.send({
      userId: params.sellerId,
      type: NotificationType.NEW_BID_ON_YOUR_AUCTION,
      title: 'مزايدة جديدة على مزادك',
      message: `مزايدة جديدة من ${params.bidderName} على ${params.carTitle} بمبلغ ${this.formatCurrency(params.amount)} دينار. عدد المزايدات: ${params.bidCount}`,
      metadata: {
        auctionId: params.auctionId,
        amount: params.amount,
        carTitle: params.carTitle,
        bidderName: params.bidderName,
        bidCount: params.bidCount,
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
    });
  }

  /**
   * إشعار تجاوز المزايدة
   */
  async sendBidOutbid(params: {
    auctionId: string;
    bidderId: string;
    previousBid: number;
    newBid: number;
    carTitle: string;
  }): Promise<void> {
    await this.send({
      userId: params.bidderId,
      type: NotificationType.BID_OUTBID,
      title: 'تنبيه: تم تجاوز مزايدتك',
      message: `تم تجاوز مزايدتك على ${params.carTitle}. مزايدتك السابقة: ${this.formatCurrency(params.previousBid)} دينار. المزايدة الجديدة: ${this.formatCurrency(params.newBid)} دينار.`,
      metadata: {
        auctionId: params.auctionId,
        previousBid: params.previousBid,
        newBid: params.newBid,
        carTitle: params.carTitle,
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      bidderId: params.bidderId,
    });
  }

  /**
   * إشعار اقتراب نهاية المزاد
   */
  async sendAuctionEnding(params: {
    auctionId: string;
    userId: string;
    carTitle: string;
    timeRemaining: string;
    currentBid: number;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: NotificationType.AUCTION_ENDING,
      title: 'المزاد ينتهي قريباً',
      message: `المزاد على ${params.carTitle} ينتهي خلال ${params.timeRemaining}. السعر الحالي: ${this.formatCurrency(params.currentBid)} دينار.`,
      metadata: {
        auctionId: params.auctionId,
        carTitle: params.carTitle,
        timeRemaining: params.timeRemaining,
        currentBid: params.currentBid,
        actionUrl: `/auction/${params.auctionId}`,
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
    });
  }

  /**
   * إشعار انتهاء المزاد (للمشتري)
   */
  async sendAuctionEndedToWinner(params: {
    auctionId: string;
    winnerId: string;
    carTitle: string;
    finalAmount: number;
    carId?: string;
  }): Promise<void> {
    await this.send({
      userId: params.winnerId,
      type: NotificationType.AUCTION_ENDED,
      title: 'انتهى المزاد - أنت المشتري!',
      message: `انتهى مزاد ${params.carTitle} وأنت المشتري بمبلغ ${this.formatCurrency(params.finalAmount)} دينار. في انتظار تأكيد البائع.`,
      metadata: {
        auctionId: params.auctionId,
        carId: params.carId,
        carTitle: params.carTitle,
        finalAmount: params.finalAmount,
        actionUrl: `/auction/${params.auctionId}`,
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      carId: params.carId,
      bidderId: params.winnerId,
    });
  }

  /**
   * إشعار تذكير بالدفع (للمشتري)
   */
  async sendPaymentReminder(params: {
    auctionId: string;
    buyerId: string;
    carTitle: string;
    amount: number;
    dueDate?: string;
    sellerPhone?: string;
    carId?: string;
  }): Promise<void> {
    await this.send({
      userId: params.buyerId,
      type: NotificationType.PAYMENT_REMINDER,
      title: 'تذكير بإتمام الدفع',
      message: `يرجى إتمام دفع مبلغ ${this.formatCurrency(params.amount)} دينار لـ ${params.carTitle}. ${params.dueDate ? `تاريخ الاستحقاق: ${params.dueDate}` : 'يرجى التواصل مع البائع.'}`,
      metadata: {
        auctionId: params.auctionId,
        carId: params.carId,
        carTitle: params.carTitle,
        amount: params.amount,
        dueDate: params.dueDate,
        sellerPhone: params.sellerPhone,
        actionUrl: `/auction/${params.auctionId}`,
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      carId: params.carId,
      bidderId: params.buyerId,
    });
  }

  /**
   * إشعار تأخر الدفع (للمشتري)
   */
  async sendPaymentOverdue(params: {
    auctionId: string;
    buyerId: string;
    carTitle: string;
    amount: number;
    daysOverdue: number;
    sellerPhone?: string;
    carId?: string;
  }): Promise<void> {
    await this.send({
      userId: params.buyerId,
      type: NotificationType.PAYMENT_OVERDUE,
      title: 'تنبيه: تأخر في الدفع',
      message: `تأخر دفع مبلغ ${this.formatCurrency(params.amount)} دينار لـ ${params.carTitle} بـ ${params.daysOverdue} يوم. يرجى التواصل مع البائع فوراً لتجنب إلغاء الصفقة.`,
      metadata: {
        auctionId: params.auctionId,
        carId: params.carId,
        carTitle: params.carTitle,
        amount: params.amount,
        daysOverdue: params.daysOverdue,
        sellerPhone: params.sellerPhone,
        actionUrl: `/auction/${params.auctionId}`,
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      carId: params.carId,
      bidderId: params.buyerId,
    });
  }

  /**
   * إشعار إلغاء المزاد (للمشتري)
   */
  async sendAuctionCancelledToBuyer(params: {
    auctionId: string;
    buyerId: string;
    carTitle: string;
    reason?: string;
    carId?: string;
  }): Promise<void> {
    await this.send({
      userId: params.buyerId,
      type: NotificationType.AUCTION_CANCELLED,
      title: 'تم إلغاء المزاد',
      message: `تم إلغاء مزاد ${params.carTitle}. ${params.reason ? `السبب: ${params.reason}` : 'للمزيد من المعلومات، يرجى التواصل مع الدعم.'}`,
      metadata: {
        auctionId: params.auctionId,
        carId: params.carId,
        carTitle: params.carTitle,
        reason: params.reason,
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      carId: params.carId,
      bidderId: params.buyerId,
    });
  }

  /**
   * إشعار استلام الدفع (تأكيد للمشتري)
   */
  async sendPaymentReceived(params: {
    auctionId: string;
    buyerId: string;
    carTitle: string;
    amount: number;
    paymentMethod?: string;
    carId?: string;
    transactionId?: string;
  }): Promise<void> {
    await this.send({
      userId: params.buyerId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'تم استلام الدفعة',
      message: `تم استلام دفعتك بمبلغ ${this.formatCurrency(params.amount)} دينار لـ ${params.carTitle}. ${params.paymentMethod ? `طريقة الدفع: ${params.paymentMethod}` : ''} سيتم التواصل معك لترتيب التسليم.`,
      metadata: {
        auctionId: params.auctionId,
        carId: params.carId,
        transactionId: params.transactionId,
        carTitle: params.carTitle,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        actionUrl: `/auction/${params.auctionId}`,
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      carId: params.carId,
      transactionId: params.transactionId,
      bidderId: params.buyerId,
    });
  }

  /**
   * إشعار جاهزية السيارة للاستلام
   */
  async sendCarReadyForPickup(params: {
    auctionId: string;
    buyerId: string;
    carTitle: string;
    pickupLocation?: string;
    pickupDate?: string;
    sellerPhone?: string;
    carId?: string;
  }): Promise<void> {
    await this.send({
      userId: params.buyerId,
      type: NotificationType.INFO,
      title: 'السيارة جاهزة للاستلام',
      message: `السيارة ${params.carTitle} جاهزة للاستلام. ${params.pickupLocation ? `الموقع: ${params.pickupLocation}` : ''} ${params.pickupDate ? `التاريخ: ${params.pickupDate}` : ''} يرجى التواصل مع البائع.`,
      metadata: {
        auctionId: params.auctionId,
        carId: params.carId,
        carTitle: params.carTitle,
        pickupLocation: params.pickupLocation,
        pickupDate: params.pickupDate,
        sellerPhone: params.sellerPhone,
        actionUrl: `/auction/${params.auctionId}`,
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      carId: params.carId,
      bidderId: params.buyerId,
    });
  }

  /**
   * إشعار رسالة جديدة من البائع
   */
  async sendNewMessageFromSeller(params: {
    buyerId: string;
    sellerName: string;
    messagePreview: string;
    conversationId?: string;
    auctionId?: string;
    carTitle?: string;
  }): Promise<void> {
    await this.send({
      userId: params.buyerId,
      type: NotificationType.MESSAGE,
      title: 'رسالة جديدة من البائع',
      message: `رسالة من ${params.sellerName}${params.carTitle ? ` بخصوص ${params.carTitle}` : ''}: ${params.messagePreview}`,
      metadata: {
        conversationId: params.conversationId,
        auctionId: params.auctionId,
        carTitle: params.carTitle,
        sellerName: params.sellerName,
        actionUrl: params.conversationId
          ? `/messages?conversation=${params.conversationId}`
          : '/messages',
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      bidderId: params.buyerId,
    });
  }

  /**
   * إشعار تقييم جديد من البائع
   */
  async sendNewRatingFromSeller(params: {
    buyerId: string;
    sellerName: string;
    rating: number;
    comment?: string;
    auctionId?: string;
    carTitle?: string;
  }): Promise<void> {
    await this.send({
      userId: params.buyerId,
      type: NotificationType.SUCCESS,
      title: 'تقييم جديد من البائع',
      message: `قام ${params.sellerName} بتقييمك (${params.rating}/5 نجوم)${params.carTitle ? ` على صفقة ${params.carTitle}` : ''}. ${params.comment ? `التعليق: ${params.comment}` : ''}`,
      metadata: {
        auctionId: params.auctionId,
        carTitle: params.carTitle,
        sellerName: params.sellerName,
        rating: params.rating,
        comment: params.comment,
        actionUrl: '/account-ratings',
        role: 'buyer',
        timestamp: new Date().toISOString(),
      },
      auctionId: params.auctionId,
      bidderId: params.buyerId,
    });
  }

  // ===========================
  // جلب وإدارة الإشعارات
  // ===========================

  /**
   * جلب إشعارات المستخدم
   */
  async getByUser(userId: string, options: FilterOptions = {}): Promise<any[]> {
    const where: any = { userId };

    if (options.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    if (options.type) {
      where.type = options.type;
    }

    const notifications = await prisma.notifications.findMany({
      where,
      orderBy: { createdAt: options.orderBy || 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });

    return notifications;
  }

  /**
   * جلب إحصائيات الإشعارات
   */
  async getStats(userId: string): Promise<NotificationStats> {
    const [total, unread, byType] = await Promise.all([
      prisma.notifications.count({ where: { userId } }),
      prisma.notifications.count({ where: { userId, isRead: false } }),
      prisma.notifications.groupBy({
        by: ['type'],
        where: { userId },
        _count: true,
      }),
    ]);

    const byTypeMap: Record<string, number> = {};
    byType.forEach((item: any) => {
      byTypeMap[item.type] = item._count;
    });

    return {
      total,
      unread,
      byType: byTypeMap,
    };
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notifications.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notifications.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * حذف إشعار
   */
  async delete(notificationId: string): Promise<void> {
    await prisma.notifications.delete({
      where: { id: notificationId },
    });
  }

  /**
   * حذف إشعارات قديمة (أكثر من 30 يوم)
   */
  async cleanupOld(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.notifications.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });

    console.log(`[Notification] [تنظيف] تم حذف ${result.count} إشعار قديم`);
    return result.count;
  }

  // ===========================
  // Helper Functions
  // ===========================

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-LY', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

// ===========================
// Export Singleton
// ===========================

export const notificationService = new UnifiedNotificationService();
