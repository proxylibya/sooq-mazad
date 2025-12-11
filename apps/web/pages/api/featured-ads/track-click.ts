import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `الطريقة ${req.method} غير مسموحة`,
    });
  }

  try {
    const { adId } = req.body;

    if (!adId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الإعلان مطلوب',
      });
    }

    // تحديث عدد النقرات
    await prisma.featuredAd.update({
      where: { id: adId },
      data: {
        clicks: { increment: 1 },
      },
    });

    res.status(200).json({
      success: true,
      message: 'تم تسجيل النقرة بنجاح',
    });
  } catch (error) {
    console.error('خطأ في تسجيل النقرة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في تسجيل النقرة',
    });
  }
}
