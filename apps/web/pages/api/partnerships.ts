/**
 * API الشراكات - API جديد للشراكات بين الشركات
 */

import { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { logger } from '../../lib/core/logging/UnifiedLogger';
import apiResponse from '../../lib/api/response';
import { getOrSetCache } from '../../lib/core/cache/UnifiedCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logger.startPerformanceTracking('partnerships-api');

  try {
    logger.info('API الشراكات - طلب جديد', {
      method: req.method,
      query: req.query,
      ip: req.headers['x-forwarded-for'] || 'unknown',
    });

    switch (req.method) {
      case 'GET':
        return await getPartnerships(req, res);
      default:
        return apiResponse.methodNotAllowed(res, ['GET']);
    }
  } catch (error) {
    logger.error('خطأ في API الشراكات:', error);
    return apiResponse.serverError(
      res,
      'خطأ في الخادم',
      error instanceof Error ? error.message : 'خطأ غير محدد',
      { route: 'api/partnerships' },
      'SERVER_ERROR',
    );
  } finally {
    logger.endPerformanceTracking('partnerships-api', 'API الشراكات مكتمل');
  }
}

async function getPartnerships(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = '1',
      limit = '20',
      status = 'ACTIVE',
      type = 'all', // 'companies' | 'showrooms' | 'all'
      verified,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    logger.info('جلب بيانات الشراكات', {
      page: pageNum,
      limit: limitNum,
      filters: { type, status, verified, featured },
    });

    const cacheKey = `partnerships:${JSON.stringify(req.query)}`;

    const result = await getOrSetCache(cacheKey, 300, async () => {
      let partnerships: Array<Record<string, unknown>> = [];
      let totalCount = 0;

      if (type === 'companies' || type === 'all') {
        // جلب الشركات
        const companyWhere: Prisma.CompanyWhereInput = {};
        if (status !== 'all') companyWhere.status = status;
        if (verified === 'true') companyWhere.verified = true;
        if (featured === 'true') companyWhere.featured = true;

        const [companies, companiesCount] = await Promise.all([
          prisma.companies.findMany({
            where: companyWhere,
            select: {
              id: true,
              name: true,
              description: true,
              businessType: true,
              city: true,
              area: true,
              address: true,
              phone: true,
              email: true,
              website: true,
              logo: true,
              rating: true,
              reviewsCount: true,
              totalEmployees: true,
              establishedYear: true,
              status: true,
              verified: true,
              featured: true,
              createdAt: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  verified: true,
                },
              },
            },
            orderBy: [
              { featured: 'desc' },
              { verified: 'desc' },
              { rating: 'desc' },
              { [sortBy as string]: sortOrder },
            ],
            skip: type === 'companies' ? offset : 0,
            take: type === 'companies' ? limitNum : undefined,
          }),
          prisma.companies.count({ where: companyWhere }),
        ]);

        const formattedCompanies = companies.map((company) => ({
          ...company,
          type: 'company',
          partnershipType: 'شركة',
        }));

        partnerships = [...partnerships, ...formattedCompanies];
        totalCount += companiesCount;
      }

      if (type === 'showrooms' || type === 'all') {
        // جلب المعارض
        const showroomWhere: Prisma.ShowroomWhereInput = {};
        if (status !== 'all') showroomWhere.status = status;
        if (verified === 'true') showroomWhere.verified = true;
        if (featured === 'true') showroomWhere.featured = true;

        const [showrooms, showroomsCount] = await Promise.all([
          prisma.showrooms.findMany({
            where: showroomWhere,
            select: {
              id: true,
              name: true,
              description: true,
              city: true,
              area: true,
              address: true,
              images: true,
              phone: true,
              email: true,
              website: true,
              rating: true,
              reviewsCount: true,
              totalCars: true,
              activeCars: true,
              status: true,
              verified: true,
              featured: true,
              createdAt: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  verified: true,
                },
              },
            },
            orderBy: [
              { featured: 'desc' },
              { verified: 'desc' },
              { rating: 'desc' },
              { [sortBy as string]: sortOrder },
            ],
            skip: type === 'showrooms' ? offset : 0,
            take: type === 'showrooms' ? limitNum : undefined,
          }),
          prisma.showrooms.count({ where: showroomWhere }),
        ]);

        const formattedShowrooms = showrooms.map((showroom) => ({
          ...showroom,
          type: 'showroom',
          partnershipType: 'معرض',
        }));

        partnerships = [...partnerships, ...formattedShowrooms];
        totalCount += showroomsCount;
      }

      // ترتيب النتائج المجمعة إذا كان النوع 'all'
      if (type === 'all') {
        partnerships = partnerships
          .sort((a, b) => {
            // ترتيب حسب featured أولاً
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;

            // ثم حسب verified
            if (a.verified && !b.verified) return -1;
            if (!a.verified && b.verified) return 1;

            // ثم حسب التقييم
            return (b.rating || 0) - (a.rating || 0);
          })
          .slice(offset, offset + limitNum);
      }

      return {
        partnerships,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum),
          hasNextPage: pageNum * limitNum < totalCount,
        },
      };
    });

    logger.info(`تم جلب ${result.partnerships.length} شراكة من أصل ${result.pagination.total}`);

    return apiResponse.ok(
      res,
      result,
      { route: 'api/partnerships', message: `تم العثور على ${result.partnerships.length} شراكة` },
      'OK',
    );
  } catch (error) {
    logger.error('خطأ في جلب بيانات الشراكات:', error);
    return apiResponse.serverError(
      res,
      'خطأ في جلب بيانات الشراكات',
      error instanceof Error ? error.message : 'خطأ غير محدد',
      { route: 'api/partnerships' },
      'FETCH_ERROR',
    );
  }
}
