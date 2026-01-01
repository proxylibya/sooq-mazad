/**
 * مساعد لاستخدام Materialized Views في التطبيق
 * يوفر دوال جاهزة للوصول إلى البيانات المحسّنة
 */

import { prisma } from './prisma';

// أنواع البيانات المُرجعة
interface TopAuction {
  auction_id: string;
  title: string;
  current_price: number;
  startTime: Date;
  endTime: Date;
  status: string;
  totalBids: number;
  featured: boolean;
  brand: string;
  model: string;
  year: number;
  images: string;
}

interface AuctionStats {
  brand: string;
  model: string;
  total_auctions: number;
  active_auctions: number;
  completed_auctions: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  total_bids: number;
  avg_bids_per_auction: number;
}

interface UserStats {
  id: string;
  name: string;
  phone: string;
  accountType: string;
  rating: number | null;
  total_cars: number;
  total_auctions: number;
  total_bids: number;
  total_bid_amount: number;
  last_bid_date: Date | null;
  last_car_added: Date | null;
}

interface ViewedCar {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  location: string;
  views: number;
  featured: boolean;
  condition: string;
  fuelType: string | null;
  transmission: string | null;
  images: string;
  favorites_count: number;
  rank_in_brand: number;
}

interface ShowroomStats {
  id: string;
  name: string;
  city: string;
  status: string;
  verified: boolean;
  featured: boolean;
  rating: number | null;
  total_cars: number;
  available_cars: number;
  sold_cars: number;
  avg_car_price: number | null;
  total_views: number;
  favorites_count: number;
}

interface EndingSoonAuction {
  id: string;
  title: string;
  current_price: number;
  startingPrice: number;
  endTime: Date;
  totalBids: number;
  featured: boolean;
  brand: string;
  model: string;
  year: number;
  location: string;
  images: string;
  hours_remaining: number;
}

interface BidStats {
  auction_id: string;
  title: string;
  total_bids: number;
  unique_bidders: number;
  min_bid: number;
  max_bid: number;
  avg_bid: number;
  median_bid: number;
  price_increase: number;
}

interface FavoritedCar {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  location: string;
  images: string;
  featured: boolean;
  favorites_count: number;
  views: number;
  favorite_rate: number | null;
}

interface MaterializedViewInfo {
  schemaname: string;
  matviewname: string;
  size: string;
  last_refresh: Date | null;
}

/**
 * الحصول على أعلى المزادات النشطة في مدينة معينة
 * يستخدم Materialized View للأداء الأفضل
 */
export async function getTopActiveAuctionsByCity(
  city: string,
  limit: number = 20,
): Promise<TopAuction[]> {
  try {
    const results = await prisma.$queryRaw<TopAuction[]>`
      SELECT 
        auction_id,
        title,
        current_price,
        "startTime",
        "endTime",
        status,
        "totalBids",
        featured,
        brand,
        model,
        year,
        images
      FROM mv_top_active_auctions_by_city
      WHERE city = ${city}
        AND rank_in_city <= ${limit}
      ORDER BY rank_in_city ASC
    `;

    return results;
  } catch (error) {
    console.error('خطأ في getTopActiveAuctionsByCity:', error);
    // Fallback إلى الاستعلام العادي إذا فشل Materialized View
    return await getFallbackActiveAuctions(city, limit);
  }
}

/**
 * الحصول على إحصائيات المزادات حسب البراند
 */
export async function getAuctionStatsByBrand(brand?: string): Promise<AuctionStats[]> {
  try {
    if (brand) {
      return await prisma.$queryRaw<AuctionStats[]>`
        SELECT * FROM mv_auction_stats_by_brand
        WHERE brand = ${brand}
      `;
    }

    return await prisma.$queryRaw<AuctionStats[]>`
      SELECT * FROM mv_auction_stats_by_brand
      ORDER BY total_auctions DESC
      LIMIT 20
    `;
  } catch (error) {
    console.error('خطأ في getAuctionStatsByBrand:', error);
    return [];
  }
}

/**
 * الحصول على إحصائيات المستخدمين النشطين
 */
export async function getActiveUsersStats(
  accountType?: string,
  limit: number = 50,
): Promise<UserStats[]> {
  try {
    if (accountType) {
      return await prisma.$queryRaw<UserStats[]>`
        SELECT * FROM mv_active_users_stats
        WHERE "accountType" = ${accountType}
        ORDER BY total_bids DESC
        LIMIT ${limit}
      `;
    }

    return await prisma.$queryRaw<UserStats[]>`
      SELECT * FROM mv_active_users_stats
      ORDER BY total_bids DESC
      LIMIT ${limit}
    `;
  } catch (error) {
    console.error('خطأ في getActiveUsersStats:', error);
    return [];
  }
}

/**
 * الحصول على السيارات الأكثر مشاهدة
 */
export async function getMostViewedCars(brand?: string, limit: number = 20): Promise<ViewedCar[]> {
  try {
    if (brand) {
      return await prisma.$queryRaw<ViewedCar[]>`
        SELECT * FROM mv_most_viewed_cars
        WHERE brand = ${brand}
        ORDER BY views DESC
        LIMIT ${limit}
      `;
    }

    return await prisma.$queryRaw<ViewedCar[]>`
      SELECT * FROM mv_most_viewed_cars
      ORDER BY views DESC
      LIMIT ${limit}
    `;
  } catch (error) {
    console.error('خطأ في getMostViewedCars:', error);
    return [];
  }
}

/**
 * الحصول على إحصائيات المعارض
 */
export async function getShowroomStatistics(city?: string): Promise<ShowroomStats[]> {
  try {
    if (city) {
      return await prisma.$queryRaw<ShowroomStats[]>`
        SELECT * FROM mv_showroom_statistics
        WHERE city = ${city} AND status = 'ACTIVE'
        ORDER BY total_cars DESC
      `;
    }

    return await prisma.$queryRaw<ShowroomStats[]>`
      SELECT * FROM mv_showroom_statistics
      WHERE status = 'ACTIVE'
      ORDER BY total_cars DESC
      LIMIT 50
    `;
  } catch (error) {
    console.error('خطأ في getShowroomStatistics:', error);
    return [];
  }
}

/**
 * الحصول على المزادات المنتهية قريباً
 */
export async function getEndingSoonAuctions(location?: string): Promise<EndingSoonAuction[]> {
  try {
    if (location) {
      return await prisma.$queryRaw<EndingSoonAuction[]>`
        SELECT * FROM mv_ending_soon_auctions
        WHERE location = ${location}
        ORDER BY "endTime" ASC
      `;
    }

    return await prisma.$queryRaw<EndingSoonAuction[]>`
      SELECT * FROM mv_ending_soon_auctions
      ORDER BY "endTime" ASC
      LIMIT 50
    `;
  } catch (error) {
    console.error('خطأ في getEndingSoonAuctions:', error);
    return [];
  }
}

/**
 * الحصول على إحصائيات العطاءات لمزاد معين
 */
export async function getAuctionBidStatistics(auctionId: string): Promise<BidStats | null> {
  try {
    const result = await prisma.$queryRaw<BidStats[]>`
      SELECT * FROM mv_auction_bid_statistics
      WHERE auction_id = ${auctionId}
    `;

    return result[0] || null;
  } catch (error) {
    console.error('خطأ في getAuctionBidStatistics:', error);
    return null;
  }
}

/**
 * الحصول على السيارات الأكثر إضافة للمفضلة
 */
export async function getMostFavoritedCars(
  brand?: string,
  limit: number = 20,
): Promise<FavoritedCar[]> {
  try {
    if (brand) {
      return await prisma.$queryRaw<FavoritedCar[]>`
        SELECT * FROM mv_most_favorited_cars
        WHERE brand = ${brand}
        ORDER BY favorites_count DESC
        LIMIT ${limit}
      `;
    }

    return await prisma.$queryRaw<FavoritedCar[]>`
      SELECT * FROM mv_most_favorited_cars
      ORDER BY favorites_count DESC
      LIMIT ${limit}
    `;
  } catch (error) {
    console.error('خطأ في getMostFavoritedCars:', error);
    return [];
  }
}

/**
 * تحديث جميع Materialized Views
 * يجب استدعاؤها بشكل دوري (كل 5-10 دقائق)
 */
export async function refreshAllMaterializedViews() {
  try {
    await prisma.$executeRaw`SELECT refresh_all_materialized_views();`;
    console.log('✓ تم تحديث جميع Materialized Views بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في تحديث Materialized Views:', error);
    return false;
  }
}

/**
 * تحديث Materialized View معين
 */
export async function refreshMaterializedView(viewName: string) {
  try {
    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName};`);
    console.log(`✓ تم تحديث ${viewName} بنجاح`);
    return true;
  } catch (error) {
    console.error(`خطأ في تحديث ${viewName}:`, error);
    return false;
  }
}

/**
 * Fallback للاستعلام العادي (في حالة عدم توفر Materialized View)
 */
async function getFallbackActiveAuctions(city: string, limit: number): Promise<TopAuction[]> {
  const auctions = await prisma.auctions.findMany({
    where: {
      status: 'ACTIVE',
      yardId: null, // ✅ مزادات أونلاين فقط - استبعاد مزادات الساحات
      car: {
        location: city,
        status: 'AVAILABLE',
      },
    },
    include: {
      car: {
        select: {
          brand: true,
          model: true,
          year: true,
          images: true,
          location: true,
        },
      },
    },
    orderBy: {
      currentPrice: 'desc',
    },
    take: limit,
  });

  // تحويل النتائج إلى صيغة TopAuction
  return auctions.map((auction) => ({
    auction_id: auction.id,
    title: auction.title,
    current_price: auction.currentPrice,
    startTime: auction.startTime,
    endTime: auction.endTime,
    status: auction.status,
    totalBids: auction.totalBids,
    featured: auction.featured,
    brand: auction.car.brand,
    model: auction.car.model,
    year: auction.car.year,
    images: auction.car.images,
  })) as TopAuction[];
}

/**
 * التحقق من وجود Materialized Views
 */
export async function checkMaterializedViewsExist() {
  try {
    const views = await prisma.$queryRaw<{ matviewname: string; }[]>`
      SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';
    `;

    const viewNames = views.map((v) => v.matviewname);
    const requiredViews = [
      'mv_top_active_auctions_by_city',
      'mv_auction_stats_by_brand',
      'mv_active_users_stats',
      'mv_most_viewed_cars',
      'mv_showroom_statistics',
      'mv_ending_soon_auctions',
      'mv_auction_bid_statistics',
      'mv_most_favorited_cars',
    ];

    const missingViews = requiredViews.filter((v) => !viewNames.includes(v));

    if (missingViews.length > 0) {
      console.warn('⚠ Materialized Views مفقودة:', missingViews);
      console.warn('قم بتشغيل: psql -f scripts/create-materialized-views.sql');
      return false;
    }

    console.log('✓ جميع Materialized Views موجودة');
    return true;
  } catch (error) {
    console.error('خطأ في التحقق من Materialized Views:', error);
    return false;
  }
}

/**
 * الحصول على معلومات حول Materialized Views
 */
export async function getMaterializedViewsInfo(): Promise<MaterializedViewInfo[]> {
  try {
    const info = await prisma.$queryRaw<MaterializedViewInfo[]>`
      SELECT 
        schemaname,
        matviewname,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
        last_refresh
      FROM pg_matviews
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||matviewname) DESC;
    `;

    return info;
  } catch (error) {
    console.error('خطأ في الحصول على معلومات Materialized Views:', error);
    return [];
  }
}

// تصدير جميع الدوال
export default {
  getTopActiveAuctionsByCity,
  getAuctionStatsByBrand,
  getActiveUsersStats,
  getMostViewedCars,
  getShowroomStatistics,
  getEndingSoonAuctions,
  getAuctionBidStatistics,
  getMostFavoritedCars,
  refreshAllMaterializedViews,
  refreshMaterializedView,
  checkMaterializedViewsExist,
  getMaterializedViewsInfo,
};
