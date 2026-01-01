import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/prisma';
import { convertToWesternNumeralsOnly } from '../../../utils/westernNumeralsOnly';

interface SearchResponse {
  success: boolean;
  data?: any[];
  error?: string;
  total?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SearchResponse>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: 'طريقة غير مدعومة',
    });
  }

  try {
    const { q, exclude, limit = '20', accountType } = req.query;

    // التحقق من وجود مصطلح البحث (السماح بحرف واحد على الأقل للبحث)
    if (!q || typeof q !== 'string' || q.trim().length < 1) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const rawQ = convertToWesternNumeralsOnly(String(q));
    const searchTerm = rawQ.trim();
    const limitNum = parseInt(limit as string) || 20;
    const excludeUserId = exclude as string;

    // توليد صيغ بحث متعددة لرقم الهاتف (091 / 91 / 21891 / +21891)
    const digits = searchTerm.replace(/[^\d]/g, '');
    const phoneVariants = buildPhoneQueryVariants(digits);

    // البحث في المستخدمين
    const users = await searchUsers(searchTerm, excludeUserId, limitNum, accountType as string, phoneVariants);

    return res.status(200).json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error('خطأ في البحث عن المستخدمين:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

function buildPhoneQueryVariants(d: string): string[] {
  const variants = new Set<string>();
  if (!d) return [];
  variants.add(d);
  const noZeros = d.replace(/^0+/, '');
  if (noZeros) variants.add(noZeros);
  if (d.startsWith('218')) {
    const after = d.slice(3);
    variants.add(after);
    const afterNoZero = after.replace(/^0+/, '');
    if (afterNoZero) variants.add(afterNoZero);
  } else {
    if (noZeros) variants.add('218' + noZeros);
  }
  // صيغ إضافية شائعة
  Array.from([...variants]).forEach((v) => {
    if (v && !v.startsWith('+218')) variants.add('+218' + (v.startsWith('218') ? v.slice(3) : v));
    if (v && !v.startsWith('0')) variants.add('0' + v);
  });
  return Array.from(variants);
}

async function searchUsers(
  searchTerm: string,
  excludeUserId?: string,
  limit: number = 20,
  accountType?: string,
  phoneVariants: string[] = [],
) {
  try {
    // بناء شروط البحث
    const nameOrConditions: any[] = [
      {
        name: {
          startsWith: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ];

    const phoneOrConditions: any[] = [
      {
        phone: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ];

    // إضافة صيغ الأرقام المتعددة
    const dedup = new Set<string>();
    phoneVariants.forEach((v) => {
      const vv = String(v || '').trim();
      if (!vv) return;
      if (dedup.has(vv)) return;
      dedup.add(vv);
      phoneOrConditions.push({ phone: { contains: vv, mode: 'insensitive' } });
    });

    const whereConditions: any = {
      AND: [
        {
          OR: [
            ...nameOrConditions,
            ...phoneOrConditions,
            { id: searchTerm },
          ],
        },
        {
          status: 'ACTIVE', // فقط المستخدمين النشطين
        },
        {
          isDeleted: { not: true }, // استبعاد المحذوفين
        },
      ],
    };

    // استبعاد مستخدم معين
    if (excludeUserId) {
      whereConditions.AND.push({
        id: {
          not: excludeUserId,
        },
      });
    }

    // فلترة حسب نوع الحساب
    if (accountType && accountType !== 'all') {
      whereConditions.AND.push({
        accountType: accountType.toUpperCase(),
      });
    }

    const users = await dbHelpers.searchUsers(whereConditions, limit);

    // تنسيق النتائج
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      profileImage: user.profileImage,
      verified: user.verified,
      accountType: user.accountType,
      createdAt: user.createdAt,
    }));

    return formattedUsers;
  } catch (error) {
    console.error('خطأ في البحث في قاعدة البيانات:', error);
    throw error;
  }
}
