// @ts-nocheck
/**
 * نظام شامل للهواتف الليبية
 */

// شبكات الاتصال الليبية
export const LIBYAN_NETWORKS = {
    ALMADAR_NEW: ['091', '092', '094', '095'],
    LIBYANA: ['090', '093', '096', '097'],
    SPECIAL: ['098', '099'],
};

// جميع بادئات الهواتف الليبية
export const ALL_LIBYAN_PREFIXES = [
    ...LIBYAN_NETWORKS.ALMADAR_NEW,
    ...LIBYAN_NETWORKS.LIBYANA,
    ...LIBYAN_NETWORKS.SPECIAL,
];

/**
 * تنظيف رقم الهاتف
 */
export function cleanPhoneNumber(phone: string): string {
    if (!phone) return '';

    // تحويل الأرقام العربية إلى إنجليزية
    const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
    let cleaned = phone;
    for (let i = 0; i < arabicNumerals.length; i++) {
        cleaned = cleaned.replace(new RegExp(arabicNumerals[i], 'g'), String(i));
    }

    // إزالة كل شيء ما عدا الأرقام
    cleaned = cleaned.replace(/[^\d]/g, '');

    // إزالة 218 من البداية
    if (cleaned.startsWith('218')) {
        cleaned = cleaned.substring(3);
    }

    // إزالة 00218 من البداية
    if (cleaned.startsWith('00218')) {
        cleaned = cleaned.substring(5);
    }

    // إزالة الصفر الأول إذا كان موجوداً (0924 → 924)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = cleaned.substring(1);
    }

    return cleaned;
}

/**
 * التحقق من صحة رقم الهاتف الليبي
 */
export function validateLibyanPhone(phone: string): {
    isValid: boolean;
    cleanedNumber: string;
    formattedNumber: string;
    network: string | null;
    error?: string;
} {
    const cleaned = cleanPhoneNumber(phone);

    if (!cleaned) {
        return {
            isValid: false,
            cleanedNumber: '',
            formattedNumber: '',
            network: null,
            error: 'الرقم مطلوب',
        };
    }

    // التحقق من الطول
    if (cleaned.length !== 9) {
        return {
            isValid: false,
            cleanedNumber: cleaned,
            formattedNumber: '',
            network: null,
            error: 'يجب أن يكون الرقم 9 أرقام',
        };
    }

    // التحقق من البادئة
    const prefix = cleaned.substring(0, 2);
    let network: string | null = null;

    if (LIBYAN_NETWORKS.ALMADAR_NEW.includes('0' + prefix)) {
        network = 'المدار الجديد';
    } else if (LIBYAN_NETWORKS.LIBYANA.includes('0' + prefix)) {
        network = 'ليبيانا';
    } else if (LIBYAN_NETWORKS.SPECIAL.includes('0' + prefix)) {
        network = 'أرقام خاصة';
    } else {
        return {
            isValid: false,
            cleanedNumber: cleaned,
            formattedNumber: '',
            network: null,
            error: 'بادئة الرقم غير صحيحة',
        };
    }

    return {
        isValid: true,
        cleanedNumber: cleaned,
        formattedNumber: `+218${cleaned}`,
        network,
    };
}

/**
 * تنسيق رقم الهاتف للعرض
 */
export function formatPhoneForDisplay(phone: string): string {
    const cleaned = cleanPhoneNumber(phone);
    if (cleaned.length !== 9) return phone;

    // تنسيق: 0XX-XXX-XXXX
    return `0${cleaned.substring(0, 2)}-${cleaned.substring(2, 5)}-${cleaned.substring(5)}`;
}

/**
 * تنسيق رقم الهاتف للتخزين
 */
export function formatPhoneForStorage(phone: string): string {
    const result = validateLibyanPhone(phone);
    return result.isValid ? result.formattedNumber : '';
}

export default {
    cleanPhoneNumber,
    validateLibyanPhone,
    formatPhoneForDisplay,
    formatPhoneForStorage,
    LIBYAN_NETWORKS,
    ALL_LIBYAN_PREFIXES,
};
