import type { NextApiRequest, NextApiResponse } from 'next';
import { UnifiedSearchService, SearchOptions } from '@/lib/services/search/UnifiedSearchService';
import { SearchSuggestionsService } from '@/lib/services/search/SearchSuggestionsService';

/**
 * API البحث الموحد الشامل
 * GET /api/search?q=تويوتا&type=cars&page=1&limit=20
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      q,
      type = 'all',
      page = '1',
      limit = '20',
      brand,
      model,
      city,
      minPrice,
      maxPrice,
      yearFrom,
      yearTo,
      condition,
      status,
      sortField = 'relevance',
      sortOrder = 'desc',
    } = req.query;

    // التحقق من وجود مصطلح البحث
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'مصطلح البحث مطلوب (q parameter)',
      });
    }

    // التحقق من طول النص
    if (q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'مصطلح البحث يجب أن يكون على الأقل حرفين',
      });
    }

    // بناء خيارات البحث
    const searchOptions: SearchOptions = {
      query: q.trim(),
      type: type as SearchOptions['type'],
      page: Math.max(1, parseInt(page as string) || 1),
      limit: Math.max(1, Math.min(100, parseInt(limit as string) || 20)),
      filters: {},
      sort: {
        field: sortField as string,
        order: (sortOrder as 'asc' | 'desc') || 'desc',
      },
    };

    // إضافة الفلاتر
    if (brand) searchOptions.filters!.brand = brand as string;
    if (model) searchOptions.filters!.model = model as string;
    if (city) searchOptions.filters!.city = city as string;
    if (condition) searchOptions.filters!.condition = condition as string;
    if (status) searchOptions.filters!.status = status as string;

    if (minPrice) {
      const price = parseFloat(minPrice as string);
      if (!isNaN(price)) searchOptions.filters!.minPrice = price;
    }
    if (maxPrice) {
      const price = parseFloat(maxPrice as string);
      if (!isNaN(price)) searchOptions.filters!.maxPrice = price;
    }

    if (yearFrom) {
      const year = parseInt(yearFrom as string);
      if (!isNaN(year)) searchOptions.filters!.yearFrom = year;
    }
    if (yearTo) {
      const year = parseInt(yearTo as string);
      if (!isNaN(year)) searchOptions.filters!.yearTo = year;
    }

    console.log('🔍 [Search API] بحث جديد:', {
      query: q,
      type,
      page: searchOptions.page,
      filters: searchOptions.filters,
    });

    // تنفيذ البحث
    const startTime = Date.now();
    const results = await UnifiedSearchService.search(searchOptions);
    const duration = Date.now() - startTime;

    console.log('✅ [Search API] نتائج:', {
      total: results.total,
      returned: results.results.length,
      duration: `${duration}ms`,
    });

    // حفظ استعلام البحث للإحصائيات (اختياري)
    SearchSuggestionsService.saveSearchQuery(q.trim(), undefined, results.total).catch((err) =>
      console.error('خطأ في حفظ استعلام البحث:', err)
    );

    return res.status(200).json({
      success: true,
      data: results,
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ [Search API] خطأ:', error);

    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في البحث',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
