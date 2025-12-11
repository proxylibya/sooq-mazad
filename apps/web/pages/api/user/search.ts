import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

/**
 * API للبحث عن مستخدم بواسطة Public ID
 *
 * GET /api/user/search?publicId=603225
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { publicId } = req.query;

    // التحقق من وجود publicId
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'يجب تحديد المعرف العام (publicId)',
      });
    }

    // تحويل إلى رقم
    const publicIdNumber = Number(publicId);
    if (isNaN(publicIdNumber)) {
      return res.status(400).json({
        success: false,
        error: 'المعرف العام يجب أن يكون رقماً',
      });
    }

    // التحقق من النطاق الصحيح
    if (publicIdNumber < 100000 || publicIdNumber > 9999999) {
      return res.status(400).json({
        success: false,
        error: 'المعرف العام غير صالح',
      });
    }

    // البحث في قاعدة البيانات
    const user = await prisma.users.findUnique({
      where: { publicId: publicIdNumber },
      select: {
        id: true,
        publicId: true,
        name: true,
        profileImage: true,
        verified: true,
        rating: true,
        totalReviews: true,
        accountType: true,
        createdAt: true,
        // لا نرجع معلومات حساسة مثل phone, email
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'لم يتم العثور على مستخدم بهذا المعرف',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('❌ [API User Search] خطأ:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في البحث عن المستخدم',
    });
  }
}
