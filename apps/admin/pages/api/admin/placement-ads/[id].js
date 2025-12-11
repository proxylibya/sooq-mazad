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
      const ad = await prisma.placement_ads.findUnique({
        where: { id },
        include: {
          placement: true,
          targeting: true,
          variants: {
            orderBy: { ctr: 'desc' },
          },
          analytics: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      });

      if (!ad) {
        return res.status(404).json({ error: 'Ad not found' });
      }

      return res.status(200).json({ ad });
    }

    if (req.method === 'PUT') {
      const updates = req.body;

      if (updates.priority !== undefined) {
        updates.priority = parseInt(updates.priority);
      }

      if (updates.startDate) {
        updates.startDate = new Date(updates.startDate);
      }

      if (updates.endDate) {
        updates.endDate = new Date(updates.endDate);
      }

      // Extract targeting data if provided
      const targetingData = updates.targeting;
      delete updates.targeting;

      // Update the ad
      const ad = await prisma.placement_ads.update({
        where: { id },
        data: updates,
        include: {
          placement: true,
          targeting: true,
        },
      });

      // Update or create targeting if provided
      if (targetingData) {
        await prisma.ad_targeting.upsert({
          where: { placementAdId: id },
          create: {
            placementAdId: id,
            targetCities: targetingData.targetCities || [],
            excludeCities: targetingData.excludeCities || [],
            targetDays: targetingData.targetDays || [],
            targetHours: targetingData.targetHours || null,
            targetUserTypes: targetingData.targetUserTypes || [],
            targetRoles: targetingData.targetRoles || [],
            minPreviousVisits: targetingData.minPreviousVisits || null,
            hasSearchedFor: targetingData.hasSearchedFor || [],
            deviceTypes: targetingData.deviceTypes || [],
            browserTypes: targetingData.browserTypes || [],
            osTypes: targetingData.osTypes || [],
            minAge: targetingData.minAge || null,
            maxAge: targetingData.maxAge || null,
            gender: targetingData.gender || null,
            interests: targetingData.interests || [],
            customRules: targetingData.customRules || null,
          },
          update: {
            targetCities: targetingData.targetCities || [],
            excludeCities: targetingData.excludeCities || [],
            targetDays: targetingData.targetDays || [],
            targetHours: targetingData.targetHours || null,
            targetUserTypes: targetingData.targetUserTypes || [],
            targetRoles: targetingData.targetRoles || [],
            minPreviousVisits: targetingData.minPreviousVisits || null,
            hasSearchedFor: targetingData.hasSearchedFor || [],
            deviceTypes: targetingData.deviceTypes || [],
            browserTypes: targetingData.browserTypes || [],
            osTypes: targetingData.osTypes || [],
            minAge: targetingData.minAge || null,
            maxAge: targetingData.maxAge || null,
            gender: targetingData.gender || null,
            interests: targetingData.interests || [],
            customRules: targetingData.customRules || null,
          },
        });
      }

      return res.status(200).json({ ad });
    }

    if (req.method === 'DELETE') {
      await prisma.placement_ads.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Placement ad API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
