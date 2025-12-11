import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

function parseImages(images: unknown, carImages?: { fileUrl: string; isPrimary: boolean }[]) {
  if (Array.isArray(carImages) && carImages.length > 0) {
    return carImages.map((img) => img.fileUrl).filter(Boolean);
  }

  if (Array.isArray(images)) {
    return images.filter((v) => typeof v === 'string' && v.trim());
  }

  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (!trimmed) return [];
    try {
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) {
          return arr.filter((v) => typeof v === 'string' && v.trim());
        }
      }
    } catch {
      //
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const limit = Math.max(1, Math.min(20, parseInt((req.query.limit as string) || '6', 10)));

    const where: any = {
      status: 'AVAILABLE',
      featured: true,
      isAuction: false,
    };

    const results = await prisma.cars.findMany({
      where,
      take: limit,
      orderBy: [
        { promotionPriority: 'desc' },
        { promotionEndDate: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        mileage: true,
        fuelType: true,
        transmission: true,
        bodyType: true,
        condition: true,
        location: true,
        area: true,
        color: true,
        images: true,
        featured: true,
        promotionPackage: true,
        promotionEndDate: true,
        createdAt: true,
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
            verified: true,
          },
        },
        car_images: {
          select: { fileUrl: true, isPrimary: true },
          take: 3,
          orderBy: [{ isPrimary: 'desc' as const }, { createdAt: 'asc' as const }],
        },
      },
    });

    const cars = results.map((car) => {
      const images = parseImages(car.images as any, (car as any).car_images);

      return {
        id: car.id,
        title: car.title,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        fuelType: car.fuelType,
        transmission: car.transmission,
        bodyType: car.bodyType,
        condition: car.condition,
        color: car.color,
        location: car.location,
        area: (car as any).area,
        images: images.length > 0 ? images : ['/images/cars/default-car.svg'],
        featured: car.featured,
        promotionPackage: car.promotionPackage,
        promotionEndDate: car.promotionEndDate,
        createdAt: car.createdAt,
        user: (car as any).users
          ? {
              id: (car as any).users.id,
              name: (car as any).users.name,
              phone: (car as any).users.phone || '',
              verified: (car as any).users.verified,
            }
          : null,
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    return res.status(200).json({
      success: true,
      data: {
        cars,
        total: cars.length,
      },
    });
  } catch (error: any) {
    console.error('/api/cars/featured error:', error);
    return res.status(200).json({
      success: true,
      data: {
        cars: [],
        total: 0,
      },
    });
  }
}
