/**
 * API endpoint للمراقبة والصحة - نسخة مبسطة
 */

import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // فحص اتصال قاعدة البيانات
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    const responseTime = Date.now() - startTime;

    // إعداد headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Response-Time', responseTime.toString());

    return res.status(dbStatus === 'healthy' ? 200 : 503).json({
      success: dbStatus === 'healthy',
      status: dbStatus,
      database: dbStatus,
      responseTime,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    });
  } catch (error) {
    console.error('خطأ في API الصحة:', error);
    return res.status(500).json({
      success: false,
      status: 'error',
      error: 'خطأ داخلي',
      responseTime: Date.now() - startTime,
    });
  }
}
