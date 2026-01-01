import { NextApiRequest, NextApiResponse } from 'next';
import { carBrands, getModelsByBrand, getAllModels } from '../../data/simple-filters';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getModels(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API الموديلات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

async function getModels(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { brand, search, limit, format = 'detailed' } = req.query;

    let models: string[] = [];

    // جلب الموديلات حسب الماركة
    if (brand && typeof brand === 'string') {
      models = getModelsByBrand(brand);

      if (models.length === 0) {
        return res.status(404).json({
          success: false,
          error: `لا توجد موديلات للماركة: ${brand}`,
          availableBrands: carBrands.map((b) => b.name),
        });
      }
    } else {
      // جلب جميع الموديلات من جميع الماركات
      models = getAllModels();
    }

    // فلترة حسب البحث
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase().trim();
      models = models.filter((model) => model.toLowerCase().includes(searchTerm));
    }

    // تحديد عدد النتائج
    if (limit && typeof limit === 'string') {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        models = models.slice(0, limitNum);
      }
    }

    // تنسيق الاستجابة
    let response;
    if (format === 'simple') {
      // إرجاع أسماء الموديلات فقط
      response = {
        success: true,
        data: models,
        total: models.length,
      };
    } else if (format === 'dropdown') {
      // تنسيق للقوائم المنسدلة
      response = {
        success: true,
        data: [
          { value: '', label: brand ? 'اختر الموديل' : 'جميع الموديلات' },
          ...models.map((model) => ({
            value: model,
            label: model,
          })),
        ],
        total: models.length + 1,
      };
    } else {
      // تنسيق مفصل (افتراضي)
      const modelsWithBrands = models.map((model) => {
        // البحث عن الماركة التي تحتوي على هذا الموديل
        const brandInfo = carBrands.find((b) => b.models.includes(model));
        return {
          name: model,
          brand: brandInfo?.name || 'غير محدد',
        };
      });

      response = {
        success: true,
        data: modelsWithBrands,
        total: models.length,
      };
    }

    // إضافة معلومات إضافية للاستجابة
    response.meta = {
      brand: brand || null,
      searchTerm: search || null,
      format,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    // تم إزالة console.error لأسباب أمنية
    return res.status(500).json({
      success: false,
      error: 'خطأ في جلب الموديلات',
    });
  }
}
