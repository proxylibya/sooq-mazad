/**
 * API Route: brands
 *
 * @description API لجلب ماركات السيارات مع إمكانيات البحث والفلترة
 *
 * @methods GET
 *
 * @param {NextApiRequest} req - طلب HTTP
 * @param {NextApiResponse} res - استجابة HTTP
 *
 * @query {string} search - مصطلح البحث لفلترة الماركات
 * @query {string} popular - 'true' لإرجاع الماركات الشائعة فقط
 * @query {string} limit - عدد النتائج المطلوبة
 * @query {string} format - تنسيق الاستجابة: 'simple', 'dropdown', 'detailed'
 *
 * @returns {Promise<void>}
 *
 * @example
 * GET /api/brands
 * GET /api/brands?search=تويوتا
 * GET /api/brands?popular=true&limit=10
 * GET /api/brands?format=dropdown
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { carBrands, getAllBrandNames } from '../../data/simple-filters';

// أنواع البيانات للاستجابة
interface BrandResponse {
  success: boolean;
  data: any[];
  total: number;
  totalModels?: number;
  meta?: {
    searchTerm: string | null;
    popularOnly: boolean;
    format: string;
    timestamp: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  timestamp?: string;
}

// دالة لتوثيق العمليات
function logApiRequest(req: NextApiRequest, context: string) {
  console.log(`[التحرير] ${context} - ${req.method} ${req.url}`, {
    timestamp: new Date().toISOString(),
    query: req.query,
    userAgent: req.headers['user-agent'],
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BrandResponse | ErrorResponse>,
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getBrands(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API الماركات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

async function getBrands(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { search, popular = 'false', limit, format = 'detailed' } = req.query;

    let brands = carBrands;

    // فلترة حسب البحث
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase().trim();
      brands = brands.filter((brand) => brand.name.toLowerCase().includes(searchTerm));
    }

    // فلترة الماركات الشائعة فقط (يمكن إضافة خاصية popular للماركات لاحقاً)
    if (popular === 'true') {
      // الماركات الشائعة في ليبيا
      const popularBrandNames = [
        'تويوتا',
        'نيسان',
        'هوندا',
        'هيونداي',
        'كيا',
        'مازدا',
        'ميتسوبيشي',
        'سوزوكي',
        'فورد',
        'شيفروليه',
        'مرسيدس',
        'BMW',
      ];
      brands = brands.filter((brand) => popularBrandNames.includes(brand.name));
    }

    // تحديد عدد النتائج
    if (limit && typeof limit === 'string') {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        brands = brands.slice(0, limitNum);
      }
    }

    // تنسيق الاستجابة
    let response;
    if (format === 'simple') {
      // إرجاع أسماء الماركات فقط
      response = {
        success: true,
        data: brands.map((brand) => brand.name),
        total: brands.length,
      };
    } else if (format === 'dropdown') {
      // تنسيق للقوائم المنسدلة
      response = {
        success: true,
        data: [
          { value: '', label: 'جميع الماركات' },
          ...brands.map((brand) => ({
            value: brand.name,
            label: brand.name,
          })),
        ],
        total: brands.length + 1,
      };
    } else {
      // تنسيق مفصل (افتراضي)
      response = {
        success: true,
        data: brands.map((brand) => ({
          name: brand.name,
          modelsCount: brand.models.length,
          models: brand.models,
        })),
        total: brands.length,
        totalModels: brands.reduce((sum, brand) => sum + brand.models.length, 0),
      };
    }

    // إضافة معلومات إضافية للاستجابة
    response.meta = {
      searchTerm: search || null,
      popularOnly: popular === 'true',
      format,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('خطأ في جلب الماركات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في جلب الماركات',
    });
  }
}
