/**
 * تحويل الأرقام بين العربية والإنجليزية
 * Number Converter
 */

const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * تحويل الأرقام العربية إلى إنجليزية
 */
export function toEnglishNumbers(str: string): string {
    if (!str) return '';
    return str.replace(/[٠-٩]/g, (match) => {
        return englishNumbers[arabicNumbers.indexOf(match)];
    });
}

/**
 * تحويل الأرقام الإنجليزية إلى عربية
 */
export function toArabicNumbers(str: string): string {
    if (!str) return '';
    return str.replace(/[0-9]/g, (match) => {
        return arabicNumbers[parseInt(match)];
    });
}

/**
 * تحويل الأرقام حسب اللغة
 */
export function convertNumbers(str: string, toArabic: boolean = false): string {
    return toArabic ? toArabicNumbers(str) : toEnglishNumbers(str);
}

/**
 * تنسيق رقم مع فواصل الآلاف
 */
export function formatWithCommas(num: number | string): string {
    const numStr = typeof num === 'number' ? num.toString() : num;
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * تحليل رقم من نص (يدعم العربية والإنجليزية)
 */
export function parseNumber(str: string): number {
    const englishStr = toEnglishNumbers(str);
    const cleaned = englishStr.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
}

/**
 * تنسيق السعر
 */
export function formatPrice(price: number, currency: string = 'LYD'): string {
    const formatted = formatWithCommas(price.toFixed(0));
    return `${formatted} ${currency === 'LYD' ? 'د.ل' : currency}`;
}

/**
 * تحويل نص معين مع الأرقام
 */
export function convertSpecificText(
    text: string,
    options: { convertNumbers?: boolean; toArabic?: boolean; } = {}
): string {
    const { convertNumbers: shouldConvert = true, toArabic = false } = options;

    if (!shouldConvert) return text;

    return toArabic ? toArabicNumbers(text) : toEnglishNumbers(text);
}

/**
 * تنسيق المسافة بالكيلومتر
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} م`;
    }
    return `${formatWithCommas(km.toFixed(1))} كم`;
}

/**
 * Alias for toEnglishNumbers
 */
export function convertToEnglishNumbers(str: string): string {
    return toEnglishNumbers(str);
}

/**
 * تنسيق رقم الهاتف
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = toEnglishNumbers(phone).replace(/\D/g, '');
    if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
}

/**
 * تنسيق السنة
 */
export function formatYear(year: number | string): string {
    return String(year);
}

/**
 * تنسيق التاريخ
 */
export function formatDate(date: Date | string, locale: string = 'ar-LY'): string {
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString(locale);
    } catch {
        return String(date);
    }
}

export default {
    toEnglishNumbers,
    toArabicNumbers,
    convertNumbers,
    formatWithCommas,
    parseNumber,
    formatPrice,
    convertSpecificText,
    formatDistance,
    convertToEnglishNumbers,
    formatPhoneNumber,
    formatYear,
    formatDate,
};
