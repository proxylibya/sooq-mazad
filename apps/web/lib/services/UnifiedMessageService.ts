/**
 * نظام الرسائل الموحد
 *
 * نظام موحد وشامل لإدارة المحادثات والرسائل
 * يدعم محادثات المزادات، السيارات، والدعم الفني
 *
 * @version 1.0.0
 * @date 2025-10-22
 */

import { prisma } from '@/lib/prisma';
import { ConversationType, MessageStatus, MessageType } from '@prisma/client';

// ===========================
// 📋 Types & Interfaces
// ===========================

export interface CreateConversationParams {
  participantIds: string[];
  type: ConversationType;
  auctionId?: string;
  carId?: string;
  title?: string;
  initialMessage?: string;
  senderId?: string;
}

export interface SendMessageParams {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
}

export interface Conversation {
  id: string;
  title: string | null;
  type: ConversationType;
  carId: string | null;
  auctionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  participants?: any[];
  messages?: any[];
}

// ===========================
// Unified Message Service
// ===========================

export class UnifiedMessageService {
  /**
   * إنشاء محادثة جديدة
   */
  async createConversation(params: CreateConversationParams): Promise<Conversation> {
    try {
      const conversationId = this.generateId('conv');
      const now = new Date();

      // إنشاء المحادثة
      const conversation = await prisma.conversations.create({
        data: {
          id: conversationId,
          title: params.title || this.generateTitle(params.type, params.auctionId, params.carId),
          type: params.type,
          auctionId: params.auctionId,
          carId: params.carId,
          createdAt: now,
          updatedAt: now,
          lastMessageAt: now,
        },
      });

      // إضافة المشاركين
      const participants = params.participantIds.map((userId) => ({
        id: this.generateId('part'),
        conversationId: conversationId,
        userId: userId,
        joinedAt: now,
        role: 'MEMBER' as const,
      }));

      await prisma.conversation_participants.createMany({
        data: participants,
      });

      // إرسال رسالة أولية إذا كانت موجودة
      if (params.initialMessage && params.senderId) {
        await this.sendMessage({
          conversationId: conversationId,
          senderId: params.senderId,
          content: params.initialMessage,
          type: MessageType.TEXT,
        });
      }

      console.log(`[Message] [تم بنجاح] تم إنشاء محادثة: ${conversationId} - ${params.type}`);

      return conversation as Conversation;
    } catch (error) {
      console.error('[Message] [خطأ] خطأ في إنشاء المحادثة:', error);
      throw error;
    }
  }

  /**
   * إرسال رسالة
   */
  async sendMessage(params: SendMessageParams): Promise<any> {
    try {
      const messageId = this.generateId('msg');
      const now = new Date();

      const message = await prisma.messages.create({
        data: {
          id: messageId,
          conversationId: params.conversationId,
          senderId: params.senderId,
          content: params.content,
          type: params.type || MessageType.TEXT,
          status: MessageStatus.SENT,
          createdAt: now,
          updatedAt: now,
        },
      });

      // تحديث آخر رسالة في المحادثة
      await prisma.conversations.update({
        where: { id: params.conversationId },
        data: { lastMessageAt: now, updatedAt: now },
      });

      console.log(`[Message] [تم بنجاح] تم إرسال رسالة: ${messageId}`);

      return message;
    } catch (error) {
      console.error('[Message] [خطأ] خطأ في إرسال الرسالة:', error);
      throw error;
    }
  }

  // ===========================
  // 🎯 محادثات المزادات المحددة
  // ===========================

  /**
   * إنشاء محادثة مزاد بين البائع والمشتري
   */
  async createAuctionConversation(params: {
    auctionId: string;
    sellerId: string;
    winnerId: string;
    carTitle: string;
    winnerName: string;
    amount: number;
  }): Promise<Conversation> {
    // التحقق من وجود محادثة سابقة
    const existing = await this.findExistingConversation({
      auctionId: params.auctionId,
      participantIds: [params.sellerId, params.winnerId],
    });

    if (existing) {
      console.log(`[Message] [معلومة] محادثة موجودة مسبقاً: ${existing.id}`);
      return existing as Conversation;
    }

    // إنشاء محادثة جديدة
    const initialMessage = this.buildSaleConfirmationMessage({
      carTitle: params.carTitle,
      winnerName: params.winnerName,
      amount: params.amount,
    });

    return await this.createConversation({
      participantIds: [params.sellerId, params.winnerId],
      type: ConversationType.AUCTION_INQUIRY,
      auctionId: params.auctionId,
      title: `مزاد: ${params.carTitle}`,
      initialMessage: initialMessage,
      senderId: params.sellerId,
    });
  }

  /**
   * إرسال رسالة تأكيد البيع
   */
  async sendSaleConfirmationMessage(params: {
    conversationId: string;
    sellerId: string;
    winnerName: string;
    carTitle: string;
    amount: number;
  }): Promise<any> {
    const message = `
مبروك ${params.winnerName}! 🎉

تم تأكيد فوزك بمزاد ${params.carTitle}

💰 المبلغ النهائي: ${this.formatCurrency(params.amount)} دينار ليبي

📋 الخطوات التالية:
1. التواصل لتحديد موعد المعاينة
2. التأكد من حالة السيارة
3. إتمام الدفع والاستلام

يمكنك التواصل معي مباشرة من خلال هذه المحادثة.

شكراً لثقتك! 🚗
    `.trim();

    return await this.sendMessage({
      conversationId: params.conversationId,
      senderId: params.sellerId,
      content: message,
      type: MessageType.TEXT,
    });
  }

  /**
   * إنشاء محادثة استفسار عن سيارة
   */
  async createCarInquiry(params: {
    carId: string;
    sellerId: string;
    buyerId: string;
    carTitle: string;
    initialQuestion?: string;
  }): Promise<Conversation> {
    const existing = await this.findExistingConversation({
      carId: params.carId,
      participantIds: [params.sellerId, params.buyerId],
    });

    if (existing) {
      // إرسال السؤال في المحادثة الموجودة
      if (params.initialQuestion) {
        await this.sendMessage({
          conversationId: existing.id,
          senderId: params.buyerId,
          content: params.initialQuestion,
        });
      }
      return existing as Conversation;
    }

    return await this.createConversation({
      participantIds: [params.sellerId, params.buyerId],
      type: ConversationType.CAR_INQUIRY,
      carId: params.carId,
      title: `استفسار: ${params.carTitle}`,
      initialMessage: params.initialQuestion,
      senderId: params.buyerId,
    });
  }

  // ===========================
  // 📊 جلب وإدارة المحادثات
  // ===========================

  /**
   * جلب محادثات المستخدم
   */
  async getUserConversations(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<any[]> {
    const conversations = await prisma.conversations.findMany({
      where: {
        conversation_participants: {
          some: { userId },
        },
      },
      include: {
        conversation_participants: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                verified: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });

    return conversations;
  }

  /**
   * جلب رسائل محادثة
   */
  async getMessages(
    conversationId: string,
    options: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<any[]> {
    const messages = await prisma.messages.findMany({
      where: { conversationId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            verified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 100,
      skip: options.offset || 0,
    });

    return messages.reverse(); // عكس الترتيب للعرض من الأقدم للأحدث
  }

  /**
   * تحديث حالة الرسالة
   */
  async markAsRead(params: { conversationId: string; userId: string; }): Promise<void> {
    await prisma.conversation_participants.updateMany({
      where: {
        conversationId: params.conversationId,
        userId: params.userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }

  /**
   * البحث عن محادثة موجودة
   */
  private async findExistingConversation(params: {
    auctionId?: string;
    carId?: string;
    participantIds: string[];
  }): Promise<any | null> {
    const where: any = {};

    if (params.auctionId) {
      where.auctionId = params.auctionId;
    }

    if (params.carId) {
      where.carId = params.carId;
    }

    const conversations = await prisma.conversations.findMany({
      where: {
        ...where,
        conversation_participants: {
          every: {
            userId: { in: params.participantIds },
          },
        },
      },
      include: {
        conversation_participants: true,
      },
    });

    // التحقق من تطابق جميع المشاركين
    for (const conv of conversations) {
      const convParticipantIds = conv.conversation_participants.map((p) => p.userId);
      if (
        convParticipantIds.length === params.participantIds.length &&
        params.participantIds.every((id) => convParticipantIds.includes(id))
      ) {
        return conv;
      }
    }

    return null;
  }

  // ===========================
  // Helper Functions
  // ===========================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTitle(type: ConversationType, auctionId?: string, carId?: string): string {
    switch (type) {
      case ConversationType.AUCTION_INQUIRY:
        return `محادثة مزاد ${auctionId || ''}`;
      case ConversationType.CAR_INQUIRY:
        return `استفسار عن سيارة ${carId || ''}`;
      case ConversationType.SUPPORT:
        return 'محادثة دعم فني';
      case ConversationType.DIRECT:
        return 'محادثة مباشرة';
      default:
        return 'محادثة';
    }
  }

  private buildSaleConfirmationMessage(params: {
    carTitle: string;
    winnerName: string;
    amount: number;
  }): string {
    return `
مرحباً! 👋

تم إنشاء هذه المحادثة بعد تأكيد فوزك بمزاد ${params.carTitle}

💰 المبلغ المتفق عليه: ${this.formatCurrency(params.amount)} دينار ليبي

يمكنك الآن التواصل مع البائع لترتيب المعاينة والاستلام.

حظاً موفقاً! 🚗
    `.trim();
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
// 📤 Export Singleton
// ===========================

export const messageService = new UnifiedMessageService();
