import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { verifyToken } from '../../../middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // التحقق من المصادقة
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'يتطلب تسجيل دخول' });
    }

    // التحقق من نوع الحساب
    if (user.accountType !== 'COMPANY') {
      return res.status(403).json({
        success: false,
        error: 'هذه الخدمة متاحة فقط لحسابات الشركات',
      });
    }

    // البحث عن شركة المستخدم
    const company = await prisma.companies.findFirst({
      where: { ownerId: user.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            verified: true,
            accountType: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'لم يتم العثور على شركة مرتبطة بحسابك',
        hasCompany: false,
      });
    }

    return res.status(200).json({
      success: true,
      company,
      hasCompany: true,
    });
  } catch (error: any) {
    console.error('خطأ في جلب شركة المستخدم:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      details: error.message,
    });
  }
}
