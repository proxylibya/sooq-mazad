import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import AuctionManager from '../../../lib/websocket/auctionManager';

let auctionManager: AuctionManager | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!auctionManager) {
    // إنشاء WebSocket server إذا لم يكن موجوداً
    const httpServer = (res.socket as any).server as HTTPServer;

    if (!httpServer.io) {
      auctionManager = new AuctionManager(httpServer);
      httpServer.io = auctionManager;
    } else {
      auctionManager = httpServer.io;
    }
  }

  // إرجاع معلومات عن المزادات النشطة
  const activeAuctions = auctionManager.getActiveAuctions();

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
