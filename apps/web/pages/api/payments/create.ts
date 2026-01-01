/**
 * Create Payment API
 * API إنشاء الدفعة
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '../../../utils/jwt';
import { paymentGateway } from '../../../services/paymentGateway';
import { PaymentRequest, PaymentMethod, Currency } from '../../../types/payment';
import { z } from 'zod';

// Validation schema
const createPaymentSchema = z.object({
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.enum(['LYD', 'USD', 'EUR']),
  method: z.enum(['BANK_TRANSFER', 'MOBILE_MONEY', 'CASH_ON_DELIVERY', 'INSTALLMENTS', 'E_WALLET']),
  description: z.string().min(1, 'الوصف مطلوب'),
  auctionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  callbackUrl: z.string().url().optional(),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

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

    // Validate request body
    const validationResult = createPaymentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: validationResult.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const {
      amount,
      currency,
      method,
      description,
      auctionId,
      metadata,
      callbackUrl,
      returnUrl,
      cancelUrl,
    } = validationResult.data;

    // Check payment method availability
    const supportedMethods = paymentGateway.getSupportedPaymentMethods();
    if (!supportedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        error: `طريقة الدفع غير مدعومة: ${method}`,
      });
    }

    // Validate amount limits
    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'الحد الأدنى للدفع هو 1 دينار',
      });
    }

    if (amount > 1000000) {
      return res.status(400).json({
        success: false,
        error: 'الحد الأقصى للدفع هو 1,000,000 دينار',
      });
    }

    // Create payment request
    const paymentRequest: PaymentRequest = {
      id: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: currency as Currency,
      method: method as PaymentMethod,
      description,
      auctionId,
      customerId: decoded.userId,
      metadata: {
        ...metadata,
        createdBy: decoded.userId,
        userAgent: req.headers?.['user-agent'],
        ipAddress: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress,
      },
      callbackUrl,
      returnUrl,
      cancelUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // Process payment through gateway
    const paymentResponse = await paymentGateway.processPayment(paymentRequest);

    // Log payment creation
    console.log(`إنشاء دفعة جديدة: ${paymentResponse.id} للمستخدم: ${decoded.userId}`);

    res.status(200).json({
      success: true,
      data: {
        paymentId: paymentResponse.id,
        status: paymentResponse.status,
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
        method: paymentResponse.method,
        paymentUrl: paymentResponse.paymentUrl,
        qrCode: paymentResponse.qrCode,
        instructions: paymentResponse.instructions,
        estimatedCompletionTime: paymentResponse.estimatedCompletionTime,
        fees: paymentResponse.fees,
        expiresAt: paymentRequest.expiresAt,
        createdAt: paymentResponse.createdAt,
      },
    });
  } catch (error) {
    console.error('خطأ في إنشاء الدفعة:', error);

    res.status(500).json({
      success: false,
      error: 'حدث خطأ في إنشاء الدفعة',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// Helper function to determine payment method recommendation
export function getRecommendedPaymentMethod(amount: number, currency: Currency): PaymentMethod {
  // Business logic for payment method recommendation
  if (amount > 10000) {
    return 'BANK_TRANSFER'; // Large amounts prefer bank transfer
  } else if (amount < 100) {
    return 'MOBILE_MONEY'; // Small amounts prefer mobile money
  } else {
    return 'E_WALLET'; // Medium amounts prefer e-wallet
  }
}

// Helper function to calculate fees
export function calculatePaymentFees(amount: number, method: PaymentMethod): number {
  const feeRates = {
    BANK_TRANSFER: 5, // Fixed 5 LYD
    MOBILE_MONEY: amount * 0.015, // 1.5%
    E_WALLET: amount * 0.01, // 1%
    CASH_ON_DELIVERY: 10, // Fixed 10 LYD
    INSTALLMENTS: amount * 0.03, // 3%
  };

  return feeRates[method] || 0;
}
