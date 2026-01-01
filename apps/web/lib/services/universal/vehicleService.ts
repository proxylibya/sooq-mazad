/**
 * نظام خدمات موحد للمركبات والصور - حل جذري ونهائي
 * يدعم جميع أقسام المشروع: مزاد، فوري، نقل، معارض، شراكات
 */

import { getOrSetCache } from '../../core/cache/UnifiedCache';
import { logger } from '../../core/logging/UnifiedLogger';
import prisma from '../../prisma';

export interface VehicleWithImages {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  mileage: number | null;
  location: string;
  description: string | null;
  images: string; // الحقل القديم
  carImages: Array<{
    fileUrl: string;
    isPrimary: boolean;
    fileName: string;
    category: string;
  }> | null;
  seller: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    verified: boolean;
    profileImage: string | null;
    accountType: string;
    rating?: number;
  };
  features: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function normalizeVehicleImageUrl(rawUrl: string, category?: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return '';

  url = url.replace(/\\/g, '/');

  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;

  if (url.startsWith('public/')) {
    url = url.replace(/^public\//, '/');
    return url;
  }

  // مسارات legacy تحت public/images
  if (url.startsWith('cars/')) {
    return `/images/${url}`;
  }
  if (url.startsWith('listings/')) {
    return `/images/cars/${url}`;
  }
  if (url.startsWith('auction-listings/')) {
    return `/images/cars/${url}`;
  }

  if (
    url.startsWith('uploads/') ||
    url.startsWith('images/') ||
    url.startsWith('_next/') ||
    url.startsWith('api/static/')
  ) {
    return `/${url}`;
  }

  // مسار داخل public/uploads بدون بادئة /
  if (url.startsWith('uploads-') || url.includes('/uploads/')) {
    const idx = url.indexOf('/uploads/');
    if (idx !== -1) {
      return url.substring(idx);
    }
  }

  // اسم ملف فقط أو مسار قصير مثل marketplace/xxx.webp
  const normalizedCategory = (category || '').toLowerCase().trim();
  const categoryFolder = (() => {
    if (!normalizedCategory) return 'marketplace';
    if (normalizedCategory === 'listings') return 'listings';
    if (normalizedCategory === 'cars') return 'cars';
    if (normalizedCategory === 'auctions') return 'auctions';
    if (normalizedCategory === 'marketplace') return 'marketplace';
    if (normalizedCategory === 'messages') return 'messages';
    if (normalizedCategory === 'transport') return 'transport';
    if (normalizedCategory === 'profiles') return 'profiles';
    if (normalizedCategory === 'showrooms') return 'showrooms';
    return 'marketplace';
  })();

  if (url.includes('/')) {
    return `/uploads/${url}`;
  }

  // في نظام رفع الإعلانات الحالي، category=listings تُحفظ تحت public/images/cars/listings
  if (categoryFolder === 'listings') {
    return `/images/cars/listings/${url}`;
  }

  return `/uploads/${categoryFolder}/${url}`;
}

/**
 * جلب مركبة مع صورها - دالة موحدة لجميع الأقسام
 */
export async function getVehicleWithImages(carId: string): Promise<VehicleWithImages | null> {
  const cacheKey = `vehicle:${carId}:with-images`;

  return await getOrSetCache(cacheKey, 300, async () => {
    logger.info(`[VehicleService] جلب بيانات المركبة: ${carId}`);

    const vehicle = await prisma.cars.findUnique({
      where: { id: carId },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        condition: true,
        mileage: true,
        location: true,
        description: true,
        images: true, // الحقل القديم للصور
        features: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // البيانات الإضافية الموجودة في قاعدة البيانات
        locationLat: true,
        locationLng: true,
        locationAddress: true,
        interiorFeatures: true,
        exteriorFeatures: true,
        technicalFeatures: true,
        color: true,
        interiorColor: true,
        seatCount: true,
        regionalSpecs: true,
        vehicleType: true,
        manufacturingCountry: true,
        chassisNumber: true,
        engineNumber: true,
        customsStatus: true,
        licenseStatus: true,
        insuranceStatus: true,
        paymentMethod: true,
        contactPhone: true,
        sellerId: true,
        hasInspectionReport: true,
        inspectionReportFile: true,
        inspectionReportType: true,
        inspectionReportFileUrl: true,
        inspectionReportFileName: true,
        inspectionReportUploadId: true,
        hasManualInspectionReport: true,
        manualInspectionData: true,
        showroomId: true,
        featured: true,
        views: true,
        isAuction: true,
        fuelType: true,
        transmission: true,
        bodyType: true,
        // الصور الجديدة من جدول CarImages
        car_images: {
          select: {
            fileUrl: true,
            isPrimary: true,
            fileName: true,
            category: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        // بيانات البائع
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            verified: true,
            profileImage: true,
            accountType: true,
            rating: true,
          }
        }
      }
    });

    if (vehicle) {
      logger.info(`[VehicleService] تم العثور على المركبة ${carId} مع ${(vehicle as any).car_images?.length || 0} صورة`);
    }

    // إعادة تسمية الحقول للتوافق مع الواجهة
    const normalizedVehicle = vehicle ? {
      ...vehicle,
      carImages: (vehicle as any).car_images,
      seller: (vehicle as any).users,
    } : null;

    return normalizedVehicle as VehicleWithImages;
  });
}

/**
 * جلب قائمة المركبات مع صورها - دالة موحدة لجميع الأقسام
 */
export async function getVehiclesWithImages(options: {
  limit?: number;
  offset?: number;
  status?: string;
  category?: string;
  sellerId?: string;
  showroomId?: string;
  isAuction?: boolean;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ vehicles: VehicleWithImages[]; total: number; }> {

  const {
    limit = 20,
    offset = 0,
    status = 'AVAILABLE',
    category,
    sellerId,
    showroomId,
    isAuction,
    featured,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const cacheKey = `vehicles:list:${JSON.stringify(options)}`;

  return await getOrSetCache(cacheKey, 60, async () => {
    logger.info('[VehicleService] جلب قائمة المركبات مع الفلاتر:', options);

    const where: any = { status };

    if (category) where.category = category;
    if (sellerId) where.sellerId = sellerId;
    if (showroomId) where.showroomId = showroomId;
    if (isAuction !== undefined) where.isAuction = isAuction;
    if (featured !== undefined) where.featured = featured;

    const [vehicles, total] = await Promise.all([
      prisma.cars.findMany({
        where,
        select: {
          id: true,
          title: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          condition: true,
          mileage: true,
          location: true,
          description: true,
          images: true,
          features: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          // بيانات الترويج
          featured: true,
          promotionPackage: true,
          promotionDays: true,
          promotionStartDate: true,
          promotionEndDate: true,
          promotionPriority: true,
          // البيانات الإضافية
          locationLng: true,
          locationAddress: true,
          hasInspectionReport: true,
          inspectionReportFileUrl: true,
          hasManualInspectionReport: true,
          manualInspectionData: true,
          fuelType: true,
          transmission: true,
          bodyType: true,
          color: true,
          interiorColor: true,
          seatCount: true,
          car_images: {
            select: {
              fileUrl: true,
              isPrimary: true,
              fileName: true,
              category: true,
            },
            orderBy: [
              { isPrimary: 'desc' },
              { createdAt: 'asc' }
            ],
            take: 5 // تحديد عدد الصور لتحسين الأداء
          },
          users: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
              profileImage: true,
              accountType: true,
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: offset,
        take: limit,
      }),
      prisma.cars.count({ where })
    ]);

    logger.info(`[VehicleService] تم العثور على ${vehicles.length} من أصل ${total} مركبة`);

    // إعادة تسمية الحقول للتوافق مع الواجهة
    const normalizedVehicles = vehicles.map((v: any) => ({
      ...v,
      carImages: v.car_images,
      seller: v.users,
    }));

    return {
      vehicles: normalizedVehicles as VehicleWithImages[],
      total
    };
  });
}

/**
 * حل موحد للصور - معالجة أولوية الصور الحقيقية على الوهمية
 * محسّن للتعامل مع جميع تنسيقات الصور (car_images جدول + images حقل نصي)
 */
export function resolveVehicleImages(vehicle: VehicleWithImages | any): string[] {
  const images: string[] = [];
  const vehicleId = vehicle?.id || 'unknown';

  try {
    // دعم كلا الاسمين: carImages و car_images
    const carImagesArray = vehicle.carImages || vehicle.car_images;

    // أولاً: الصور الجديدة من CarImages (الأولوية العليا)
    if (carImagesArray && Array.isArray(carImagesArray) && carImagesArray.length > 0) {
      logger.info(`[ImageResolver] وجد ${carImagesArray.length} صورة في carImages للمركبة ${vehicleId}`);

      const validImages = carImagesArray
        .filter(
          (img: any) => {
            const raw = img?.fileUrl || img?.imageUrl || img?.url;
            return !!raw && typeof raw === 'string' && raw.trim();
          },
        )
        .map((img: any) => {
          let url = (img.fileUrl || img.imageUrl || img.url || '').trim();
          if (url.includes('/admin-auctions/')) {
            url = url.replace('/admin-auctions/', '/auctions/');
          }
          return normalizeVehicleImageUrl(url, img.category);
        });

      if (validImages.length > 0) {
        images.push(...validImages);
        logger.info(`[ImageResolver] تم استخراج ${validImages.length} صورة صالحة من carImages`);
        return images;
      }
    }

    // ثانياً: الصور القديمة من حقل images (احتياطي)
    const imagesField = vehicle.images;
    if (imagesField && typeof imagesField === 'string' && imagesField.trim()) {
      logger.info(`[ImageResolver] معالجة الصور من حقل images للمركبة ${vehicleId}`);

      try {
        const trimmedImages = imagesField.trim();

        // محاولة تحليل JSON - أي نص يبدأ بـ [ أو "
        if (trimmedImages.startsWith('[') || trimmedImages.startsWith('"')) {
          let parsed: any;

          // إذا كان يبدأ بـ " فقد يكون JSON string مكرر التشفير
          if (trimmedImages.startsWith('"')) {
            try {
              // محاولة فك التشفير المزدوج
              parsed = JSON.parse(JSON.parse(trimmedImages));
            } catch {
              parsed = JSON.parse(trimmedImages);
            }
          } else {
            parsed = JSON.parse(trimmedImages);
          }

          if (Array.isArray(parsed)) {
            const validImages = parsed
              .filter((img: any) => img && typeof img === 'string' && img.trim())
              .filter(
                (img: string) =>
                  !img.includes('placeholder.com') && !img.includes('via.placeholder'),
              )
              .map((img: string) => normalizeVehicleImageUrl(img));

            if (validImages.length > 0) {
              images.push(...validImages);
              logger.info(`[ImageResolver] تم استخراج ${validImages.length} صورة من JSON للمركبة ${vehicleId}`);
              return images;
            }
          } else if (typeof parsed === 'string' && parsed.trim()) {
            // إذا كان JSON يحتوي على string واحد
            const url = parsed.trim();
            if (!url.includes('placeholder.com') && !url.includes('via.placeholder')) {
              const finalUrl = url.startsWith('http') || url.startsWith('/') ? url : `/uploads/${url}`;
              images.push(finalUrl);
              logger.info(`[ImageResolver] تم استخراج صورة واحدة من JSON string للمركبة ${vehicleId}`);
              return images;
            }
          }
        }

        // محاولة تقسيم النص بالفاصلة
        if (trimmedImages.includes(',')) {
          const splitImages = trimmedImages.split(',')
            .map((img: string) => img.trim())
            .filter((img: string) => img && !img.includes('placeholder.com') && !img.includes('via.placeholder'))
            .map((img: string) => {
              if (img.startsWith('http') || img.startsWith('/')) {
                return img;
              } else {
                return `/uploads/${img}`;
              }
            });

          if (splitImages.length > 0) {
            images.push(...splitImages);
            logger.info(
              `[ImageResolver] تم استخراج ${splitImages.length} صورة من النص المقسم للمركبة ${vehicleId}`,
            );
            return images;
          }
        }

        // صورة واحدة مباشرة
        if (
          !trimmedImages.includes('placeholder.com') &&
          !trimmedImages.includes('via.placeholder')
        ) {
          const finalUrl = normalizeVehicleImageUrl(trimmedImages);
          if (finalUrl) {
            images.push(finalUrl);
          }
          logger.info(`[ImageResolver] تم استخراج صورة واحدة مباشرة للمركبة ${vehicleId}`);
          return images;
        }
      } catch (parseError) {
        logger.error(`[ImageResolver] خطأ في تحليل الصور للمركبة ${vehicleId}:`, parseError);

        // محاولة أخيرة: استخدام النص كما هو إذا كان يبدو كـ URL
        const trimmed = imagesField.trim();
        if (
          (trimmed.startsWith('/') || trimmed.startsWith('http')) &&
          !trimmed.includes('placeholder.com') &&
          !trimmed.includes('via.placeholder')
        ) {
          images.push(trimmed);
          logger.info(`[ImageResolver] استخدام النص كـ URL مباشر للمركبة ${vehicleId}`);
          return images;
        }
      }
    }

    // ثالثاً: الصورة الافتراضية (آخر حل)
    logger.warn(`[ImageResolver] لم يتم العثور على صور للمركبة ${vehicleId} - استخدام صورة افتراضية`);
    images.push('/images/cars/default-car.svg');

  } catch (error) {
    logger.error(`[ImageResolver] خطأ عام في معالجة صور المركبة ${vehicleId}:`, error);
    images.push('/images/cars/default-car.svg');
  }

  return images;
}

/**
 * تحديث عداد المشاهدات للمركبة
 * @deprecated استخدم viewsService.recordCarView بدلاً من هذه الدالة
 */
export async function incrementVehicleViews(carId: string): Promise<void> {
  // استخدام الخدمة الموحدة للمشاهدات
  try {
    // استيراد ديناميكي لتجنب التبعية الدائرية
    const { default: viewsService } = await import('../unified/viewsService');
    await viewsService.recordCarView(carId);
    logger.info(`[VehicleService] تم تحديث عداد المشاهدات للمركبة ${carId}`);
  } catch (error) {
    logger.error(`[VehicleService] فشل في تحديث عداد المشاهدات للمركبة ${carId}:`, error);
  }
}

export default {
  getVehicleWithImages,
  getVehiclesWithImages,
  resolveVehicleImages,
  incrementVehicleViews
};
