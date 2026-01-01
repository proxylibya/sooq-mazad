import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Endpoint لعرض إحصائيات الضغط
 * GET /api/compression-stats
 */

interface CompressionStats {
  totalRequests: number;
  compressedRequests: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  compressionRatio: string;
  compressionRate: string;
  timestamp: string;
  status: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompressionStats | { error: string }>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // محاكاة الإحصائيات (في الإنتاج، يتم الحصول عليها من الـ middleware)
    const stats: CompressionStats = {
      totalRequests: 0,
      compressedRequests: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      compressionRatio: '0%',
      compressionRate: '0%',
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    // في الإنتاج، يمكن استيراد الإحصائيات من الـ middleware
    // const { getCompressionStats } = require('@/server-middleware/compression');
    // const stats = getCompressionStats();

    res.status(200).json(stats);
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الضغط:', error);
    res.status(500).json({ error: 'فشل جلب إحصائيات الضغط' });
  }
}
