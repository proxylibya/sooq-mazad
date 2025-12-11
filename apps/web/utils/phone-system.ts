/**
 * نظام إدارة أرقام الهواتف الموحد
 * مصمم خصيصاً للأرقام الليبية مع دعم الأرقام العربية والدولية
 */

import type { PhoneValidationResult } from '../types/auth-unified';

// أرقام الدول العربية المدعومة
const SUPPORTED_COUNTRIES = [
  { code: '+218', name: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾', primary: true },
  { code: '+20', name: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: '+966', name: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', name: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪' },
  { code: '+974', name: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
  { code: '+965', name: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', name: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', name: 'عُمان', nameEn: 'Oman', flag: '🇴🇲' },
  { code: '+962', name: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: '+961', name: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧' },
  { code: '+963', name: 'سوريا', nameEn: 'Syria', flag: '🇸🇾' },
  { code: '+964', name: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { code: '+212', name: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: '+213', name: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
  { code: '+216', name: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' }
];

// أنماط الأرقام الليبية - شبكات المدار وليبيانا والأرقام الخاصة
export const LIBYA_PATTERNS = {
  // الموبايل: 091, 092, 093, 094, 095, 096, 097, 098, 099
  mobile: /^(9[0-9])\d{7}$/,
  landline: /^(21|22|23|24|25|31|32|41|51|54|61|63|71|72|73)\d{6}$/
};

export class PhoneSystem {

  /**
   * تنظيف وتوحيد رقم الهاتف
   */
  static normalize(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // إزالة جميع المسافات والرموز عدا + والأرقام
    let cleaned = phone.replace(/[^\d+]/g, '');

    // التعامل مع الأرقام العربية
    cleaned = this.convertArabicDigits(cleaned);

    // إضافة رمز ليبيا إذا لم يكن موجوداً
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('218')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('0')) {
        // إزالة الصفر الأول وإضافة رمز ليبيا
        cleaned = '+218' + cleaned.substring(1);
      } else if (cleaned.length >= 9) {
        // رقم محلي ليبي
        cleaned = '+218' + cleaned;
      }
    }

    return cleaned;
  }

  /**
   * التحقق من صحة رقم الهاتف
   */
  static validate(phone: string): PhoneValidationResult {
    const normalized = this.normalize(phone);

    if (!normalized) {
      return {
        isValid: false,
        normalizedPhone: '',
        displayPhone: '',
        countryCode: '',
        error: 'رقم الهاتف مطلوب'
      };
    }

    // التحقق من الطول العام
    if (normalized.length < 10 || normalized.length > 15) {
      return {
        isValid: false,
        normalizedPhone: normalized,
        displayPhone: this.formatForDisplay(normalized),
        countryCode: this.extractCountryCode(normalized),
        error: 'طول رقم الهاتف غير صحيح'
      };
    }

    // التحقق من رمز الدولة
    const countryCode = this.extractCountryCode(normalized);
    if (!countryCode) {
      return {
        isValid: false,
        normalizedPhone: normalized,
        displayPhone: this.formatForDisplay(normalized),
        countryCode: '',
        error: 'رمز الدولة غير صحيح'
      };
    }

    // التحقق المخصص للأرقام الليبية
    if (countryCode === '+218') {
      const localNumber = normalized.replace('+218', '');

      if (!LIBYA_PATTERNS.mobile.test(localNumber) && !LIBYA_PATTERNS.landline.test(localNumber)) {
        return {
          isValid: false,
          normalizedPhone: normalized,
          displayPhone: this.formatForDisplay(normalized),
          countryCode: countryCode,
          error: 'تنسيق الرقم الليبي غير صحيح'
        };
      }
    }

    return {
      isValid: true,
      normalizedPhone: normalized,
      displayPhone: this.formatForDisplay(normalized),
      countryCode: countryCode
    };
  }

  /**
   * تنسيق الرقم للعرض
   */
  static formatForDisplay(phone: string): string {
    const normalized = this.normalize(phone);

    if (!normalized) return phone;

    if (normalized.startsWith('+218')) {
      const localNumber = normalized.replace('+218', '');

      // تنسيق أرقام الموبايل الليبية
      if (LIBYA_PATTERNS.mobile.test(localNumber)) {
        return `0${localNumber.substring(0, 2)} ${localNumber.substring(2, 5)} ${localNumber.substring(5)}`;
      }

      // تنسيق أرقام الهاتف الأرضي الليبية
      if (LIBYA_PATTERNS.landline.test(localNumber)) {
        return `0${localNumber.substring(0, 2)} ${localNumber.substring(2)}`;
      }

      return `0${localNumber}`;
    }

    // تنسيق الأرقام الدولية
    return normalized;
  }

  /**
   * استخراج رمز الدولة من الرقم
   */
  static extractCountryCode(phone: string): string {
    const normalized = this.normalize(phone);

    for (const country of SUPPORTED_COUNTRIES) {
      if (normalized.startsWith(country.code)) {
        return country.code;
      }
    }

    return '';
  }

  /**
   * الحصول على معلومات الدولة من رمز الهاتف
   */
  static getCountryInfo(phone: string) {
    const countryCode = this.extractCountryCode(phone);
    return SUPPORTED_COUNTRIES.find(country => country.code === countryCode);
  }

  /**
   * تحويل الأرقام العربية إلى إنجليزية
   */
  static convertArabicDigits(text: string): string {
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const englishDigits = '0123456789';

    return text.split('').map(char => {
      const index = arabicDigits.indexOf(char);
      return index !== -1 ? englishDigits[index] : char;
    }).join('');
  }

  /**
   * التحقق من أن الرقم ليبي
   */
  static isLibyanNumber(phone: string): boolean {
    const normalized = this.normalize(phone);
    return normalized.startsWith('+218');
  }

  /**
   * التحقق من أن الرقم موبايل ليبي
   */
  static isLibyanMobile(phone: string): boolean {
    if (!this.isLibyanNumber(phone)) return false;

    const normalized = this.normalize(phone);
    const localNumber = normalized.replace('+218', '');

    return LIBYA_PATTERNS.mobile.test(localNumber);
  }

  /**
   * التحقق من أن الرقم هاتف أرضي ليبي
   */
  static isLibyanLandline(phone: string): boolean {
    if (!this.isLibyanNumber(phone)) return false;

    const normalized = this.normalize(phone);
    const localNumber = normalized.replace('+218', '');

    return LIBYA_PATTERNS.landline.test(localNumber);
  }

  /**
   * الحصول على جميع التنسيقات الممكنة للبحث في قاعدة البيانات
   */
  static getSearchFormats(phone: string): string[] {
    const validation = this.validate(phone);

    if (!validation.isValid) {
      return [phone.trim()];
    }

    const formats = [validation.normalizedPhone];

    // إضافة تنسيقات إضافية للأرقام الليبية
    if (validation.normalizedPhone.startsWith('+218')) {
      const localNumber = validation.normalizedPhone.replace('+218', '');
      formats.push(`0${localNumber}`); // 0912345678
      formats.push(localNumber);       // 912345678
      formats.push(`218${localNumber}`); // 218912345678
    }

    // إضافة الرقم الأصلي كما أدخله المستخدم
    if (!formats.includes(phone.trim())) {
      formats.push(phone.trim());
    }

    return formats;
  }

  /**
   * تنظيف قاعدة البيانات - توحيد جميع أرقام الهواتف
   */
  static async normalizeAllPhones(updateCallback: (phone: string, normalized: string) => Promise<void>) {
    // هذه الدالة تستخدم لتنظيف قاعدة البيانات الموجودة
    // يمكن استدعاؤها مرة واحدة لتوحيد جميع الأرقام
    console.log('تم استدعاء تنظيف قاعدة البيانات');
  }

  /**
   * إنشاء رقم عشوائي ليبي للاختبار
   */
  static generateTestLibyanNumber(): string {
    const prefixes = ['91', '92', '93', '94', '95', '96'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const remaining = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

    return `+218${prefix}${remaining}`;
  }
}

// تصدير الثوابت
export { SUPPORTED_COUNTRIES };

// تصدير افتراضي
export default PhoneSystem;
