/**
* @sooq-mazad/utils
* Shared utilities
*/

// تصدير بيانات السيارات المشتركة
export * from './data/shared-car-data';
export { default as sharedCarData } from './data/shared-car-data';

export function formatCurrency(amount: number, currency = 'LYD'): string {
    return new Intl.NumberFormat('ar-LY', {
        style: 'currency',
        currency,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('ar-LY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}

export function formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('218')) {
        return `+${cleaned}`;
    }
    if (cleaned.startsWith('0')) {
        return `+218${cleaned.slice(1)}`;
    }
    return `+218${cleaned}`;
}

export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}
