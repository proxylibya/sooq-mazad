import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

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
      const { placementAdId } = req.query;

      if (!placementAdId) {
        return res.status(400).json({ error: 'placementAdId required' });
      }

      const variants = await prisma.ad_variants.findMany({
        where: { placementAdId },
        orderBy: { ctr: 'desc' },
      });

      return res.status(200).json({ variants });
    }

    if (req.method === 'POST') {
      const {
        placementAdId,
        variantName,
        title,
        description,
        imageUrl,
        videoUrl,
        linkUrl,
        mediaType,
        weight,
      } = req.body;

      if (!placementAdId || !variantName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const variant = await prisma.ad_variants.create({
        data: {
          id: nanoid(),
          placementAdId,
          variantName,
          title,
          description,
          imageUrl,
          videoUrl,
          linkUrl,
          mediaType: mediaType || 'IMAGE',
          weight: parseInt(weight) || 50,
        },
      });

      return res.status(201).json({ variant });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Ad variants API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
