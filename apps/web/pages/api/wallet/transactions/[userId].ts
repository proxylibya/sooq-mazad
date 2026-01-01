import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withApiRateLimit, RateLimitConfigs } from '../../../../utils/rateLimiter';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'طريقة غير مدعومة',
    });
  }

  try {
    const { userId } = req.query;
    const { walletType, page = '1', limit = '20', type, status, startDate, endDate } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم مطلوب',
        error: 'MISSING_USER_ID',
      });
    }

    // البحث عن المحفظة
    const wallet = await prisma.wallets.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'المحفظة غير موجودة',
        error: 'WALLET_NOT_FOUND',
      });
    }

    // بناء شروط البحث
    const whereConditions: Record<string, unknown> = {
      walletId: wallet.id,
    };

    if (walletType && typeof walletType === 'string') {
      whereConditions.walletType = walletType;
    }

    if (type && typeof type === 'string') {
      whereConditions.type = type;
    }

    if (status && typeof status === 'string') {
      whereConditions.status = status;
    }

    if (startDate && endDate) {
      whereConditions.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    // حساب الصفحات
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // جلب المعاملات
    const [transactions, totalCount] = await Promise.all([
      prisma.transactions.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber,
        include: {
          payment_method_configs: {
            select: {
              name: true,
              nameAr: true,
              type: true,
              icon: true,
            },
          },
        },
      }),
      prisma.transactions.count({
        where: whereConditions,
      }),
    ]);

    // تنسيق البيانات
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      currency: transaction.currency,
      walletType: transaction.walletType,
      description: transaction.description,
      reference: transaction.reference,
      fees: transaction.fees,
      originalAmount: transaction.originalAmount,
      originalCurrency: transaction.originalCurrency,
      blockchainTxHash: transaction.blockchainTxHash,
      confirmations: transaction.confirmations,
      networkFee: transaction.networkFee,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      completedAt: transaction.completedAt,
      paymentMethod: transaction.payment_method_configs
        ? {
            name:
              transaction.payment_method_configs.nameAr || transaction.payment_method_configs.name,
            type: transaction.payment_method_configs.type,
            icon: transaction.payment_method_configs.icon,
          }
        : null,
    }));

    // حساب الإحصائيات
    const stats = await prisma.transactions.groupBy({
      by: ['walletType', 'type', 'status'],
      where: { walletId: wallet.id },
      _sum: { amount: true },
      _count: true,
    });

    // تنظيم الإحصائيات
    const walletStats = {
      LOCAL: {
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingCount: 0,
        completedCount: 0,
      },
      GLOBAL: {
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingCount: 0,
        completedCount: 0,
      },
      CRYPTO: {
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingCount: 0,
        completedCount: 0,
      },
    };

    stats.forEach((stat) => {
      const walletType = stat.walletType as keyof typeof walletStats;
      if (walletStats[walletType]) {
        if (stat.type === 'DEPOSIT') {
          walletStats[walletType].totalDeposits += stat._sum.amount || 0;
        } else if (stat.type === 'WITHDRAWAL') {
          walletStats[walletType].totalWithdrawals += stat._sum.amount || 0;
        }

        if (stat.status === 'PENDING') {
          walletStats[walletType].pendingCount += stat._count;
        } else if (stat.status === 'COMPLETED') {
          walletStats[walletType].completedCount += stat._count;
        }
      }
    });

    // حساب معلومات الصفحات
    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    res.status(200).json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalCount,
          limit: limitNumber,
          hasNextPage,
          hasPreviousPage,
        },
        stats: walletStats,
        filters: {
          walletType: walletType || 'ALL',
          type: type || 'ALL',
          status: status || 'ALL',
          dateRange: startDate && endDate ? { startDate, endDate } : null,
        },
      },
    });
  } catch (error) {
    // تم إزالة console.error لأسباب أمنية

    res.status(500).json({
      success: false,
      message: 'حدث خطأ داخلي في الخادم',
      error: 'INTERNAL_SERVER_ERROR',
    });
  } finally {
    // Prisma Singleton: لا تقم بقطع الاتصال هنا
  }
}

export default withApiRateLimit(handler, RateLimitConfigs.API_GENERAL);
