import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import viewsService, {
  generateSessionId,
  getLocationFromIP,
  parseUserAgent
} from '../../../lib/services/unified/viewsService';

interface PageViewData {
  page: string;
  title?: string;
  referrer?: string;
  sessionDuration?: number; // in seconds
  scrollDepth?: number; // percentage
  properties?: any;
}

// استخدام دوال الخدمة الموحدة بدلاً من التكرار
function getSessionId(req: NextApiRequest): string {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.connection.remoteAddress ||
    '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';
  return generateSessionId(ip, userAgent);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check if analytics is enabled
    if (process.env.ANALYTICS_ENABLED === 'false') {
      return res.status(200).json({
        success: true,
        message: 'Analytics is disabled',
      });
    }

    const pageViewData: PageViewData = req.body;

    // Validate required fields
    if (!pageViewData.page) {
      return res.status(400).json({
        success: false,
        error: 'page is required',
      });
    }

    // Get user info from token (optional)
    let userId: string | null = null;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any;
        userId = decoded.id || decoded.userId;
      } catch (error) {
        // Continue without user ID if token is invalid
      }
    }

    // Generate session ID
    const sessionId = getSessionId(req);

    // Parse user agent
    const userAgent = req.headers['user-agent'] || '';
    const { browser, os, device } = parseUserAgent(userAgent);

    // Get location
    const clientIP =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.connection.remoteAddress ||
      '127.0.0.1';
    const { country, city } = getLocationFromIP(clientIP);

    // Create page view event
    const eventId = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const pageViewEvent = await prisma.analytics_events.create({
      data: {
        id: eventId,
        sessionId,
        eventType: 'PAGE_VIEW' as any,
        eventName: 'page_view',
        category: 'Navigation',
        label: pageViewData.title,
        value: pageViewData.sessionDuration,
        properties: pageViewData.properties ? JSON.stringify(pageViewData.properties) : null,
        page: pageViewData.page,
        referrer: pageViewData.referrer,
        browser,
        os,
        device,
        country,
        city,
        ...(userId ? { users: { connect: { id: userId } } } : {}),
      },
    });

    // Update daily stats
    await updateDailyStats(userId, sessionId);

    // Track content-specific views using unified service
    await trackContentViews(pageViewData, sessionId, userId);

    return res.status(200).json({
      success: true,
      eventId: pageViewEvent.id,
      sessionId,
      message: 'Page view tracked successfully',
    });
  } catch (error) {
    console.error('Page view tracking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to track page view',
    });
  }
}

// Update daily statistics
async function updateDailyStats(userId: string | null, sessionId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if daily stats record exists for today
    const existingStats = await prisma.daily_stats.findUnique({
      where: { date: today },
    });

    if (existingStats) {
      // Update existing record
      await prisma.daily_stats.update({
        where: { date: today },
        data: {
          pageViews: { increment: 1 },
          // Only count unique visitors once per session per day
          uniqueVisitors: {
            increment: (await isUniqueVisitor(sessionId, today)) ? 1 : 0,
          },
        },
      });
    } else {
      // Create new daily stats record
      const statsId = `stats_${today.toISOString().split('T')[0].replace(/-/g, '')}`;
      await prisma.daily_stats.create({
        data: {
          id: statsId,
          date: today,
          pageViews: 1,
          uniqueVisitors: 1,
          totalUsers: await prisma.users.count(),
          activeUsers: await getActiveUsersCount(today),
          newUsers: await getNewUsersCount(today),
          updatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
}

// Check if this is a unique visitor for today
async function isUniqueVisitor(sessionId: string, date: Date): Promise<boolean> {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const existingView = await prisma.analytics_events.findFirst({
    where: {
      sessionId,
      eventType: 'PAGE_VIEW',
      createdAt: {
        gte: date,
        lt: nextDay,
      },
    },
  });

  return !existingView;
}

// Get active users count for today
async function getActiveUsersCount(date: Date): Promise<number> {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // استخدام groupBy للحصول على عدد المستخدمين المميزين
  const uniqueUsers = await prisma.analytics_events.groupBy({
    by: ['userId'],
    where: {
      eventType: 'PAGE_VIEW' as any,
      userId: { not: null },
      createdAt: {
        gte: date,
        lt: nextDay,
      },
    },
  });

  return uniqueUsers.length;
}

// Get new users count for today
async function getNewUsersCount(date: Date): Promise<number> {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const count = await prisma.users.count({
    where: {
      createdAt: {
        gte: date,
        lt: nextDay,
      },
    },
  });

  return count;
}

// Track content-specific views using unified service
async function trackContentViews(pageViewData: PageViewData, sessionId?: string, userId?: string | null) {
  try {
    const properties = pageViewData.properties || {};
    const page = pageViewData.page;

    // Car page views
    if (page.includes('/cars/') || properties.carId) {
      const carId = properties.carId || extractIdFromPath(page, '/cars/');
      if (carId) {
        await viewsService.recordCarView(carId, {
          sessionId,
          userId,
          page,
          referrer: pageViewData.referrer,
        });
      }
    }

    // Auction page views
    if (page.includes('/auctions/') || page.includes('/auction/') || properties.auctionId) {
      const auctionId = properties.auctionId || extractIdFromPath(page, '/auctions/') || extractIdFromPath(page, '/auction/');
      if (auctionId) {
        await viewsService.recordAuctionView(auctionId, {
          sessionId,
          userId,
          page,
          referrer: pageViewData.referrer,
        });
      }
    }

    // Showroom page views
    if (page.includes('/showrooms/') || properties.showroomId) {
      const showroomId = properties.showroomId || extractIdFromPath(page, '/showrooms/');
      if (showroomId) {
        await viewsService.recordShowroomView(showroomId, {
          sessionId,
          userId,
          page,
          referrer: pageViewData.referrer,
        });
      }
    }
  } catch (error) {
    console.error('Error tracking content views:', error);
  }
}

// Extract ID from URL path
function extractIdFromPath(path: string, prefix: string): string | null {
  const index = path.indexOf(prefix);
  if (index === -1) return null;

  const afterPrefix = path.substring(index + prefix.length);
  const parts = afterPrefix.split('/');
  const id = parts[0];

  // Basic ID validation (assuming cuid format)
  if (id && id.length > 10) {
    return id;
  }

  return null;
}
