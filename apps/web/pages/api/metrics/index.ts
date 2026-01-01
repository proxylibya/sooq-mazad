/**
 * API endpoint لعرض Prometheus metrics
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getMetrics } from '@/lib/monitoring/performance-metrics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // السماح فقط بـ GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // الحصول على جميع المقاييس
    const metrics = await getMetrics();

    // إرجاع المقاييس بتنسيق Prometheus
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.status(200).send(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}
