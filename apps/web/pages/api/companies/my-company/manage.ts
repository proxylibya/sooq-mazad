import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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
    const existingCompany = await prisma.companies.findFirst({
      where: { ownerId: user.id },
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        error: 'لم يتم العثور على شركة مرتبطة بحسابك',
      });
    }

    if (req.method === 'PUT') {
      // تحديث بيانات الشركة
      const body = req.body || {};

      const updateData: any = {};

      // الحقول القابلة للتحديث
      if (body.name && String(body.name).trim()) {
        updateData.name = String(body.name).trim();
      }
      if (body.description !== undefined) {
        updateData.description = body.description ? String(body.description).trim() : null;
      }
      if (body.phone !== undefined) {
        updateData.phone = body.phone ? String(body.phone).trim() : null;
      }
      if (body.email !== undefined) {
        updateData.email = body.email ? String(body.email).trim() : null;
      }
      if (body.website !== undefined) {
        updateData.website = body.website ? String(body.website).trim() : null;
      }
      if (body.city && String(body.city).trim()) {
        updateData.city = String(body.city).trim();
      }
      if (body.area !== undefined) {
        updateData.area = body.area ? String(body.area).trim() : null;
      }
      if (body.address !== undefined) {
        updateData.address = body.address ? String(body.address).trim() : null;
      }
      if (Array.isArray(body.businessType)) {
        updateData.businessType = body.businessType.map((s: any) => String(s));
      }
      if (Array.isArray(body.specialties)) {
        updateData.specialties = body.specialties.map((s: any) => String(s));
      }
      if (body.openingHours !== undefined) {
        updateData.openingHours = body.openingHours ? String(body.openingHours).trim() : null;
      }
      if (body.establishedYear !== undefined) {
        updateData.establishedYear = body.establishedYear ? Number(body.establishedYear) : null;
      }
      if (body.licenseNumber !== undefined) {
        updateData.licenseNumber = body.licenseNumber ? String(body.licenseNumber).trim() : null;
      }
      if (body.taxNumber !== undefined) {
        updateData.taxNumber = body.taxNumber ? String(body.taxNumber).trim() : null;
      }

      updateData.updatedAt = new Date();

      const updatedCompany = await prisma.companies.update({
        where: { id: existingCompany.id },
        data: updateData,
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

      return res.status(200).json({
        success: true,
        message: 'تم تحديث بيانات الشركة بنجاح',
        company: updatedCompany,
      });
    }

    if (req.method === 'DELETE') {
      // حذف الشركة
      await prisma.companies.delete({
        where: { id: existingCompany.id },
      });

      return res.status(200).json({
        success: true,
        message: 'تم حذف الشركة بنجاح',
      });
    }

    if (req.method === 'POST') {
      // تعليق الشركة (تغيير الحالة إلى معلق)
      const updatedCompany = await prisma.companies.update({
        where: { id: existingCompany.id },
        data: {
          status: 'SUSPENDED',
          updatedAt: new Date(),
        },
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

      return res.status(200).json({
        success: true,
        message: 'تم تعليق الشركة مؤقتاً',
        company: updatedCompany,
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error: any) {
    console.error('خطأ في إدارة الشركة:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      details: error.message,
    });
  }
}
