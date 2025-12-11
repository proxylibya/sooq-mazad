import { prisma } from '@/lib/prisma';
import { decodeApiResponse } from '@/utils/universalNameDecoder';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = 1, limit = 10, search = '', accountType = '', verified = '' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // بناء شروط البحث
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (accountType) {
      where.accountType = accountType;
    }

    if (verified !== '') {
      where.verified = verified === 'true';
    }

    // جلب المستخدمين مع البيانات المرتبطة
    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      include: {
        wallet: {
          include: {
            localWallet: true,
            globalWallet: true,
            cryptoWallet: true,
          },
        },
        settings: {
          select: {
            profileName: true,
            profileBio: true,
            profileCity: true,
            profileAvatar: true,
            theme: true,
            timezone: true,
          },
        },
        transportProfile: {
          select: {
            truckNumber: true,
            truckType: true,
            capacity: true,
            serviceArea: true,
            verified: true,
          },
        },
        _count: {
          select: {
            cars: true,
            auctions: true,
            bids: true,
            messages: true,
            transportServices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // جلب العدد الإجمالي للمستخدمين
    const totalUsers = await prisma.user.count({ where });

    // تنسيق البيانات
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      accountType: user.accountType,
      verified: user.verified,
      status: user.status,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // بيانات المحفظة
      wallet: user.wallet
        ? {
            id: user.wallet.id,
            isActive: user.wallet.isActive,
            localBalance: user.wallet.localWallet?.balance || 0,
            globalBalance: user.wallet.globalWallet?.balance || 0,
            cryptoBalance: user.wallet.cryptoWallet?.balance || 0,
            totalBalance: {
              LYD: user.wallet.localWallet?.balance || 0,
              USD: user.wallet.globalWallet?.balance || 0,
              USDT: user.wallet.cryptoWallet?.balance || 0,
            },
          }
        : null,

      // الإعدادات الشخصية
      profile: user.settings
        ? {
            name: user.settings.profileName,
            bio: user.settings.profileBio,
            city: user.settings.profileCity,
            avatar: user.settings.profileAvatar,
            theme: user.settings.theme,
            timezone: user.settings.timezone,
          }
        : null,

      // بيانات النقل (إن وجدت)
      transport: user.transportProfile
        ? {
            truckNumber: user.transportProfile.truckNumber,
            truckType: user.transportProfile.truckType,
            capacity: user.transportProfile.capacity,
            serviceArea: user.transportProfile.serviceArea,
            verified: user.transportProfile.verified,
          }
        : null,

      // الإحصائيات
      stats: {
        cars: user._count.cars,
        auctions: user._count.auctions,
        bids: user._count.bids,
        messages: user._count.messages,
        transportServices: user._count.transportServices,
        totalActivity:
          user._count.cars + user._count.auctions + user._count.bids + user._count.messages,
      },
    }));

    // معلومات التصفح
    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / take),
      totalUsers,
      hasNextPage: skip + take < totalUsers,
      hasPrevPage: parseInt(page) > 1,
    };

    // فك تشفير جميع أسماء المستخدمين قبل الإرجاع
    const response = {
      success: true,
      data: formattedUsers,
      pagination,
      filters: {
        search,
        accountType,
        verified,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        recordsReturned: formattedUsers.length,
      },
    };

    const decodedResponse = decodeApiResponse(response);
    res.status(200).json(decodedResponse);
  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدمين:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب بيانات المستخدمين',
      details: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
}
