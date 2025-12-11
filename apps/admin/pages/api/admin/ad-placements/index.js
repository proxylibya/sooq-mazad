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
      const { search } = req.query;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const placements = await prisma.ad_placements.findMany({
        where,
        include: {
          _count: {
            select: { ads: true },
          },
        },
        orderBy: [{ location: 'asc' }, { displayOrder: 'asc' }],
      });

      return res.status(200).json({ placements });
    }

    if (req.method === 'POST') {
      const {
        name,
        description,
        location,
        type,
        maxAds,
        displayOrder,
        autoRotate,
        rotateInterval,
        width,
        height,
        isActive,
      } = req.body;

      const placement = await prisma.ad_placements.create({
        data: {
          name,
          description,
          location,
          type,
          maxAds: parseInt(maxAds),
          displayOrder: parseInt(displayOrder),
          autoRotate,
          rotateInterval: autoRotate ? parseInt(rotateInterval) : null,
          width: width || null,
          height: height || null,
          isActive,
          createdBy: auth.adminId,
        },
      });

      return res.status(201).json({ placement });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = req.body;

      if (updates.maxAds) updates.maxAds = parseInt(updates.maxAds);
      if (updates.displayOrder) updates.displayOrder = parseInt(updates.displayOrder);
      if (updates.rotateInterval) updates.rotateInterval = parseInt(updates.rotateInterval);

      updates.updatedBy = auth.adminId;

      const placement = await prisma.ad_placements.update({
        where: { id },
        data: updates,
      });

      return res.status(200).json({ placement });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      await prisma.ad_placements.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Ad placements API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
