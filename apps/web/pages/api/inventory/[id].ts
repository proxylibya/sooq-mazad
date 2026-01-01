import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { activityLogger } from '../../../lib/services/activityLogger';
import { inventoryService } from '../../../lib/services/inventoryService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid inventory ID' });
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
    // Check user permissions
    if (!['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET':
        return handleGetItem(req, res, user, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Inventory item API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get single inventory item by ID
async function handleGetItem(req: NextApiRequest, res: NextApiResponse, user: any, id: string) {
  try {
    const inventory = await inventoryService.getInventoryById(id);

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Permission check for showroom users
    if (['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      const userShowroom = await prisma.users.findUnique({
        where: { id: user.id },
        select: { showroomId: true },
      });

      if (userShowroom?.showroomId !== inventory.showroomId) {
        return res.status(403).json({ error: 'Access denied to this inventory item' });
      }
    }

    // Log access
    await activityLogger.logActivity(
      {
        userId: user.id,
        action: 'READ',
        entityType: 'Inventory',
        entityId: id,
        description: `Viewed inventory item: ${inventory.name}`,
        metadata: { showroomId: inventory.showroomId },
      },
      req,
    );

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
}
