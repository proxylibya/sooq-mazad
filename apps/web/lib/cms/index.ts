// @ts-nocheck
/**
 * ============================================================
 * UNIFIED CMS SYSTEM - نظام إدارة المحتوى الموحد
 * ============================================================
 * يدعم: Rich Text, Multi-language, Content Versioning, SEO
 */

// ============================================================
// TYPES
// ============================================================

export type Language = 'ar' | 'en';

export interface LocalizedContent {
    ar: string;
    en?: string;
}

export interface ContentMeta {
    id: string;
    type: ContentType;
    slug: string;
    status: ContentStatus;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    createdBy: string;
    updatedBy?: string;
    version: number;
}

export type ContentType =
    | 'page'
    | 'article'
    | 'announcement'
    | 'faq'
    | 'policy'
    | 'help'
    | 'category'
    | 'banner';

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

export interface SEOData {
    title: LocalizedContent;
    description: LocalizedContent;
    keywords: string[];
    ogImage?: string;
    noIndex?: boolean;
    canonicalUrl?: string;
}

export interface ContentBlock {
    id: string;
    type: BlockType;
    data: Record<string, any>;
    order: number;
}

export type BlockType =
    | 'paragraph'
    | 'heading'
    | 'image'
    | 'gallery'
    | 'video'
    | 'quote'
    | 'list'
    | 'table'
    | 'code'
    | 'divider'
    | 'callout'
    | 'accordion'
    | 'tabs'
    | 'embed'
    | 'html';

export interface Content extends ContentMeta {
    title: LocalizedContent;
    content: LocalizedContent;
    blocks?: ContentBlock[];
    seo: SEOData;
    tags?: string[];
    category?: string;
    featured?: boolean;
    thumbnail?: string;
}

export interface ContentVersion {
    id: string;
    contentId: string;
    version: number;
    data: Content;
    createdAt: Date;
    createdBy: string;
    changeNote?: string;
}

// ============================================================
// LANGUAGE SYSTEM
// ============================================================

const defaultLanguage: Language = 'ar';
let currentLanguage: Language = defaultLanguage;

const translations: Record<string, LocalizedContent> = {
    // Common
    'common.save': { ar: 'حفظ', en: 'Save' },
    'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
    'common.delete': { ar: 'حذف', en: 'Delete' },
    'common.edit': { ar: 'تعديل', en: 'Edit' },
    'common.add': { ar: 'إضافة', en: 'Add' },
    'common.search': { ar: 'بحث', en: 'Search' },
    'common.filter': { ar: 'تصفية', en: 'Filter' },
    'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
    'common.error': { ar: 'حدث خطأ', en: 'An error occurred' },
    'common.success': { ar: 'تمت العملية بنجاح', en: 'Operation successful' },
    'common.confirm': { ar: 'تأكيد', en: 'Confirm' },
    'common.yes': { ar: 'نعم', en: 'Yes' },
    'common.no': { ar: 'لا', en: 'No' },
    'common.back': { ar: 'رجوع', en: 'Back' },
    'common.next': { ar: 'التالي', en: 'Next' },
    'common.previous': { ar: 'السابق', en: 'Previous' },
    'common.close': { ar: 'إغلاق', en: 'Close' },
    'common.open': { ar: 'فتح', en: 'Open' },
    'common.view': { ar: 'عرض', en: 'View' },
    'common.download': { ar: 'تحميل', en: 'Download' },
    'common.upload': { ar: 'رفع', en: 'Upload' },
    'common.share': { ar: 'مشاركة', en: 'Share' },
    'common.copy': { ar: 'نسخ', en: 'Copy' },
    'common.print': { ar: 'طباعة', en: 'Print' },

    // Auth
    'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
    'auth.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
    'auth.register': { ar: 'إنشاء حساب', en: 'Register' },
    'auth.forgotPassword': { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
    'auth.resetPassword': { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password' },
    'auth.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
    'auth.password': { ar: 'كلمة المرور', en: 'Password' },
    'auth.confirmPassword': { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
    'auth.otp': { ar: 'رمز التحقق', en: 'Verification Code' },

    // Navigation
    'nav.home': { ar: 'الرئيسية', en: 'Home' },
    'nav.auctions': { ar: 'المزادات', en: 'Auctions' },
    'nav.marketplace': { ar: 'السوق الفوري', en: 'Marketplace' },
    'nav.transport': { ar: 'خدمات النقل', en: 'Transport' },
    'nav.showrooms': { ar: 'المعارض', en: 'Showrooms' },
    'nav.profile': { ar: 'حسابي', en: 'My Profile' },
    'nav.settings': { ar: 'الإعدادات', en: 'Settings' },
    'nav.help': { ar: 'المساعدة', en: 'Help' },
    'nav.about': { ar: 'عن الموقع', en: 'About' },
    'nav.contact': { ar: 'اتصل بنا', en: 'Contact Us' },

    // Auctions
    'auction.bid': { ar: 'مزايدة', en: 'Bid' },
    'auction.currentBid': { ar: 'المزايدة الحالية', en: 'Current Bid' },
    'auction.startingPrice': { ar: 'سعر البداية', en: 'Starting Price' },
    'auction.buyNow': { ar: 'اشتر الآن', en: 'Buy Now' },
    'auction.timeLeft': { ar: 'الوقت المتبقي', en: 'Time Left' },
    'auction.ended': { ar: 'انتهى المزاد', en: 'Auction Ended' },
    'auction.winner': { ar: 'الفائز', en: 'Winner' },
    'auction.bids': { ar: 'المزايدات', en: 'Bids' },
    'auction.noBids': { ar: 'لا توجد مزايدات', en: 'No Bids' },
    'auction.placeBid': { ar: 'قدم مزايدة', en: 'Place Bid' },
    'auction.minBid': { ar: 'الحد الأدنى للمزايدة', en: 'Minimum Bid' },
    'auction.yourBid': { ar: 'مزايدتك', en: 'Your Bid' },
    'auction.outbid': { ar: 'تم تجاوز مزايدتك', en: 'You have been outbid' },
    'auction.winning': { ar: 'أنت الأعلى', en: 'You are winning' },

    // Cars
    'car.brand': { ar: 'الماركة', en: 'Brand' },
    'car.model': { ar: 'الموديل', en: 'Model' },
    'car.year': { ar: 'سنة الصنع', en: 'Year' },
    'car.mileage': { ar: 'الكيلومترات', en: 'Mileage' },
    'car.price': { ar: 'السعر', en: 'Price' },
    'car.color': { ar: 'اللون', en: 'Color' },
    'car.transmission': { ar: 'ناقل الحركة', en: 'Transmission' },
    'car.fuelType': { ar: 'نوع الوقود', en: 'Fuel Type' },
    'car.condition': { ar: 'الحالة', en: 'Condition' },
    'car.location': { ar: 'الموقع', en: 'Location' },
    'car.description': { ar: 'الوصف', en: 'Description' },
    'car.features': { ar: 'المميزات', en: 'Features' },
    'car.specifications': { ar: 'المواصفات', en: 'Specifications' },

    // Transport
    'transport.service': { ar: 'خدمة النقل', en: 'Transport Service' },
    'transport.from': { ar: 'من', en: 'From' },
    'transport.to': { ar: 'إلى', en: 'To' },
    'transport.vehicle': { ar: 'نوع المركبة', en: 'Vehicle Type' },
    'transport.price': { ar: 'السعر', en: 'Price' },
    'transport.book': { ar: 'احجز الآن', en: 'Book Now' },

    // Messages
    'message.new': { ar: 'رسالة جديدة', en: 'New Message' },
    'message.send': { ar: 'إرسال', en: 'Send' },
    'message.reply': { ar: 'رد', en: 'Reply' },
    'message.noMessages': { ar: 'لا توجد رسائل', en: 'No Messages' },

    // Errors
    'error.required': { ar: 'هذا الحقل مطلوب', en: 'This field is required' },
    'error.invalid': { ar: 'قيمة غير صحيحة', en: 'Invalid value' },
    'error.minLength': { ar: 'الحد الأدنى للأحرف: {min}', en: 'Minimum {min} characters' },
    'error.maxLength': { ar: 'الحد الأقصى للأحرف: {max}', en: 'Maximum {max} characters' },
    'error.invalidPhone': { ar: 'رقم الهاتف غير صحيح', en: 'Invalid phone number' },
    'error.invalidEmail': { ar: 'البريد الإلكتروني غير صحيح', en: 'Invalid email' },
    'error.network': { ar: 'خطأ في الاتصال', en: 'Network error' },
    'error.server': { ar: 'خطأ في الخادم', en: 'Server error' },
    'error.unauthorized': { ar: 'غير مصرح لك', en: 'Unauthorized' },
    'error.notFound': { ar: 'غير موجود', en: 'Not found' },

    // Success
    'success.saved': { ar: 'تم الحفظ بنجاح', en: 'Saved successfully' },
    'success.deleted': { ar: 'تم الحذف بنجاح', en: 'Deleted successfully' },
    'success.updated': { ar: 'تم التحديث بنجاح', en: 'Updated successfully' },
    'success.created': { ar: 'تم الإنشاء بنجاح', en: 'Created successfully' },
    'success.sent': { ar: 'تم الإرسال بنجاح', en: 'Sent successfully' },
    'success.copied': { ar: 'تم النسخ', en: 'Copied' },
};

/**
 * Set current language
 */
export function setLanguage(lang: Language): void {
    currentLanguage = lang;
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('language', lang);
    }
}

/**
 * Get current language
 */
export function getLanguage(): Language {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('language') as Language;
        if (saved) return saved;
    }
    return currentLanguage;
}

/**
 * Initialize language from storage
 */
export function initLanguage(): Language {
    const lang = getLanguage();
    setLanguage(lang);
    return lang;
}

/**
 * Translate a key
 */
export function t(key: string, params?: Record<string, string | number>): string {
    const translation = translations[key];
    if (!translation) {
        console.warn(`Missing translation: ${key}`);
        return key;
    }

    let text = translation[currentLanguage] || translation.ar;

    if (params) {
        for (const [param, value] of Object.entries(params)) {
            text = text.replace(`{${param}}`, String(value));
        }
    }

    return text;
}

/**
 * Get localized content
 */
export function getLocalized(content: LocalizedContent | string): string {
    if (typeof content === 'string') return content;
    return content[currentLanguage] || content.ar || '';
}

/**
 * Add custom translations
 */
export function addTranslations(newTranslations: Record<string, LocalizedContent>): void {
    Object.assign(translations, newTranslations);
}

// ============================================================
// RICH TEXT HELPERS
// ============================================================

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
    const allowedTags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
    ];

    const allowedAttrs = [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'width', 'height',
    ];

    // Basic sanitization - for production use a proper library
    let clean = html;

    // Remove script tags
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: URLs
    clean = clean.replace(/javascript:/gi, '');

    return clean;
}

/**
 * Convert plain text to HTML
 */
export function textToHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}

/**
 * Strip HTML tags
 */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

/**
 * Truncate HTML content safely
 */
export function truncateHtml(html: string, maxLength: number): string {
    const text = stripHtml(html);
    if (text.length <= maxLength) return html;
    return text.substring(0, maxLength) + '...';
}

// ============================================================
// SEO HELPERS
// ============================================================

/**
 * Generate SEO meta tags
 */
export function generateSeoMeta(seo: SEOData): Record<string, string> {
    const title = getLocalized(seo.title);
    const description = getLocalized(seo.description);

    return {
        title,
        description,
        keywords: seo.keywords.join(', '),
        'og:title': title,
        'og:description': description,
        'og:image': seo.ogImage || '',
        'og:type': 'website',
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': seo.ogImage || '',
        ...(seo.noIndex ? { robots: 'noindex,nofollow' } : {}),
        ...(seo.canonicalUrl ? { canonical: seo.canonicalUrl } : {}),
    };
}

/**
 * Generate JSON-LD structured data
 */
export function generateJsonLd(type: string, data: Record<string, any>): string {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': type,
        ...data,
    };
    return JSON.stringify(jsonLd);
}

// ============================================================
// CONTENT HELPERS
// ============================================================

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '') // Keep Arabic and English
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (format === 'relative') {
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (currentLanguage === 'ar') {
            if (seconds < 60) return 'الآن';
            if (minutes < 60) return `منذ ${minutes} دقيقة`;
            if (hours < 24) return `منذ ${hours} ساعة`;
            if (days < 7) return `منذ ${days} يوم`;
        } else {
            if (seconds < 60) return 'just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;
        }
    }

    const options: Intl.DateTimeFormatOptions = format === 'long'
        ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

    return d.toLocaleDateString(currentLanguage === 'ar' ? 'ar-LY' : 'en-US', options);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'LYD'): string {
    const formatted = amount.toLocaleString(currentLanguage === 'ar' ? 'ar-LY' : 'en-US');

    if (currentLanguage === 'ar') {
        return `${formatted} د.ل`;
    }
    return `${formatted} ${currency}`;
}

/**
 * Format number
 */
export function formatNumber(num: number): string {
    return num.toLocaleString(currentLanguage === 'ar' ? 'ar-LY' : 'en-US');
}

// ============================================================
// EXPORTS
// ============================================================

export default {
    // Language
    setLanguage,
    getLanguage,
    initLanguage,
    t,
    getLocalized,
    addTranslations,

    // Rich Text
    sanitizeHtml,
    textToHtml,
    stripHtml,
    truncateHtml,

    // SEO
    generateSeoMeta,
    generateJsonLd,

    // Content
    generateSlug,
    formatDate,
    formatCurrency,
    formatNumber,
};
