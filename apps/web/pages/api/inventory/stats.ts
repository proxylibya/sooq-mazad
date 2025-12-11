import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { activityLogger } from '../../../lib/services/activityLogger';
import { inventoryService } from '../../../lib/services/inventoryService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication check
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let user;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any;
      user = decoded;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check user permissions
    if (!['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { showroomId } = req.query;

    // If user is showroom owner/manager, restrict to their showroom
    let finalShowroomId = showroomId as string;
    if (['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      const userShowroom = await prisma.users.findUnique({
        where: { id: user.id },
        select: { showroomId: true },
      });
      finalShowroomId = userShowroom?.showroomId || '';
    }

    const stats = await inventoryService.getInventoryStats(finalShowroomId);

    // Log access
    await activityLogger.logActivity(
      {
        userId: user.id,
        action: 'READ',
        entityType: 'InventoryStats',
        description: 'Viewed inventory statistics',
        metadata: { showroomId: finalShowroomId },
      },
      req,
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    res.status(500).json({ error: 'Failed to fetch inventory statistics' });
  }
}
