/**
 * استعلامات Prisma المحسّنة
 * دوال جاهزة للاستخدام مع pagination وselect محسّن
 */

import { prisma } from '../prisma';
import {
  defaultOrdering,
  paginationSettings,
  selectAuctionDetails,
  selectAuctionPreview,
  selectCarDetails,
  selectCarListing,
  selectNotificationBasic,
  selectReviewBasic,
  selectShowroomBasic,
  selectTransactionBasic,
  selectTransportBasic,
  selectUserBasic,
} from './optimized-selectors';

/**
 * Cars Queries
 */
export const carsQueries = {
  /**
   * جلب قائمة السيارات مع Cursor Pagination
   */
  getCarsList: async (cursor?: string, limit = paginationSettings.cars.take) => {
    const queryOptions: any = {
      select: selectCarListing,
      where: { status: 'AVAILABLE' },
      orderBy: { id: 'desc' },
      take: limit + 1, // جلب عنصر إضافي للتحقق من وجود صفحة تالية
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const [cars, total] = await Promise.all([
      prisma.cars.findMany(queryOptions),
      prisma.cars.count({ where: { status: 'AVAILABLE' } }),
    ]);

    const hasNextPage = cars.length > limit;
    if (hasNextPage) {
      cars.pop();
    }

    return {
      data: cars,
      pagination: {
        limit,
        total,
        hasNextPage,
        nextCursor: hasNextPage && cars.length > 0 ? cars[cars.length - 1].id : null,
      },
    };
  },

  /**
   * جلب تفاصيل سيارة واحدة
   */
  getCarDetails: async (carId: string) => {
    return prisma.cars.findUnique({
      where: { id: carId },
      select: selectCarDetails,
    });
  },

  /**
   * جلب السيارات المميزة
   */
  getFeaturedCars: async (limit = 10) => {
    return prisma.cars.findMany({
      select: selectCarListing,
      where: {
        status: 'AVAILABLE',
        featured: true,
      },
      orderBy: defaultOrdering.newest,
      take: limit,
    });
  },

  /**
   * البحث في السيارات مع Cursor Pagination
   */
  searchCars: async (params: {
    query?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    cursor?: string;
    limit?: number;
  }) => {
    const { query, brand, minPrice, maxPrice, cursor, limit = 20 } = params;

    const where: any = { status: 'AVAILABLE' };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (brand) where.brand = brand;
    if (minPrice) where.price = { ...where.price, gte: minPrice };
    if (maxPrice) where.price = { ...where.price, lte: maxPrice };

    const queryOptions: any = {
      select: selectCarListing,
      where,
      orderBy: { id: 'desc' },
      take: limit + 1,
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const [cars, total] = await Promise.all([
      prisma.cars.findMany(queryOptions),
      prisma.cars.count({ where }),
    ]);

    const hasNextPage = cars.length > limit;
    if (hasNextPage) {
      cars.pop();
    }

    return {
      data: cars,
      pagination: {
        limit,
        total,
        hasNextPage,
        nextCursor: hasNextPage && cars.length > 0 ? cars[cars.length - 1].id : null,
      },
    };
  },
};

/**
 * Auctions Queries
 */
export const auctionsQueries = {
  /**
   * جلب المزادات النشطة مع Cursor Pagination
   */
  getActiveAuctions: async (cursor?: string, limit = paginationSettings.auctions.take) => {
    const queryOptions: any = {
      select: selectAuctionPreview,
      where: {
        status: 'ACTIVE',
        yardId: null, // ✅ مزادات أونلاين فقط - استبعاد مزادات الساحات
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const [auctions, total] = await Promise.all([
      prisma.auctions.findMany(queryOptions),
      prisma.auctions.count({ where: { status: 'ACTIVE', yardId: null } }),
    ]);

    const hasNextPage = auctions.length > limit;
    if (hasNextPage) {
      auctions.pop();
    }

    return {
      data: auctions,
      pagination: {
        limit,
        total,
        hasNextPage,
        nextCursor: hasNextPage && auctions.length > 0 ? auctions[auctions.length - 1].id : null,
      },
    };
  },

  /**
   * جلب تفاصيل مزاد واحد
   */
  getAuctionDetails: async (auctionId: string) => {
    return prisma.auctions.findUnique({
      where: { id: auctionId },
      select: selectAuctionDetails,
    });
  },

  /**
   * جلب المزادات القادمة
   */
  getUpcomingAuctions: async (limit = 10) => {
    return prisma.auctions.findMany({
      select: selectAuctionPreview,
      where: {
        status: 'UPCOMING',
        yardId: null, // ✅ مزادات أونلاين فقط
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });
  },
};

/**
 * Users Queries
 */
export const usersQueries = {
  /**
   * جلب بيانات مستخدم
   */
  getUserBasic: async (userId: string) => {
    return prisma.users.findUnique({
      where: { id: userId },
      select: selectUserBasic,
    });
  },

  /**
   * جلب قائمة المستخدمين مع Cursor Pagination
   */
  getUsersList: async (cursor?: string, limit = 20) => {
    const queryOptions: any = {
      select: selectUserBasic,
      orderBy: { id: 'desc' },
      take: limit + 1,
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany(queryOptions),
      prisma.users.count(),
    ]);

    const hasNextPage = users.length > limit;
    if (hasNextPage) {
      users.pop();
    }

    return {
      data: users,
      pagination: {
        limit,
        total,
        hasNextPage,
        nextCursor: hasNextPage && users.length > 0 ? users[users.length - 1].id : null,
      },
    };
  },
};

/**
 * Showrooms Queries
 */
export const showroomsQueries = {
  /**
   * جلب قائمة المعارض مع Cursor Pagination
   */
  getShowroomsList: async (cursor?: string, limit = 20) => {
    const queryOptions: any = {
      select: selectShowroomBasic,
      where: { status: 'APPROVED' },
      orderBy: { id: 'desc' },
      take: limit + 1,
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const [showrooms, total] = await Promise.all([
      prisma.showrooms.findMany(queryOptions),
      prisma.showrooms.count({ where: { status: 'APPROVED' } }),
    ]);

    const hasNextPage = showrooms.length > limit;
    if (hasNextPage) {
      showrooms.pop();
    }

    return {
      data: showrooms,
      pagination: {
        limit,
        total,
        hasNextPage,
        nextCursor: hasNextPage && showrooms.length > 0 ? showrooms[showrooms.length - 1].id : null,
      },
    };
  },
};

/**
 * Notifications Queries
 */
export const notificationsQueries = {
  /**
   * جلب إشعارات المستخدم
   */
  getUserNotifications: async (
    userId: string,
    page = 1,
    limit = paginationSettings.notifications.take,
  ) => {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notifications.findMany({
        select: selectNotificationBasic,
        where: { userId },
        orderBy: defaultOrdering.newest,
        take: limit,
        skip,
      }),
      prisma.notifications.count({ where: { userId } }),
      prisma.notifications.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};

/**
 * Transactions Queries
 */
export const transactionsQueries = {
  /**
   * جلب معاملات المحفظة
   */
  getWalletTransactions: async (
    walletId: string,
    page = 1,
    limit = paginationSettings.transactions.take,
  ) => {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transactions.findMany({
        select: selectTransactionBasic,
        where: { walletId },
        orderBy: defaultOrdering.newest,
        take: limit,
        skip,
      }),
      prisma.transactions.count({ where: { walletId } }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};

/**
 * Reviews Queries
 */
export const reviewsQueries = {
  /**
   * جلب تقييمات سيارة
   */
  getCarReviews: async (carId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.reviews.findMany({
        select: selectReviewBasic,
        where: { carId },
        orderBy: defaultOrdering.newest,
        take: limit,
        skip,
      }),
      prisma.reviews.count({ where: { carId } }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};

/**
 * Transport Queries
 */
export const transportQueries = {
  /**
   * جلب خدمات النقل
   */
  getTransportServices: async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.transport_services.findMany({
        select: selectTransportBasic,
        where: { status: 'ACTIVE' },
        orderBy: defaultOrdering.newest,
        take: limit,
        skip,
      }),
      prisma.transport_services.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
