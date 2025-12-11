/**
 * أدوات معالجة الأرقام للمحفظة
 */

export function formatCurrency(
    amount: number,
    currency: string = 'LYD',
    locale: string = 'ar-LY'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatNumber(num: number, locale: string = 'ar-LY'): string {
    return new Intl.NumberFormat(locale).format(num);
}

export function parseNumber(value: string): number {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
}

export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

export function abbreviateNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export default {
    formatCurrency,
    formatNumber,
    parseNumber,
    formatPercentage,
    abbreviateNumber,
};
