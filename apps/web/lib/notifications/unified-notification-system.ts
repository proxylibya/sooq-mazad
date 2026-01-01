/**
 * نظام الإشعارات الموحد العالمي
 * Unified Global Notification System
 * 
 * نظام شامل للإشعارات يدعم:
 * - SMS
 * - Email
 * - Push Notifications
 * - In-App Notifications
 * - WebSocket Real-time
 */

import nodemailer from 'nodemailer';
import { keydb } from '@/lib/cache/keydb-unified';
import { db } from '@/lib/database/unified-database-service';
import prisma from '@/lib/prisma';

// Types
export type NotificationType = 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP' | 'WEBSOCKET';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title?: string;
  message: string;
  data?: any;
  templateId?: string;
  templateData?: Record<string, any>;
  scheduledAt?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string;
  body: string;
  variables: string[];
}

/**
 * فئة نظام الإشعارات الموحد
 */
export class UnifiedNotificationSystem {
  private static instance: UnifiedNotificationSystem;
  private emailTransporter: nodemailer.Transporter;
  private templates: Map<string, NotificationTemplate>;

  private constructor() {
    // إعداد Email Transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // تحميل القوالب
    this.templates = new Map();
    this.loadTemplates();
  }

  /**
   * الحصول على مثيل واحد من النظام
   */
  public static getInstance(): UnifiedNotificationSystem {
    if (!UnifiedNotificationSystem.instance) {
      UnifiedNotificationSystem.instance = new UnifiedNotificationSystem();
    }
    return UnifiedNotificationSystem.instance;
  }

  /**
   * تحميل قوالب الإشعارات
   */
  private loadTemplates() {
    // قوالب SMS
    this.templates.set('sms_otp', {
      id: 'sms_otp',
      name: 'رمز التحقق',
      type: 'SMS',
      body: 'رمز التحقق الخاص بك في سوق مزاد: {{otp}}',
      variables: ['otp']
    });

    this.templates.set('sms_bid_placed', {
      id: 'sms_bid_placed',
      name: 'مزايدة جديدة',
      type: 'SMS',
      body: 'تم وضع مزايدة بقيمة {{amount}} دينار على سيارتك {{carName}}',
      variables: ['amount', 'carName']
    });

    // قوالب Email
    this.templates.set('email_welcome', {
      id: 'email_welcome',
      name: 'ترحيب',
      type: 'EMAIL',
      subject: 'مرحباً بك في سوق مزاد',
      body: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2>مرحباً {{name}}!</h2>
          <p>نرحب بك في سوق مزاد، أكبر منصة لبيع وشراء السيارات في ليبيا.</p>
          <p>يمكنك الآن:</p>
          <ul>
            <li>عرض سيارتك للبيع</li>
            <li>المزايدة على السيارات</li>
            <li>التواصل مع البائعين</li>
          </ul>
          <p>مع تحيات فريق سوق مزاد</p>
        </div>
      `,
      variables: ['name']
    });

    this.templates.set('email_auction_won', {
      id: 'email_auction_won',
      name: 'فوز بالمزاد',
      type: 'EMAIL',
      subject: 'مبروك! لقد فزت بالمزاد',
      body: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2>تهانينا {{name}}!</h2>
          <p>لقد فزت بالمزاد على السيارة:</p>
          <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
            <p><strong>السيارة:</strong> {{carName}}</p>
            <p><strong>السعر النهائي:</strong> {{amount}} دينار</p>
            <p><strong>البائع:</strong> {{sellerName}}</p>
          </div>
          <p>سيتواصل معك البائع قريباً لإتمام عملية الشراء.</p>
          <p>مع تحيات فريق سوق مزاد</p>
        </div>
      `,
      variables: ['name', 'carName', 'amount', 'sellerName']
    });

    // قوالب Push
    this.templates.set('push_new_bid', {
      id: 'push_new_bid',
      name: 'مزايدة جديدة',
      type: 'PUSH',
      body: 'مزايدة جديدة بقيمة {{amount}} دينار على {{carName}}',
      variables: ['amount', 'carName']
    });

    // قوالب In-App
    this.templates.set('inapp_system_message', {
      id: 'inapp_system_message',
      name: 'رسالة النظام',
      type: 'IN_APP',
      body: '{{message}}',
      variables: ['message']
    });
  }

  /**
   * إرسال إشعار
   */
  public async send(notification: NotificationData): Promise<boolean> {
    try {
      // إذا كان هناك قالب
      if (notification.templateId) {
        const template = this.templates.get(notification.templateId);
        if (template) {
          notification = this.applyTemplate(notification, template);
        }
      }

      // حفظ الإشعار في قاعدة البيانات
      const savedNotification = await this.saveNotification(notification);

      // إرسال حسب النوع
      let success = false;
      switch (notification.type) {
        case 'SMS':
          success = await this.sendSMS(notification);
          break;
        case 'EMAIL':
          success = await this.sendEmail(notification);
          break;
        case 'PUSH':
          success = await this.sendPush(notification);
          break;
        case 'IN_APP':
          success = await this.sendInApp(notification);
          break;
        case 'WEBSOCKET':
          success = await this.sendWebSocket(notification);
          break;
      }

      // تحديث حالة الإشعار
      await this.updateNotificationStatus(
        savedNotification.id,
        success ? 'SENT' : 'FAILED'
      );

      return success;
    } catch (error) {
      console.error('Notification send error:', error);
      return false;
    }
  }

  /**
   * إرسال SMS
   */
  private async sendSMS(notification: NotificationData): Promise<boolean> {
    try {
      // الحصول على رقم الهاتف
      const user = await prisma.users.findUnique({
        where: { id: notification.userId },
        select: { phone: true }
      });

      if (!user?.phone) {
        throw new Error('User phone not found');
      }

      // هنا يمكن إضافة integration مع خدمة SMS حقيقية
      // مثل Twilio, Vonage, etc.
      
      console.log(`SMS to ${user.phone}: ${notification.message}`);
      
      // حفظ في سجل SMS
      await prisma.sMSLog.create({
        data: {
          userId: notification.userId,
          phone: user.phone,
          message: notification.message,
          status: 'SENT'
        }
      });

      return true;
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  /**
   * إرسال Email
   */
  private async sendEmail(notification: NotificationData): Promise<boolean> {
    try {
      // الحصول على البريد الإلكتروني
      const user = await prisma.users.findUnique({
        where: { id: notification.userId },
        select: { email: true, name: true }
      });

      if (!user?.email) {
        console.log('User email not found');
        return false;
      }

      // إرسال البريد
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@sooq-mazad.ly',
        to: user.email,
        subject: notification.title || 'إشعار من سوق مزاد',
        html: notification.message
      };

      await this.emailTransporter.sendMail(mailOptions);
      
      console.log(`Email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  /**
   * إرسال Push Notification
   */
  private async sendPush(notification: NotificationData): Promise<boolean> {
    try {
      // هنا يمكن إضافة integration مع خدمة Push
      // مثل Firebase Cloud Messaging, OneSignal, etc.
      
      console.log(`Push notification: ${notification.message}`);
      
      // حفظ في الذاكرة المؤقتة للعرض لاحقاً
      await keydb.lpush(
        `push:${notification.userId}`,
        JSON.stringify({
          title: notification.title,
          message: notification.message,
          data: notification.data,
          timestamp: new Date()
        })
      );
      
      // الاحتفاظ بآخر 50 إشعار فقط
      await keydb.getClient().ltrim(`push:${notification.userId}`, 0, 49);
      
      return true;
    } catch (error) {
      console.error('Push send error:', error);
      return false;
    }
  }

  /**
   * إرسال In-App Notification
   */
  private async sendInApp(notification: NotificationData): Promise<boolean> {
    try {
      // حفظ في قاعدة البيانات
      await prisma.notifications.create({
        data: {
          userId: notification.userId,
          type: 'IN_APP',
          title: notification.title || 'إشعار جديد',
          message: notification.message,
          data: notification.data ? JSON.stringify(notification.data) : null,
          isRead: false
        }
      });
      
      // حفظ في الذاكرة المؤقتة للعرض الفوري
      await keydb.lpush(
        `notifications:${notification.userId}`,
        JSON.stringify({
          title: notification.title,
          message: notification.message,
          data: notification.data,
          timestamp: new Date()
        })
      );
      
      // الاحتفاظ بآخر 100 إشعار
      await keydb.getClient().ltrim(`notifications:${notification.userId}`, 0, 99);
      
      return true;
    } catch (error) {
      console.error('In-app notification error:', error);
      return false;
    }
  }

  /**
   * إرسال WebSocket Notification
   */
  private async sendWebSocket(notification: NotificationData): Promise<boolean> {
    try {
      // نشر الإشعار عبر WebSocket
      const channel = `user:${notification.userId}`;
      const message = {
        type: 'notification',
        data: {
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          timestamp: new Date()
        }
      };
      
      // حفظ في قناة WebSocket
      await keydb.getClient().publish(channel, JSON.stringify(message));
      
      return true;
    } catch (error) {
      console.error('WebSocket send error:', error);
      return false;
    }
  }

  /**
   * تطبيق القالب
   */
  private applyTemplate(
    notification: NotificationData,
    template: NotificationTemplate
  ): NotificationData {
    let message = template.body;
    let subject = template.subject;
    
    // استبدال المتغيرات
    if (notification.templateData) {
      for (const [key, value] of Object.entries(notification.templateData)) {
        const placeholder = `{{${key}}}`;
        message = message.replace(new RegExp(placeholder, 'g'), value);
        if (subject) {
          subject = subject.replace(new RegExp(placeholder, 'g'), value);
        }
      }
    }
    
    return {
      ...notification,
      title: subject || notification.title,
      message,
      type: template.type
    };
  }

  /**
   * حفظ الإشعار في قاعدة البيانات
   */
  private async saveNotification(notification: NotificationData): Promise<any> {
    return await prisma.notifications.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title || '',
        message: notification.message,
        data: notification.data ? JSON.stringify(notification.data) : null,
        priority: notification.priority || 'MEDIUM',
        status: 'PENDING',
        scheduledAt: notification.scheduledAt,
        isRead: false
      }
    });
  }

  /**
   * تحديث حالة الإشعار
   */
  private async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus
  ): Promise<void> {
    await prisma.notifications.update({
      where: { id: notificationId },
      data: { status }
    });
  }

  /**
   * إرسال إشعارات جماعية
   */
  public async sendBulk(notifications: NotificationData[]): Promise<number> {
    let successCount = 0;
    
    for (const notification of notifications) {
      const success = await this.send(notification);
      if (success) successCount++;
    }
    
    return successCount;
  }

  /**
   * جدولة إشعار
   */
  public async schedule(
    notification: NotificationData,
    sendAt: Date
  ): Promise<string> {
    const scheduledNotification = await prisma.notifications.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title || '',
        message: notification.message,
        data: notification.data ? JSON.stringify(notification.data) : null,
        priority: notification.priority || 'MEDIUM',
        status: 'PENDING',
        scheduledAt: sendAt,
        isRead: false
      }
    });
    
    return scheduledNotification.id;
  }

  /**
   * الحصول على إشعارات المستخدم
   */
  public async getUserNotifications(
    userId: string,
    options: {
      type?: NotificationType;
      isRead?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    const where: any = { userId };
    
    if (options.type) where.type = options.type;
    if (typeof options.isRead === 'boolean') where.isRead = options.isRead;
    
    return await prisma.notifications.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0
    });
  }

  /**
   * تحديد الإشعار كمقروء
   */
  public async markAsRead(notificationId: string): Promise<void> {
    await prisma.notifications.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  public async markAllAsRead(userId: string): Promise<void> {
    await prisma.notifications.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  /**
   * حذف إشعار
   */
  public async delete(notificationId: string): Promise<void> {
    await prisma.notifications.delete({
      where: { id: notificationId }
    });
  }

  /**
   * إحصائيات الإشعارات
   */
  public async getStats(userId: string): Promise<any> {
    const [total, unread, byType] = await Promise.all([
      prisma.notifications.count({ where: { userId } }),
      prisma.notifications.count({ where: { userId, isRead: false } }),
      prisma.notifications.groupBy({
        by: ['type'],
        where: { userId },
        _count: true
      })
    ]);
    
    return {
      total,
      unread,
      byType: byType.reduce((acc, item) => ({
        ...acc,
        [item.type]: item._count
      }), {})
    };
  }
}

// تصدير مثيل واحد من النظام
export const notifications = UnifiedNotificationSystem.getInstance();

// تصدير وظائف سريعة للاستخدام
export const notify = {
  send: (data: NotificationData) => notifications.send(data),
  sendBulk: (data: NotificationData[]) => notifications.sendBulk(data),
  schedule: (data: NotificationData, sendAt: Date) => notifications.schedule(data, sendAt),
  getUserNotifications: (userId: string, options?: any) => 
    notifications.getUserNotifications(userId, options),
  markAsRead: (id: string) => notifications.markAsRead(id),
  markAllAsRead: (userId: string) => notifications.markAllAsRead(userId),
  
  // اختصارات للأنواع المختلفة
  sms: (userId: string, message: string) => 
    notifications.send({ userId, type: 'SMS', message }),
  
  email: (userId: string, title: string, message: string) =>
    notifications.send({ userId, type: 'EMAIL', title, message }),
  
  push: (userId: string, title: string, message: string, data?: any) =>
    notifications.send({ userId, type: 'PUSH', title, message, data }),
  
  inApp: (userId: string, title: string, message: string, data?: any) =>
    notifications.send({ userId, type: 'IN_APP', title, message, data })
};
