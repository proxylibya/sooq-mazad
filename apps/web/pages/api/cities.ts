import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return res.status(200).json({
          success: true,
          data: [],
          message: 'API المدن غير متوفر حالياً',
        });
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API المدن:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}
