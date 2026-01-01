import { NextApiRequest, NextApiResponse } from 'next';
import { inventoryService } from '../../../../lib/services/inventoryService';
import { activityLogger } from '../../../../lib/services/activityLogger';
import jwt from 'jsonwebtoken';

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

    const { itemId } = req.query;

    if (!itemId || typeof itemId !== 'string') {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    switch (req.method) {
      case 'POST':
        return await handleStockMovement(req, res, user, itemId);
      case 'PUT':
        return await handleStockAdjustment(req, res, user, itemId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Stock movement API error:', error);

    await activityLogger.logSystemActivity(
      {
        action: 'API_REQUEST',
        component: 'StockMovementAPI',
        severity: 'ERROR',
        message: 'Stock movement API request failed',
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

async function handleStockMovement(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
  itemId: string,
) {
  const { type, quantity, reason, reference, notes, unitPrice } = req.body;

  // Validate required fields
  if (!type || quantity === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Movement type and quantity are required',
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Quantity must be positive',
    });
  }

  // Validate movement type
  const validTypes = [
    'IN_PURCHASE',
    'IN_RETURN',
    'IN_TRANSFER',
    'IN_ADJUSTMENT',
    'OUT_SALE',
    'OUT_RETURN',
    'OUT_TRANSFER',
    'OUT_DAMAGE',
    'OUT_ADJUSTMENT',
  ];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid movement type',
    });
  }

  const movementData = {
    inventoryId: itemId,
    type,
    quantity: parseInt(quantity),
    reason,
    reference,
    notes,
    performedBy: user.id,
    unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
  };

  const movement = await inventoryService.recordMovement(movementData);

  res.status(201).json({
    success: true,
    data: movement,
  });
}

async function handleStockAdjustment(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
  itemId: string,
) {
  const { newQuantity, reason } = req.body;

  // Validate required fields
  if (newQuantity === undefined || !reason) {
    return res.status(400).json({
      success: false,
      error: 'New quantity and reason are required',
    });
  }

  if (newQuantity < 0) {
    return res.status(400).json({
      success: false,
      error: 'New quantity must be non-negative',
    });
  }

  const movement = await inventoryService.adjustStock(
    itemId,
    parseInt(newQuantity),
    reason,
    user.id,
  );

  res.status(200).json({
    success: true,
    data: movement,
  });
}
