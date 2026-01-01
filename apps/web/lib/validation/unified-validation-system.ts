/**
 * 🌟 Unified Validation System
 * نظام التحقق الموحد العالمي
 * Enterprise-grade validation for all forms
 */

import { z } from 'zod';

// ============================================
// 1. Base Validation Types
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationRule {
  field: string;
  rules: Array<(value: any, data?: any) => ValidationError | null>;
  transform?: (value: any) => any;
}

// ============================================
// 2. Common Validation Rules
// ============================================

export const ValidationRules = {
  // Required
  required: (message = 'هذا الحقل مطلوب') => (value: any): ValidationError | null => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { field: '', message, code: 'REQUIRED' };
    }
    return null;
  },

  // String validations
  minLength: (min: number, message?: string) => (value: string): ValidationError | null => {
    if (!value || value.length < min) {
      return { 
        field: '', 
        message: message || `يجب أن يكون ${min} أحرف على الأقل`, 
        code: 'MIN_LENGTH' 
      };
    }
    return null;
  },

  maxLength: (max: number, message?: string) => (value: string): ValidationError | null => {
    if (value && value.length > max) {
      return { 
        field: '', 
        message: message || `يجب ألا يتجاوز ${max} حرف`, 
        code: 'MAX_LENGTH' 
      };
    }
    return null;
  },

  pattern: (pattern: RegExp, message = 'التنسيق غير صحيح') => (value: string): ValidationError | null => {
    if (value && !pattern.test(value)) {
      return { field: '', message, code: 'PATTERN' };
    }
    return null;
  },

  // Email validation
  email: (message = 'البريد الإلكتروني غير صحيح') => (value: string): ValidationError | null => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (value && !emailRegex.test(value)) {
      return { field: '', message, code: 'INVALID_EMAIL' };
    }
    return null;
  },

  // Phone validation (Libyan)
  libyanPhone: (message = 'رقم الهاتف الليبي غير صحيح') => (value: string): ValidationError | null => {
    const cleanPhone = value?.replace(/\D/g, '');
    const validPrefixes = ['91', '92', '93', '94', '95', '96', '97', '98', '99'];
    
    if (!cleanPhone) return null;
    
    // Check if starts with 218 (country code)
    let phoneToCheck = cleanPhone;
    if (cleanPhone.startsWith('218')) {
      phoneToCheck = cleanPhone.substring(3);
    }
    
    // Check if starts with 0
    if (phoneToCheck.startsWith('0')) {
      phoneToCheck = phoneToCheck.substring(1);
    }
    
    // Check length and prefix
    if (phoneToCheck.length !== 9 || !validPrefixes.includes(phoneToCheck.substring(0, 2))) {
      return { field: '', message, code: 'INVALID_PHONE' };
    }
    
    return null;
  },

  // Number validations
  min: (min: number, message?: string) => (value: number): ValidationError | null => {
    if (value !== undefined && value !== null && value < min) {
      return { 
        field: '', 
        message: message || `يجب أن يكون ${min} على الأقل`, 
        code: 'MIN_VALUE' 
      };
    }
    return null;
  },

  max: (max: number, message?: string) => (value: number): ValidationError | null => {
    if (value !== undefined && value !== null && value > max) {
      return { 
        field: '', 
        message: message || `يجب ألا يتجاوز ${max}`, 
        code: 'MAX_VALUE' 
      };
    }
    return null;
  },

  // Password validation
  password: (message = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على أحرف وأرقام') => (value: string): ValidationError | null => {
    if (!value || value.length < 8) {
      return { field: '', message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', code: 'PASSWORD_TOO_SHORT' };
    }
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      return { field: '', message, code: 'PASSWORD_WEAK' };
    }
    return null;
  },

  // Match fields
  match: (fieldName: string, message?: string) => (value: any, data: any): ValidationError | null => {
    if (value !== data[fieldName]) {
      return { 
        field: '', 
        message: message || `يجب أن يطابق ${fieldName}`, 
        code: 'FIELDS_DONT_MATCH' 
      };
    }
    return null;
  },

  // Custom validation
  custom: (validator: (value: any, data?: any) => boolean, message = 'قيمة غير صحيحة') => (value: any, data: any): ValidationError | null => {
    if (!validator(value, data)) {
      return { field: '', message, code: 'CUSTOM_VALIDATION' };
    }
    return null;
  }
};

// ============================================
// 3. Form Validators
// ============================================

export class FormValidator {
  private rules: ValidationRule[] = [];

  addRule(field: string, ...rules: Array<(value: any, data?: any) => ValidationError | null>) {
    this.rules.push({ field, rules });
    return this;
  }

  validate(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of this.rules) {
      const value = this.getFieldValue(data, rule.field);
      
      // Apply transform if exists
      const transformedValue = rule.transform ? rule.transform(value) : value;
      
      // Apply all rules
      for (const validator of rule.rules) {
        const error = validator(transformedValue, data);
        if (error) {
          errors.push({ ...error, field: rule.field });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? data : undefined
    };
  }

  private getFieldValue(data: any, field: string): any {
    const parts = field.split('.');
    let value = data;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
}

// ============================================
// 4. Zod Schema Validators (Advanced)
// ============================================

export const ZodSchemas = {
  // User schemas
  loginSchema: z.object({
    identifier: z.string()
      .min(1, 'اسم المستخدم أو رقم الهاتف مطلوب')
      .refine(val => val.length >= 3, 'يجب أن يكون 3 أحرف على الأقل'),
    password: z.string()
      .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
  }),

  registerSchema: z.object({
    name: z.string()
      .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
      .max(50, 'الاسم يجب ألا يتجاوز 50 حرف'),
    phone: z.string()
      .regex(/^(\+?218)?[0]?[9][0-9]{8}$/, 'رقم الهاتف الليبي غير صحيح'),
    email: z.string()
      .email('البريد الإلكتروني غير صحيح')
      .optional()
      .or(z.literal('')),
    password: z.string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على أحرف وأرقام'),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword']
  }),

  // Auction schemas
  createAuctionSchema: z.object({
    title: z.string()
      .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل')
      .max(100, 'العنوان يجب ألا يتجاوز 100 حرف'),
    description: z.string()
      .min(20, 'الوصف يجب أن يكون 20 حرف على الأقل')
      .max(2000, 'الوصف يجب ألا يتجاوز 2000 حرف'),
    starting_price: z.number()
      .min(100, 'السعر الابتدائي يجب أن يكون 100 دينار على الأقل'),
    minimum_bid_increment: z.number()
      .min(10, 'الحد الأدنى للمزايدة يجب أن يكون 10 دينار على الأقل'),
    start_time: z.string()
      .refine(val => new Date(val) > new Date(), 'تاريخ البدء يجب أن يكون في المستقبل'),
    end_time: z.string()
  }).refine(data => new Date(data.end_time) > new Date(data.start_time), {
    message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء',
    path: ['end_time']
  }),

  // Car schemas
  carSchema: z.object({
    brand: z.string()
      .min(2, 'الماركة مطلوبة'),
    model: z.string()
      .min(2, 'الموديل مطلوب'),
    year: z.number()
      .min(1990, 'السنة يجب أن تكون 1990 أو أحدث')
      .max(new Date().getFullYear() + 1, 'السنة غير صحيحة'),
    mileage: z.number()
      .min(0, 'المسافة المقطوعة غير صحيحة'),
    price: z.number()
      .min(0, 'السعر غير صحيح'),
    fuel_type: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']),
    transmission: z.enum(['MANUAL', 'AUTOMATIC']),
    color: z.string()
      .min(2, 'اللون مطلوب'),
    description: z.string()
      .optional()
  }),

  // Transport schemas
  transportServiceSchema: z.object({
    company_name: z.string()
      .min(3, 'اسم الشركة يجب أن يكون 3 أحرف على الأقل')
      .max(100, 'اسم الشركة يجب ألا يتجاوز 100 حرف'),
    responsible_person: z.string()
      .min(3, 'اسم الشخص المسؤول مطلوب'),
    phone: z.string()
      .regex(/^(\+?218)?[0]?[9][0-9]{8}$/, 'رقم الهاتف غير صحيح'),
    license_number: z.string()
      .min(5, 'رقم الرخصة مطلوب'),
    service_regions: z.array(z.string())
      .min(1, 'يجب اختيار منطقة واحدة على الأقل'),
    vehicle_types: z.array(z.string())
      .min(1, 'يجب اختيار نوع مركبة واحد على الأقل'),
    pricing_per_km: z.number()
      .min(0, 'السعر لكل كيلومتر غير صحيح'),
    minimum_price: z.number()
      .min(0, 'الحد الأدنى للسعر غير صحيح')
  }),

  // Payment schemas
  paymentSchema: z.object({
    amount: z.number()
      .min(1, 'المبلغ يجب أن يكون أكبر من صفر'),
    payment_method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD']),
    reference_number: z.string()
      .optional()
  })
};

// ============================================
// 5. Validation Helpers
// ============================================

export const ValidationHelpers = {
  /**
   * Validate form data using Zod schema
   */
  validateWithSchema: <T>(schema: z.ZodSchema<T>, data: any): ValidationResult => {
    try {
      const validated = schema.parse(data);
      return {
        isValid: true,
        errors: [],
        data: validated
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code || 'VALIDATION_ERROR'
        }));
        return {
          isValid: false,
          errors
        };
      }
      return {
        isValid: false,
        errors: [{
          field: '',
          message: 'خطأ في التحقق من البيانات',
          code: 'UNKNOWN_ERROR'
        }]
      };
    }
  },

  /**
   * Format validation errors for display
   */
  formatErrors: (errors: ValidationError[]): Record<string, string> => {
    const formatted: Record<string, string> = {};
    errors.forEach(error => {
      if (error.field) {
        formatted[error.field] = error.message;
      }
    });
    return formatted;
  },

  /**
   * Get first error message
   */
  getFirstError: (errors: ValidationError[]): string | null => {
    return errors.length > 0 ? errors[0].message : null;
  },

  /**
   * Clean Libyan phone number
   */
  cleanLibyanPhone: (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove country code if exists
    if (cleaned.startsWith('218')) {
      cleaned = cleaned.substring(3);
    }
    
    // Remove leading zero if exists
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Add country code
    return `+218${cleaned}`;
  },

  /**
   * Validate file upload
   */
  validateFile: (file: File, options: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
  } = {}): ValidationError | null => {
    const { maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'] } = options;
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return {
        field: 'file',
        message: `حجم الملف يجب ألا يتجاوز ${maxSize} ميجابايت`,
        code: 'FILE_TOO_LARGE'
      };
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        field: 'file',
        message: 'نوع الملف غير مسموح',
        code: 'INVALID_FILE_TYPE'
      };
    }
    
    return null;
  }
};

// ============================================
// 6. React Hook for Validation
// ============================================

export function useValidation<T>(schema?: z.ZodSchema<T>) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValid, setIsValid] = React.useState(true);

  const validate = React.useCallback((data: any): boolean => {
    if (!schema) return true;
    
    const result = ValidationHelpers.validateWithSchema(schema, data);
    const formattedErrors = ValidationHelpers.formatErrors(result.errors);
    
    setErrors(formattedErrors);
    setIsValid(result.isValid);
    
    return result.isValid;
  }, [schema]);

  const clearErrors = React.useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  const setFieldError = React.useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
    setIsValid(false);
  }, []);

  const clearFieldError = React.useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    if (Object.keys(errors).length === 1 && errors[field]) {
      setIsValid(true);
    }
  }, [errors]);

  return {
    errors,
    isValid,
    validate,
    clearErrors,
    setFieldError,
    clearFieldError
  };
}

// Import React for the hook
import React from 'react';

export default {
  ValidationRules,
  FormValidator,
  ZodSchemas,
  ValidationHelpers,
  useValidation
};
