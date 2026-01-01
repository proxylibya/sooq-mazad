/**
 * تحويل الأرقام إلى الأرقام الغربية فقط
 * Western Numerals Only
 */

const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

// خريطة تحويل الأرقام من جميع الأنظمة إلى الغربية
const numeralMap: Record<string, string> = {
    // الأرقام العربية الشرقية (٠-٩)
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    // الأرقام الفارسية/الأردية (۰-۹)
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    // الأرقام الهندية (०-९)
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

/**
 * تحويل جميع الأرقام العربية إلى غربية
 */
export function toWesternNumerals(str: string | number): string {
    if (str === null || str === undefined) return '';
    const strValue = String(str);

    return strValue.replace(/[٠-٩]/g, (match) => {
        const index = arabicNumbers.indexOf(match);
        return index !== -1 ? index.toString() : match;
    });
}

/**
 * تحويل جميع أنواع الأرقام إلى الأرقام الغربية (0-9)
 * يدعم: العربية الشرقية، الفارسية، الهندية
 */
export function convertToWesternNumeralsOnly(text: string | number | null | undefined): string {
    if (text === null || text === undefined) return '';

    const strValue = String(text);

    // استخدام regex للتحويل السريع
    return strValue.replace(/[٠-٩۰-۹०-९]/g, (match) => {
        return numeralMap[match] || match;
    });
}

/**
 * تنسيق الرقم مع الأرقام الغربية
 */
export function formatWesternNumber(num: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(num);
}

/**
 * Alias لـ formatWesternNumber للتوافق
 */
export function formatNumberWestern(num: number | string | null | undefined): string {
    if (num === null || num === undefined) return '0';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0';
    return formatWesternNumber(numValue);
}

/**
 * تنسيق السعر مع الأرقام الغربية
 */
export function formatWesternPrice(price: number, currency: string = 'LYD'): string {
    const formatted = formatWesternNumber(price);
    const currencyLabels: Record<string, string> = {
        'LYD': 'د.ل',
        'USD': '$',
        'EUR': '€',
    };
    return `${formatted} ${currencyLabels[currency] || currency}`;
}

/**
 * تنسيق العملة بالأرقام الغربية
 */
export function formatCurrencyWestern(amount: number | string | null | undefined, currency: string = 'د.ل'): string {
    if (amount === null || amount === undefined) return `0 ${currency}`;
    const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numValue)) return `0 ${currency}`;
    return `${formatWesternNumber(numValue)} ${currency}`;
}

/**
 * تنسيق التاريخ بالأرقام الغربية
 */
export function formatDateWestern(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

/**
 * Hook لتحويل الأرقام في العنصر
 */
export function convertElementNumbers(element: HTMLElement): void {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
    );

    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
    }

    textNodes.forEach((textNode) => {
        if (textNode.nodeValue) {
            textNode.nodeValue = toWesternNumerals(textNode.nodeValue);
        }
    });
}

export default {
    toWesternNumerals,
    convertToWesternNumeralsOnly,
    formatWesternNumber,
    formatNumberWestern,
    formatWesternPrice,
    formatCurrencyWestern,
    formatDateWestern,
    convertElementNumbers,
};
