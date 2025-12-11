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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    const variant = await prisma.ad_variants.findUnique({
      where: { id },
    });

    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    await prisma.ad_variants.updateMany({
      where: { placementAdId: variant.placementAdId },
      data: { isWinner: false },
    });

    await prisma.ad_variants.update({
      where: { id },
      data: { isWinner: true },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Set winner error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
