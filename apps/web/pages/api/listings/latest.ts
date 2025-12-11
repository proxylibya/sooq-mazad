import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

/**
 * API لجلب أحدث الإعلانات المنشورة
 * GET /api/listings/latest
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: 'الطريقة غير مدعومة',
    });
  }

  try {
    const limit = Math.min(20, parseInt((req.query.limit as string) || '10'));
    const type = req.query.type as string; // 'auction' | 'instant' | 'all'

    // بناء شروط البحث
    const where: any = {
      status: 'AVAILABLE', // فقط الإعلانات المتاحة
    };

    // تصفية حسب نوع الإعلان
    if (type === 'auction') {
      where.isAuction = true;
    } else if (type === 'instant') {
      where.isAuction = false;
    }
    // إذا كان type === 'all' فلا نضيف شرط isAuction

    console.log('[API] جلب أحدث الإعلانات:', { limit, type, where });

    // جلب أحدث الإعلانات
    const listings = await prisma.cars.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        mileage: true,
        condition: true,
        location: true,
        images: true,
        status: true,
        featured: true,
        isAuction: true,
        createdAt: true,
        // بيانات البائع
        seller: {
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
        // الصور المرفوعة
        carImages: {
          select: {
            fileUrl: true,
            isPrimary: true,
          },
          take: 3,
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        // بيانات المعرض إن وجد
        showroom: {
          select: {
            id: true,
            name: true,
            verified: true,
            rating: true,
          },
        },
      },
    });

    // معالجة الصور لكل إعلان
    const processedListings = listings.map((listing) => {
      // أولوية للصور المرفوعة في جدول CarImage
      let processedImages: string[] = [];

      if (listing.carImages && listing.carImages.length > 0) {
        processedImages = listing.carImages.map((img) => img.fileUrl);
      } else if (listing.images) {
        // معالجة الصور القديمة من حقل images
        try {
          if (typeof listing.images === 'string') {
            const parsed = JSON.parse(listing.images);
            processedImages = Array.isArray(parsed) ? parsed : [listing.images];
          } else if (Array.isArray(listing.images)) {
            processedImages = listing.images;
          }
        } catch {
          processedImages = [];
        }
      }

      return {
        ...listing,
        images: processedImages,
        // إزالة البيانات غير المطلوبة
        carImages: undefined,
        listingType: listing.isAuction ? 'auction' : 'instant',
      };
    });

    console.log(`[نجح] تم جلب ${processedListings.length} إعلان جديد`);

    return res.status(200).json({
      success: true,
      data: {
        listings: processedListings,
        total: processedListings.length,
        hasMore: processedListings.length === limit,
      },
      meta: {
        timestamp: new Date().toISOString(),
        type: type || 'all',
        limit,
      },
    });
  } catch (error) {
    console.error('[خطأ] فشل في جلب أحدث الإعلانات:', error);

    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب الإعلانات',
      details:
        process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.message
            : 'خطأ غير معروف'
          : undefined,
    });
  }
}
