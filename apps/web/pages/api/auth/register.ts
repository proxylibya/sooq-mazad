import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { UserValidation } from '../../../lib/database/userValidation';
import { prisma } from '../../../lib/prisma';
import { PhoneSystem } from '../../../utils/phone-system';
import { withApiRateLimit } from '../../../utils/rateLimiter';
import {
  validateCapacity,
  validateRegistrationForm,
  validateTruckNumber,
} from '../../../utils/validationUtils';

// استخدام عميل Prisma الموحد (Singleton)

interface TransportData {
  truckNumber: string;
  licenseCode: string;
  truckType: string;
  capacity: number;
  serviceArea: string;
  pricePerKm: number;
}

interface RegisterRequest {
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  accountType: 'REGULAR_USER' | 'TRANSPORT_OWNER' | 'COMPANY' | 'SHOWROOM';
  transportData?: TransportData;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    userId: string;
    phone: string;
    verificationRequired: boolean;
    verified?: boolean;
  };
}

// مساعدة بسيطة لإعادة المحاولة على أخطاء الاتصال العابرة
async function withDbRetry<T>(op: () => Promise<T>, label: string, tries = 2, delayMs = 250): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await op();
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      const msg = errMessage.toLowerCase();
      const retryable =
        msg.includes('connection') ||
        msg.includes('not available') ||
        msg.includes('denied') ||
        msg.includes('timeout') ||
        msg.includes('terminated');
      lastErr = err;
      if (!retryable || i === tries - 1) break;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`[DB] ${label} failed`);
}

/**
 * دالة تنظيف وتوحيد النصوص العربية
 * تحول النصوص لتكون متوافقة مع UTF-8
 */
function sanitizeArabicText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // إزالة الأحرف غير المرئية والتحكم
  let cleaned = text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // أحرف التحكم
    .replace(/\u200B/g, '') // Zero-width space
    .replace(/\u200C/g, '') // Zero-width non-joiner
    .replace(/\u200D/g, '') // Zero-width joiner
    .replace(/\uFEFF/g, '') // BOM
    .trim();

  // التأكد من أن النص UTF-8 صحيح
  try {
    // تحويل إلى Buffer ثم إعادته كـ UTF-8
    const buffer = Buffer.from(cleaned, 'utf8');
    cleaned = buffer.toString('utf8');
  } catch {
    // إذا فشل التحويل، استخدم النص الأصلي
  }

  return cleaned;
}

async function handler(req: NextApiRequest, res: NextApiResponse<RegisterResponse>) {
  // إعداد headers للترميز العربي الصحيح
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Accept-Charset', 'utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'الطريقة غير مسموحة',
    });
  }

  try {
    // التحقق من وجود البيانات في الطلب
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'لا توجد بيانات في الطلب',
      });
    }

    const { phone, firstName: rawFirstName, lastName: rawLastName, password, accountType, transportData }: RegisterRequest =
      req.body;

    // تنظيف وتوحيد الأسماء العربية
    const firstName = sanitizeArabicText(rawFirstName);
    const lastName = sanitizeArabicText(rawLastName);

    // التحقق من وجود الأسماء بعد التنظيف
    if (!firstName || firstName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'الاسم الأول يجب أن يكون حرفين على الأقل',
      });
    }

    if (!lastName || lastName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'اللقب يجب أن يكون حرفين على الأقل',
      });
    }

    // طباعة معلومات التشخيص في بيئة التطوير
    if (process.env.NODE_ENV === 'development') {
      console.log('[التحرير] طلب تسجيل جديد:', {
        phone: phone ? 'موجود' : 'غير موجود',
        firstName: firstName ? 'موجود' : 'غير موجود',
        lastName: lastName ? 'موجود' : 'غير موجود',
        password: password ? 'موجود' : 'غير موجود',
        accountType: accountType || 'غير محدد',
        hasTransportData: !!transportData,
      });
      console.log('[البحث] تفاصيل نوع الحساب:', {
        accountType,
        accountTypeType: typeof accountType,
        accountTypeLength: accountType?.length,
        accountTypeValue: JSON.stringify(accountType),
      });
    }

    // التحقق من صحة البيانات باستخدام نظام التحقق الجديد
    const validation = validateRegistrationForm({
      firstName,
      lastName,
      phone,
      password,
      confirmPassword: password, // في API، نفترض أن كلمة المرور مؤكدة
      accountType,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return res.status(400).json({
        success: false,
        error: firstError,
      });
    }

    // التحقق من صحة نوع الحساب
    if (!['REGULAR_USER', 'TRANSPORT_OWNER', 'COMPANY', 'SHOWROOM'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        error: 'نوع الحساب غير صحيح',
      });
    }

    // Admin/Moderator registration removed

    // معالجة رقم الهاتف - استخدام النظام الموحد PhoneSystem
    const phoneValidation = PhoneSystem.validate(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error || 'رقم الهاتف غير صحيح',
      });
    }

    // الرقم الموحد للحفظ في قاعدة البيانات
    const normalizedPhone = phoneValidation.normalizedPhone;

    // التحقق المحسن من عدم وجود المستخدم مسبقاً
    const duplicateCheck = await UserValidation.checkPhoneDuplicate(normalizedPhone);

    if (duplicateCheck.error) {
      return res.status(400).json({
        success: false,
        error: duplicateCheck.error,
      });
    }

    if (duplicateCheck.isDuplicate) {
      console.log(`[تحذير] محاولة تسجيل رقم موجود مسبقاً: ${normalizedPhone}`);
      return res.status(409).json({
        success: false,
        error: 'رقم الهاتف مسجل مسبقاً',
      });
    }

    // التحقق من قوة كلمة المرور (نظام موحد)
    const { quickPasswordCheck } = await import('../../../utils/passwordValidation');
    const passwordError = quickPasswordCheck(password, 6);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        error: passwordError,
      });
    }

    // تشفير كلمة المرور بدون pepper (متوافق مع نظام تسجيل الدخول الجديد)
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(`[تسجيل] معلومات التسجيل:`);
    console.log(`  - الرقم الموحد: ${normalizedPhone}`);
    console.log(`  - Hash: ${hashedPassword.substring(0, 30)}...`);

    // إنشاء المستخدم والمحفظة وكلمة المرور في معاملة واحدة
    const result = await withDbRetry(() => prisma.$transaction(async (tx) => {
      // التحقق من عدم وجود المستخدم مرة أخرى داخل المعاملة
      const existingUserInTransaction = await tx.users.findFirst({
        where: { phone: normalizedPhone },
      });

      if (existingUserInTransaction) {
        throw new Error('رقم الهاتف مسجل مسبقاً');
      }

      // إنشاء المستخدم - حفظ الاسم مباشرة بالعربية (PostgreSQL يدعم UTF-8)
      const user = await tx.users.create({
        data: {
          id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${firstName.trim()} ${lastName.trim()}`,
          phone: normalizedPhone, // استخدام الرقم الموحد من PhoneSystem
          role: 'USER',
          accountType: accountType,
          verified: true, // مُفعل مباشرة بدون التحقق من الهاتف
          updatedAt: new Date(),
        },
      });

      // إنشاء كلمة المرور
      await tx.user_passwords.create({
        data: {
          id: `pwd_${Date.now()}`,
          userId: user.id,
          hashedPassword: hashedPassword,
        },
      });

      // إنشاء محفظة للمستخدم مع المحافظ الفرعية
      const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      await tx.wallets.create({
        data: {
          id: walletId,
          userId: user.id,
          local_wallets: {
            create: {
              id: `local_${Date.now()}`,
              balance: 0.0,
              currency: 'LYD',
              updatedAt: now,
            },
          },
          global_wallets: {
            create: {
              id: `global_${Date.now()}`,
              balance: 0.0,
              currency: 'USD',
              updatedAt: now,
            },
          },
          crypto_wallets: {
            create: {
              id: `crypto_${Date.now()}`,
              balance: 0.0,
              currency: 'USDT-TRC20',
              network: 'TRC20',
              updatedAt: now,
            },
          },
        },
      });

      // إنشاء الكيان المرتبط حسب نوع الحساب
      if (accountType === 'SHOWROOM') {
        // إنشاء سجل معرض مبدئي مرتبط بالمستخدم - حفظ مباشر بالعربية
        await tx.showrooms.create({
          data: {
            id: `showroom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${firstName.trim()} ${lastName.trim()} - معرض`,
            description: 'بيانات أولية - يرجى استكمال الملف لاحقاً',
            vehicleTypes: 'سيارات',
            vehicleCount: '0-10',
            city: 'غير محدد',
            area: 'غير محدد',
            address: 'غير محدد',
            images: '[]',
            updatedAt: new Date(),
            users: { connect: { id: user.id } },
            // الحقول الأخرى لها قيم افتراضية في المخطط (status=PENDING, verified=false, ...)
          },
        });
      } else if (accountType === 'TRANSPORT_OWNER' && transportData) {
        // التحقق من البيانات الأساسية وإنشاء ملف نقل
        const tn = validateTruckNumber(transportData.truckNumber);
        if (!tn.isValid) {
          throw new Error(tn.error || 'رقم الساحبة غير صحيح');
        }
        const cap = validateCapacity(Number(transportData.capacity));
        if (!cap.isValid) {
          throw new Error(cap.error || 'السعة غير صحيحة');
        }

        const licenseCode = (transportData.licenseCode || '').toString().trim();
        const truckType = (transportData.truckType || '').toString().trim() || 'غير محدد';
        const serviceArea = (transportData.serviceArea || '').toString().trim() || 'غير محدد';
        const pricePerKm = Number(transportData.pricePerKm) || 0;

        if (licenseCode.length === 0) {
          // في حال عدم توفر كود الرخصة حالياً، نتخطى إنشاء الملف ليكمله المستخدم لاحقاً
          console.warn('[تسجيل نقل] تم تخطي إنشاء TransportProfile بسبب نقص licenseCode');
        } else {
          await tx.transport_profiles.create({
            data: {
              id: `transport_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              truckNumber: tn.value,
              licenseCode,
              truckType,
              capacity: cap.value,
              serviceArea,
              pricePerKm,
              updatedAt: new Date(),
              users: { connect: { id: user.id } },
            },
          });
        }
      }

      // إنشاء إشعار ترحيبي متوافق مع الواجهة
      try {
        const welcomeTitle = 'مرحباً بك!';
        let welcomeMessage = 'تم إنشاء حسابك بنجاح.';
        if (accountType === 'SHOWROOM') {
          welcomeMessage = 'تم إنشاء حساب المعرض بنجاح. أكمل بيانات المعرض لبدء النشر.';
        } else if (accountType === 'TRANSPORT_OWNER') {
          welcomeMessage = 'تم إنشاء حساب خدمة النقل بنجاح. أكمل ملف الشاحنة لبدء استقبال الطلبات.';
        } else if (accountType === 'COMPANY') {
          welcomeMessage = 'تم إنشاء حساب الشركة بنجاح.';
        }

        await tx.notifications.create({
          data: {
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.id,
            title: welcomeTitle,
            message: welcomeMessage,
            // نستخدم نوع INFO في Prisma، وسنطبّق mapping في الواجهة لاحقاً
            type: 'INFO',
            isRead: false,
            createdAt: new Date(),
          },
        });
      } catch (e) {
        // لا نفشل التسجيل بسبب إشعار ترحيبي
        console.warn('تحذير: فشل إنشاء إشعار ترحيبي:', e);
      }

      return user;
    }), '$transaction');

    // لا حاجة لرمز التحقق - الحساب مُفعل مباشرة
    console.log(`[تم بنجاح] تم إنشاء حساب جديد لـ ${normalizedPhone} وتم تفعيله مباشرة`);

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        userId: result.id,
        phone: normalizedPhone,
        verificationRequired: false,
        verified: true,
      },
    });
  } catch (error) {

    // تفاصيل أكثر للخطأ في بيئة التطوير
    let errorMessage = 'حدث خطأ داخلي في الخادم';
    let statusCode = 500;

    if (error instanceof Error) {
      console.error('تفاصيل الخطأ:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // التعامل مع أخطاء قاعدة البيانات المحددة
      if (error.message.includes('رقم الهاتف مسجل مسبقاً')) {
        errorMessage = 'رقم الهاتف مسجل مسبقاً';
        statusCode = 409;
      } else if (
        error.message.includes('UNIQUE constraint failed') ||
        error.message.includes('unique constraint')
      ) {
        errorMessage = 'رقم الهاتف مسجل مسبقاً';
        statusCode = 409;
      } else if (error.message.includes('WIN1252') || error.message.includes('encoding')) {
        console.error('[الأدوات] خطأ في الترميز:', error.message);
        errorMessage = 'خطأ في ترميز النصوص العربية. يرجى المحاولة مرة أخرى.';
        statusCode = 500;
      } else if (error.message.includes('character with byte sequence')) {
        console.error('[الأدوات] خطأ في تسلسل البايتات:', error.message);
        errorMessage = 'خطأ في معالجة النصوص العربية. يرجى التحقق من البيانات المدخلة.';
        statusCode = 400;
      } else if (error.message.includes('database') || error.message.includes('connection')) {
        errorMessage = 'خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى.';
        statusCode = 503;
      } else if (error.message.includes('validation')) {
        errorMessage = 'بيانات غير صحيحة. يرجى التحقق من المعلومات المدخلة.';
        statusCode = 400;
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'خطأ في العلاقات. يرجى المحاولة مرة أخرى.';
        statusCode = 400;
      }

      // في بيئة التطوير، أرسل تفاصيل الخطأ
      if (process.env.NODE_ENV === 'development') {
        errorMessage += ` (${error.message})`;
      }
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          originalError: error instanceof Error ? error.message : 'خطأ غير معروف',
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } finally {
    // لا نقوم بقطع الاتصال هنا لأننا نستخدم Prisma Singleton على مستوى التطبيق
  }
}
// استخدام config مباشر لتجنب مشاكل الاستيراد
export default withApiRateLimit(handler, { maxAttempts: 100, windowMs: 60 * 1000 });
