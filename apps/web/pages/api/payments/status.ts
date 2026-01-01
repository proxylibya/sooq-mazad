import { NextApiRequest, NextApiResponse } from 'next';
import { paymentGateway } from '../../../lib/payments/paymentGateway';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // إعداد رؤوس CORS والأمان
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'الطريقة غير مدعومة',
    });
  }

  try {
    const { transactionId } = req.query;

    if (!transactionId || typeof transactionId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف المعاملة مطلوب',
      });
    }

    // الحصول على حالة المعاملة
    const status = paymentGateway.getTransactionStatus(transactionId);

    return res.status(200).json({
      success: true,
      data: {
        transactionId,
        status,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('خطأ في API حالة الدفع:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ داخلي في الخادم',
    });
  }
}
