/**
 * API: الحصول على أرصدة المحافظ المتعددة
 * Multi-Wallet Balance API
 *
 * @description نقطة نهاية للحصول على أرصدة جميع محافظ المستخدم
 */

import { prisma } from '@/lib/prisma';
import { walletService } from '@/lib/wallet/wallet-service';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // إعداد headers للاستجابة
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, max-age=60');

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'طريقة غير مدعومة',
      error: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم مطلوب',
        error: 'MISSING_USER_ID',
      });
    }

    // التحقق من صحة معرف المستخدم
    if (userId.length < 10 || userId.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح',
        error: 'INVALID_USER_ID',
      });
    }

    // التحقق من وجود المستخدم أولاً
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
        error: 'USER_NOT_FOUND',
      });
    }

    // الحصول على أرصدة المحافظ باستخدام الخدمة الموحدة
    const walletData = await walletService.getMultiWalletBalance(userId);

    return res.status(200).json({
      success: true,
      wallets: {
        local: {
          balance: walletData.local.balance,
          currency: walletData.local.currency,
          isActive: walletData.local.isActive,
        },
        global: {
          balance: walletData.global.balance,
          currency: walletData.global.currency,
          isActive: walletData.global.isActive,
        },
        crypto: {
          balance: walletData.crypto.balance,
          currency: walletData.crypto.currency,
          isActive: walletData.crypto.isActive,
          address: walletData.crypto.address,
          network: walletData.crypto.network,
        },
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('خطأ في API المحافظ المتعددة:', error);

    // تحديد نوع الخطأ وإرجاع استجابة مناسبة
    let statusCode = 500;
    let errorMessage = 'حدث خطأ داخلي في الخادم';
    let errorCode = 'INTERNAL_ERROR';

    const err = error as { code?: string; message?: string; };

    if (err.code === 'P2025') {
      statusCode = 404;
      errorMessage = 'المستخدم غير موجود';
      errorCode = 'USER_NOT_FOUND';
    } else if (err.code === 'P2002') {
      statusCode = 409;
      errorMessage = 'تضارب في البيانات';
      errorCode = 'DATA_CONFLICT';
    } else if (err.message && err.message.includes('connect')) {
      statusCode = 503;
      errorMessage = 'خطأ في الاتصال بقاعدة البيانات';
      errorCode = 'DATABASE_CONNECTION_ERROR';
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: errorCode,
    });
  }
}
