/**
 * مثال على استخدام Materialized Views في API Endpoints
 *
 * هذا الملف للإرشاد فقط - يوضح كيفية استخدام الدوال المساعدة
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getTopActiveAuctionsByCity,
  getAuctionStatsByBrand,
  getMostViewedCars,
  getShowroomStatistics,
  getEndingSoonAuctions,
  getMostFavoritedCars,
} from '@/lib/materialized-views-helper';
import { cache } from '@/lib/cache';

/**
 * مثال 1: الحصول على أعلى المزادات في مدينة
 *
 * GET /api/auctions/top?city=طرابلس&limit=20
 *
 * الأداء: ~35ms (بدلاً من ~1200ms بدون Materialized View)
 */
export async function getTopAuctionsHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { city, limit = 20 } = req.query;

    if (!city || typeof city !== 'string') {
      return res.status(400).json({ error: 'city مطلوب' });
    }

    // محاولة الحصول من الكاش أولاً
    const cacheKey = `top_auctions:${city}:${limit}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        source: 'cache',
        data: cached,
      });
    }

    // الحصول من Materialized View
    const auctions = await getTopActiveAuctionsByCity(city, Number(limit));

    // حفظ في الكاش لمدة 5 دقائق
    await cache.set(cacheKey, auctions, 300);

    return res.status(200).json({
      source: 'materialized_view',
      data: auctions,
      count: auctions.length,
    });
  } catch (error) {
    console.error('خطأ في getTopAuctionsHandler:', error);
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
}

/**
 * مثال 2: الحصول على إحصائيات البراندات
 *
 * GET /api/stats/brands?brand=تويوتا
 *
 * الأداء: ~20ms (بدلاً من ~800ms)
 */
export async function getBrandStatsHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { brand } = req.query;

    const cacheKey = brand ? `brand_stats:${brand}` : 'brand_stats:all';

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        source: 'cache',
        data: cached,
      });
    }

    const stats = await getAuctionStatsByBrand(brand ? String(brand) : undefined);

    await cache.set(cacheKey, stats, 600); // 10 دقائق

    return res.status(200).json({
      source: 'materialized_view',
      data: stats,
    });
  } catch (error) {
    console.error('خطأ في getBrandStatsHandler:', error);
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
}

/**
 * مثال 3: الحصول على السيارات الأكثر مشاهدة
 *
 * GET /api/cars/trending?brand=تويوتا&limit=10
 *
 * الأداء: ~25ms
 */
export async function getTrendingCarsHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { brand, limit = 20 } = req.query;

    const cacheKey = brand ? `trending_cars:${brand}:${limit}` : `trending_cars:all:${limit}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        source: 'cache',
        data: cached,
      });
    }

    const cars = await getMostViewedCars(brand ? String(brand) : undefined, Number(limit));

    await cache.set(cacheKey, cars, 300); // 5 دقائق

    return res.status(200).json({
      source: 'materialized_view',
      data: cars,
      count: cars.length,
    });
  } catch (error) {
    console.error('خطأ في getTrendingCarsHandler:', error);
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
}

/**
 * مثال 4: الحصول على المزادات المنتهية قريباً
 *
 * GET /api/auctions/ending-soon?location=طرابلس
 *
 * الأداء: ~30ms
 * يجب تحديثها بشكل متكرر (كل دقيقة)
 */
export async function getEndingSoonHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { location } = req.query;

    const cacheKey = location ? `ending_soon:${location}` : 'ending_soon:all';

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        source: 'cache',
        data: cached,
      });
    }

    const auctions = await getEndingSoonAuctions(location ? String(location) : undefined);

    // TTL قصير لأن البيانات تتغير بسرعة
    await cache.set(cacheKey, auctions, 60); // 1 دقيقة

    return res.status(200).json({
      source: 'materialized_view',
      data: auctions,
      count: auctions.length,
    });
  } catch (error) {
    console.error('خطأ في getEndingSoonHandler:', error);
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
}

/**
 * مثال 5: الحصول على إحصائيات المعارض
 *
 * GET /api/showrooms/stats?city=طرابلس
 *
 * الأداء: ~40ms
 */
export async function getShowroomsStatsHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { city } = req.query;

    const cacheKey = city ? `showroom_stats:${city}` : 'showroom_stats:all';

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        source: 'cache',
        data: cached,
      });
    }

    const stats = await getShowroomStatistics(city ? String(city) : undefined);

    await cache.set(cacheKey, stats, 900); // 15 دقيقة

    return res.status(200).json({
      source: 'materialized_view',
      data: stats,
      count: stats.length,
    });
  } catch (error) {
    console.error('خطأ في getShowroomsStatsHandler:', error);
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
}

/**
 * مثال 6: الحصول على السيارات الأكثر إضافة للمفضلة
 *
 * GET /api/cars/most-favorited?brand=تويوتا&limit=10
 *
 * الأداء: ~25ms
 */
export async function getMostFavoritedHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { brand, limit = 20 } = req.query;

    const cacheKey = brand ? `favorited_cars:${brand}:${limit}` : `favorited_cars:all:${limit}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        source: 'cache',
        data: cached,
      });
    }

    const cars = await getMostFavoritedCars(brand ? String(brand) : undefined, Number(limit));

    await cache.set(cacheKey, cars, 600); // 10 دقائق

    return res.status(200).json({
      source: 'materialized_view',
      data: cars,
      count: cars.length,
    });
  } catch (error) {
    console.error('خطأ في getMostFavoritedHandler:', error);
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
}

/**
 * استراتيجية الكاش الموصى بها:
 *
 * 1. بيانات في الوقت الفعلي (المزادات المنتهية قريباً):
 *    - TTL: 60 ثانية
 *    - تحديث Materialized View: كل دقيقة
 *
 * 2. بيانات شبه ثابتة (أعلى المزادات):
 *    - TTL: 300 ثانية (5 دقائق)
 *    - تحديث Materialized View: كل 5 دقائق
 *
 * 3. بيانات إحصائية (إحصائيات البراندات):
 *    - TTL: 600 ثانية (10 دقائق)
 *    - تحديث Materialized View: كل 10 دقائق
 *
 * 4. بيانات نادرة التغيير (إحصائيات المعارض):
 *    - TTL: 900 ثانية (15 دقيقة)
 *    - تحديث Materialized View: كل 15 دقيقة
 */

/**
 * ملاحظات مهمة:
 *
 * 1. الكاش أولاً:
 *    - دائماً تحقق من الكاش قبل الوصول إلى Materialized View
 *    - هذا يقلل الضغط على قاعدة البيانات
 *
 * 2. TTL مناسب:
 *    - اختر TTL بناءً على مدى تغير البيانات
 *    - البيانات الأكثر تغيراً = TTL أقصر
 *
 * 3. معالجة الأخطاء:
 *    - دائماً وفّر Fallback للاستعلام العادي
 *    - سجّل الأخطاء للمراقبة
 *
 * 4. المراقبة:
 *    - راقب Cache Hit Rate بانتظام
 *    - راقب أوقات الاستجابة
 */

// تصدير للاستخدام في ملفات API الفعلية
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // هذا مثال فقط - لا تستخدمه مباشرة
  return res.status(200).json({
    message: 'هذا ملف مثال فقط. استخدم الدوال المُصدّرة في endpoints منفصلة',
    examples: [
      'getTopAuctionsHandler',
      'getBrandStatsHandler',
      'getTrendingCarsHandler',
      'getEndingSoonHandler',
      'getShowroomsStatsHandler',
      'getMostFavoritedHandler',
    ],
  });
}
