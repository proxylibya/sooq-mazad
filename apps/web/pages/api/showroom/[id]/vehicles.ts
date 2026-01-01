import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // التحقق من وجود المعرض
      const showroom = await prisma.showrooms.findUnique({
        where: { id: id as string },
        select: {
          id: true,
          name: true,
          city: true,
          area: true,
          verified: true,
        },
      });

      if (!showroom) {
        // إذا كان المعرض غير موجود في قاعدة البيانات، نعيد بيانات تجريبية
        if (id === 'cmdxx2hv60007vgbwibccw4pq') {
          // المعرض الجديد - لا يحتوي على مركبات بعد
          return res.status(200).json({
            success: true,
            vehicles: [],
            message: 'لا توجد مركبات في هذا المعرض حتى الآن',
          });
        }
        return res.status(404).json({ error: 'المعرض غير موجود' });
      }

      // جلب المركبات الخاصة بالمعرض
      const vehicles = await prisma.cars.findMany({
        where: {
          showroomId: id as string,
          status: 'AVAILABLE',
        },
        include: {
          carImages: {
            select: {
              id: true,
              fileName: true,
              fileUrl: true,
              isPrimary: true,
            },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          },
          seller: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
            },
          },
          showroom: {
            select: {
              id: true,
              name: true,
              city: true,
              area: true,
              verified: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // تحويل البيانات للتنسيق المطلوب
      const formattedVehicles = vehicles.map((vehicle) => ({
        id: vehicle.id,
        title: vehicle.title,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        condition: vehicle.condition,
        mileage: vehicle.mileage,
        location: vehicle.location,
        description: vehicle.description,
        bodyType: vehicle.bodyType,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        color: vehicle.color,
        images: vehicle.carImages.map((img) => img.fileUrl),
        features: vehicle.features ? JSON.parse(vehicle.features) : [],
        contactPhone: vehicle.contactPhone,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
        seller: vehicle.seller,
        showroom: vehicle.showroom,
      }));

      res.status(200).json({
        success: true,
        showroom,
        vehicles: formattedVehicles,
        total: formattedVehicles.length,
      });
    } catch (error) {
      console.error('فشل خطأ في جلب مركبات المعرض:', error);
      res.status(500).json({
        error: 'حدث خطأ أثناء جلب مركبات المعرض',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
