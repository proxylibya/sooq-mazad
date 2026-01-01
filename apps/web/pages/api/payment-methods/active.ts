import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withApiRateLimit, RateLimitConfigs } from '../../../utils/rateLimiter';
import keydbClient from '../../../lib/keydb';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'طريقة غير مدعومة',
      error: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const { category } = req.query;
    const cacheKey = `payment_methods:active:${category || 'all'}`;

    // محاولة جلب البيانات من Cache أولاً
    try {
      const cached = await keydbClient.get<any>(cacheKey);
      if (cached) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        return res.status(200).json(cached);
      }
    } catch (cacheError) {
      console.warn('[CACHE ERROR]', cacheError);
      // الاستمرار في جلب البيانات من قاعدة البيانات
    }

    // بناء شروط البحث
    const whereConditions: Record<string, unknown> = {
      isActive: true,
    };

    if (category && category !== 'all') {
      whereConditions.category = category;
    }

    // جلب وسائل الدفع النشطة فقط
    const paymentMethods = await prisma.payment_method_configs.findMany({
      where: whereConditions,
      orderBy: [
        { isPopular: 'desc' }, // الشائعة أولاً
        { createdAt: 'asc' }, // ثم الأقدم
      ],
      select: {
        id: true,
        name: true,
        nameAr: true,
        type: true,
        category: true,
        description: true,
        icon: true,
        logo: true,
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
      },
    });

    // تنظيم البيانات حسب الفئة
    const organized = {
      local: paymentMethods.filter((m) => m.category === 'local'),
      international: paymentMethods.filter((m) => m.category === 'international'),
      wallet: paymentMethods.filter((m) => m.category === 'wallet'),
      bank: paymentMethods.filter((m) => m.category === 'bank'),
      all: paymentMethods,
    };

    const response = {
      success: true,
      data: {
        paymentMethods: category
          ? organized[category as keyof typeof organized] || []
          : organized.all,
        organized,
        count: paymentMethods.length,
      },
    };

    // حفظ النتيجة في Cache لمدة 5 دقائق (300 ثانية)
    try {
      await keydbClient.set(cacheKey, response, 300);
      console.log(`[CACHE SET] ${cacheKey}`);
    } catch (cacheError) {
      console.warn('[CACHE SET ERROR]', cacheError);
      // الاستمرار في إرجاع النتيجة حتى لو فشل الحفظ في Cache
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('خطأ في جلب وسائل الدفع:', error);

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ داخلي في الخادم',
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
}

export default withApiRateLimit(handler, RateLimitConfigs.API_GENERAL);
