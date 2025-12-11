import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API للبحث عن محفظة بواسطة Public ID
 * GET /api/wallet/search?publicId=340567891
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { publicId } = req.query;
    const walletPublicId = Number(publicId);

    // التحقق من الصحة
    if (!walletPublicId || isNaN(walletPublicId)) {
      return res.status(400).json({
        success: false,
        message: 'رقم محفظة غير صالح'
      });
    }

    // التحقق من النطاق (300M - 399M)
    if (walletPublicId < 300000000 || walletPublicId >= 400000000) {
      return res.status(400).json({
        success: false,
        message: 'رقم المحفظة يجب أن يبدأ بـ 3'
      });
    }

    // البحث عن المحفظة
    const wallet = await prisma.wallets.findUnique({
      where: { publicId: walletPublicId },
      include: {
        users: {
          select: {
            id: true,
            publicId: true,
            name: true,
            profileImage: true,
            verified: true
          }
        },
        local_wallets: {
          select: {
            balance: true,
            currency: true
          }
        }
      }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'المحفظة غير موجودة'
      });
    }

    // إرجاع البيانات
    return res.status(200).json({
      success: true,
      wallet: {
        publicId: wallet.publicId,
        user: {
          publicId: wallet.users?.publicId,
          name: wallet.users?.name,
          profileImage: wallet.users?.profileImage,
          verified: wallet.users?.verified
        },
        balance: wallet.local_wallets?.balance || 0,
        currency: wallet.local_wallets?.currency || 'LYD'
      }
    });
  } catch (error) {
    console.error('خطأ في البحث عن المحفظة:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
}
