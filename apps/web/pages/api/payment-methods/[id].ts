import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withApiRateLimit, RateLimitConfigs } from '../../../utils/rateLimiter';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'طريقة غير مدعومة',
      error: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف وسيلة الدفع مطلوب',
        error: 'INVALID_ID',
      });
    }

    // جلب معلومات وسيلة الدفع
    const paymentMethod = await prisma.payment_method_configs.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        nameEn: true,
        type: true,
        category: true,
        description: true,
        icon: true,
        logo: true,
        isActive: true,
        isPopular: true,
        minAmount: true,
        maxAmount: true,
        dailyLimit: true,
        monthlyLimit: true,
        processingTime: true,
        baseFee: true,
        percentageFee: true,
        fixedFee: true,
        supportedCurrencies: true,
        requiredFields: true,
        metadata: true,
      },
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'وسيلة الدفع غير موجودة',
        error: 'NOT_FOUND',
      });
    }

    // التحقق من أن وسيلة الدفع نشطة
    if (!paymentMethod.isActive) {
      return res.status(403).json({
        success: false,
        message: 'وسيلة الدفع غير متاحة حالياً',
        error: 'INACTIVE',
      });
    }

    return res.status(200).json({
      success: true,
      data: paymentMethod,
    });
  } catch (error) {
    console.error('خطأ في جلب وسيلة الدفع:', error);

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ داخلي في الخادم',
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
}

export default withApiRateLimit(handler, RateLimitConfigs.API_GENERAL);
