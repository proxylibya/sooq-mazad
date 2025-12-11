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

  const { type, query } = req.query;

  if (!query || query.length < 2) {
    return res.status(200).json({ results: [] });
  }

  try {
    let results = [];

    switch (type) {
      case 'auction':
        results = await prisma.auctions.findMany({
          where: {
            AND: [
              { status: 'ACTIVE' },
              {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { id: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          select: { id: true, title: true },
          take: 10,
        });
        break;

      case 'car':
        results = await prisma.cars.findMany({
          where: {
            AND: [
              { status: 'AVAILABLE' },
              {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { id: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          select: { id: true, title: true },
          take: 10,
        });
        break;

      case 'transport':
        results = await prisma.transport_services.findMany({
          where: {
            AND: [
              { status: 'ACTIVE' },
              {
                OR: [
                  { companyName: { contains: query, mode: 'insensitive' } },
                  { id: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          select: { id: true, companyName: true },
          take: 10,
        });
        results = results.map((r) => ({ id: r.id, title: r.companyName }));
        break;

      case 'yard':
        results = await prisma.yards.findMany({
          where: {
            AND: [
              { status: 'ACTIVE' },
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { id: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          select: { id: true, name: true },
          take: 10,
        });
        results = results.map((r) => ({ id: r.id, title: r.name }));
        break;

      default:
        return res.status(400).json({ error: 'Invalid entity type' });
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Search entities error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
