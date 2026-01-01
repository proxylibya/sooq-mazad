import { NextApiRequest, NextApiResponse } from 'next';

interface UpdateProfileRequest {
  userId: string;
  field: string;
  value: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateProfileResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { userId, field, value }: UpdateProfileRequest = req.body;

    // التحقق من صحة البيانات
    if (!userId || !field || !value) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة',
      });
    }

    // قائمة الحقول المسموح تعديلها
    const allowedFields = ['name', 'email', 'phone', 'city'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'هذا الحقل غير قابل للتعديل',
      });
    }

    // التحقق من صحة البيانات حسب نوع الحقل
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني غير صحيح',
        });
      }
    }

    if (field === 'phone') {
      // دعم جميع أنواع الأرقام الليبية: 091, 92, 093, 094, 095 إلخ
      const cleanPhone = value.replace(/\s/g, '');
      const isValidLibyanPhone =
        /^09[0-9]{8}$/.test(cleanPhone) || // 0912345678, 0923456789
        /^9[0-9]{8}$/.test(cleanPhone) || // 912345678, 923456789
        /^21809[0-9]{8}$/.test(cleanPhone) || // 218912345678
        /^\+21809[0-9]{8}$/.test(cleanPhone); // +218912345678

      if (!isValidLibyanPhone) {
        return res.status(400).json({
          success: false,
          message: 'يرجى إدخال رقم هاتف ليبي صحيح (مثال: 0912345678، 0923456789)',
        });
      }
    }

    if (field === 'name') {
      if (value.length < 2 || value.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'الاسم يجب أن يكون بين 2 و 50 حرف',
        });
      }
    }

    // محاكاة تحديث قاعدة البيانات

    // في التطبيق الحقيقي، ستقوم بتحديث قاعدة البيانات
    // const updatedUser = await User.findByIdAndUpdate(
    //   userId,
    //   { [field]: value },
    //   { new: true }
    // );

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // إذا كان البريد الإلكتروني، أرسل رسالة تأكيد
    if (field === 'email') {
      // محاكاة إرسال رسالة تأكيد
    }

    // إذا كان رقم الهاتف، أرسل رمز تحقق
    if (field === 'phone') {
      // محاكاة إرسال رمز تحقق
    }

    return res.status(200).json({
      success: true,
      message: 'تم تحديث المعلومات بنجاح',
      data: {
        field,
        value,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
    });
  }
}
