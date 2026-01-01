import type { NextApiRequest, NextApiResponse } from 'next';

// تم إهمال هذا المسار. الرجاء استخدام المسار الصحيح:
// POST /api/auctions/[id]/bid
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Allow', ['POST']);
  return res.status(410).json({
    success: false,
    error: 'تم إهمال هذا المسار. استخدم /api/auctions/[id]/bid لإرسال المزايدات.',
  });
}
