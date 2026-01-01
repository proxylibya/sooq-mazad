import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../lib/prisma';

interface UserSettings {
  profile: {
    name: string;
    phone: string;
    city: string;
    bio: string;
    avatar: string;
  };
  truckProfile?: {
    frontImage?: string;
    backImage?: string;
    sideImage?: string;
    interiorImage?: string;
    truckNumber?: string;
    licenseCode?: string;
    truckType?: string;
    capacity?: number;
    serviceArea?: string;
  };
  notifications: {
    smsNotifications: boolean;
    pushNotifications: boolean;
    auctionAlerts: boolean;
    bidUpdates: boolean;
    messageAlerts: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    numberFormat: 'western';
  };
}

// تم استبدال قاعدة البيانات الوهمية بقاعدة البيانات الحقيقية

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // التحقق من المصادقة - معطل مؤقتاً
    // const session = await getSession({ req });
    // if (!session || !session.user) {
    //   return res.status(401).json({
    //     success: false,
    //     error: 'غير مصرح لك بالوصول'
    //   });
    // }

    // استخدام معرف مستخدم من localStorage أو افتراضي
    const userId = (req.headers['user-id'] as string) || 'default-user';

    switch (req.method) {
      case 'GET':
        return await getSettings(req, res, userId);
      case 'PUT':
      case 'POST': // إضافة دعم لطريقة POST
        return await updateSettings(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('[فشل] خطأ في API الإعدادات:', error);
    console.error('[التقرير] تفاصيل الخطأ:', {
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
    });
  }
}

async function getSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    console.log('[الإحصائيات] معرف المستخدم من headers:', req.headers['user-id']);

    // جلب إعدادات المستخدم من قاعدة البيانات
    const settings = await dbHelpers.getUserSettings(userId);
    console.log('[تم بنجاح] تم جلب الإعدادات بنجاح:', settings ? 'موجود' : 'غير موجود');

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('[فشل] خطأ في جلب الإعدادات:', error);
    console.error('[التقرير] تفاصيل الخطأ:', {
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب الإعدادات',
    });
  }
}

async function updateSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        error: 'بيانات الإعدادات مطلوبة',
      });
    }

    // التحقق من صحة البيانات
    const validationResult = validateSettings(settings);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error,
      });
    }

    // تحديث الإعدادات في قاعدة البيانات
    const updatedSettings = await dbHelpers.updateUserSettings(userId, settings);

    return res.status(200).json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('خطأ في تحديث الإعدادات:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في حفظ الإعدادات',
    });
  }
}

function validateSettings(settings: Partial<UserSettings>): {
  isValid: boolean;
  error?: string;
} {
  try {
    // التحقق من البيانات الشخصية
    if (settings.profile) {
      if (settings.profile.name && settings.profile.name.length < 2) {
        return { isValid: false, error: 'الاسم يجب أن يكون أكثر من حرفين' };
      }

      if (settings.profile.phone && !isValidPhone(settings.profile.phone)) {
        return { isValid: false, error: 'رقم الهاتف غير صحيح' };
      }

      if (settings.profile.bio && settings.profile.bio.length > 500) {
        return {
          isValid: false,
          error: 'النبذة الشخصية يجب أن تكون أقل من 500 حرف',
        };
      }
    }


    // التحقق من التفضيلات
    if (settings.preferences) {
      if (
        settings.preferences.theme &&
        !['light', 'dark', 'auto'].includes(settings.preferences.theme)
      ) {
        return { isValid: false, error: 'المظهر المختار غير مدعوم' };
      }

      if (
        settings.preferences.numberFormat &&
        !['western'].includes(settings.preferences.numberFormat)
      ) {
        return { isValid: false, error: 'تنسيق الأرقام غير مدعوم' };
      }
    }


    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'خطأ في التحقق من البيانات' };
  }
}

function isValidPhone(phone: string): boolean {
  // دعم جميع أنواع الأرقام الليبية: 091, 92, 093, 094, 095 إلخ
  const cleanPhone = phone.replace(/\s/g, '');

  const isValidLibyanPhone =
    /^09[0-9]{8}$/.test(cleanPhone) || // 0912345678, 0923456789
    /^9[0-9]{8}$/.test(cleanPhone) || // 912345678, 923456789
    /^21809[0-9]{8}$/.test(cleanPhone) || // 218912345678
    /^\+21809[0-9]{8}$/.test(cleanPhone); // +218912345678

  // قبول الأرقام الدولية العامة أيضاً
  const internationalRegex = /^\+?[1-9]\d{1,14}$/;

  return isValidLibyanPhone || internationalRegex.test(cleanPhone);
}
