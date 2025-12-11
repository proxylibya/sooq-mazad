import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchSuggestionsService } from '@/lib/services/search/SearchSuggestionsService';

/**
 * API اقتراحات البحث الذكية
 * GET /api/search/suggestions?q=تويوتا&limit=8
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { q = '', limit = '8' } = req.query;

    const query = typeof q === 'string' ? q.trim() : '';
    const limitNum = Math.max(1, Math.min(20, parseInt(limit as string) || 8));

    // جلب الاقتراحات
    const suggestions = await SearchSuggestionsService.getSuggestions(query, limitNum);

    return res.status(200).json({
      success: true,
      suggestions,
      total: suggestions.length,
    });
  } catch (error: any) {
    console.error('❌ [Suggestions API] خطأ:', error);

    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب الاقتراحات',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
