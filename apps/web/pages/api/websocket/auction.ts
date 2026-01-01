import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const activeAuctions: string[] = [];

  res.status(200).json({
    success: true,
    message: 'خادم WebSocket للمزادات يعمل',
    data: {
      activeAuctions: activeAuctions.length,
      auctionIds: activeAuctions,
      endpoint: '/api/websocket/auction',
      protocols: ['websocket', 'polling'],
    },
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
