import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '../../../lib/payments/paymentManager';
import {
  PaymentData,
  TransactionType,
  PaymentGateway,
} from '../../../lib/payments/paymentGateways';
import { verifyToken } from '../../../lib/auth';
import { rateLimiter } from '../../../lib/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter.checkRateLimit(
      `payment_init_${req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown'}`,
      10,
      60,
    );

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'تم تجاوز حد المحاولات',
        retryAfter: rateLimitResult.retryAfter,
      });
    }

    // التحقق من المصادقة
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'رمز المصادقة مطلوب' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'رمز المصادقة غير صحيح' });
    }

    const {
      amount,
      currency = 'LYD',
      auctionId,
      transactionType,
      gateway,
      description,
      metadata,
    } = req.body;

    // التحقق من صحة البيانات
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'المبلغ مطلوب ويجب أن يكون أكبر من صفر' });
    }

    if (!transactionType || !Object.values(TransactionType).includes(transactionType)) {
      return res.status(400).json({ error: 'نوع المعاملة مطلوب وغير صحيح' });
    }

    // إنشاء معرف الطلب
    const orderId = `ORD_${Date.now()}_${user.userId.slice(-6)}`;

    // تحضير بيانات الدفع
    const paymentData: PaymentData = {
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      orderId,
      userId: user.userId,
      auctionId,
      transactionType,
      gateway: gateway as PaymentGateway,
      description: description || `دفع ${transactionType} - سوق المزاد`,
      metadata: {
        ...metadata,
        userEmail: user.email,
        userName: user.name,
        timestamp: new Date().toISOString(),
      },
    };

    // معالجة الدفع
    const result = await paymentService.processPayment(paymentData);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          transactionId: result.transactionId,
          paymentUrl: result.paymentUrl,
          gatewayTransactionId: result.gatewayTransactionId,
          orderId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: result.status,
          message: result.message,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        transactionId: result.transactionId,
      });
    }
  } catch (error) {
    console.error('خطأ في تهيئة الدفع:', error);
    res.status(500).json({
      error: 'خطأ في الخادم',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
