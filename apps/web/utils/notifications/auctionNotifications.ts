import { prisma } from '../../lib/prisma';
import { sendEmail } from './providers';
import { renderEmailTemplate, renderSMSTemplate } from './templates';
// import { sendSMS } from './providers'; // غير مستخدم حالياً

export interface AuctionNotificationData {
  auctionId: string;
  auctionTitle: string;
  finalPrice?: string;
  winnerId?: string;
  previousBidderId?: string;
  hoursLeft?: number;
  url?: string;
}

/**
 * إرسال إشعار فوز بالمزاد للمشتري
 */
export async function sendAuctionWonNotification(data: AuctionNotificationData) {
  if (!data.winnerId || !data.finalPrice) {
    console.error('بيانات إشعار الفوز غير مكتملة');
    return;
  }

  try {
    // جلب بيانات المشتري
    const winner = await prisma.users.findUnique({
      where: { id: data.winnerId },
      include: { user_settings: true },
    });

    if (!winner) {
      console.error('المشتري غير موجود:', data.winnerId);
      return;
    }

    const templateData = {
      userName: winner.name,
      auctionTitle: data.auctionTitle,
      finalPrice: data.finalPrice,
      url: data.url || `/auctions/${data.auctionId}`,
    };

    // إرسال بريد إلكتروني إذا توفر
    if (winner.email && winner.user_settings?.smsNotifications !== false) {
      try {
        const emailTemplate = renderEmailTemplate('AUCTION_WON', templateData);
        await sendEmail({
          to: winner.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
        console.log(`تم إرسال بريد فوز المزاد إلى: ${winner.email}`);
      } catch (error) {
        console.error('فشل إرسال بريد فوز المزاد:', error);
      }
    }

    // إرسال رسالة قصيرة
    if (winner.phone && winner.user_settings?.smsNotifications !== false) {
      try {
        const smsMessage = renderSMSTemplate('AUCTION_WON', templateData);
        const smsResult = await fetch('/api/notifications/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: winner.phone,
            body: smsMessage,
            userId: winner.id,
          }),
        });

        if (smsResult.ok) {
          console.log(`تم إرسال SMS فوز المزاد إلى: ${winner.phone}`);
        }
      } catch (error) {
        console.error('فشل إرسال SMS فوز المزاد:', error);
      }
    }

    // إنشاء إشعار في النظام
    await prisma.notifications.create({
      data: {
        id: `auction_won_${data.auctionId}_${Date.now()}`,
        userId: winner.id,
        type: 'AUCTION_WON',
        title: 'مبروك! اشتريت المزاد',
        message: `تهانينا! لقد اشتريت "${data.auctionTitle}" بمبلغ ${data.finalPrice}`,
        metadata: {
          auctionId: data.auctionId,
          finalPrice: data.finalPrice,
          url: templateData.url,
        },
      },
    });
  } catch (error) {
    console.error('خطأ في إرسال إشعار فوز المزاد:', error);
  }
}

/**
 * إرسال إشعار تجاوز المزايدة للمزايد السابق
 */
export async function sendOutbidNotification(data: AuctionNotificationData) {
  if (!data.previousBidderId) {
    console.error('معرف المزايد السابق غير موجود');
    return;
  }

  try {
    // جلب بيانات المزايد السابق
    const previousBidder = await prisma.users.findUnique({
      where: { id: data.previousBidderId },
      include: { user_settings: true },
    });

    if (!previousBidder) {
      console.error('المزايد السابق غير موجود:', data.previousBidderId);
      return;
    }

    const templateData = {
      userName: previousBidder.name,
      auctionTitle: data.auctionTitle,
      url: data.url || `/auctions/${data.auctionId}`,
    };

    // إرسال بريد إلكتروني إذا توفر
    if (previousBidder.email && previousBidder.user_settings?.bidUpdates !== false) {
      try {
        const _emailTemplate = renderEmailTemplate('AUCTION_ENDING_SOON', {
          ...templateData,
          hoursLeft: 0, // سنستخدم قالب "ينتهي قريباً" مؤقتاً
        });
        // تخصيص العنوان والمحتوى للتجاوز
        const customSubject = `تم تجاوز عرضك: ${data.auctionTitle}`;
        const customHtml = `
          <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; color: #111827">
            <h2 style="margin:0 0 12px; color:#dc2626">تم تجاوز عرضك</h2>
            <p style="margin:0 0 8px">مرحباً ${templateData.userName},</p>
            <p style="margin:0 0 8px">تم تجاوز عرضك في المزاد: <strong>${data.auctionTitle}</strong>.</p>
            <p style="margin:0 0 8px">يمكنك تقديم عرض جديد للمشاركة مرة أخرى.</p>
            ${templateData.url ? `<p style="margin:0 0 8px"><a href="${templateData.url}" style="color:#2563eb">الانتقال إلى صفحة المزاد</a></p>` : ''}
            <hr style="margin:16px 0" />
            <p style="font-size:12px; color:#6b7280">سوق المزاد</p>
          </div>`;

        await sendEmail({
          to: previousBidder.email,
          subject: customSubject,
          html: customHtml,
        });
        console.log(`تم إرسال بريد تجاوز المزايدة إلى: ${previousBidder.email}`);
      } catch (error) {
        console.error('فشل إرسال بريد تجاوز المزايدة:', error);
      }
    }

    // إنشاء إشعار في النظام
    await prisma.notifications.create({
      data: {
        id: `outbid_${data.auctionId}_${data.previousBidderId}_${Date.now()}`,
        userId: previousBidder.id,
        type: 'BID_OUTBID',
        title: 'تم تجاوز عرضك',
        message: `تم تجاوز عرضك في المزاد "${data.auctionTitle}". يمكنك تقديم عرض جديد.`,
        metadata: {
          auctionId: data.auctionId,
          url: templateData.url,
        },
      },
    });
  } catch (error) {
    console.error('خطأ في إرسال إشعار تجاوز المزايدة:', error);
  }
}

/**
 * إرسال إشعار اقتراب انتهاء المزاد للمشاركين
 */
export async function sendAuctionEndingSoonNotification(data: AuctionNotificationData) {
  if (!data.hoursLeft) {
    console.error('عدد الساعات المتبقية غير محدد');
    return;
  }

  try {
    // جلب جميع المزايدين في هذا المزاد
    const bidders = await prisma.bids.findMany({
      where: { auctionId: data.auctionId },
      include: {
        users: {
          include: { user_settings: true },
        },
      },
      distinct: ['bidderId'],
    });

    const templateData = {
      auctionTitle: data.auctionTitle,
      hoursLeft: data.hoursLeft,
      url: data.url || `/auctions/${data.auctionId}`,
    };

    for (const bid of bidders) {
      const bidder = bid.users;

      if (!bidder.user_settings?.auctionAlerts) continue;

      const personalizedData = {
        ...templateData,
        userName: bidder.name,
      };

      // إرسال بريد إلكتروني
      if (bidder.email) {
        try {
          const emailTemplate = renderEmailTemplate('AUCTION_ENDING_SOON', personalizedData);
          await sendEmail({
            to: bidder.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
          console.log(`تم إرسال بريد اقتراب الانتهاء إلى: ${bidder.email}`);
        } catch (error) {
          console.error('فشل إرسال بريد اقتراب الانتهاء:', error);
        }
      }

      // إنشاء إشعار في النظام
      await prisma.notifications.create({
        data: {
          id: `ending_soon_${data.auctionId}_${bidder.id}_${Date.now()}`,
          userId: bidder.id,
          type: 'AUCTION_ENDING',
          title: 'المزاد ينتهي قريباً',
          message: `المزاد "${data.auctionTitle}" ينتهي خلال ${data.hoursLeft} ساعة`,
          metadata: {
            auctionId: data.auctionId,
            hoursLeft: data.hoursLeft,
            url: personalizedData.url,
          },
        },
      });
    }
  } catch (error) {
    console.error('خطأ في إرسال إشعارات اقتراب الانتهاء:', error);
  }
}

/**
 * إرسال تذكير بالدفع للمشتري
 */
export async function sendPaymentReminderNotification(data: AuctionNotificationData) {
  if (!data.winnerId) {
    console.error('معرف المشتري غير موجود');
    return;
  }

  try {
    const winner = await prisma.users.findUnique({
      where: { id: data.winnerId },
      include: { user_settings: true },
    });

    if (!winner) {
      console.error('المشتري غير موجود:', data.winnerId);
      return;
    }

    const templateData = {
      userName: winner.name,
      auctionTitle: data.auctionTitle,
      url: data.url || `/auctions/${data.auctionId}/payment`,
    };

    // إرسال بريد إلكتروني
    if (winner.email && winner.user_settings?.smsNotifications !== false) {
      try {
        const emailTemplate = renderEmailTemplate('PAYMENT_REMINDER', templateData);
        await sendEmail({
          to: winner.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
        console.log(`تم إرسال بريد تذكير الدفع إلى: ${winner.email}`);
      } catch (error) {
        console.error('فشل إرسال بريد تذكير الدفع:', error);
      }
    }

    // إرسال رسالة قصيرة
    if (winner.phone && winner.user_settings?.smsNotifications !== false) {
      try {
        const smsMessage = renderSMSTemplate('PAYMENT_REMINDER', templateData);
        const smsResult = await fetch('/api/notifications/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: winner.phone,
            body: smsMessage,
            userId: winner.id,
          }),
        });

        if (smsResult.ok) {
          console.log(`تم إرسال SMS تذكير الدفع إلى: ${winner.phone}`);
        }
      } catch (error) {
        console.error('فشل إرسال SMS تذكير الدفع:', error);
      }
    }

    // إنشاء إشعار في النظام
    await prisma.notifications.create({
      data: {
        id: `payment_reminder_${data.auctionId}_${Date.now()}`,
        userId: winner.id,
        type: 'PAYMENT_REMINDER',
        title: 'تذكير بالدفع',
        message: `يرجى إتمام دفع المزاد "${data.auctionTitle}" في أقرب وقت`,
        metadata: {
          auctionId: data.auctionId,
          url: templateData.url,
        },
      },
    });
  } catch (error) {
    console.error('خطأ في إرسال تذكير الدفع:', error);
  }
}
