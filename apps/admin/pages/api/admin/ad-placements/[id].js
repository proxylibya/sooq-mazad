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

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const placement = await prisma.ad_placements.findUnique({
        where: { id },
        include: {
          ads: {
            orderBy: { priority: 'desc' },
          },
        },
      });

      if (!placement) {
        return res.status(404).json({ error: 'Placement not found' });
      }

      return res.status(200).json({ placement });
    }

    if (req.method === 'PUT') {
      const updates = req.body;

      if (updates.maxAds) updates.maxAds = parseInt(updates.maxAds);
      if (updates.displayOrder !== undefined) updates.displayOrder = parseInt(updates.displayOrder);
      if (updates.rotateInterval) updates.rotateInterval = parseInt(updates.rotateInterval);

      updates.updatedBy = auth.adminId;

      const placement = await prisma.ad_placements.update({
        where: { id },
        data: updates,
      });

      return res.status(200).json({ placement });
    }

    if (req.method === 'DELETE') {
      await prisma.ad_placements.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Ad placement API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
