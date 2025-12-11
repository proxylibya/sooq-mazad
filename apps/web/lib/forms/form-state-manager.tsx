// @ts-nocheck
/**
 * Form State Management System
 * نظام إدارة حالة النماذج الموحد
 * Centralized form state handling with validation
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { z } from 'zod';
import { ValidationHelpers, ValidationResult } from '../validation/unified-validation-system';

// ============================================
// 1. Types & Interfaces
// ============================================

export interface FormField {
  value: any;
  error?: string;
  touched: boolean;
  isDirty: boolean;
  isValidating: boolean;
}

export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  isValid: boolean;
}

export interface FormOptions<T = any> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  onSubmit: (values: T) => void | Promise<void>;
  onError?: (errors: Record<string, string>) => void;
  onReset?: () => void;
}

// ============================================
// 2. Action Types
// ============================================

type FormAction<T = any> =
  | { type: 'SET_VALUES'; payload: Partial<T> }
  | { type: 'SET_FIELD_VALUE'; payload: { field: string; value: any } }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; error: string | undefined } }
  | { type: 'SET_TOUCHED'; payload: { field: string; touched: boolean } }
  | { type: 'SET_MULTIPLE_TOUCHED'; payload: Record<string, boolean> }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_VALIDATING'; payload: boolean }
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_FAILURE' }
  | { type: 'RESET'; payload: T }
  | { type: 'SET_FORM_STATE'; payload: Partial<FormState<T>> };

// ============================================
// 3. Form Reducer
// ============================================

function formReducer<T = any>(state: FormState<T>, action: FormAction<T>): FormState<T> {
  switch (action.type) {
    case 'SET_VALUES':
      return {
        ...state,
        values: { ...state.values, ...action.payload },
        isDirty: true,
      };

    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.field]: action.payload.value,
        },
        isDirty: true,
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
        isValid: Object.keys(action.payload).length === 0,
      };

    case 'SET_FIELD_ERROR':
      const newErrors = { ...state.errors };
      if (action.payload.error) {
        newErrors[action.payload.field] = action.payload.error;
      } else {
        delete newErrors[action.payload.field];
      }
      return {
        ...state,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };

    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.payload.field]: action.payload.touched,
        },
      };

    case 'SET_MULTIPLE_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, ...action.payload },
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case 'SET_VALIDATING':
      return {
        ...state,
        isValidating: action.payload,
      };

    case 'SUBMIT_ATTEMPT':
      return {
        ...state,
        submitCount: state.submitCount + 1,
        isSubmitting: true,
      };

    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
      };

    case 'SUBMIT_FAILURE':
      return {
        ...state,
        isSubmitting: false,
      };

    case 'RESET':
      return {
        values: action.payload,
        errors: {},
        touched: {},
        isDirty: false,
        isSubmitting: false,
        isValidating: false,
        submitCount: 0,
        isValid: true,
      };

    case 'SET_FORM_STATE':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

// ============================================
// 4. useFormState Hook
// ============================================

export function useFormState<T = any>(options: FormOptions<T>) {
  const {
    initialValues,
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    onSubmit,
    onError,
    onReset,
  } = options;

  // Initial state
  const initialState: FormState<T> = {
    values: initialValues,
    errors: {},
    touched: {},
    isDirty: false,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    isValid: true,
  };

  const [state, dispatch] = useReducer(
    formReducer as (state: FormState<T>, action: FormAction<T>) => FormState<T>,
    initialState,
  );

  const isFirstRender = useRef(true);

  // Validate form
  const validateForm = useCallback(
    async (values?: T): Promise<ValidationResult> => {
      if (!validationSchema) {
        return { isValid: true, errors: [] };
      }

      dispatch({ type: 'SET_VALIDATING', payload: true });

      const valuesToValidate = values || state.values;
      const result = ValidationHelpers.validateWithSchema(validationSchema, valuesToValidate);

      const formattedErrors = ValidationHelpers.formatErrors(result.errors);
      dispatch({ type: 'SET_ERRORS', payload: formattedErrors });
      dispatch({ type: 'SET_VALIDATING', payload: false });

      return result;
    },
    [validationSchema, state.values],
  );

  // Validate single field
  const validateField = useCallback(
    async (field: string, value: any): Promise<string | undefined> => {
      if (!validationSchema) return undefined;

      try {
        // Create partial schema for single field validation
        const fieldSchema = validationSchema.shape[field as keyof typeof validationSchema.shape];
        if (!fieldSchema) return undefined;

        await fieldSchema.parseAsync(value);
        dispatch({ type: 'SET_FIELD_ERROR', payload: { field, error: undefined } });
        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors[0]?.message;
          dispatch({ type: 'SET_FIELD_ERROR', payload: { field, error: errorMessage } });
          return errorMessage;
        }
        return undefined;
      }
    },
    [validationSchema],
  );

  // Set field value
  const setFieldValue = useCallback(
    async (field: string, value: any) => {
      dispatch({ type: 'SET_FIELD_VALUE', payload: { field, value } });

      if (validateOnChange) {
        await validateField(field, value);
      }
    },
    [validateOnChange, validateField],
  );

  // Set multiple values
  const setValues = useCallback(
    async (values: Partial<T>) => {
      dispatch({ type: 'SET_VALUES', payload: values });

      if (validateOnChange) {
        await validateForm({ ...state.values, ...values });
      }
    },
    [validateOnChange, validateForm, state.values],
  );

  // Set field touched
  const setFieldTouched = useCallback(
    async (field: string, touched = true) => {
      dispatch({ type: 'SET_TOUCHED', payload: { field, touched } });

      if (validateOnBlur && touched) {
        const value = (state.values as any)[field];
        await validateField(field, value);
      }
    },
    [validateOnBlur, validateField, state.values],
  );

  // Set multiple fields touched
  const setTouched = useCallback((touched: Record<string, boolean>) => {
    dispatch({ type: 'SET_MULTIPLE_TOUCHED', payload: touched });
  }, []);

  // Handle field change
  const handleChange = useCallback(
    (field: string) => async (value: any) => {
      await setFieldValue(field, value);
    },
    [setFieldValue],
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: string) => async () => {
      await setFieldTouched(field, true);
    },
    [setFieldTouched],
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      dispatch({ type: 'SUBMIT_ATTEMPT' });

      // Touch all fields
      const allTouched = Object.keys(state.values as object).reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {},
      );
      setTouched(allTouched);

      // Validate form
      const validationResult = await validateForm();

      if (!validationResult.isValid) {
        dispatch({ type: 'SUBMIT_FAILURE' });
        if (onError) {
          onError(state.errors);
        }
        return;
      }

      try {
        await onSubmit(state.values);
        dispatch({ type: 'SUBMIT_SUCCESS' });
      } catch (error) {
        dispatch({ type: 'SUBMIT_FAILURE' });
        if (onError) {
          onError({
            submit: error instanceof Error ? error.message : 'حدث خطأ أثناء الإرسال',
          });
        }
      }
    },
    [state.values, state.errors, validateForm, onSubmit, onError, setTouched],
  );

  // Reset form
  const resetForm = useCallback(
    (values?: T) => {
      dispatch({ type: 'RESET', payload: values || initialValues });
      if (onReset) {
        onReset();
      }
    },
    [initialValues, onReset],
  );

  // Get field props
  const getFieldProps = useCallback(
    (field: string) => {
      const value = (state.values as any)[field];
      const error = state.errors[field];
      const touched = state.touched[field];

      return {
        name: field,
        value: value || '',
        error: touched ? error : undefined,
        onChange: handleChange(field),
        onBlur: handleBlur(field),
      };
    },
    [state.values, state.errors, state.touched, handleChange, handleBlur],
  );

  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount && isFirstRender.current) {
      isFirstRender.current = false;
      validateForm();
    }
  }, [validateOnMount, validateForm]);

  return {
    // State
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isDirty: state.isDirty,
    isSubmitting: state.isSubmitting,
    isValidating: state.isValidating,
    submitCount: state.submitCount,
    isValid: state.isValid,

    // Actions
    setFieldValue,
    setValues,
    setFieldTouched,
    setTouched,
    validateForm,
    validateField,
    handleSubmit,
    resetForm,

    // Helpers
    getFieldProps,
    handleChange,
    handleBlur,
  };
}

// ============================================
// 5. Form Provider Context (Optional)
// ============================================

import React, { createContext, useContext } from 'react';

type FormContextType<T = any> = ReturnType<typeof useFormState<T>>;

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider<T = any>({
  children,
  ...options
}: FormOptions<T> & { children: React.ReactNode }) {
  const formState = useFormState<T>(options);

  return (
    <FormContext.Provider value={formState as FormContextType}>{children}</FormContext.Provider>
  );
}

export function useFormContext<T = any>(): FormContextType<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context as FormContextType<T>;
}

// ============================================
// 6. Utility Functions
// ============================================

export const FormUtils = {
  /**
   * Check if form has errors
   */
  hasErrors: (errors: Record<string, string>): boolean => {
    return Object.keys(errors).length > 0;
  },

  /**
   * Get first error message
   */
  getFirstError: (errors: Record<string, string>): string | null => {
    const firstKey = Object.keys(errors)[0];
    return firstKey ? errors[firstKey] : null;
  },

  /**
   * Check if all fields are touched
   */
  allFieldsTouched: (touched: Record<string, boolean>, fields: string[]): boolean => {
    return fields.every((field) => touched[field]);
  },

  /**
   * Create form data from values
   */
  createFormData: (values: Record<string, any>): FormData => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(`${key}[]`, item);
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    return formData;
  },
};

export default {
  useFormState,
  FormProvider,
  useFormContext,
  FormUtils,
};
