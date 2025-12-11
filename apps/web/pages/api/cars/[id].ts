import { NextApiRequest, NextApiResponse } from 'next';
import {
  ForbiddenError,
  NotFoundError,
  sendSuccess,
  validateCarId,
  withApiHandler
} from '../../../lib/api-helpers';
import { dbHelpers } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return withApiHandler(req, res, async (req, res, requestId) => {
    const id = validateCarId(req.query.id);

    switch (req.method) {
      case 'GET':
        return await getCarById(req, res, id, requestId);
      case 'PUT':
        return await updateCar(req, res, id, requestId);
      case 'DELETE':
        return await deleteCar(req, res, id, requestId);
      default:
        throw new Error(`الطريقة ${req.method} غير مدعومة`);
    }
  }, ['GET', 'PUT', 'DELETE']);
}

async function getCarById(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  requestId: string
) {
  // جلب بيانات السيارة من قاعدة البيانات
  const car = await dbHelpers.getCarById(id);

  if (!car) {
    throw new NotFoundError('السيارة غير موجودة أو تم حذفها');
  }

  // التحقق من حالة السيارة
  if (car.status === 'DRAFT') {
    throw new ForbiddenError('السيارة في وضع المسودة وغير متاحة للعرض');
  }

  // معالجة صور السيارة
  const processedCar = {
    ...car,
    images: processCarImages(car),
    carImages: (car as any).car_images || [],
    seller: (car as any).users ? {
      id: (car as any).users.id,
      name: (car as any).users.name,
      phone: (car as any).users.phone,
      email: (car as any).users.email,
      profileImage: (car as any).users.profileImage || null,
      verified: (car as any).users.verified,
      accountType: (car as any).users.accountType,
      rating: (car as any).users.rating || 0,
    } : null
  };

  sendSuccess(res, processedCar, 'تم جلب بيانات السيارة بنجاح');
}

// دالة معالجة صور السيارة
function processCarImages(car: any): string[] {
  let images: string[] = [];

  // استخدام الصور من جدول car_images أولاً (Prisma يرجع car_images بشرطة سفلية)
  const carImages = car.car_images || car.carImages;
  if (carImages && Array.isArray(carImages) && carImages.length > 0) {
    images = carImages.map((img: { fileUrl: string; }) => img.fileUrl).filter(Boolean);
  }
  // إذا لم توجد، استخدام حقل images القديم
  else if (car.images) {
    if (typeof car.images === 'string') {
      // التحقق من نوع النص - JSON أو مفصول بفواصل
      const trimmed = car.images.trim();
      if (trimmed.startsWith('[')) {
        // محاولة تحليل JSON
        try {
          const parsedImages = JSON.parse(trimmed);
          if (Array.isArray(parsedImages)) {
            images = parsedImages;
          }
        } catch {
          // إذا فشل، اعتبرها نص عادي
          images = [car.images];
        }
      } else {
        // النص مفصول بفواصل
        images = car.images.split(',').map((img: string) => img.trim());
      }
    } else if (Array.isArray(car.images)) {
      images = car.images;
    }
  }

  // فلترة الصور الصحيحة فقط
  const validImages = images.filter((img: string) =>
    img &&
    typeof img === 'string' &&
    img.trim() !== '' &&
    !img.includes('default-car.svg') // إزالة الصور الافتراضية
  );

  console.log('[processCarImages] عدد الصور المعالجة:', validImages.length, validImages);

  return validImages;
}


async function updateCar(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const carData = req.body;

    // التحقق من وجود السيارة
    const existingCar = await dbHelpers.getCarById(id);
    if (!existingCar) {
      return res.status(404).json({
        success: false,
        error: 'السيارة غير موجودة',
      });
    }

    // تحديث السيارة
    const updatedCar = await dbHelpers.updateCar(id, {
      ...carData,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: 'تم تحديث السيارة بنجاح',
      data: updatedCar,
    });
  } catch (error) {
    console.error('خطأ في تحديث السيارة:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في تحديث السيارة',
    });
  }
}

async function deleteCar(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // التحقق من وجود السيارة
    const existingCar = await dbHelpers.getCarById(id);
    if (!existingCar) {
      return res.status(404).json({
        success: false,
        error: 'السيارة غير موجودة',
      });
    }

    // حذف السيارة
    await dbHelpers.deleteCar(id);

    return res.status(200).json({
      success: true,
      message: 'تم حذف السيارة بنجاح',
    });
  } catch (error) {
    console.error('خطأ في حذف السيارة:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في حذف السيارة',
    });
  }
}
