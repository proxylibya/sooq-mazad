// Inventory Service
import prisma from '../prisma';
import logger from '../logger';

export const getAllInventoryItems = async (filters?: { status?: string; userId?: string }) => {
  try {
    const items = await prisma.inventory.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });
    return items;
  } catch (error) {
    logger.error('Error getting inventory items', { error });
    throw error;
  }
};

export const getInventoryItem = async (id: string) => {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id },
    });
    return item;
  } catch (error) {
    logger.error('Error getting inventory item', { error, id });
    throw error;
  }
};

export const createInventoryItem = async (data: {
  name: string;
  description?: string;
  quantity: number;
  userId: string;
}) => {
  try {
    const item = await prisma.inventory.create({
      data,
    });
    logger.info('Inventory item created', { id: item.id });
    return item;
  } catch (error) {
    logger.error('Error creating inventory item', { error });
    throw error;
  }
};

export const updateInventoryItem = async (
  id: string,
  data: { name?: string; description?: string; quantity?: number },
) => {
  try {
    const item = await prisma.inventory.update({
      where: { id },
      data,
    });
    logger.info('Inventory item updated', { id });
    return item;
  } catch (error) {
    logger.error('Error updating inventory item', { error, id });
    throw error;
  }
};

export const deleteInventoryItem = async (id: string) => {
  try {
    await prisma.inventory.delete({
      where: { id },
    });
    logger.info('Inventory item deleted', { id });
  } catch (error) {
    logger.error('Error deleting inventory item', { error, id });
    throw error;
  }
};

const inventoryService = {
  getAllInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};

export { inventoryService };
export default inventoryService;
