import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, SMSStatus } from '@prisma/client';
import { sendSMS } from '../../../utils/notifications/providers';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'طريقة غير مدعومة' });
  }

  try {
    const { to, body, provider, from, userId } = req.body || {};

    if (!to || !body) {
      return res.status(400).json({
        success: false,
        error: 'البيانات المطلوبة غير مكتملة',
        required: ['to', 'body'],
      });
    }

    // إنشاء سجل أولي في SMSLog بحالة PENDING
    const log = await prisma.sMSLog.create({
      data: {
        phone: to,
        message: body,
        userId: userId || null,
        status: SMSStatus.PENDING,
        provider: provider || null,
      },
    });

    const result = await sendSMS({ to, body, provider, from });

    if (!result.ok) {
      // تحديث السجل بفشل الإرسال
      await prisma.sMSLog.update({
        where: { id: log.id },
        data: {
          errorMessage: result.error || 'فشل إرسال الرسالة',
          failedAt: new Date(),
        },
      });
      return res.status(500).json({ success: false, error: result.error || 'فشل إرسال الرسالة' });
    }

    // نجاح: تحديث السجل إلى SENT
    await prisma.sMSLog.update({
      where: { id: log.id },
      data: {
        status: SMSStatus.SENT,
        provider: provider || process.env.SMS_PROVIDER || 'twilio',
        sentAt: new Date(),
      },
    });

    return res.status(200).json({ success: true, message: 'تم إرسال الرسالة القصيرة بنجاح' });
  } catch (error: any) {
    console.error('خطأ في API الرسائل القصيرة:', error);
    return res.status(500).json({ success: false, error: 'خطأ داخلي في الخادم' });
  }
}
