/**
 * API خدمات النقل المحدث - مع النظام الموحد
 */

import { NextApiRequest, NextApiResponse } from 'next';
import apiResponse from '../../lib/api/response';
import { getOrSetCache } from '../../lib/core/cache/UnifiedCache';
import { logger } from '../../lib/core/logging/UnifiedLogger';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    logger.info('API خدمات النقل - طلب جديد', {
      method: req.method,
      query: req.query,
      ip: req.headers['x-forwarded-for'] || 'unknown',
    });

    switch (req.method) {
      case 'GET':
        return await getTransportServices(req, res);
      default:
        return apiResponse.methodNotAllowed(res, ['GET']);
    }
  } catch (error) {
    logger.error('خطأ في API خدمات النقل:', error);
    return apiResponse.serverError(
      res,
      'خطأ في الخادم',
      error instanceof Error ? error.message : 'خطأ غير محدد',
      { route: 'api/transport' },
      'SERVER_ERROR'
    );
  } finally {
    logger.info(`API خدمات النقل مكتمل - ${Date.now() - startTime}ms`);
  }
}

async function getTransportServices(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = '1',
      limit = '20',
      status = 'ACTIVE',
      truckType,
      serviceArea,
      minCapacity,
      maxCapacity,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    logger.info('جلب خدمات النقل', {
      page: pageNum,
      limit: limitNum,
      filters: { status, truckType, serviceArea, userId }
    });

    const cacheKey = `transport:services:${JSON.stringify(req.query)}`;

    const result = await getOrSetCache(cacheKey, 180, async () => {
      // بناء شروط البحث
      const where: any = {};
      if (status && status !== 'all') {
        where.status = status;
      }
      if (truckType && truckType !== 'all') {
        where.truckType = truckType;
      }
      if (serviceArea) {
        where.serviceArea = {
          contains: serviceArea as string,
          mode: 'insensitive'
        };
      }
      if (minCapacity) {
        where.capacity = { gte: parseFloat(minCapacity as string) };
      }
      if (maxCapacity) {
        where.capacity = { ...where.capacity, lte: parseFloat(maxCapacity as string) };
      }
      if (userId) {
        where.userId = userId;
      }

      const [services, total] = await Promise.all([
        prisma.transport_services.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            truckType: true,
            capacity: true,
            serviceArea: true,
            pricePerKm: true,
            availableDays: true,
            contactPhone: true,
            images: true, // إضافة حقل الصور
            status: true,
            featured: true,
            promotionPackage: true,
            promotionDays: true,
            promotionEndDate: true,
            promotionPriority: true,
            createdAt: true,
            users: {
              select: {
                id: true,
                name: true,
                phone: true,
                verified: true,
                profileImage: true,
                accountType: true,
                rating: true,
              },
            },
          },
          orderBy: [
            { featured: 'desc' },
            { promotionPriority: 'desc' },
            { [sortBy as string]: sortOrder }
          ],
          skip: offset,
          take: limitNum,
        }),
        prisma.transport_services.count({ where })
      ]);

      // تنسيق البيانات للعرض
      const formattedServices = services.map(service => {
        // تحويل الصور من نص مفصول بفاصلة إلى مصفوفة
        let imagesArray: string[] = [];
        if (service.images) {
          if (typeof service.images === 'string') {
            imagesArray = service.images.split(',').map(img => img.trim()).filter(Boolean);
          } else if (Array.isArray(service.images)) {
            imagesArray = service.images;
          }
        }

        return {
          id: service.id,
          title: service.title,
          description: service.description,
          truckType: service.truckType,
          capacity: service.capacity,
          serviceArea: service.serviceArea,
          pricePerKm: service.pricePerKm,
          availableDays: service.availableDays,
          contactPhone: service.contactPhone,
          status: service.status,
          featured: service.featured || false,
          promotionPackage: service.promotionPackage || 'free',
          promotionDays: service.promotionDays || 0,
          promotionEndDate: service.promotionEndDate || null,
          promotionPriority: service.promotionPriority || 0,
          rating: 0, // سيتم حسابها من التقييمات
          reviewsCount: 0, // سيتم حسابها من التقييمات
          createdAt: service.createdAt,
          images: imagesArray, // الصور كمصفوفة
          user: {
            id: service.users.id,
            name: service.users.name,
            phone: service.users.phone,
            verified: service.users.verified,
            profileImage: service.users.profileImage,
            accountType: service.users.accountType,
            rating: service.users.rating || 0,
          }
        };
      });

      return {
        services: formattedServices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum),
          hasNextPage: pageNum * limitNum < total,
        }
      };
    });

    logger.info(`تم جلب ${result.services.length} خدمة نقل من أصل ${result.pagination.total}`);

    return apiResponse.ok(
      res,
      result,
      { route: 'api/transport', message: `تم العثور على ${result.services.length} خدمة نقل` },
      'OK'
    );

  } catch (error) {
    logger.error('خطأ في جلب خدمات النقل:', error);
    return apiResponse.serverError(
      res,
      'خطأ في جلب خدمات النقل',
      error instanceof Error ? error.message : 'خطأ غير محدد',
      { route: 'api/transport' },
      'FETCH_ERROR'
    );
  }
}
