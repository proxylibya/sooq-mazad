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
      const { category, search } = req.query;

      const where = {
        isActive: true,
      };

      if (category && category !== 'all') {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const templates = await prisma.banner_templates.findMany({
        where,
        orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      });

      return res.status(200).json({ templates });
    }

    if (req.method === 'POST') {
      const {
        name,
        description,
        category,
        width,
        height,
        aspectRatio,
        previewUrl,
        thumbnailUrl,
        tags,
      } = req.body;

      if (!name || !category || !width || !height || !aspectRatio) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const template = await prisma.banner_templates.create({
        data: {
          id: nanoid(),
          name,
          description,
          category,
          width: parseInt(width),
          height: parseInt(height),
          aspectRatio,
          previewUrl,
          thumbnailUrl,
          tags: tags || [],
          createdBy: auth.adminId,
        },
      });

      return res.status(201).json({ template });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Banner templates API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
