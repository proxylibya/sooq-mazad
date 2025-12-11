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
      const { placementId, adId } = req.query;

      if (adId) {
        const ad = await prisma.placement_ads.findUnique({
          where: { id: adId },
          include: {
            placement: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        });

        if (!ad) {
          return res.status(404).json({ error: 'Ad not found' });
        }

        const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;

        return res.status(200).json({
          ad: {
            id: ad.id,
            entityType: ad.entityType,
            entityId: ad.entityId,
            placement: ad.placement,
            clicks: ad.clicks,
            impressions: ad.impressions,
            ctr: ctr.toFixed(2),
            isActive: ad.isActive,
            createdAt: ad.createdAt,
          },
        });
      }

      if (placementId) {
        const ads = await prisma.placement_ads.findMany({
          where: { placementId },
          include: {
            placement: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        });

        const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
        const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
        const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        const adsWithStats = ads.map((ad) => ({
          id: ad.id,
          entityType: ad.entityType,
          entityId: ad.entityId,
          clicks: ad.clicks,
          impressions: ad.impressions,
          ctr: ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00',
          isActive: ad.isActive,
        }));

        return res.status(200).json({
          placement: ads[0]?.placement || null,
          stats: {
            totalAds: ads.length,
            activeAds: ads.filter((ad) => ad.isActive).length,
            totalClicks,
            totalImpressions,
            avgCTR: avgCTR.toFixed(2),
          },
          ads: adsWithStats,
        });
      }

      const allAds = await prisma.placement_ads.findMany({
        include: {
          placement: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
      });

      const placements = await prisma.ad_placements.findMany({
        include: {
          _count: {
            select: { ads: true },
          },
        },
      });

      const totalClicks = allAds.reduce((sum, ad) => sum + ad.clicks, 0);
      const totalImpressions = allAds.reduce((sum, ad) => sum + ad.impressions, 0);
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      const placementStats = placements.map((placement) => {
        const placementAds = allAds.filter((ad) => ad.placementId === placement.id);
        const clicks = placementAds.reduce((sum, ad) => sum + ad.clicks, 0);
        const impressions = placementAds.reduce((sum, ad) => sum + ad.impressions, 0);
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

        return {
          id: placement.id,
          name: placement.name,
          location: placement.location,
          adsCount: placement._count.ads,
          clicks,
          impressions,
          ctr: ctr.toFixed(2),
        };
      });

      const topAds = allAds
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10)
        .map((ad) => ({
          id: ad.id,
          entityType: ad.entityType,
          entityId: ad.entityId,
          placement: ad.placement,
          clicks: ad.clicks,
          impressions: ad.impressions,
          ctr: ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00',
        }));

      return res.status(200).json({
        overview: {
          totalPlacements: placements.length,
          totalAds: allAds.length,
          activeAds: allAds.filter((ad) => ad.isActive).length,
          totalClicks,
          totalImpressions,
          avgCTR: avgCTR.toFixed(2),
        },
        placements: placementStats,
        topAds,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
