import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

/**
 * دالة موحدة لمعالجة وتنظيف مسارات الصور
 * تتعامل مع جميع التنسيقات: JSON، CSV، مصفوفة، نص
 */
function parseImages(val?: string | string[] | null): string[] {
  if (!val) return [];

  const DEFAULT_IMAGE = '/images/transport/default-truck.jpg';

  // دالة لتنظيف مسار الصورة
  const cleanImagePath = (img: string): string => {
    if (!img || typeof img !== 'string') return '';

    let cleaned = img.trim();

    // إزالة الاقتباسات الزائدة
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');
    cleaned = cleaned.replace(/""+/g, '"');
    cleaned = cleaned.replace(/\["|"]/g, '');

    // إزالة backslashes المزدوجة
    cleaned = cleaned.replace(/\\\\/g, '/');

    // التحقق من صحة المسار
    if (cleaned.length < 5) return '';
    if (!cleaned.startsWith('/') && !cleaned.startsWith('http')) return '';

    return cleaned;
  };

  // إذا كانت مصفوفة بالفعل
  if (Array.isArray(val)) {
    const result: string[] = [];
    for (const item of val) {
      if (typeof item === 'string') {
        // قد تكون العناصر JSON أيضاً
        if (item.includes('[') && item.includes(']')) {
          try {
            const parsed = JSON.parse(item.replace(/""+/g, '"'));
            if (Array.isArray(parsed)) {
              result.push(...parsed.map(cleanImagePath).filter(Boolean));
            } else {
              result.push(cleanImagePath(String(parsed)));
            }
          } catch {
            result.push(cleanImagePath(item));
          }
        } else {
          result.push(cleanImagePath(item));
        }
      }
    }
    return result.length > 0 ? result : [DEFAULT_IMAGE];
  }

  // إذا كانت نص
  const str = String(val).trim();

  // محاولة تحليل JSON
  if (str.startsWith('[') || str.startsWith('{')) {
    try {
      // إصلاح JSON التالف
      let fixedJson = str
        .replace(/""+/g, '"')
        .replace(/\[\s*""+/g, '["')
        .replace(/""+\s*]/g, '"]');

      const parsed = JSON.parse(fixedJson);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map(cleanImagePath).filter(Boolean);
        return cleaned.length > 0 ? cleaned : [DEFAULT_IMAGE];
      }
      const single = cleanImagePath(String(parsed));
      return single ? [single] : [DEFAULT_IMAGE];
    } catch {
      // فشل التحليل، نتابع
    }
  }

  // معالجة CSV
  const images = str
    .split(',')
    .map(cleanImagePath)
    .filter(Boolean);

  return images.length > 0 ? images : [DEFAULT_IMAGE];
}

/**
 * دالة لتحليل الميزات
 */
function parseFeatures(val?: string | string[] | null): string[] {
  if (!val) return [];

  if (Array.isArray(val)) {
    return val.filter((f) => f && typeof f === 'string' && f.trim().length > 0);
  }

  const str = String(val).trim();

  // محاولة تحليل JSON
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.filter((f) => f && typeof f === 'string' && f.trim().length > 0);
      }
    } catch {
      // فشل التحليل
    }
  }

  // معالجة CSV
  return str
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      limit = '20',
      status = 'ACTIVE',
      truckType,
      serviceArea,
      search,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && status !== 'all') where.status = String(status);
    if (truckType && truckType !== 'all') where.truckType = String(truckType);
    if (serviceArea && serviceArea !== 'all') {
      where.serviceArea = { contains: String(serviceArea), mode: 'insensitive' };
    }
    if (userId) where.userId = String(userId);

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { serviceArea: { contains: q, mode: 'insensitive' } },
        { truckType: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
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
          status: true,
          createdAt: true,
          images: true,
          features: true,
          isAvailable: true,
          availabilityNote: true,
          featured: true,
          // حقول الترويج
          promotionPackage: true,
          promotionDays: true,
          promotionStartDate: true,
          promotionEndDate: true,
          promotionPriority: true,
          users: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
              profileImage: true,
              accountType: true,
              rating: true,
              totalReviews: true,
            },
          },
        },
        // ترتيب: المميزة أولاً، ثم حسب الأولوية، ثم الأحدث
        orderBy: [
          { featured: 'desc' },
          { promotionPriority: 'desc' },
          { [String(sortBy)]: String(sortOrder) as 'asc' | 'desc' },
        ],
        skip,
        take: limitNum,
      }),
      prisma.transport_services.count({ where }),
    ]);

    const services = rows.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      truckType: s.truckType,
      capacity: s.capacity,
      serviceArea: s.serviceArea,
      address: s.serviceArea, // استخدام serviceArea كعنوان
      pricePerKm: s.pricePerKm,
      availableDays: s.availableDays,
      contactPhone: s.contactPhone,
      status: s.status,
      isAvailable: s.isAvailable ?? true,
      availabilityNote: s.availabilityNote || null,
      featured: s.featured ?? false,
      // حقول الترويج
      promotionPackage: s.promotionPackage || 'free',
      promotionDays: s.promotionDays || 0,
      promotionStartDate: s.promotionStartDate?.toISOString?.() || null,
      promotionEndDate: s.promotionEndDate?.toISOString?.() || null,
      promotionPriority: s.promotionPriority || 0,
      rating: 0,
      reviewsCount: 0,
      createdAt: s.createdAt?.toISOString?.() || s.createdAt.toString(),
      images: parseImages(s.images),
      features: parseFeatures(s.features),
      commission: 8, // عمولة افتراضية
      user: {
        ...s.users,
        rating: s.users?.rating || 0,
        totalReviews: s.users?.totalReviews || 0,
      },
    }));

    res.setHeader('Cache-Control', 'private, max-age=0, no-cache, no-store');
    return res.status(200).json({
      success: true,
      data: services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[API /transport/services] error:', error);
    return res
      .status(200)
      .json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
  }
}
