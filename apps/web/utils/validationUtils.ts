/**
 * Validation Utils - إعادة توجيه للنظام الموحد
 */
export * from '../lib/validation/unified-validation-system';

// دوال توافقية
export function validateRequired(value: any, fieldName = 'هذا الحقل'): string | null {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} مطلوب`;
    }
    return null;
}

export function validateEmail(email: string): string | null {
    if (!email) return null;
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
        return 'البريد الإلكتروني غير صحيح';
    }
    return null;
}

export function validatePhone(phone: string): string | null {
    if (!phone) return null;
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.length !== 9 && cleaned.length !== 12) {
        return 'رقم الهاتف غير صحيح';
    }
    return null;
}

export function validateMinLength(value: string, min: number, fieldName = 'هذا الحقل'): string | null {
    if (value && value.length < min) {
        return `${fieldName} يجب أن يكون ${min} أحرف على الأقل`;
    }
    return null;
}

export function validateMaxLength(value: string, max: number, fieldName = 'هذا الحقل'): string | null {
    if (value && value.length > max) {
        return `${fieldName} يجب ألا يتجاوز ${max} حرف`;
    }
    return null;
}

/**
 * التحقق من صحة السعر
 * يُرجع كائن يحتوي على isValid و error بدلاً من string | null
 */
export function validatePrice(price: number | string, min = 0, max = 999999999): { isValid: boolean; error?: string; } {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
        return { isValid: false, error: 'السعر يجب أن يكون رقماً صحيحاً' };
    }

    if (numPrice < min) {
        return { isValid: false, error: `السعر يجب أن يكون أكبر من ${min}` };
    }

    if (numPrice > max) {
        return { isValid: false, error: `السعر يجب أن يكون أقل من ${max.toLocaleString('ar-LY')}` };
    }

    return { isValid: true };
}

/**
 * التحقق من صحة نموذج التسجيل
 */
export interface RegistrationFormData {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    accountType: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export function validateRegistrationForm(data: RegistrationFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // التحقق من الاسم الأول
    if (!data.firstName || data.firstName.trim().length < 2) {
        errors.firstName = 'الاسم الأول مطلوب ويجب أن يكون حرفين على الأقل';
    }

    // التحقق من الاسم الأخير
    if (!data.lastName || data.lastName.trim().length < 2) {
        errors.lastName = 'الاسم الأخير مطلوب ويجب أن يكون حرفين على الأقل';
    }

    // التحقق من رقم الهاتف
    if (!data.phone) {
        errors.phone = 'رقم الهاتف مطلوب';
    }

    // التحقق من كلمة المرور
    if (!data.password || data.password.length < 6) {
        errors.password = 'كلمة المرور مطلوبة ويجب أن تكون 6 أحرف على الأقل';
    }

    // التحقق من تأكيد كلمة المرور
    if (data.confirmPassword && data.password !== data.confirmPassword) {
        errors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    // التحقق من نوع الحساب
    const validAccountTypes = ['REGULAR_USER', 'TRANSPORT_OWNER', 'COMPANY', 'SHOWROOM'];
    if (!data.accountType || !validAccountTypes.includes(data.accountType)) {
        errors.accountType = 'نوع الحساب غير صحيح';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * التحقق من صحة رقم الشاحنة
 */
export function validateTruckNumber(truckNumber: string): { isValid: boolean; value: string; error?: string; } {
    if (!truckNumber || truckNumber.trim().length < 3) {
        return { isValid: false, value: '', error: 'رقم الشاحنة مطلوب ويجب أن يكون 3 أحرف على الأقل' };
    }
    return { isValid: true, value: truckNumber.trim() };
}

/**
 * التحقق من صحة السعة
 */
export function validateCapacity(capacity: number): { isValid: boolean; value: number; error?: string; } {
    if (isNaN(capacity) || capacity <= 0) {
        return { isValid: false, value: 0, error: 'السعة يجب أن تكون رقماً موجباً' };
    }
    if (capacity > 100000) {
        return { isValid: false, value: 0, error: 'السعة كبيرة جداً' };
    }
    return { isValid: true, value: capacity };
}

export default {
    validateRequired,
    validateEmail,
    validatePhone,
    validateMinLength,
    validateMaxLength,
    validatePrice,
    validateRegistrationForm,
    validateTruckNumber,
    validateCapacity,
};
