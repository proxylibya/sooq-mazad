import { useState, useCallback, useRef, useEffect } from 'react';
import {
  scrollToFirstError,
  scrollToField,
  addFieldAttributes,
  type ScrollToFieldOptions,
} from '../utils/formScrollUtils';

export interface ValidationRule<T = any> {
  /** دالة التحقق */
  validator: (value: T, formData?: any) => boolean;
  /** رسالة الخطأ */
  message: string;
  /** هل الحقل مطلوب */
  required?: boolean;
}

export interface FieldValidationRules {
  [fieldName: string]: ValidationRule | ValidationRule[];
}

export interface UseFormValidationOptions {
  /** التوجه تلقائياً لأول خطأ */
  autoScroll?: boolean;
  /** خيارات التوجه */
  scrollOptions?: ScrollToFieldOptions;
  /** تفعيل التحقق عند التغيير */
  validateOnChange?: boolean;
  /** تفعيل التحقق عند Blur */
  validateOnBlur?: boolean;
}

/**
 * Hook مخصص للتحقق من صحة النماذج مع ميزة Auto-scroll
 *
 * @example
 * ```tsx
 * const { errors, validate, clearError } = useFormValidation({
 *   brand: { validator: (v) => !!v, message: 'يرجى اختيار الماركة', required: true },
 *   price: [
 *     { validator: (v) => !!v, message: 'السعر مطلوب', required: true },
 *     { validator: (v) => Number(v) > 0, message: 'السعر يجب أن يكون موجباً' }
 *   ]
 * });
 *
 * const handleSubmit = () => {
 *   if (validate(formData)) {
 *     // Submit form
 *   }
 * };
 * ```
 */
export const useFormValidation = <T extends Record<string, any>>(
  rules: FieldValidationRules,
  options: UseFormValidationOptions = {},
) => {
  const {
    autoScroll = true,
    scrollOptions = {},
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // إضافة data-field attributes تلقائياً
  useEffect(() => {
    if (formRef.current) {
      addFieldAttributes(formRef.current);
    }
  }, []);

  /**
   * التحقق من حقل واحد
   */
  const validateField = useCallback(
    (fieldName: string, value: any, formData?: T): string => {
      const fieldRules = rules[fieldName];
      if (!fieldRules) return '';

      const rulesToCheck = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

      for (const rule of rulesToCheck) {
        // التحقق من الحقول المطلوبة
        if (rule.required && (!value || value === '')) {
          return rule.message;
        }

        // تطبيق دالة التحقق
        if (value && !rule.validator(value, formData)) {
          return rule.message;
        }
      }

      return '';
    },
    [rules],
  );

  /**
   * التحقق من جميع الحقول
   */
  const validate = useCallback(
    (formData: T): boolean => {
      const newErrors: Record<string, string> = {};

      // التحقق من كل حقل
      Object.keys(rules).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName], formData);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);

      // التوجه لأول خطأ إذا كان مفعلاً
      if (autoScroll && Object.keys(newErrors).length > 0) {
        setTimeout(() => {
          scrollToFirstError(newErrors, scrollOptions);
        }, 100);
      }

      return Object.keys(newErrors).length === 0;
    },
    [rules, validateField, autoScroll, scrollOptions],
  );

  /**
   * التحقق من حقل واحد وتحديث الأخطاء
   */
  const validateSingleField = useCallback(
    (fieldName: string, value: any, formData?: T) => {
      const error = validateField(fieldName, value, formData);

      setErrors((prev) => {
        if (error) {
          return { ...prev, [fieldName]: error };
        } else {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        }
      });

      return !error;
    },
    [validateField],
  );

  /**
   * مسح خطأ حقل معين
   */
  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * مسح جميع الأخطاء
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * التوجه يدوياً لحقل معين
   */
  const scrollTo = useCallback(
    (fieldName: string) => {
      scrollToField(fieldName, scrollOptions);
    },
    [scrollOptions],
  );

  /**
   * معالج onChange مع التحقق التلقائي
   */
  const handleChange = useCallback(
    (fieldName: string, value: any, formData?: T) => {
      if (validateOnChange) {
        validateSingleField(fieldName, value, formData);
      } else if (errors[fieldName]) {
        // مسح الخطأ فقط إذا كان موجوداً
        clearError(fieldName);
      }
    },
    [validateOnChange, validateSingleField, errors, clearError],
  );

  /**
   * معالج onBlur مع التحقق التلقائي
   */
  const handleBlur = useCallback(
    (fieldName: string, value: any, formData?: T) => {
      if (validateOnBlur) {
        validateSingleField(fieldName, value, formData);
      }
    },
    [validateOnBlur, validateSingleField],
  );

  return {
    /** الأخطاء الحالية */
    errors,
    /** التحقق من جميع الحقول */
    validate,
    /** التحقق من حقل واحد */
    validateField: validateSingleField,
    /** مسح خطأ حقل معين */
    clearError,
    /** مسح جميع الأخطاء */
    clearAllErrors,
    /** التوجه لحقل معين */
    scrollTo,
    /** معالج onChange */
    handleChange,
    /** معالج onBlur */
    handleBlur,
    /** مرجع النموذج */
    formRef,
  };
};

/**
 * Hook بسيط للتحقق السريع من النماذج
 */
export const useQuickValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndScroll = useCallback((validationErrors: Record<string, string>) => {
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setTimeout(() => {
        scrollToFirstError(validationErrors, {
          offset: 100,
          behavior: 'smooth',
          focus: true,
          highlight: true,
        });
      }, 100);
    }

    return Object.keys(validationErrors).length === 0;
  }, []);

  return {
    errors,
    setErrors,
    validateAndScroll,
    clearErrors: () => setErrors({}),
  };
};
