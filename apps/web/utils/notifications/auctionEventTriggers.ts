import { prisma } from '../../lib/prisma';
import {
  AuctionNotificationData,
  sendAuctionEndingSoonNotification,
  sendAuctionWonNotification,
  sendOutbidNotification,
  sendPaymentReminderNotification,
} from './auctionNotifications';

/**
 * تشغيل إشعارات عند وضع مزايدة جديدة
 */
export async function triggerNewBidNotifications(
  auctionId: string,
  newBidderId: string,
  bidAmount: number,
) {
  try {
    // جلب بيانات المزاد
    const auction = await prisma.auctions.findUnique({
      where: { id: auctionId },
      include: {
        cars: true,
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 2, // المزايدة الجديدة والسابقة
          include: { users: true },
        },
      },
    });

    if (!auction) {
      console.error('المزاد غير موجود:', auctionId);
      return;
    }

    // التحقق من وجود مزايدة سابقة لإرسال إشعار التجاوز
    const previousBid = (auction as any).bids?.find((bid: any) => bid.bidderId !== newBidderId);

    if (previousBid) {
      const notificationData: AuctionNotificationData = {
        auctionId,
        auctionTitle: auction.title || (auction as any).cars?.title || 'مزاد',
        previousBidderId: previousBid.bidderId,
        url: `/auctions/${auctionId}`,
      };

      await sendOutbidNotification(notificationData);
    }

    console.log(`تم تشغيل إشعارات المزايدة الجديدة للمزاد: ${auctionId}`);
  } catch (error) {
    console.error('خطأ في تشغيل إشعارات المزايدة الجديدة:', error);
  }
}

/**
 * تشغيل إشعارات عند انتهاء المزاد
 */
export async function triggerAuctionEndedNotifications(auctionId: string) {
  try {
    // جلب بيانات المزاد مع أعلى مزايدة
    const auction = await prisma.auctions.findUnique({
      where: { id: auctionId },
      include: {
        cars: true,
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: { users: true },
        },
      },
    });

    if (!auction) {
      console.error('المزاد غير موجود:', auctionId);
      return;
    }

    // إذا كان هناك فائز
    const auctionBids = (auction as any).bids || [];
    if (auctionBids.length > 0) {
      const winningBid = auctionBids[0];
      const notificationData: AuctionNotificationData = {
        auctionId,
        auctionTitle: auction.title || (auction as any).cars?.title || 'مزاد',
        winnerId: winningBid.bidderId,
        finalPrice: `${winningBid.amount.toLocaleString()} د.ل`,
        url: `/auctions/${auctionId}`,
      };

      await sendAuctionWonNotification(notificationData);

      // تحديث المزاد بمعرف الفائز
      await prisma.auctions.update({
        where: { id: auctionId },
        data: {
          currentPrice: winningBid.amount,
        },
      });
    }

    console.log(`تم تشغيل إشعارات انتهاء المزاد: ${auctionId}`);
  } catch (error) {
    console.error('خطأ في تشغيل إشعارات انتهاء المزاد:', error);
  }
}

/**
 * تشغيل إشعارات اقتراب انتهاء المزاد (يتم استدعاؤها من cron job)
 */
export async function triggerAuctionEndingSoonNotifications() {
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // البحث عن المزادات التي تنتهي خلال ساعتين
    const endingSoonAuctions = await prisma.auctions.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: twoHoursFromNow,
        },
      },
      include: {
        cars: true,
        bids: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    for (const auction of endingSoonAuctions) {
      // تجنب إرسال إشعارات متكررة
      const lastNotification = await prisma.notifications.findFirst({
        where: {
          type: 'AUCTION_ENDING',
          metadata: {
            path: ['auctionId'],
            equals: auction.id,
          },
          createdAt: {
            gte: new Date(now.getTime() - 60 * 60 * 1000), // آخر ساعة
          },
        },
      });

      if (lastNotification) continue;

      const hoursLeft = Math.ceil((auction.endDate.getTime() - now.getTime()) / (60 * 60 * 1000));

      if (hoursLeft <= 2 && hoursLeft > 0) {
        const notificationData: AuctionNotificationData = {
          auctionId: auction.id,
          auctionTitle: auction.title || (auction as any).cars?.title || 'مزاد',
          hoursLeft,
          url: `/auctions/${auction.id}`,
        };

        await sendAuctionEndingSoonNotification(notificationData);
      }
    }

    console.log(`تم فحص ${endingSoonAuctions.length} مزاد لإشعارات اقتراب الانتهاء`);
  } catch (error) {
    console.error('خطأ في تشغيل إشعارات اقتراب الانتهاء:', error);
  }
}

/**
 * تشغيل تذكيرات الدفع للفائزين (يتم استدعاؤها من cron job)
 */
export async function triggerPaymentReminders() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // البحث عن المزادات المنتهية التي لم يتم دفعها
    const unpaidAuctions = await prisma.auctions.findMany({
      where: {
        status: 'ENDED',
        endDate: {
          gte: oneDayAgo,
          lte: now,
        },
      },
      include: {
        cars: true,
      },
    });

    for (const auction of unpaidAuctions) {
      const winnerId = (auction as any).highestBidderId;
      // التحقق من عدم وجود معاملة دفع
      const paymentTransaction = await prisma.transactions.findFirst({
        where: {
          reference: auction.id,
          status: 'COMPLETED',
        },
      });

      if (paymentTransaction) continue;

      // تجنب إرسال تذكيرات متكررة
      const lastReminder = await prisma.notifications.findFirst({
        where: {
          type: 'PAYMENT_REMINDER',
          userId: winnerId || '',
          metadata: {
            path: ['auctionId'],
            equals: auction.id,
          },
          createdAt: {
            gte: new Date(now.getTime() - 12 * 60 * 60 * 1000), // آخر 12 ساعة
          },
        },
      });

      if (lastReminder) continue;

      const notificationData: AuctionNotificationData = {
        auctionId: auction.id,
        auctionTitle: auction.title || (auction as any).cars?.title || 'مزاد',
        winnerId: winnerId || '',
        url: `/auctions/${auction.id}/payment`,
      };

      await sendPaymentReminderNotification(notificationData);
    }

    console.log(`تم فحص ${unpaidAuctions.length} مزاد لتذكيرات الدفع`);
  } catch (error) {
    console.error('خطأ في تشغيل تذكيرات الدفع:', error);
  }
}
