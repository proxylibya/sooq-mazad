import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface MadarTopupRequest {
  userId: string;
  cardNumber: string;
  provider: 'MADAR';
}

interface MadarTopupResponse {
  success: boolean;
  message: string;
  data?: {
    amount: number;
    currency: string;
    transactionId: string;
    newBalance: number;
  };
  error?: string;
}

// محاكاة قاعدة بيانات كروت المدار للاختبار
const mockMadarCards = [
  { number: '1234567890123456', amount: 50 },
  { number: '2345678901234567', amount: 100 },
  { number: '3456789012345678', amount: 30 },
  { number: '4567890123456789', amount: 20 },
  { number: '5678901234567890', amount: 10 },
  { number: '1111222233334444', amount: 75 },
  { number: '5555666677778888', amount: 25 },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MadarTopupResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is allowed',
    });
  }

  try {
    const { userId, cardNumber, provider }: MadarTopupRequest = req.body;

    // التحقق من صحة البيانات
    if (!userId || !cardNumber || provider !== 'MADAR') {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير مكتملة',
        error: 'جميع الحقول مطلوبة',
      });
    }

    // التحقق من وجود المستخدم
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
        error: 'User not found',
      });
    }

    // تنظيف رقم الكرت
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    // التحقق من صحة الكرت (محاكاة)
    const cardData = mockMadarCards.find((card) => card.number === cleanCardNumber);

    if (!cardData) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الكرت غير صحيحة',
        error: 'رقم الكرت غير صحيح أو تم استخدامه مسبقاً',
      });
    }

    // البحث عن المحفظة المحلية أو إنشاؤها
    let wallet = await prisma.wallets.findFirst({
      where: {
        userId: userId,
        currency: 'LYD',
      },
    });

    if (!wallet) {
      wallet = await prisma.wallets.create({
        data: {
          userId: userId,
          balance: 0,
          currency: 'LYD',
        },
      });
    }

    // تحديث رصيد المحفظة
    const newBalance = wallet.balance + cardData.amount;

    await prisma.wallets.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    // إنشاء سجل المعاملة
    const transactionId = `MADAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await prisma.transactions.create({
      data: {
        id: transactionId,
        userId: userId,
        type: 'TOPUP',
        amount: cardData.amount,
        currency: 'LYD',
        status: 'COMPLETED',
        description: `تعبئة من كرت المدار`,
        metadata: {
          provider: 'MADAR',
          cardLastFour: cleanCardNumber.slice(-4),
          processingTime: 'instant',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // إنشاء إشعار للمستخدم
    try {
      await prisma.notifications.create({
        data: {
          userId: userId,
          title: 'تم شحن المحفظة بنجاح',
          message: `تم إضافة ${cardData.amount} د.ل إلى محفظتك المحلية من كرت المدار`,
          type: 'WALLET_TOPUP',
          isRead: false,
          createdAt: new Date(),
        },
      });
    } catch (notificationError) {
      // تم إزالة console.log لأسباب أمنية - يجب استخدام نظام logging آمن
    }

    return res.status(200).json({
      success: true,
      message: 'تم شحن المحفظة بنجاح',
      data: {
        amount: cardData.amount,
        currency: 'LYD',
        transactionId,
        newBalance,
      },
    });
  } catch (error) {
    // تم إزالة console.error لأسباب أمنية - معلومات حساسة
    return res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: 'حدث خطأ غير متوقع أثناء معالجة الطلب',
    });
  } finally {
    await prisma.$disconnect();
  }
}

// دالة مساعدة للتحقق من صحة رقم الكرت
function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{12,16}$/.test(cleaned);
}

// دالة مساعدة للتحقق من صحة الرقم السري
function validatePinCode(pinCode: string): boolean {
  return /^\d{4,8}$/.test(pinCode);
}
