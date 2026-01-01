import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '../../../lib/payments/paymentManager';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // التحقق من المصادقة
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'رمز المصادقة مطلوب' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'رمز المصادقة غير صحيح' });
    }

    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'معرف المعاملة مطلوب' });
    }

    // التحقق من ملكية المعاملة للمستخدم
    const transaction = await prisma.transactions.findFirst({
      where: {
        id: transactionId,
        userId: user.userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'المعاملة غير موجودة أو غير مصرح لك بالوصول إليها' });
    }

    // التحقق من حالة الدفع
    const result = await paymentService.verifyPayment(transactionId);

    res.status(200).json({
      success: result.success,
      data: {
        transactionId: result.transactionId,
        status: result.status,
        message: result.message,
        gatewayTransactionId: result.gatewayTransactionId,
      },
      error: result.error,
    });
  } catch (error) {
    console.error('خطأ في التحقق من الدفع:', error);
    res.status(500).json({
      error: 'خطأ في الخادم',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
