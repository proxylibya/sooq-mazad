import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface UserListResponse {
  success: boolean;
  data?: {
    regularUsers: any[];
    transportOwners: any[];
    totalUsers: number;
  };
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<UserListResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // جلب جميع المستخدمين مع تصنيفهم حسب نوع الحساب
    const regularUsers = await prisma.users.findMany({
      where: {
        accountType: 'REGULAR_USER',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        accountType: true,
        verified: true,
        createdAt: true,
        wallets: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transportOwners = await prisma.users.findMany({
      where: {
        accountType: 'TRANSPORT_OWNER',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        accountType: true,
        verified: true,
        createdAt: true,
        wallets: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalUsers = regularUsers.length + transportOwners.length;

    return res.status(200).json({
      success: true,
      data: {
        regularUsers,
        transportOwners,
        totalUsers,
      },
    });
  } catch (error) {
    console.error('خطأ في جلب قائمة المستخدمين:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب قائمة المستخدمين',
    });
  }
}
