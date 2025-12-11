/**
 * التحقق من بيانات المستخدم - نظام موحد وشامل
 * User Validation - Unified and Comprehensive System
 */

import { prisma } from '../prisma';

// ═══════════════════════════════════════════════════════════════
// الأنواع والواجهات
// ═══════════════════════════════════════════════════════════════

export interface UserValidationResult {
    valid: boolean;
    errors: string[];
    exists?: boolean;
}

export interface PhoneDuplicateResult {
    isDuplicate: boolean;
    error?: string;
    existingUserId?: string;
}

// ═══════════════════════════════════════════════════════════════
// دوال التحقق الأساسية
// ═══════════════════════════════════════════════════════════════

/**
 * تنظيف رقم الهاتف وتوحيده
 */
function normalizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';

    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // تحويل الأرقام العربية إلى إنجليزية
    cleaned = cleaned.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

    // معالجة التنسيقات المختلفة
    if (cleaned.startsWith('00218')) {
        cleaned = '+218' + cleaned.slice(5);
    } else if (cleaned.startsWith('218')) {
        cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
        cleaned = '+218' + cleaned.slice(1);
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+218' + cleaned;
    }

    // إصلاح مشكلة الصفر المزدوج (+2180 بدلاً من +218)
    if (cleaned.startsWith('+2180')) {
        cleaned = '+218' + cleaned.slice(5);
    }

    return cleaned;
}

/**
 * الحصول على جميع تنسيقات البحث للرقم
 */
function getSearchFormats(phone: string): string[] {
    const normalized = normalizePhone(phone);
    if (!normalized) return [];

    const formats: string[] = [normalized];

    // إضافة التنسيق بدون رمز الدولة
    if (normalized.startsWith('+218')) {
        const localNumber = normalized.slice(4);
        formats.push('0' + localNumber);
        formats.push(localNumber);
        formats.push('218' + localNumber);
        formats.push('00218' + localNumber);
    }

    return [...new Set(formats)]; // إزالة التكرارات
}

/**
 * التحقق من وجود رقم الهاتف
 */
export async function checkPhoneExists(phone: string): Promise<boolean> {
    try {
        const searchFormats = getSearchFormats(phone);

        if (searchFormats.length === 0) {
            return false;
        }

        const user = await prisma.users.findFirst({
            where: {
                OR: searchFormats.map(format => ({ phone: format })),
            },
        });

        return !!user;
    } catch (error) {
        console.error('[UserValidation] Error checking phone:', error);
        return false;
    }
}

/**
 * التحقق المحسن من تكرار رقم الهاتف - الدالة المطلوبة
 */
export async function checkPhoneDuplicate(phone: string): Promise<PhoneDuplicateResult> {
    try {
        if (!phone) {
            return {
                isDuplicate: false,
                error: 'رقم الهاتف مطلوب',
            };
        }

        const searchFormats = getSearchFormats(phone);

        if (searchFormats.length === 0) {
            return {
                isDuplicate: false,
                error: 'تنسيق رقم الهاتف غير صحيح',
            };
        }

        console.log('[UserValidation] Checking phone duplicate with formats:', searchFormats);

        const existingUser = await prisma.users.findFirst({
            where: {
                OR: searchFormats.map(format => ({ phone: format })),
            },
            select: {
                id: true,
                phone: true,
            },
        });

        if (existingUser) {
            console.log('[UserValidation] Found existing user:', existingUser.id);
            return {
                isDuplicate: true,
                existingUserId: existingUser.id,
            };
        }

        return {
            isDuplicate: false,
        };
    } catch (error) {
        console.error('[UserValidation] Error in checkPhoneDuplicate:', error);
        return {
            isDuplicate: false,
            error: 'حدث خطأ أثناء التحقق من رقم الهاتف',
        };
    }
}

/**
 * التحقق من وجود البريد الإلكتروني
 */
export async function checkEmailExists(email: string): Promise<boolean> {
    try {
        if (!email) return false;

        const user = await prisma.users.findFirst({
            where: { email: email.toLowerCase().trim() },
        });
        return !!user;
    } catch (error) {
        console.error('[UserValidation] Error checking email:', error);
        return false;
    }
}

/**
 * التحقق من بيانات التسجيل
 */
export async function validateRegistration(data: {
    phone: string;
    name?: string;
    email?: string;
    password?: string;
}): Promise<UserValidationResult> {
    const errors: string[] = [];

    // التحقق من الهاتف
    if (!data.phone) {
        errors.push('رقم الهاتف مطلوب');
    } else {
        const duplicateCheck = await checkPhoneDuplicate(data.phone);
        if (duplicateCheck.error) {
            errors.push(duplicateCheck.error);
        } else if (duplicateCheck.isDuplicate) {
            errors.push('رقم الهاتف مسجل مسبقاً');
        }
    }

    // التحقق من البريد
    if (data.email) {
        const emailExists = await checkEmailExists(data.email);
        if (emailExists) {
            errors.push('البريد الإلكتروني مسجل مسبقاً');
        }
    }

    // التحقق من كلمة المرور
    if (data.password && data.password.length < 6) {
        errors.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ═══════════════════════════════════════════════════════════════
// تصدير موحد كـ class للتوافق مع API
// ═══════════════════════════════════════════════════════════════

export const UserValidation = {
    checkPhoneExists,
    checkPhoneDuplicate,
    checkEmailExists,
    validateRegistration,
    normalizePhone,
    getSearchFormats,
};

// تصدير افتراضي أيضاً للتوافق
export default UserValidation;
