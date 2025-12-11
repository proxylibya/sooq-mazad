import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'sooq-mazad-admin-secret-key-min-32-chars!';
const COOKIE_NAME = 'admin_session';

async function verifyAuth(req) {
  const token = req.cookies[COOKIE_NAME] || req.cookies.admin_token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'admin') return null;
    return { adminId: decoded.adminId, role: decoded.role };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const auth = await verifyAuth(req);

  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const { placementId } = req.query;

      const ads = await prisma.placement_ads.findMany({
        where: { placementId },
        orderBy: { priority: 'desc' },
      });

      return res.status(200).json({ ads });
    }

    if (req.method === 'POST') {
      const { placementId, entityType, entityId, priority, isActive, startDate, endDate } =
        req.body;

      const placement = await prisma.ad_placements.findUnique({
        where: { id: placementId },
        include: { _count: { select: { ads: true } } },
      });

      if (!placement) {
        return res.status(404).json({ error: 'Placement not found' });
      }

      if (placement._count.ads >= placement.maxAds) {
        return res.status(400).json({ error: `الحد الأقصى للإعلانات هو ${placement.maxAds}` });
      }

      const ad = await prisma.placement_ads.create({
        data: {
          placementId,
          entityType,
          entityId,
          priority: parseInt(priority),
          isActive,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
      });

      return res.status(201).json({ ad });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = req.body;

      if (updates.priority) updates.priority = parseInt(updates.priority);
      if (updates.startDate) updates.startDate = new Date(updates.startDate);
      if (updates.endDate) updates.endDate = new Date(updates.endDate);

      const ad = await prisma.placement_ads.update({
        where: { id },
        data: updates,
      });

      return res.status(200).json({ ad });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      await prisma.placement_ads.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Placement ads API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
