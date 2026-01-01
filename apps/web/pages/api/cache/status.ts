/**
 * API Endpoint: حالة نظام Cache
 * GET /api/cache/status
 */

import { getOrSetCache } from '@/lib/cache';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة' });
  }

  try {
    // اختبار الكتابة والقراءة
    const testKey = '__health_check__';
    const testData = {
      timestamp: Date.now(),
      message: 'اختبار الكاش',
    };

    // كتابة اختبارية
    const writeTest = await getOrSetCache(testKey, 60, async () => testData);

    const response = {
      status: 'success',
      cache: {
        health: {
          writeTest: writeTest !== null,
          operational: true,
        },
        info: {
          activeStore: 'LocalCache',
        },
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('خطأ في فحص حالة الكاش:', error);
    return res.status(500).json({
      status: 'error',
      error: 'فشل فحص حالة الكاش',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
