import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        message: 'معرف المستخدم مطلوب',
        error: 'MISSING_USER_ID',
      });
    }

    // البحث عن المحفظة مع الأنواع
    const wallet = await prisma.wallets.findUnique({
      where: { userId },
      include: {
        local_wallets: true,
        global_wallets: true,
        crypto_wallets: true,
      },
    });

    if (!wallet) {
      return res.status(404).json({
        message: 'المحفظة غير موجودة',
        error: 'WALLET_NOT_FOUND',
      });
    }

    const local = wallet.local_wallets;

    return res.status(200).json({
      userId,
      balance: local?.balance ?? 0,
      currency: local?.currency ?? 'LYD',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'حدث خطأ في الخادم',
      error: 'INTERNAL_ERROR',
    });
  } finally {
    // Prisma Singleton: لا تقم بقطع الاتصال هنا
  }
}
