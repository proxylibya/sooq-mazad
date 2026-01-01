/**
 * أدوات التعامل مع أرقام الهواتف
 * Phone Actions Utilities
 */

/**
 * فتح تطبيق الاتصال
 */
export function callPhone(phone: string): void {
    if (typeof window !== 'undefined') {
        window.location.href = `tel:${normalizePhone(phone)}`;
    }
}

/**
 * فتح واتساب
 */
export function openWhatsApp(phone: string, message?: string): void {
    if (typeof window !== 'undefined') {
        const cleanPhone = normalizePhone(phone).replace(/\+/g, '');
        const encodedMessage = message ? encodeURIComponent(message) : '';
        const url = `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
        window.open(url, '_blank');
    }
}

/**
 * نسخ الرقم إلى الحافظة
 */
export async function copyPhone(phone: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(phone);
            return true;
        } catch {
            return false;
        }
    }
    return false;
}

/**
 * تنسيق رقم الهاتف
 */
export function normalizePhone(phone: string): string {
    // إزالة المسافات والشرطات
    let cleaned = phone.replace(/[\s-]/g, '');

    // تحويل الأرقام العربية إلى إنجليزية
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    arabicNumbers.forEach((ar, i) => {
        cleaned = cleaned.replace(new RegExp(ar, 'g'), i.toString());
    });

    // تنسيق الرقم الليبي
    if (cleaned.startsWith('00218')) {
        cleaned = '+218' + cleaned.slice(5);
    } else if (cleaned.startsWith('218')) {
        cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
        cleaned = '+218' + cleaned.slice(1);
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+218' + cleaned;
    }

    return cleaned;
}

/**
 * تنسيق رقم الهاتف للعرض
 */
export function formatPhoneDisplay(phone: string): string {
    const normalized = normalizePhone(phone);

    // تنسيق للعرض: +218 92 XXX XXXX
    if (normalized.startsWith('+218') && normalized.length === 13) {
        return `${normalized.slice(0, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
    }

    return normalized;
}

/**
 * التحقق من صحة رقم الهاتف الليبي
 */
export function isValidLibyanPhone(phone: string): boolean {
    const normalized = normalizePhone(phone);
    // الرقم الليبي: +218 9X XXX XXXX (13 حرف)
    const libyanPattern = /^\+218(9[0-9])\d{7}$/;
    return libyanPattern.test(normalized);
}

/**
 * الحصول على معلومات شركة الاتصال
 */
export function getCarrierInfo(phone: string): { carrier: string; color: string; } {
    const normalized = normalizePhone(phone);
    const prefix = normalized.slice(4, 6);

    const carriers: Record<string, { carrier: string; color: string; }> = {
        '91': { carrier: 'المدار الجديد', color: '#00a651' },
        '92': { carrier: 'المدار الجديد', color: '#00a651' },
        '94': { carrier: 'المدار الجديد', color: '#00a651' },
        '95': { carrier: 'المدار الجديد', color: '#00a651' },
        '90': { carrier: 'ليبيانا', color: '#ff6b00' },
        '93': { carrier: 'ليبيانا', color: '#ff6b00' },
        '96': { carrier: 'ليبيانا', color: '#ff6b00' },
        '97': { carrier: 'ليبيانا', color: '#ff6b00' },
    };

    return carriers[prefix] || { carrier: 'غير معروف', color: '#666' };
}

/**
 * معالج النقر على الهاتف الموحد
 * يفتح قائمة الخيارات (اتصال، واتساب، نسخ)
 */
export interface PhoneClickOptions {
    phone: string;
    sellerName?: string;
    onCall?: () => void;
    onWhatsApp?: () => void;
    onCopy?: () => void;
    directCall?: boolean;
    showWhatsApp?: boolean;
    context?: string;
}

export function handlePhoneClickUnified(options: PhoneClickOptions): void {
    const { phone, onCall } = options;

    // سلوك افتراضي: فتح الاتصال
    callPhone(phone);
    onCall?.();
}

/**
 * معالج الهاتف مع دعم الإجراءات المتعددة
 */
export async function handlePhoneAction(
    phone: string,
    action: 'call' | 'whatsapp' | 'copy',
    message?: string
): Promise<boolean> {
    switch (action) {
        case 'call':
            callPhone(phone);
            return true;
        case 'whatsapp':
            openWhatsApp(phone, message);
            return true;
        case 'copy':
            return await copyPhone(phone);
        default:
            return false;
    }
}

export default {
    callPhone,
    openWhatsApp,
    copyPhone,
    normalizePhone,
    formatPhoneDisplay,
    isValidLibyanPhone,
    getCarrierInfo,
    handlePhoneClickUnified,
    handlePhoneAction,
};
