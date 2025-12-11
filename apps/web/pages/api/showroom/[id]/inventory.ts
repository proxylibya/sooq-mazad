import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { activityLogger } from '../../../../lib/services/activityLogger';
import { inventoryService } from '../../../../lib/services/inventoryService';

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

    const { id: showroomId } = req.query;

    if (!showroomId || typeof showroomId !== 'string') {
      return res.status(400).json({ error: 'Valid showroom ID is required' });
    }

    // Check if user has access to this showroom
    // For regular users, verify showroom ownership
    // This would need to be implemented based on your user-showroom relationship

    switch (req.method) {
      case 'GET':
        return await handleGetInventory(req, res, user, showroomId);
      case 'POST':
        return await handleCreateInventoryItem(req, res, user, showroomId);
      case 'PUT':
        return await handleBulkUpdate(req, res, user, showroomId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Inventory API error:', error);

    await activityLogger.logSystemActivity(
      {
        action: 'API_REQUEST',
        component: 'InventoryAPI',
        severity: 'ERROR',
        message: 'Inventory API request failed',
        metadata: { error: error.message },
      },
      req,
    );

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handleGetInventory(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
  showroomId: string,
) {
  const {
    category,
    condition,
    lowStock,
    search,
    location,
    supplier,
    minQuantity,
    maxQuantity,
    minPrice,
    maxPrice,
    page = '1',
    limit = '20',
  } = req.query;

  const filters = {
    category: category as string,
    condition: condition as string,
    lowStock: lowStock === 'true',
    search: search as string,
    location: location as string,
    supplier: supplier as string,
    minQuantity: minQuantity ? parseInt(minQuantity as string) : undefined,
    maxQuantity: maxQuantity ? parseInt(maxQuantity as string) : undefined,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    limit: parseInt(limit as string),
    offset: (parseInt(page as string) - 1) * parseInt(limit as string),
  };

  const { items, total } = await inventoryService.getInventoryItems(showroomId, filters);

  // Log access
  await activityLogger.logActivity(
    {
      userId: user.id,
      action: 'read',
      entityType: 'Inventory',
      description: 'Retrieved inventory items',
      metadata: { showroomId, filters, resultCount: items.length },
    },
    req,
  );

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    },
  });
}

async function handleCreateInventoryItem(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
  showroomId: string,
) {
  const {
    name,
    category,
    brand,
    model,
    sku,
    description,
    unitPrice,
    quantity,
    minQuantity,
    maxQuantity,
    location,
    supplier,
    condition,
    tags,
    images,
  } = req.body;

  // Validate required fields
  if (!name || !category || !unitPrice || quantity === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Name, category, unit price, and quantity are required',
    });
  }

  const itemData = {
    name,
    category,
    brand,
    model,
    sku,
    description,
    unitPrice: parseFloat(unitPrice),
    quantity: parseInt(quantity),
    minQuantity: minQuantity ? parseInt(minQuantity) : null,
    maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
    location,
    supplier,
    condition: condition || 'GOOD',
    tags,
    images,
  };

  const item = await inventoryService.createInventoryItem(showroomId, itemData, user.id);

  res.status(201).json({
    success: true,
    data: {
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
      tags: item.tags ? item.tags.split(',') : [],
    },
  });
}

async function handleBulkUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
  showroomId: string,
) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Items array is required and must not be empty',
    });
  }

  // Validate each item has an ID
  for (const item of items) {
    if (!item.id) {
      return res.status(400).json({
        success: false,
        error: 'Each item must have an ID for bulk update',
      });
    }
  }

  const result = await inventoryService.bulkUpdateInventory(items, user.id);

  res.status(200).json({
    success: true,
    data: result,
  });
}
