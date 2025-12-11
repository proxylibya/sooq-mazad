import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimitConfigs, withApiRateLimit } from '../../../../utils/rateLimiter';
import { formatWalletBalance, generateWalletQRData } from '../../../../utils/walletUtils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, network } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'طريقة غير مدعومة',
      error: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
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
      include: {
        local_wallets: true,
        global_wallets: true,
        crypto_wallets: true,
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
            verified: true,
          },
        },
      },
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'المحفظة غير موجودة',
        error: 'WALLET_NOT_FOUND',
      });
    }

    // الحصول على آخر المعاملات
    const recentTransactions = await prisma.transactions.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        currency: true,
        walletType: true,
        description: true,
        createdAt: true,
        reference: true,
        fees: true,
      },
    });

    // حساب الإحصائيات
    const stats = await prisma.transactions.groupBy({
      by: ['type', 'walletType'],
      where: {
        walletId: wallet.id,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // تنسيق البيانات
    const walletData = {
      id: wallet.id,
      userId: wallet.userId,
      isActive: wallet.isActive,
      user: wallet.users,

      // المحفظة المحلية
      local: wallet.local_wallets
        ? {
          id: wallet.local_wallets.id,
          balance: wallet.local_wallets.balance,
          currency: wallet.local_wallets.currency,
          formattedBalance: formatWalletBalance(
            wallet.local_wallets.balance,
            wallet.local_wallets.currency,
          ),
          isActive: wallet.local_wallets.isActive,
          features: ['تحويل بنكي محلي', 'تعبئة رصيد ليبيانا', 'تعبئة رصيد مدار', 'دعم فوري'],
          limits: {
            min: 10,
            max: 50000,
            daily: 10000,
            monthly: 100000,
          },
        }
        : null,

      // المحفظة العالمية
      global: wallet.global_wallets
        ? {
          id: wallet.global_wallets.id,
          balance: wallet.global_wallets.balance,
          currency: wallet.global_wallets.currency,
          formattedBalance: formatWalletBalance(
            wallet.global_wallets.balance,
            wallet.global_wallets.currency,
          ),
          isActive: wallet.global_wallets.isActive,
          features: ['PayPal', 'Payoneer', 'Wise', 'تحويل دولي'],
          limits: {
            min: 5,
            max: 10000,
            daily: 5000,
            monthly: 50000,
          },
        }
        : null,

      // المحفظة الرقمية
      crypto: wallet.crypto_wallets
        ? {
          id: wallet.crypto_wallets.id,
          balance: wallet.crypto_wallets.balance,
          currency: wallet.crypto_wallets.currency,
          formattedBalance: formatWalletBalance(
            wallet.crypto_wallets.balance,
            wallet.crypto_wallets.currency,
          ),
          // إذا تم طلب شبكة محددة ولم تكن هي النشطة، نعيد null للعنوان ليتم إنشاؤه
          address: (!network || (network as string).toUpperCase() === wallet.crypto_wallets.network)
            ? wallet.crypto_wallets.address
            : null,
          network: (!network || (network as string).toUpperCase() === wallet.crypto_wallets.network)
            ? wallet.crypto_wallets.network
            : (network as string).toUpperCase(),
          qrData: (!network || (network as string).toUpperCase() === wallet.crypto_wallets.network) && wallet.crypto_wallets.address
            ? generateWalletQRData(wallet.crypto_wallets.address)
            : null,
          isActive: wallet.crypto_wallets.isActive,
          features: ['إيداع فوري', 'رسوم منخفضة', 'أمان عالي', 'شفافية كاملة'],
          limits: {
            min: 10,
            max: 100000,
            daily: 50000,
            monthly: 500000,
          },
          confirmations: {
            required: 20,
            fast: 6,
          },
        }
        : null,

      // المعاملات الأخيرة
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        currency: tx.currency,
        walletType: tx.walletType,
        description: tx.description,
        reference: tx.reference,
        fees: tx.fees,
        date: tx.createdAt.toISOString().split('T')[0],
        time: tx.createdAt.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        formattedAmount: formatWalletBalance(tx.amount, tx.currency),
      })),

      // الإحصائيات
      stats: {
        local: {
          totalDeposits:
            stats.find((s) => s.type === 'DEPOSIT' && s.walletType === 'LOCAL')?._sum.amount || 0,
          totalWithdrawals:
            stats.find((s) => s.type === 'WITHDRAWAL' && s.walletType === 'LOCAL')?._sum.amount ||
            0,
          transactionCount: stats
            .filter((s) => s.walletType === 'LOCAL')
            .reduce((sum, s) => sum + s._count.id, 0),
        },
        global: {
          totalDeposits:
            stats.find((s) => s.type === 'DEPOSIT' && s.walletType === 'GLOBAL')?._sum.amount || 0,
          totalWithdrawals:
            stats.find((s) => s.type === 'WITHDRAWAL' && s.walletType === 'GLOBAL')?._sum.amount ||
            0,
          transactionCount: stats
            .filter((s) => s.walletType === 'GLOBAL')
            .reduce((sum, s) => sum + s._count.id, 0),
        },
        crypto: {
          totalDeposits:
            stats.find((s) => s.type === 'DEPOSIT' && s.walletType === 'CRYPTO')?._sum.amount || 0,
          totalWithdrawals:
            stats.find((s) => s.type === 'WITHDRAWAL' && s.walletType === 'CRYPTO')?._sum.amount ||
            0,
          transactionCount: stats
            .filter((s) => s.walletType === 'CRYPTO')
            .reduce((sum, s) => sum + s._count.id, 0),
        },
      },

      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'تم جلب بيانات المحفظة بنجاح',
      data: walletData,
    });
  } catch (error) {
    console.error('خطأ في API جلب بيانات المحفظة:', error);

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ داخلي في الخادم',
      error: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  } finally {
    // Prisma Singleton: لا تقم بقطع الاتصال هنا
  }
}

export default withApiRateLimit(handler, RateLimitConfigs.API_GENERAL);
