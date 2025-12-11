import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

/**
 * API لإرسال رسالة تلقائية (مثل تأكيد البيع)
 * POST /api/messages/send-auto
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { recipientId, message, type, auctionId, metadata } = req.body;

    // التحقق من البيانات المطلوبة
    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير مكتملة - يجب توفير recipientId و message'
      });
    }

    // التحقق من وجود المستلم
    const recipient = await prisma.users.findUnique({
      where: { id: String(recipientId) },
      select: { id: true, name: true, email: true }
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم المستلم غير موجود'
      });
    }

    // يمكن استخدام نظام الرسائل الموجود أو إنشاء إشعار
    // في هذا المثال سنحفظ الرسالة كإشعار
    const notification = await prisma.notifications.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: String(recipientId),
        type: type || 'SALE_CONFIRMED',
        title: 'تأكيد البيع',
        message: message,
        auctionId: auctionId ? String(auctionId) : null,
        metadata: metadata || null,
        isRead: false,
      }
    });

    console.log(`✅ [Auto Message] تم إرسال رسالة تلقائية للمستخدم ${recipientId}`);

    // محاولة إرسال إشعار بريد إلكتروني (اختياري)
    if (recipient.email) {
      try {
        // يمكنك إضافة خدمة إرسال البريد الإلكتروني هنا
        console.log(`📧 [Auto Message] يمكن إرسال بريد إلكتروني إلى: ${recipient.email}`);
      } catch (emailError) {
        console.error('خطأ في إرسال البريد الإلكتروني:', emailError);
        // لا نوقف العملية
      }
    }

    return res.status(200).json({
      success: true,
      message: 'تم إرسال الرسالة التلقائية بنجاح',
      data: {
        notificationId: notification.id,
        recipientId: recipient.id,
        recipientName: recipient.name,
      }
    });

  } catch (error) {
    console.error('[Auto Message Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في إرسال الرسالة التلقائية',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
