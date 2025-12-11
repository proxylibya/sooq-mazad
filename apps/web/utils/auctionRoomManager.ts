/**
 * Auction Room Manager
 */

import prisma from '../lib/prisma';
import {
  // AuctionState, // غير مستخدم حالياً,
  AuctionParticipant,
  AuctionRoomConfig,
  AuctionStats,
  // BidPayload, // غير مستخدم حالياً,
  SocketUser,
} from '../types/socket';

interface ActiveAuctionRoom {
  _auctionId: string;
  participants: Map<string, AuctionParticipant>;
  currentState: any; // AuctionState - سيتم تحديد النوع لاحقاً
  config: AuctionRoomConfig;
  stats: AuctionStats;
  lastActivity: number;
  isActive: boolean;
  endTimer?: NodeJS.Timeout;
  warningTimer?: NodeJS.Timeout;
}

export class AuctionRoomManager {
  private activeRooms = new Map<string, ActiveAuctionRoom>();
  private readonly DEFAULT_CONFIG: AuctionRoomConfig = {
    maxParticipants: 100,
    bidIncrementPercentage: 5,
    endingSoonThreshold: 300, // 5 minutes
    autoExtensionThreshold: 30, // 30 seconds
    maxAutoExtensions: 3,
    heartbeatInterval: 30000, // 30 seconds
    inactivityTimeout: 300000, // 5 minutes
  };

  constructor() {
    // تنظيف الغرف غير النشطة كل 10 دقائق
    setInterval(() => this.cleanupInactiveRooms(), 10 * 60 * 1000);
  }

  /**
   * إنشاء أو الحصول على غرفة مزاد
   */
  async getOrCreateRoom(_auctionId: string): Promise<ActiveAuctionRoom | null> {
    // إذا كانت الغرفة موجودة، أرجعها
    if (this.activeRooms.has(auctionId)) {
      return this.activeRooms.get(auctionId)!;
    }

    // إنشاء غرفة جديدة
    const auction = await this.loadAuctionFromDB(auctionId);
    if (!auction) {
      return null;
    }

    const room: ActiveAuctionRoom = {
      auctionId,
      participants: new Map(),
      currentState: auction,
      config: { ...this.DEFAULT_CONFIG },
      stats: {
        totalBids: 0,
        uniqueBidders: 0,
        averageBidTime: 0,
        priceIncreasePercentage: 0,
        participantEngagement: 0,
        peakParticipants: 0,
      },
      lastActivity: Date.now(),
      isActive: true,
    };

    this.activeRooms.set(auctionId, room);
    this.setupAuctionTimers(room);

    console.log(`🏠 إنشاء غرفة مزاد جديدة: ${auctionId}`);
    return room;
  }

  /**
   * إضافة مشارك للغرفة
   */
  addParticipant(_auctionId: string, _user: SocketUser, _socketId: string): boolean {
    const room = this.activeRooms.get(auctionId);
    if (!room || !room.isActive) {
      return false;
    }

    // التحقق من الحد الأقصى للمشاركين
    if (room.participants.size >= room.config.maxParticipants) {
      return false;
    }

    const participant: AuctionParticipant = {
      user,
      joinedAt: Date.now(),
      lastActivity: Date.now(),
      totalBids: 0,
      isActive: true,
    };

    room.participants.set(user.id, participant);
    room.lastActivity = Date.now();

    // تحديث إحصائيات الذروة
    if (room.participants.size > room.stats.peakParticipants) {
      room.stats.peakParticipants = room.participants.size;
    }

    console.log(
      `👥 انضمام ${user.name} للمزاد ${auctionId} (المشاركون: ${room.participants.size})`,
    );
    return true;
  }

  /**
   * إزالة مشارك من الغرفة
   */
  removeParticipant(_auctionId: string, _userId: string): boolean {
    const room = this.activeRooms.get(auctionId);
    if (!room) {
      return false;
    }

    const removed = room.participants.delete(userId);
    if (removed) {
      room.lastActivity = Date.now();
      console.log(
        `👋 مغادرة المستخدم ${userId} للمزاد ${auctionId} (المشاركون: ${room.participants.size})`,
      );
    }

    return removed;
  }

  /**
   * معالجة عرض جديد
   */
  async processBid(
    _auctionId: string,
    bid: BidData,
    _user: SocketUser,
  ): Promise<{
    success: boolean;
    error?: string;
    updatedState?: any; // AuctionState - سيتم تحديد النوع لاحقاً
  }> {
    const room = this.activeRooms.get(auctionId);
    if (!room || !room.isActive) {
      return { success: false, error: 'Auction room not found or inactive' };
    }

    // التحقق من صحة العرض
    const validation = this.validateBid(room, bid, user);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      // حفظ العرض في قاعدة البيانات
      await prisma.bids.create({
        data: {
          id: bid.bidId || `bid_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          auctionId: bid.auctionId,
          bidderId: bid.bidderId,
          amount: bid.amount,
        },
      });

      // تحديث حالة المزاد
      room.currentState.currentPrice = bid.amount;
      room.currentState.lastBidder = user;
      room.currentState.participantsCount = room.participants.size;
      room.lastActivity = Date.now();

      // تحديث إحصائيات المشارك
      const participant = room.participants.get(user.id);
      if (participant) {
        participant.totalBids++;
        participant.lastActivity = Date.now();
      }

      // تحديث إحصائيات الغرفة
      room.stats.totalBids++;
      room.stats.uniqueBidders = new Set(
        Array.from(room.participants.values())
          .filter((p) => p.totalBids > 0)
          .map((p) => p.user.id),
      ).size;

      // حساب نسبة زيادة السعر
      const auction = await prisma.auctions.findUnique({
        where: { id: auctionId },
        select: { startingPrice: true },
      });

      if (auction) {
        room.stats.priceIncreasePercentage =
          ((bid.amount - auction.startingPrice) / auction.startingPrice) * 100;
      }

      // التحقق من إمكانية التمديد التلقائي
      await this.checkAutoExtension(room);

      console.log(`💰 عرض مُقبول: ${user.name} - ${bid.amount} دينار في المزاد ${auctionId}`);

      return {
        success: true,
        updatedState: room.currentState,
      };
    } catch (error) {
      console.error('خطأ في معالجة العرض:', error);
      return { success: false, error: 'Database error' };
    }
  }

  /**
   * التحقق من صحة العرض
   */
  private validateBid(
    room: ActiveAuctionRoom,
    bid: BidData,
    _user: SocketUser,
  ): {
    valid: boolean;
    error?: string;
  } {
    const now = Date.now();

    // التحقق من انتهاء المزاد
    if (room.currentState.endTime <= now) {
      return { valid: false, error: 'Auction has ended' };
    }

    // التحقق من حالة المزاد
    if (room.currentState.status !== 'LIVE') {
      return { valid: false, error: 'Auction is not live' };
    }

    // التحقق من أن المزايد ليس هو آخر مزايد
    if (room.currentState.lastBidder?.id === user.id) {
      return { valid: false, error: 'Cannot outbid yourself' };
    }

    // التحقق من الحد الأدنى للعرض - حد أدنى 500 دينار
    const minimumIncrement = room.currentState?.minimumBidIncrement || 500;
    const minimumBid = Math.max(
      room.currentState.currentPrice + minimumIncrement,
      500 // الحد الأدنى المطلق: 500 دينار ليبي
    );
    if (bid.amount < minimumBid) {
      return {
        valid: false,
        error: `الحد الأدنى للمزايدة ${minimumBid} دينار ليبي`,
      };
    }

    // التحقق من المشاركة النشطة
    const participant = room.participants.get(user.id);
    if (!participant || !participant.isActive) {
      return { valid: false, error: 'User not in auction room' };
    }

    return { valid: true };
  }

  /**
   * التحقق من التمديد التلقائي
   */
  private async checkAutoExtension(room: ActiveAuctionRoom): Promise<void> {
    const now = Date.now();
    const timeRemaining = room.currentState.endTime - now;

    // إذا كان الوقت المتبقي أقل من العتبة، قم بالتمديد
    if (timeRemaining <= room.config.autoExtensionThreshold * 1000) {
      const extensionTime = 2 * 60 * 1000; // 2 دقائق
      room.currentState.endTime += extensionTime;

      // إعادة إعداد المؤقتات
      this.setupAuctionTimers(room);

      console.log(`⏰ تمديد تلقائي للمزاد ${room.auctionId} لمدة دقيقتين`);
    }
  }

  /**
   * إعداد مؤقتات المزاد
   */
  private setupAuctionTimers(room: ActiveAuctionRoom): void {
    // مسح المؤقتات الموجودة
    if (room.endTimer) clearTimeout(room.endTimer);
    if (room.warningTimer) clearTimeout(room.warningTimer);

    const now = Date.now();
    const timeToEnd = room.currentState.endTime - now;
    const timeToWarning = timeToEnd - room.config.endingSoonThreshold * 1000;

    // مؤقت تحذير "ينتهي قريباً"
    if (timeToWarning > 0) {
      room.warningTimer = setTimeout(() => {
        room.currentState.status = 'ENDING_SOON';
        console.log(
          `⏰ تحذير: المزاد ${room.auctionId} ينتهي خلال ${room.config.endingSoonThreshold} ثانية`,
        );
      }, timeToWarning);
    }

    // مؤقت انتهاء المزاد
    if (timeToEnd > 0) {
      room.endTimer = setTimeout(() => {
        this.endAuction(room.auctionId, 'natural');
      }, timeToEnd);
    }
  }

  /**
   * إنهاء المزاد
   */
  async endAuction(
    _auctionId: string,
    reason: 'natural' | 'admin_ended' | 'system_error',
  ): Promise<void> {
    const room = this.activeRooms.get(auctionId);
    if (!room) return;

    try {
      // تحديث حالة المزاد في قاعدة البيانات
      await prisma.auctions.update({
        where: { id: auctionId },
        data: {
          status: 'ENDED',
          endTime: new Date(),
        },
      });

      // تحديث حالة الغرفة
      room.currentState.status = 'ENDED';
      room.isActive = false;

      // مسح المؤقتات
      if (room.endTimer) clearTimeout(room.endTimer);
      if (room.warningTimer) clearTimeout(room.warningTimer);

      console.log(`🏁 انتهى المزاد ${auctionId} - السبب: ${reason}`);
      console.log(
        `📊 إحصائيات المزاد: ${room.stats.totalBids} عرض، ${room.stats.uniqueBidders} مزايد`,
      );

      // إزالة الغرفة بعد 30 دقيقة
      setTimeout(
        () => {
          this.activeRooms.delete(auctionId);
          console.log(`🗑️ تم حذف غرفة المزاد ${auctionId}`);
        },
        30 * 60 * 1000,
      );
    } catch (error) {
      console.error(`خطأ في إنهاء المزاد ${auctionId}:`, error);
    }
  }

  /**
   * تحميل بيانات المزاد من قاعدة البيانات
   */
  private async loadAuctionFromDB(_auctionId: string): Promise<AuctionState | null> {
    try {
      const auction = await prisma.auctions.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: {
              bidder: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  accountType: true,
                  verified: true,
                },
              },
            },
          },
        },
      });

      if (!auction) return null;

      const currentBid = auction.bids[0];
      const currentPrice = currentBid?.amount || auction.startPrice;

      return {
        id: auction.id,
        currentPrice,
        lastBidder: currentBid
          ? {
            id: currentBid.bidder.id,
            name: currentBid.bidder.name,
            role: currentBid.bidder.role as SocketUser['role'],
            accountType: currentBid.bidder.accountType,
            verified: currentBid.bidder.verified,
          }
          : null,
        participantsCount: 0,
        status: auction.status as 'ACTIVE' | 'UPCOMING' | 'CANCELLED' | 'SOLD',
        endTime: auction.endDate.getTime(),
        minimumBidIncrement: Math.max(auction?.minimumBid || 500, 500),
        reservePrice: auction.reservePrice,
      };
    } catch (error) {
      console.error('خطأ في تحميل بيانات المزاد:', error);
      return null;
    }
  }

  /**
   * تنظيف الغرف غير النشطة
   */
  private cleanupInactiveRooms(): void {
    const now = Date.now();
    const inactivityThreshold = 30 * 60 * 1000; // 30 دقيقة

    for (const [auctionId, room] of this.activeRooms.entries()) {
      if (
        now - room.lastActivity > inactivityThreshold ||
        (!room.isActive && room.participants.size === 0)
      ) {
        // مسح المؤقتات
        if (room.endTimer) clearTimeout(room.endTimer);
        if (room.warningTimer) clearTimeout(room.warningTimer);

        this.activeRooms.delete(auctionId);
        console.log(`🧹 تنظيف غرفة المزاد غير النشطة: ${auctionId}`);
      }
    }
  }

  /**
   * الحصول على معلومات الغرفة
   */
  getRoomInfo(_auctionId: string): {
    participants: AuctionParticipant[];
    state: any; // AuctionState - سيتم تحديد النوع لاحقاً
    stats: AuctionStats;
  } | null {
    const room = this.activeRooms.get(auctionId);
    if (!room) return null;

    return {
      participants: Array.from(room.participants.values()),
      state: room.currentState,
      stats: room.stats,
    };
  }

  /**
   * الحصول على قائمة الغرف النشطة
   */
  getActiveRooms(): string[] {
    return Array.from(this.activeRooms.keys()).filter((id) => this.activeRooms.get(id)?.isActive);
  }

  /**
   * تحديث نشاط المشارك
   */
  updateParticipantActivity(_auctionId: string, _userId: string): void {
    const room = this.activeRooms.get(auctionId);
    if (!room) return;

    const participant = room.participants.get(userId);
    if (participant) {
      participant.lastActivity = Date.now();
      room.lastActivity = Date.now();
    }
  }
}

// Singleton instance
let auctionRoomManagerInstance: AuctionRoomManager | null = null;

export function getAuctionRoomManager(): AuctionRoomManager {
  if (!auctionRoomManagerInstance) {
    auctionRoomManagerInstance = new AuctionRoomManager();
  }
  return auctionRoomManagerInstance;
}
