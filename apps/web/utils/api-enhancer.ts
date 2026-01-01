// نظام تحسين وتطوير APIs المتكامل
import { NextApiRequest, NextApiResponse } from 'next';

// أنواع البيانات المحسنة
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
  meta?: ResponseMeta;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ResponseMeta {
  timestamp: string;
  version: string;
  requestId: string;
  executionTime: number;
}

export interface ApiFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

// فئة تحسين APIs
export class ApiEnhancer {
  private startTime: number;
  private requestId: string;

  constructor() {
    this.startTime = Date.now();
    this.requestId = this.generateRequestId();
  }

  // إنشاء معرف فريد للطلب
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // تحليل وتنظيف المعاملات
  parseFilters(query: any): ApiFilters {
    return {
      page: parseInt(query.page as string) || 1,
      limit: Math.min(parseInt(query.limit as string) || 20, 100), // حد أقصى 100
      search: query.search ? String(query.search).trim() : undefined,
      sortBy: (query.sortBy as string) || 'createdAt',
      sortOrder: (query.sortOrder as string) === 'asc' ? 'asc' : 'desc',
      status: query.status ? String(query.status).toUpperCase() : undefined,
      brand: query.brand && query.brand !== 'جميع الماركات' ? String(query.brand) : undefined,
      minPrice: query.minPrice ? parseFloat(query.minPrice as string) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice as string) : undefined,
    };
  }

  // إنشاء معلومات التصفح
  createPagination(total: number, page: number, limit: number): PaginationInfo {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // إنشاء معلومات الاستجابة
  createMeta(): ResponseMeta {
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requestId: this.requestId,
      executionTime: Date.now() - this.startTime,
    };
  }

  // إنشاء استجابة نجاح
  successResponse<T>(data: T, pagination?: PaginationInfo, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      pagination,
      meta: this.createMeta(),
    };
  }

  // إنشاء استجابة خطأ
  errorResponse(error: string, _statusCode: number = 500): ApiResponse {
    return {
      success: false,
      error,
      meta: this.createMeta(),
    };
  }

  // معالج الأخطاء المحسن
  handleError(error: any, location: string): ApiResponse {
    console.error(`فشل خطأ في ${location}:`, error);

    // تسجيل مفصل للأخطاء
    const errorDetails = {
      message: error.message || 'خطأ غير معروف',
      stack: error.stack,
      location,
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
    };

    // في بيئة التطوير، أرسل تفاصيل أكثر
    if (process.env.NODE_ENV === 'development') {
      console.error('تفاصيل الخطأ:', errorDetails);
    }

    // تحديد نوع الخطأ وإرجاع رسالة مناسبة
    if (error.code === 'P2002') {
      return this.errorResponse('البيانات موجودة مسبقاً', 409);
    }

    if (error.code === 'P2025') {
      return this.errorResponse('البيانات المطلوبة غير موجودة', 404);
    }

    if (error.name === 'ValidationError') {
      return this.errorResponse('بيانات غير صحيحة', 400);
    }

    return this.errorResponse('خطأ في الخادم', 500);
  }

  // التحقق من صحة البيانات المطلوبة
  validateRequired(data: any, requiredFields: string[]): { isValid: boolean; missing: string[]; } {
    const missing: string[] = [];

    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missing.push(field);
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
    };
  }

  // تنظيف وتحسين بيانات السيارة
  sanitizeCarData(car: any): any {
    if (!car) return null;

    return {
      ...car,
      images: Array.isArray(car.images)
        ? car.images
        : typeof car.images === 'string'
          ? car.images.startsWith('[')
            ? JSON.parse(car.images)
            : car.images.split(',').filter(Boolean)
          : ['/images/cars/default-car.svg'],
      price: parseFloat(car.price) || 0,
      year: parseInt(car.year) || new Date().getFullYear(),
      mileage: car.mileage ? parseInt(car.mileage) : null,
      features: car.features || '',
      description: car.description || '',
      seller: car.seller
        ? {
          id: car.seller.id,
          name: car.seller.name,
          phone: car.seller.phone,
          verified: car.seller.verified || false,
          profileImage: car.seller.profileImage || '/images/default-avatar.svg',
        }
        : null,
    };
  }

  // تنظيف وتحسين بيانات المزاد
  sanitizeAuctionData(auction: any): any {
    if (!auction) return null;

    return {
      ...auction,
      car: this.sanitizeCarData(auction.car),
      startingPrice: parseFloat(auction.startingPrice || auction.startPrice) || 0,
      currentPrice: parseFloat(auction.currentPrice) || 0,
      reservePrice: auction.reservePrice ? parseFloat(auction.reservePrice) : null,
      startTime: new Date(auction.startDate || auction.startTime),
      endTime: new Date(auction.endDate || auction.endTime),
      timeRemaining: this.calculateTimeRemaining(auction.endDate || auction.endTime),
      bidsCount: auction.bids ? auction.bids.length : 0,
      highestBid:
        auction.bids && auction.bids.length > 0
          ? Math.max(...auction.bids.map((bid: any) => parseFloat(bid.amount)))
          : auction.startingPrice,
    };
  }

  // حساب الوقت المتبقي
  private calculateTimeRemaining(endTime: string | Date): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  }

  // إنشاء استعلام Prisma محسن للسيارات
  buildCarQuery(filters: ApiFilters) {
    const where: any = {};
    const orderBy: any = {};

    // تطبيق الفلاتر
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.brand) {
      where.brand = filters.brand;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // ترتيب النتائج
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    return {
      where,
      orderBy,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            verified: true,
            profileImage: true,
            accountType: true,
            createdAt: true,
          },
        },
        carImages: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            isPrimary: true,
            createdAt: true,
          },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
      },
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      take: filters.limit || 20,
    };
  }

  // إنشاء استعلام Prisma محسن للمزادات
  buildAuctionQuery(filters: ApiFilters) {
    const where: any = {};
    const orderBy: any = {};

    // تطبيق الفلاتر
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        {
          car: {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { brand: { contains: filters.search, mode: 'insensitive' } },
              { model: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // ترتيب النتائج
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    return {
      where,
      orderBy,
      include: {
        car: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                verified: true,
                profileImage: true,
                accountType: true,
                createdAt: true,
              },
            },
            carImages: {
              select: {
                id: true,
                fileName: true,
                fileUrl: true,
                isPrimary: true,
                createdAt: true,
              },
              orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
            },
          },
        },
        bids: {
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { amount: 'desc' },
          take: 5, // أعلى 5 مزايدات فقط
        },
      },
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      take: filters.limit || 20,
    };
  }
}

// دالة مساعدة لإنشاء معالج API محسن
export function createApiHandler(
  handler: (req: NextApiRequest, res: NextApiResponse, enhancer: ApiEnhancer) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const enhancer = new ApiEnhancer();

    try {
      await handler(req, res, enhancer);
    } catch (error) {
      const errorResponse = enhancer.handleError(error, 'API Handler');
      res.status(500).json(errorResponse);
    } finally {
      // لا تغلق Prisma client هنا. نستخدم Singleton عبر lib/prisma،
      // وإغلاقه في نهاية كل طلب قد يسبب أخطاء في الطلبات التالية.
    }
  };
}

// دوال مساعدة للتحقق من الطرق المدعومة
export function validateMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[],
): boolean {
  if (!allowedMethods.includes(req.method || '')) {
    res.setHeader('Allow', allowedMethods);
    res.status(405).json({
      success: false,
      error: `طريقة ${req.method} غير مدعومة`,
      meta: {
        timestamp: new Date().toISOString(),
        allowedMethods,
      },
    });
    return false;
  }
  return true;
}

export default ApiEnhancer;
