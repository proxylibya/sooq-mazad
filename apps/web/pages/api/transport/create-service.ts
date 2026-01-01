import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { isTransportOwner } from '../../../utils/accountTypeUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // استخراج التوكن من الهيدر
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'رمز المصادقة مطلوب' });
    }
    const token = authHeader.substring(7);
    let decoded: JwtPayload & { userId?: string; id?: string; };
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      decoded = jwt.verify(token, secret) as JwtPayload & { userId?: string; id?: string; };
    } catch (error) {
      return res.status(401).json({ success: false, error: 'رمز المصادقة غير صحيح' });
    }

    // استخدام userId أو id من التوكن
    const tokenUserId = decoded.userId || decoded.id;
    if (!tokenUserId) {
      return res.status(401).json({ success: false, error: 'رمز المصادقة لا يحتوي على معرف المستخدم' });
    }

    // التحقق من نوع الحساب
    const user = await prisma.users.findUnique({
      where: { id: tokenUserId },
      select: { accountType: true, verified: true },
    });

    if (!user || !isTransportOwner(user.accountType)) {
      return res.status(403).json({
        success: false,
        error: 'هذه الخدمة متاحة فقط لحسابات خدمات النقل',
      });
    }

    // استقبال بيانات الخدمة
    const {
      title,
      description,
      truckType,
      capacity,
      serviceArea,
      pricePerKm,
      availableDays,
      contactPhone,
      images,
      features,
      commission,
      promotionPackage,
      promotionDays,
    } = req.body;

    // تحقق من الحقول الأساسية
    if (!title || !description || !truckType || !capacity || !serviceArea || !contactPhone) {
      return res.status(400).json({ success: false, error: 'الحقول الأساسية مطلوبة' });
    }

    // معالجة الصور
    let processedImages = '';
    if (images) {
      if (Array.isArray(images)) {
        // إذا كانت مصفوفة من URLs
        processedImages = images.filter((img) => img && img.trim()).join(',');
      } else if (typeof images === 'string') {
        // إذا كانت نص مفصول بفواصل
        processedImages = images.trim();
      }
    }

    console.log('معالجة الصور:', {
      originalImages: images,
      processedImages,
      isArray: Array.isArray(images),
      type: typeof images,
    });

    // حساب تواريخ الترويج إذا تم اختيار باقة
    let promotionStartDate = null;
    let promotionEndDate = null;
    let promotionPriority = 0;
    const selectedPackage = promotionPackage || 'free';
    const selectedDays = promotionDays ? Number(promotionDays) : 0;

    if (selectedPackage !== 'free' && selectedDays > 0) {
      promotionStartDate = new Date();
      promotionEndDate = new Date();
      promotionEndDate.setDate(promotionEndDate.getDate() + selectedDays);

      // تحديد الأولوية حسب الباقة (نفس باقات المزادات)
      const priorityMap: Record<string, number> = {
        'vip': 100,
        'premium': 75,
        'basic': 50,
        'free': 0,
      };
      promotionPriority = priorityMap[selectedPackage] || 0;
    }

    // إنشاء الخدمة
    const newService = await prisma.transport_services.create({
      data: {
        id: `ts_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
        userId: tokenUserId,
        title,
        description,
        truckType,
        capacity: Number(capacity),
        serviceArea: Array.isArray(serviceArea) ? serviceArea.join(',') : serviceArea,
        pricePerKm: pricePerKm === '' ? null : Number(pricePerKm),
        availableDays: Array.isArray(availableDays) ? availableDays.join(',') : availableDays || '',
        contactPhone,
        images: processedImages,
        features: Array.isArray(features) ? features.join(',') : features || '',
        commission: commission ? Number(commission) : 1,
        status: 'ACTIVE',
        featured: selectedPackage !== 'free',
        promotionPackage: selectedPackage,
        promotionDays: selectedDays,
        promotionStartDate,
        promotionEndDate,
        promotionPriority,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
            verified: true,
            profileImage: true,
            accountType: true,
          },
        },
      },
    });

    console.log('✅ [create-service] خدمة جديدة تم إنشاؤها:', {
      id: newService.id,
      title: newService.title,
      status: newService.status,
      userId: newService.userId,
    });

    return res.status(201).json({
      success: true,
      id: newService.id,
      service: newService
    });
  } catch (error) {
    console.error('خطأ في إنشاء خدمة النقل:', error);
    return res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  } finally {
    // نستخدم Prisma Singleton، لا نقوم بالإغلاق هنا
  }
}
