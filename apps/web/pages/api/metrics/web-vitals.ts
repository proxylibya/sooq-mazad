/**
 * API endpoint لاستقبال Web Vitals من المتصفح
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { metrics } from '@/lib/monitoring/performance-metrics';
import { reportWebVitals } from '@/lib/monitoring/sentry-config';

interface WebVitalData {
  id: string;
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  navigationType?: string;
  page?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // السماح فقط بـ POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data: WebVitalData = req.body;

    // التحقق من صحة البيانات
    if (!data.name || typeof data.value !== 'number') {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const page = data.page || req.headers.referer || 'unknown';

    // تسجيل في Prometheus
    if (['LCP', 'FID', 'CLS'].includes(data.name)) {
      metrics.recordWebVital(data.name as 'LCP' | 'FID' | 'CLS', data.value, page);
    }

    // تسجيل في Sentry
    reportWebVitals({
      id: data.id,
      name: data.name,
      label: 'web-vital',
      value: data.value,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording web vital:', error);
    res.status(500).json({ error: 'Failed to record web vital' });
  }
}
