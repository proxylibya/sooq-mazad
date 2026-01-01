import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * @swagger
 * /api/health/liveness:
 *   get:
 *     summary: فحص حالة التطبيق الأساسية
 *     description: يتحقق من أن التطبيق يعمل ويستجيب
 *     tags:
 *       - Health Checks
 *     responses:
 *       200:
 *         description: التطبيق يعمل بشكل صحيح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: وقت التشغيل بالثواني
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).json(healthCheck);
}
