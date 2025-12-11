import { NextApiRequest, NextApiResponse } from 'next';
import {
  paymentGateway,
  PaymentMethod,
  PaymentGateway,
  Currency,
} from '../../../lib/payments/paymentGateway';
import { generateHash } from '../../../lib/security/edgeEncryption';
import { advancedBlocking, ThreatLevel, BlockReason } from '../../../lib/security/advancedBlocking';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // إعداد رؤوس CORS والأمان
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'الطريقة غير مدعومة',
    });
  }

  try {
    // فحص أمني للطلب
    const clientIP =
      (req.headers?.['x-forwarded-for'] as string) ||
      (req.headers?.['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      'unknown';

    const securityCheck = await advancedBlocking.analyzeRequest({
      ip: clientIP,
      userAgent: req.headers?.['user-agent'] || '',
      url: req.url || '',
      method: req.method,
      body: req.body,
      headers: req.headers,
    });

    if (!securityCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: 'طلب مرفوض لأسباب أمنية',
        reasons: securityCheck.reasons,
      });
    }

    return await handlePaymentProcess(req, res);
  } catch (error) {
    console.error('خطأ في API معالجة الدفع:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ داخلي في الخادم',
    });
  }
}

// معالجة طلب الدفع
async function handlePaymentProcess(req: NextApiRequest, res: NextApiResponse) {
  const { amount, currency, method, gateway, customerId, orderId, description, country, metadata } =
    req.body;

  // التحقق من البيانات المطلوبة
  const requiredFields = [
    'amount',
    'currency',
    'method',
    'gateway',
    'customerId',
    'orderId',
    'country',
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'بيانات مفقودة',
      missingFields,
    });
  }

  // التحقق من صحة البيانات
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'المبلغ يجب أن يكون رقم أكبر من صفر',
    });
  }

  if (!Object.values(Currency).includes(currency)) {
    return res.status(400).json({
      success: false,
      message: 'العملة غير مدعومة',
    });
  }

  if (!Object.values(PaymentMethod).includes(method)) {
    return res.status(400).json({
      success: false,
      message: 'وسيلة الدفع غير مدعومة',
    });
  }

  if (!Object.values(PaymentGateway).includes(gateway)) {
    return res.status(400).json({
      success: false,
      message: 'بوابة الدفع غير مدعومة',
    });
  }

  try {
    // إنشاء طلب الدفع
    const paymentRequest = {
      id: await generateHash(customerId + orderId + Date.now()),
      amount,
      currency,
      method,
      gateway,
      customerId,
      orderId,
      description: description || 'دفع مزاد السيارات',
      metadata: metadata || {},
      country: country.toUpperCase(),
      timestamp: new Date(),
    };

    // معالجة الدفع
    const result = await paymentGateway.processPayment(paymentRequest);

    // تسجيل المعاملة للمراقبة
    if (result.success) {
      console.log('معاملة دفع ناجحة:', {
        transactionId: result.transactionId,
        amount,
        currency,
        method,
        country,
      });
    } else {
      console.warn('فشل في معاملة الدفع:', {
        orderId,
        customerId,
        reason: result.message,
        errorCode: result.errorCode,
      });
    }

    // إنشاء إشعار عند النجاح
    if (result.success) {
      try {
        await prisma.notifications.create({
          data: {
            id: `notif_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: customerId,
            type: 'PAYMENT_RECEIVED',
            title: 'تم استلام الدفع',
            message: `تم استلام دفعة بقيمة ${amount} ${currency} للطلب ${orderId}`,
            isRead: false,
            createdAt: new Date(),
          },
        });
      } catch (e) {
        console.warn('تحذير: فشل إنشاء إشعار الدفع المستلم:', e);
      }
    } else {
      // فشل الدفع - إشعار تحذيري اختياري
      try {
        await prisma.notifications.create({
          data: {
            id: `notif_payment_warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: customerId,
            type: 'WARNING',
            title: 'فشل في معالجة الدفع',
            message: `تعذر إكمال الدفع للطلب ${orderId}. الرجاء المحاولة مرة أخرى.`,
            isRead: false,
            createdAt: new Date(),
          },
        });
      } catch (e) {
        console.warn('تحذير: فشل إنشاء إشعار فشل الدفع:', e);
      }
    }

    return res.status(result.success ? 200 : 400).json({
      success: result.success,
      data: result.success
        ? {
            transactionId: result.transactionId,
            status: result.status,
            redirectUrl: result.redirectUrl,
            processingFee: result.processingFee,
            exchangeRate: result.exchangeRate,
            estimatedTime: result.estimatedTime,
          }
        : null,
      message: result.message,
      errorCode: result.errorCode,
    });
  } catch (error) {
    console.error('خطأ في معالجة الدفع:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في معالجة الدفع',
    });
  }
}
