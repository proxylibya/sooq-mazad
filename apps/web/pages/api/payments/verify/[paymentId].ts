/**
 * Verify Payment API
 * API التحقق من الدفعة
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '../../../../utils/jwt';
import { paymentGateway } from '../../../../services/paymentGateway';
import { PaymentMethod } from '../../../../types/payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'طريقة غير مدعومة',
    });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة مطلوب',
      });
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة غير صالح',
      });
    }

    const { paymentId } = req.query;
    const { method } = req.body;

    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'معرف الدفعة مطلوب',
      });
    }

    if (!method) {
      return res.status(400).json({
        success: false,
        error: 'طريقة الدفع مطلوبة',
      });
    }

    // Verify payment through gateway
    const paymentResponse = await paymentGateway.verifyPayment(paymentId, method as PaymentMethod);

    // Log verification attempt
    console.log(`التحقق من الدفعة: ${paymentId} بواسطة المستخدم: ${decoded.userId}`);

    res.status(200).json({
      success: true,
      data: {
        paymentId: paymentResponse.id,
        status: paymentResponse.status,
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
        method: paymentResponse.method,
        transactionId: paymentResponse.transactionId,
        providerTransactionId: paymentResponse.providerTransactionId,
        completedAt: paymentResponse.completedAt,
        updatedAt: paymentResponse.updatedAt,
        errorCode: paymentResponse.errorCode,
        errorMessage: paymentResponse.errorMessage,
      },
    });
  } catch (error) {
    console.error('خطأ في التحقق من الدفعة:', error);

    res.status(500).json({
      success: false,
      error: 'حدث خطأ في التحقق من الدفعة',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
