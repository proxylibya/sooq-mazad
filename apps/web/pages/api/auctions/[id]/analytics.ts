import type { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers, prisma } from '../../../../lib/prisma';

interface AnalyticsData {
  auctionId: string;
  title: string;
  performanceMetrics: {
    viewsGrowth: number;
    bidsGrowth: number;
    priceGrowth: number;
    engagementRate: number;
  };
  timeSeriesData: {
    views: { time: string; value: number; }[];
    bids: { time: string; value: number; }[];
    price: { time: string; value: number; }[];
  };
  competitorAnalysis: {
    averageViews: number;
    averageBids: number;
    averagePrice: number;
    marketPosition: 'above' | 'average' | 'below';
  };
  predictions: {
    expectedFinalPrice: number;
    expectedTotalBids: number;
    confidence: number;
  };
}

type AuctionForAnalytics = {
  startingPrice?: number;
  currentPrice?: number;
  views?: number;
  bids?: Array<{ bidderId?: string; userId?: string; amount: number; createdAt: Date | string; }>;
  category?: string | null;
  id?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'طريقة غير مدعومة',
    });
  }

  const { id, timeRange = '7d' } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'معرف المزاد مطلوب',
    });
  }

  try {
    // جلب بيانات المزاد الأساسية
    const auction = await dbHelpers.getAuctionById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: 'المزاد غير موجود',
      });
    }

    // جلب مؤشرات الأداء
    const performanceMetrics = await getPerformanceMetrics(id, timeRange as string);

    // جلب البيانات الزمنية
    const timeSeriesData = await getTimeSeriesData(id, timeRange as string);

    // جلب تحليل المنافسين
    const competitorAnalysis = await getCompetitorAnalysis(auction);

    // جلب التوقعات
    const predictions = await getPredictions(id, auction);

    const analyticsData: AnalyticsData = {
      auctionId: id,
      title: auction.title || 'مزاد بدون عنوان',
      performanceMetrics,
      timeSeriesData,
      competitorAnalysis,
      predictions,
    };

    return res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('خطأ في جلب تحليلات المزاد:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في جلب تحليلات المزاد',
    });
  }
}

async function getPerformanceMetrics(auctionId: string, _timeRange: string) {
  try {
    const auction = await dbHelpers.getAuctionById(auctionId);
    const a = (auction || {}) as AuctionForAnalytics;
    const bids = a.bids || [];

    // حساب نمو السعر (حقيقي بناءً على الحقول الصحيحة)
    const startingPrice = a.startingPrice || 0;
    const currentPrice = a.currentPrice || startingPrice;
    const priceGrowth = startingPrice > 0 ? ((currentPrice - startingPrice) / startingPrice) * 100 : 0;

    // بدون بيانات تاريخية للمقارنة نُرجع 0 كنمو للمشاهدات والمزايدات
    const bidsGrowth = 0;
    const viewsGrowth = 0;

    // معدل التفاعل = عدد المزايدين المميزين / إجمالي المشاهدات
    const totalViews = a.views || 0;
    const totalBidders = [...new Set(bids.map((b: any) => b.bidderId || b.userId))].length;
    const engagementRate = totalViews > 0 ? (totalBidders / totalViews) * 100 : 0;

    return {
      viewsGrowth: Math.round(viewsGrowth * 10) / 10,
      bidsGrowth: Math.round(bidsGrowth * 10) / 10,
      priceGrowth: Math.round(priceGrowth * 10) / 10,
      engagementRate: Math.round(engagementRate * 10) / 10,
    };
  } catch (error) {
    console.error('خطأ في حساب مؤشرات الأداء:', error);
    // إرجاع قيم صفرية آمنة بدون بيانات وهمية
    return {
      viewsGrowth: 0,
      bidsGrowth: 0,
      priceGrowth: 0,
      engagementRate: 0,
    };
  }
}

async function getTimeSeriesData(auctionId: string, timeRange: string) {
  try {
    // جلب المزايدات من قاعدة البيانات (حقيقي)
    const auction = await dbHelpers.getAuctionById(auctionId);
    const bids = auction?.bids || [];

    // جلب مشاهدات الصفحة من جدول analyticsEvent (إن وجدت)
    const { startTime } = parseTimeRange(timeRange);
    const pageContains1 = `/auction/${auctionId}`;
    const pageContains2 = `/auctions/${auctionId}`;
    const viewEvents = await prisma.analytics_events.findMany({
      where: {
        eventType: 'PAGE_VIEW',
        createdAt: { gte: startTime },
        OR: [{ page: { contains: pageContains1 } }, { page: { contains: pageContains2 } }],
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 2000,
    }).catch(() => []);

    // تجميع البيانات حسب الوقت
    const timeData = generateTimeSeriesFromBids(bids as any[], timeRange, viewEvents as any[]);
    return timeData;
  } catch (error) {
    console.error('خطأ في جلب البيانات الزمنية:', error);
    // إرجاع سلاسل زمنية فارغة بدلاً من بيانات افتراضية
    return {
      views: [],
      bids: [],
      price: [],
    };
  }
}

async function getCompetitorAnalysis(auction: any) {
  try {
    // جلب مزادات مشابهة للمقارنة (نفس الحالة/الفئة قدر الإمكان) باستعلام مباشر من Prisma
    // ✅ نقارن مزادات أونلاين بأونلاين ومزادات ساحات بساحات
    const similarAuctions = await prisma.auctions.findMany({
      where: {
        id: { not: auction.id },
        // ✅ فصل المقارنة: أونلاين مع أونلاين، ساحات مع ساحات
        yardId: auction.yardId ? { not: null } : null,
        // إن وُجدت فئة
        ...(auction.category ? { category: auction.category } : {}),
      },
      select: {
        views: true,
        totalBids: true,
        currentPrice: true,
        startPrice: true,
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    if (similarAuctions.length === 0) {
      // بدون بيانات مشابهة نعيد أصفاراً آمنة
      return {
        averageViews: 0,
        averageBids: 0,
        averagePrice: 0,
        marketPosition: 'average' as const,
      };
    }

    // حساب المتوسطات
    const averageViews =
      similarAuctions.reduce((sum, a: any) => sum + (a.views || 0), 0) / similarAuctions.length;
    const averageBids =
      similarAuctions.reduce((sum, a: any) => sum + (a.totalBids || 0), 0) / similarAuctions.length;
    const averagePrice =
      similarAuctions.reduce((sum, a: any) => sum + (a.currentPrice || a.startPrice || 0), 0) /
      similarAuctions.length;

    // تحديد موقع المزاد في السوق
    const currentViews = auction.views || 0;
    const currentBids = auction.totalBids || 0;
    const currentPrice = auction.currentPrice || auction.startPrice || 0;

    let marketPosition: 'above' | 'average' | 'below' = 'average';

    const viewsRatio = currentViews / averageViews;
    const bidsRatio = currentBids / averageBids;
    const priceRatio = currentPrice / averagePrice;

    const overallRatio = (viewsRatio + bidsRatio + priceRatio) / 3;

    if (overallRatio > 1.2) {
      marketPosition = 'above';
    } else if (overallRatio < 0.8) {
      marketPosition = 'below';
    }

    return {
      averageViews: Math.round(averageViews),
      averageBids: Math.round(averageBids),
      averagePrice: Math.round(averagePrice),
      marketPosition,
    };
  } catch (error) {
    console.error('خطأ في تحليل المنافسين:', error);
    return {
      averageViews: 0,
      averageBids: 0,
      averagePrice: 0,
      marketPosition: 'average' as const,
    };
  }
}

async function getPredictions(auctionId: string, auction: any) {
  try {
    const bids = auction?.bids || [];

    // حساب التوقعات بناءً على الاتجاه الحالي
    const currentBid = auction.currentBid || auction.startingBid || 0;
    const bidCount = bids.length;

    // توقع السعر النهائي
    const growthRate = bidCount > 0 ? 1.2 + bidCount * 0.05 : 1.1;
    const expectedFinalPrice = Math.round(currentBid * growthRate);

    // توقع إجمالي المزايدات
    const timeRemaining = auction.endDate
      ? Math.max(0, new Date(auction.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
      : 7;
    const expectedTotalBids = Math.round(bidCount + timeRemaining * 5);

    // مستوى الثقة
    const confidence = Math.min(95, Math.max(60, 75 + bidCount * 2));

    return {
      expectedFinalPrice,
      expectedTotalBids,
      confidence: Math.round(confidence * 10) / 10,
    };
  } catch (error) {
    console.error('خطأ في حساب التوقعات:', error);
    return {
      expectedFinalPrice: 0,
      expectedTotalBids: 0,
      confidence: 0,
    };
  }
}

function parseTimeRange(timeRange: string): { startTime: Date; } {
  const now = new Date();
  const start = new Date(now);
  if (timeRange === '24h') {
    start.setHours(start.getHours() - 24);
  } else if (timeRange === '30d') {
    start.setDate(start.getDate() - 30);
  } else {
    // 7 أيام افتراضياً
    start.setDate(start.getDate() - 7);
  }
  return { startTime: start };
}

function generateTimeSeriesFromBids(
  bids: Array<{ createdAt: string | Date; amount: number; }>,
  _timeRange: string,
  viewEvents: Array<{ createdAt: Date; }> = [],
) {
  // تجميع المزايدات حسب الوقت
  const bidsByTime: { [key: string]: number; } = {};
  const priceByTime: { [key: string]: number; } = {};

  bids.forEach((bid) => {
    const dt = typeof bid.createdAt === 'string' ? new Date(bid.createdAt) : bid.createdAt;
    const time = dt.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });
    bidsByTime[time] = (bidsByTime[time] || 0) + 1;
    priceByTime[time] = Math.max(priceByTime[time] || 0, bid.amount);
  });

  // تجميع المشاهدات حسب الوقت (إن وُجدت)
  const viewsByTime: { [key: string]: number; } = {};
  viewEvents.forEach((v) => {
    const t = new Date(v.createdAt).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });
    viewsByTime[t] = (viewsByTime[t] || 0) + 1;
  });

  const times = Array.from(new Set([...Object.keys(bidsByTime), ...Object.keys(viewsByTime)])).sort();

  return {
    views: times.map((time) => ({ time, value: viewsByTime[time] || 0 })),
    bids: times.map((time) => ({ time, value: bidsByTime[time] || 0 })),
    price: times.map((time) => ({ time, value: priceByTime[time] || 0 })),
  };
}
