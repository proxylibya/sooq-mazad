import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

interface TransportProfileResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      name: string;
      phone: string;
      email: string;
      accountType: string;
      verified: boolean;
      createdAt: string;
    };
    transportProfile: {
      id: string;
      truckNumber: string;
      licenseCode: string;
      truckType: string;
      capacity: number;
      serviceArea: string;
      pricePerKm: number | null;
      priceType: string;
      isAvailable: boolean;
      verified: boolean;
      createdAt: string;
      updatedAt: string;
    };
    wallet: {
      id: string;
      balance: number;
      currency: string;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransportProfileResponse>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // استخراج التوكن من الهيدر
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة مطلوب',
      });
    }

    const token = authHeader.substring(7);

    // التحقق من صحة التوكن
    let decoded: JwtPayload & { userId?: string; id?: string; };
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      decoded = jwt.verify(token, secret) as JwtPayload & {
        userId?: string;
        id?: string;
      };
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة غير صحيح',
      });
    }

    // البحث عن المستخدم مع ملف النقل
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      include: {
        transport_profiles: true,
        wallet: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    // التحقق من أن المستخدم من نوع TRANSPORT_OWNER
    if (user.accountType !== 'TRANSPORT_OWNER') {
      return res.status(403).json({
        success: false,
        error: 'هذا الحساب ليس من نوع خدمة النقل',
      });
    }

    if (!user.transport_profiles) {
      return res.status(404).json({
        success: false,
        error: 'ملف النقل غير موجود',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          accountType: user.accountType,
          verified: user.verified,
          createdAt: user.createdAt.toISOString(),
        },
        transportProfile: {
          id: user.transport_profiles.id,
          truckNumber: user.transport_profiles.truckNumber,
          licenseCode: user.transport_profiles.licenseCode,
          truckType: user.transport_profiles.truckType,
          capacity: user.transport_profiles.capacity,
          serviceArea: user.transport_profiles.serviceArea,
          pricePerKm: user.transport_profiles.pricePerKm,
          priceType: user.transport_profiles.priceType,
          isAvailable: user.transport_profiles.isAvailable,
          verified: user.transport_profiles.verified,
          createdAt: user.transport_profiles.createdAt.toISOString(),
          updatedAt: user.transport_profiles.updatedAt.toISOString(),
        },
        wallet: {
          id: user.wallet?.id || '',
          balance: user.wallet?.balance || 0,
          currency: user.wallet?.currency || 'LYD',
        },
      },
    });
  } catch (error) {
    console.error('خطأ في جلب ملف النقل:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  } finally {
    // نستخدم Prisma Singleton من lib/prisma، لذا لا نغلق الاتصال هنا
  }
}
