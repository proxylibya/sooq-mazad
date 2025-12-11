import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { isTransportOwner } from '../../../utils/accountTypeUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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
      // استخدم نفس السر الافتراضي المستخدم في AuthSystem لضمان التوافق
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      decoded = jwt.verify(token, secret) as JwtPayload & {
        userId?: string;
        id?: string;
      };
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
      select: { id: true, accountType: true, verified: true, name: true, phone: true },
    });

    if (!user || !isTransportOwner(user.accountType)) {
      return res.status(403).json({
        success: false,
        error: 'هذه الخدمة متاحة فقط لحسابات خدمات النقل',
      });
    }

    console.log('[my-services] ═══════════════════════════════════════');
    console.log('[my-services] جلب خدمات المستخدم');
    console.log('[my-services] userId:', tokenUserId);
    console.log('[my-services] phone:', user.phone);
    console.log('[my-services] name:', user.name);

    // جلب خدمات النقل الخاصة بالمستخدم
    // البحث بـ userId فقط (الطريقة الصحيحة)
    const services = await prisma.transport_services.findMany({
      where: {
        userId: tokenUserId,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ [my-services] تم جلب ${services.length} خدمة`);

    // تسجيل تفاصيل الخدمات للتشخيص
    if (services.length > 0) {
      console.log('[my-services] الخدمات الموجودة:');
      services.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title} (ID: ${s.id}, Status: ${s.status})`);
      });
    } else {
      // فحص إذا كانت هناك خدمات في قاعدة البيانات عموماً
      const totalServices = await prisma.transport_services.count();
      console.log(`[my-services] ⚠️ لا توجد خدمات لهذا المستخدم`);
      console.log(`[my-services] إجمالي الخدمات في قاعدة البيانات: ${totalServices}`);

      // فحص آخر خدمة مضافة
      const lastService = await prisma.transport_services.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, userId: true, title: true, createdAt: true }
      });
      if (lastService) {
        console.log(`[my-services] آخر خدمة مضافة: ${lastService.title}`);
        console.log(`[my-services] userId الخدمة: ${lastService.userId}`);
        console.log(`[my-services] تطابق؟ ${lastService.userId === tokenUserId ? '✅ نعم' : '❌ لا'}`);
      }
    }

    // تحويل البيانات لتكون أكثر قابلية للاستخدام
    const formattedServices = services.map((service) => ({
      ...service,
      images: service.images ? service.images.split(',').filter(img => img.trim()) : [],
      features: service.features ? service.features.split(',').filter(f => f.trim()) : [],
      serviceArea: service.serviceArea ? service.serviceArea.split(',').filter(a => a.trim()) : [],
      availableDays: service.availableDays ? service.availableDays.split(',').filter(d => d.trim()) : [],
    }));

    return res.status(200).json({
      success: true,
      services: formattedServices,
      count: formattedServices.length,
      user: {
        name: user.name,
        phone: user.phone,
        verified: user.verified,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error('خطأ في جلب خدمات النقل:', error);
    return res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  } finally {
    // نستخدم Prisma Singleton، لا نقوم بالإغلاق هنا
  }
}
