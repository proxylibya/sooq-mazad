import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { activityLogger } from '../../../lib/services/activityLogger';
import { inventoryService } from '../../../lib/services/inventoryService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    switch (req.method) {
      case 'GET':
        return handleGetStockMovements(req, res, user);
      case 'POST':
        return handleCreateStockMovement(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Stock movements API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get stock movements for an inventory item
async function handleGetStockMovements(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const { inventoryId, page = '1', limit = '20' } = req.query;

    if (!inventoryId) {
      return res.status(400).json({ error: 'Inventory ID is required' });
    }

    // Check if user has permission to view this inventory item
    if (['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId as string },
        select: { showroomId: true },
      });

      if (!inventory) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      const userShowroom = await prisma.users.findUnique({
        where: { id: user.id },
        select: { showroomId: true },
      });

      if (userShowroom?.showroomId !== inventory.showroomId) {
        return res.status(403).json({ error: 'Access denied to this inventory item' });
      }
    }

    const result = await inventoryService.getStockMovements(
      inventoryId as string,
      parseInt(page as string),
      parseInt(limit as string),
    );

    // Log access
    await activityLogger.logActivity(
      {
        userId: user.id,
        action: 'READ',
        entityType: 'InventoryMovement',
        description: 'Viewed stock movements',
        metadata: { inventoryId, resultCount: result.movements.length },
      },
      req,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
}

// Create new stock movement (stock adjustment)
async function handleCreateStockMovement(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const { inventoryId, type, quantity, reason, reference, notes, unitPrice } = req.body;

    // Validate required fields
    if (!inventoryId || !type || !quantity) {
      return res.status(400).json({
        error: 'Inventory ID, movement type, and quantity are required',
      });
    }

    // Validate movement type
    const validTypes = ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'DAMAGE', 'THEFT'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid movement type' });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    // Check if user has permission to modify this inventory item
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { showroomId: true, quantity: true },
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    if (['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      const userShowroom = await prisma.users.findUnique({
        where: { id: user.id },
        select: { showroomId: true },
      });

      if (userShowroom?.showroomId !== inventory.showroomId) {
        return res.status(403).json({ error: 'Access denied to this inventory item' });
      }
    }

    // Check if there's sufficient stock for OUT movements
    if (['OUT', 'TRANSFER', 'DAMAGE', 'THEFT'].includes(type)) {
      if (inventory.quantity < quantity) {
        return res.status(400).json({
          error: 'Insufficient stock. Available quantity: ' + inventory.quantity,
        });
      }
    }

    const movement = await inventoryService.createStockMovement({
      inventoryId,
      type,
      quantity,
      reason,
      reference,
      notes,
      performedBy: user.name || user.email,
      unitPrice,
    });

    // Log movement creation
    await activityLogger.logActivity(
      {
        userId: user.id,
        action: 'CREATE',
        entityType: 'InventoryMovement',
        entityId: movement.id,
        description: `Created ${type} stock movement for quantity ${quantity}`,
        metadata: {
          inventoryId,
          type,
          quantity,
          reason,
          balanceBefore: movement.balanceBefore,
          balanceAfter: movement.balanceAfter,
        },
      },
      req,
    );

    res.status(201).json({
      success: true,
      message: 'Stock movement created successfully',
      data: movement,
    });
  } catch (error) {
    console.error('Error creating stock movement:', error);

    if (error.message === 'Inventory item not found') {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === 'Insufficient stock for this operation') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to create stock movement' });
  }
}
