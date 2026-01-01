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

    // Check user permissions - only showroom owners/managers can manage inventory
    if (!['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET':
        return handleGetInventory(req, res, user);
      case 'POST':
        return handleCreateInventory(req, res, user);
      case 'PUT':
        return handleUpdateInventory(req, res, user);
      case 'DELETE':
        return handleDeleteInventory(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Inventory API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get inventory items with filters and pagination
async function handleGetInventory(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const {
      page = '1',
      limit = '20',
      showroomId,
      category,
      condition,
      brand,
      lowStock,
      search,
      isActive = 'true',
    } = req.query;

    // If user is showroom owner/manager, restrict to their showroom
    let finalShowroomId = showroomId as string;
    if (['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      const userShowroom = await prisma.users.findUnique({
        where: { id: user.id },
        select: { showroomId: true },
      });
      finalShowroomId = userShowroom?.showroomId || '';
    }

    const filters = {
      showroomId: finalShowroomId,
      category: category as any,
      condition: condition as any,
      brand: brand as string,
      lowStock: lowStock === 'true',
      search: search as string,
      isActive: isActive === 'true',
    };

    const result = await inventoryService.getInventory(
      filters,
      parseInt(page as string),
      parseInt(limit as string),
    );

    // Log access
    await activityLogger.logActivity(
      {
        userId: user.id,
        action: 'READ',
        entityType: 'Inventory',
        description: 'Viewed inventory items',
        metadata: { filters, resultCount: result.items.length },
      },
      req,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

// Create new inventory item
async function handleCreateInventory(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const inventoryData = req.body;

    // If user is showroom owner/manager, set their showroom ID
    if (['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      const userShowroom = await prisma.users.findUnique({
        where: { id: user.id },
        select: { showroomId: true },
      });

      if (!userShowroom?.showroomId) {
        return res.status(400).json({ error: 'User is not associated with a showroom' });
      }

      inventoryData.showroomId = userShowroom.showroomId;
    }

    // Validate required fields
    if (!inventoryData.name || !inventoryData.showroomId || !inventoryData.category) {
      return res.status(400).json({
        error: 'Name, showroom ID, and category are required',
      });
    }

    // Validate quantity and unit price
    if (inventoryData.quantity < 0 || inventoryData.unitPrice < 0) {
      return res.status(400).json({
        error: 'Quantity and unit price must be non-negative',
      });
    }

    const inventory = await inventoryService.createInventory(inventoryData);

    // Log creation
    await activityLogger.logActivity(
      {
        userId: user.id,
        action: 'CREATE',
        entityType: 'Inventory',
        entityId: inventory.id,
        description: `Created inventory item: ${inventory.name}`,
        metadata: {
          showroomId: inventory.showroomId,
          category: inventory.category,
          quantity: inventory.quantity,
          unitPrice: inventory.unitPrice,
        },
      },
      req,
    );

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventory,
    });
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
}

// Update inventory item
async function handleUpdateInventory(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Inventory ID is required' });
    }

    // Check if inventory item exists and user has permission
    const existingInventory = await prisma.inventory.findUnique({
      where: { id: id as string },
      include: { showroom: true },
    });

    if (!existingInventory) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Permission check for showroom users
    if (['SHOWROOM_OWNER', 'SHOWROOM_MANAGER'].includes(user.role)) {
      const userShowroom = await prisma.users.findUnique({
        where: { id: user.id },
        select: { showroomId: true },
      });

      if (userShowroom?.showroomId !== existingInventory.showroomId) {
        return res.status(403).json({ error: 'Access denied to this inventory item' });
      }
    }

    // Validate updated values
    if (updateData.quantity !== undefined && updateData.quantity < 0) {
      return res.status(400).json({ error: 'Quantity must be non-negative' });
    }

    if (updateData.unitPrice !== undefined && updateData.unitPrice < 0) {
      return res.status(400).json({ error: 'Unit price must be non-negative' });
    }

    const updatedInventory = await inventoryService.updateInventory({
      id: id as string,
      ...updateData,
    });

    // Log update
    await activityLogger.logActivity(
      {
        userId: user.id,
        action: 'UPDATE',
        entityType: 'Inventory',
        entityId: id as string,
        description: `Updated inventory item: ${updatedInventory.name}`,
        metadata: {
          changes: updateData,
          oldValues: existingInventory,
        },
      },
      req,
    );

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedInventory,
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
}

// Delete inventory item
async function handleDeleteInventory(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Inventory ID is required' });
    }

    // Check if inventory item exists and user has permission
    const inventory = await prisma.inventory.findUnique({
      where: { id: id as string },
      include: { showroom: true },
    });

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

    const deleted = await inventoryService.deleteInventory(id as string);

    if (deleted) {
      // Log deletion
      await activityLogger.logActivity(
        {
          userId: user.id,
          action: 'DELETE',
          entityType: 'Inventory',
          entityId: id as string,
          description: `Deleted inventory item: ${inventory.name}`,
          metadata: {
            inventoryName: inventory.name,
            showroomId: inventory.showroomId,
            category: inventory.category,
          },
        },
        req,
      );

      res.status(200).json({
        success: true,
        message: 'Inventory item deleted successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete inventory item',
      });
    }
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
}
