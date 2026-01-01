/**
 * أدوات معالجة أرقام الهواتف - نظام مرن يدعم الدول العربية
 */

export interface PhoneProcessingResult {
  isValid: boolean;
  cleanNumber: string; // الرقم الوطني بدون أصفار بادئة
  fullNumber: string; // رقم E.164 مثل +2189xxxxxxx
  displayNumber: string; // رقم مناسب للعرض (عادة 0 + الرقم الوطني)
  error?: string;
}

// خريطة أنماط التحقق حسب رمز الاتصال الدولي (E.164)
const phonePatternsByDialCode: { [dial: string]: RegExp[] } = {
  '+218': [/^(91|92|93|94|95)[0-9]{7}$/], // ليبيا
  '+20': [/^(10|11|12|15)[0-9]{8}$/], // مصر
  '+966': [/^[5][0-9]{8}$/], // السعودية
  '+971': [/^[5][0-9]{8}$/], // الإمارات
  '+974': [/^[3567][0-9]{7}$/], // قطر
  '+965': [/^[569][0-9]{7}$/], // الكويت
  '+973': [/^[1-9][0-9]{7}$/], // البحرين
  '+968': [/^[79][0-9]{7}$/], // عُمان
  '+962': [/^[7][0-9]{8}$/], // الأردن
  '+961': [/^[13-9][0-9]{6,7}$/], // لبنان
  '+963': [/^[9][0-9]{8}$/], // سوريا
  '+964': [/^[7][0-9]{9}$/], // العراق
  '+212': [/^[5-7][0-9]{8}$/], // المغرب
  '+213': [/^[5-7][0-9]{8}$/], // الجزائر
  '+216': [/^[2-9][0-9]{7}$/], // تونس
  '+249': [/^[9][0-9]{8}$/], // السودان
  '+967': [/^[7][0-9]{8}$/], // اليمن
  '+970': [/^[5][0-9]{8}$/], // فلسطين
  '+222': [/^[0-9]{8}$/], // موريتانيا
  '+252': [/^[6][0-9]{7}$/], // الصومال
  '+253': [/^[0-9]{8}$/], // جيبوتي
  '+269': [/^[0-9]{7}$/], // جزر القمر
};

// أسماء عربية مبسطة للعرض في رسائل الأخطاء
const countryNameByDial: { [dial: string]: string } = {
  '+218': 'ليبيا',
  '+20': 'مصر',
  '+966': 'السعودية',
  '+971': 'الإمارات',
  '+974': 'قطر',
  '+965': 'الكويت',
  '+973': 'البحرين',
  '+968': 'عُمان',
  '+962': 'الأردن',
  '+961': 'لبنان',
  '+963': 'سوريا',
  '+964': 'العراق',
  '+212': 'المغرب',
  '+213': 'الجزائر',
  '+216': 'تونس',
  '+249': 'السودان',
  '+967': 'اليمن',
  '+970': 'فلسطين',
  '+222': 'موريتانيا',
  '+252': 'الصومال',
  '+253': 'جيبوتي',
  '+269': 'جزر القمر',
};

// إنشاء قوائم مساعدة لاكتشاف رمز الدولة سواء مع "+" أو بدونه
const allDials = Object.keys(phonePatternsByDialCode).sort((a, b) => b.length - a.length); // الأطول أولاً
const allDialNumbers = allDials.map((d) => d.replace('+', ''));

/**
 * معالجة رقم الهاتف بمرونة كاملة ودعم عدة دول عربية
 * إذا لم يبدأ الرقم بـ "+" سيتم الافتراض على ليبيا (+218)
 */
export function processPhoneNumber(input: string): PhoneProcessingResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      cleanNumber: '',
      fullNumber: '',
      displayNumber: '',
      error: 'يرجى إدخال رقم الهاتف',
    };
  }

  // إزالة كل شيء عدا الأرقام و+
  let cleaned = input.trim().replace(/[^\d+]/g, '');
  // دعم بادئة 00 كبديل لعلامة + (أرقام دولية شائعة مثل 00218...)
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }
  // إزالة + الزائدة إن وجدت في الوسط
  cleaned = cleaned.replace(/(?!^)\+/g, '');

  if (!cleaned || cleaned.replace(/\+/g, '').length === 0) {
    return {
      isValid: false,
      cleanNumber: '',
      fullNumber: '',
      displayNumber: '',
      error: 'يرجى إدخال رقم الهاتف',
    };
  }

  // فصل رمز الدولة والرقم الوطني
  const withoutPlus = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;

  // محاولة اكتشاف رمز الدولة من البداية (حتى لو لم يكن هناك +)
  let detectedDial = '';
  for (const dialNum of allDialNumbers) {
    if (withoutPlus.startsWith(dialNum)) {
      detectedDial = '+' + dialNum;
      break;
    }
  }

  let nationalRaw: string;
  let dialCode: string;

  if (detectedDial) {
    dialCode = detectedDial;
    // إزالة رمز الدولة من الرقم (بدون +)
    const dialWithoutPlus = detectedDial.substring(1); // مثلاً "218"
    nationalRaw = withoutPlus.slice(dialWithoutPlus.length);
  } else {
    // لم يتم اكتشاف رمز بلد معروف، نفترض ليبيا كافتراضي
    dialCode = '+218';
    nationalRaw = withoutPlus;
  }

  // إزالة الأصفار البادئة
  const national = nationalRaw.replace(/^0+/, '');

  // التحقق بالأنماط حسب الدولة
  const patterns = phonePatternsByDialCode[dialCode];
  if (!patterns) {
    return {
      isValid: false,
      cleanNumber: national,
      fullNumber: '',
      displayNumber: national,
      error: 'رمز دولة غير مدعوم',
    };
  }

  const isValid = patterns.some((re) => re.test(national));
  if (!isValid) {
    return {
      isValid: false,
      cleanNumber: national,
      fullNumber: '',
      displayNumber: national,
      error: `رقم الهاتف ${countryNameByDial[dialCode] || ''} غير صحيح`,
    };
  }

  const fullNumber = `${dialCode}${national}`;
  const displayNumber = `0${national}`; // عرض محلي مألوف

  return {
    isValid: true,
    cleanNumber: national,
    fullNumber,
    displayNumber,
  };
}

/**
 * تنسيق رقم الهاتف للعرض
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
  const result = processPhoneNumber(phoneNumber);
  return result.isValid ? result.displayNumber : phoneNumber;
}

/**
 * الحصول على الرقم الكامل مع رمز البلد
 */
export function getFullPhoneNumber(phoneNumber: string): string {
  const result = processPhoneNumber(phoneNumber);
  return result.isValid ? result.fullNumber : '';
}

/**
 * التحقق من صحة رقم الهاتف فقط
 */
export function isValidLibyanPhone(phoneNumber: string): boolean {
  const result = processPhoneNumber(phoneNumber);
  return result.isValid && result.fullNumber.startsWith('+218');
}

/**
 * تنسيق رقم الهاتف الليبي لعرض مفتاح شركة الاتصالات مع XXXXX
 * مثال: +218912345678 → 092xxxxxxx
 */
export function formatLibyanPhoneForDisplay(phoneNumber?: string): string {
  if (!phoneNumber) return '092xxxxxxx';
  
  const result = processPhoneNumber(phoneNumber);
  
  if (!result.isValid || !result.fullNumber.startsWith('+218')) {
    return '092xxxxxxx';
  }
  
  // استخراج الرقم الوطني (بدون رمز البلد)
  const national = result.cleanNumber;
  
  if (national.length >= 2) {
    // استخراج مفتاح شركة الاتصالات (أول رقمين + 0)
    const prefix = '0' + national.substring(0, 2);
    return `${prefix}xxxxxxx`;
  }
  
  return '092xxxxxxx'; // افتراضي
}
  
/**
 * إخفاء رقم الهاتف الليبي بإظهار أول 7 أرقام ثم xxx
 * أمثلة: 0915214xxx, 0928783xxx
 */
export function maskLibyanPhoneFirst7Xxx(phoneNumber?: string): string {
  if (!phoneNumber) return '092xxxxxxx';

  const result = processPhoneNumber(phoneNumber);

  if (result.isValid && result.fullNumber.startsWith('+218')) {
    const display = result.displayNumber; // "0" + الرقم الوطني
    const digits = display.replace(/\D/g, '');
    if (digits.length >= 7) {
      return digits.slice(0, 7) + 'xxx';
    }
  }

  // محاولة تنظيف بسيطة إذا لم يتم التحقق
  const raw = String(phoneNumber);
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('218')) digits = digits.slice(3);
  if (!digits.startsWith('0')) digits = '0' + digits; // تحويل للعرض المحلي
  const clean = digits.replace(/\D/g, '');
  if (clean.length >= 7) {
    return clean.slice(0, 7) + 'xxx';
  }
  return '092xxxxxxx';
}
  
  /**
   * قائمة بأنماط الأرقام الليبية المقبولة للاختبار
   */
export const LIBYAN_PHONE_PATTERNS = [
  // بدون رمز البلد
  '912345678',
  '923456789',
  '934567890',
  '956789012',
  '967890123',
  '978901234',
  '989012345',
  '990123456',
  '901234567',
  '926183185',

  // مع الصفر
  '0912345678',
  '0923456789',
  '0934567890',
  '0945678901',
  '0956789012',
  '0967890123',
  '0978901234',
  '0989012345',
  '0990123456',
  '0901234567',
  '0926183185',

  // مع رمز البلد
  '218912345678',
  '218923456789',
  '218934567890',
  '218945678901',
  '218956789012',
  '218967890123',
  '218978901234',
  '218989012345',
  '218990123456',
  '218901234567',
  '218926183185',

  // مع + ورمز البلد
  '+218912345678',
  '+218923456789',
  '+218934567890',
  '+218945678901',
  '+218956789012',
  '+218967890123',
  '+218978901234',
  '+218989012345',
  '+218990123456',
  '+218901234567',
  '+218926183185',
];

/**
 * اختبار جميع أنماط الأرقام
 */
export function testPhonePatterns(): void {
  if (process.env.NODE_ENV !== 'development') {
    console.log('اختبار أنماط أرقام الهواتف الليبية:');

    LIBYAN_PHONE_PATTERNS.forEach((pattern) => {
      const result = processPhoneNumber(pattern);
      console.log(
        `${pattern} → ${result.isValid ? 'صحيح' : 'خطأ'} ${result.fullNumber || result.error}`,
      );
    });
  }
}
