/**
 * Advanced Validation Utilities
 */

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateAuctionData(data: unknown): ValidationResult {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d.title || typeof d.title !== 'string') {
        errors.push('العنوان مطلوب');
    }

    if (!d.startPrice || typeof d.startPrice !== 'number' || d.startPrice <= 0) {
        errors.push('سعر البداية يجب أن يكون رقم موجب');
    }

    if (!d.endDate) {
        errors.push('تاريخ الانتهاء مطلوب');
    }

    return { valid: errors.length === 0, errors };
}

export function validateCarData(data: unknown): ValidationResult {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d.title || typeof d.title !== 'string') {
        errors.push('العنوان مطلوب');
    }

    if (!d.brand || typeof d.brand !== 'string') {
        errors.push('العلامة التجارية مطلوبة');
    }

    if (!d.price || typeof d.price !== 'number' || d.price <= 0) {
        errors.push('السعر يجب أن يكون رقم موجب');
    }

    return { valid: errors.length === 0, errors };
}

export function validateUserData(data: unknown): ValidationResult {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d.phone || typeof d.phone !== 'string') {
        errors.push('رقم الهاتف مطلوب');
    }

    if (!d.name || typeof d.name !== 'string') {
        errors.push('الاسم مطلوب');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * دالة التحقق مع رمي خطأ في حالة الفشل
 */
export function validateAndThrow(
    validator: (data: unknown) => ValidationResult,
    data: unknown,
    errorMessage?: string
): void {
    const result = validator(data);
    if (!result.valid) {
        throw new Error(errorMessage || result.errors.join(', '));
    }
}

/**
 * دالة التحقق العامة
 */
export function validate(data: unknown, rules: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    for (const [field, rule] of Object.entries(rules)) {
        if (rule === 'required' && !d[field]) {
            errors.push(`${field} مطلوب`);
        }
    }

    return { valid: errors.length === 0, errors };
}

export default {
    validateAuctionData,
    validateCarData,
    validateUserData,
    validateAndThrow,
    validate,
};
