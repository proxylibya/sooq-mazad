import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/middleware/auth';
import { dbHelpers } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const authUser = await verifyToken(req);

    const qRaw = (req.query.q as string | undefined) ?? (req.query.search as string | undefined);
    const limitRaw = (req.query.limit as string | undefined) ?? '50';
    const queryUserId = (req.query.userId as string | undefined) || undefined;

    const q = (qRaw || '').trim();
    const limit = Math.max(1, Math.min(100, parseInt(limitRaw as string, 10) || 50));

    const userId = authUser?.id || queryUserId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'غير مصرح' });
    }

    if (!q) {
      return res.status(400).json({ success: false, error: 'معامل البحث q مطلوب' });
    }

    // Enforce user scope when both are present
    if (authUser?.id && queryUserId && String(authUser.id) !== String(queryUserId)) {
      return res.status(403).json({ success: false, error: 'غير مسموح' });
    }

    const messages = await dbHelpers.searchMessages(String(userId), q, limit);

    return res.status(200).json({ success: true, messages });
  } catch (error: any) {
    console.error('Messages search error:', error);
    return res.status(500).json({ success: false, error: 'Server error', details: error?.message || 'unknown' });
  }
}
