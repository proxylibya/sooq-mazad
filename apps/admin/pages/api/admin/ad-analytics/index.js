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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { placementAdId, days = 7 } = req.query;

  if (!placementAdId) {
    return res.status(400).json({ error: 'placementAdId required' });
  }

  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const dailyAnalytics = await prisma.ad_analytics.findMany({
      where: {
        placementAdId,
        date: {
          gte: daysAgo,
        },
      },
      orderBy: { date: 'asc' },
    });

    const totalImpressions = dailyAnalytics.reduce((sum, day) => sum + day.impressions, 0);
    const totalClicks = dailyAnalytics.reduce((sum, day) => sum + day.clicks, 0);
    const totalUniqueViews = dailyAnalytics.reduce((sum, day) => sum + day.uniqueViews, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    const deviceStats = {
      desktop: dailyAnalytics.reduce((sum, day) => sum + day.desktopViews, 0),
      mobile: dailyAnalytics.reduce((sum, day) => sum + day.mobileViews, 0),
      tablet: dailyAnalytics.reduce((sum, day) => sum + day.tabletViews, 0),
    };

    const browserStats = {};
    const locationStats = {};

    dailyAnalytics.forEach((day) => {
      if (day.browserStats) {
        Object.entries(day.browserStats).forEach(([browser, count]) => {
          browserStats[browser] = (browserStats[browser] || 0) + count;
        });
      }
      if (day.locationStats) {
        Object.entries(day.locationStats).forEach(([city, count]) => {
          locationStats[city] = (locationStats[city] || 0) + count;
        });
      }
    });

    const topBrowsers = Object.entries(browserStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topLocations = Object.entries(locationStats)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const response = {
      totalImpressions,
      totalClicks,
      totalUniqueViews,
      avgCTR,
      deviceStats,
      topBrowsers,
      topLocations,
      daily: dailyAnalytics,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
