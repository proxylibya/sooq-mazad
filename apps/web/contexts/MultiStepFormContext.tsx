/**
 * MultiStepFormContext
 * Context عالمي لإدارة النماذج متعددة الخطوات
 *
 * يوفر:
 * - مشاركة البيانات بين صفحات النموذج
 * - حفظ واسترجاع تلقائي
 * - تتبع التقدم والخطوات
 * - دعم نماذج متعددة في نفس الوقت
 */

import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FORM_STORAGE_KEYS, FormPersistence } from '../lib/forms/form-persistence';

// ============================================
// 1. Types & Interfaces
// ============================================

export interface FormStep {
  id: string;
  title: string;
  path: string;
  isRequired?: boolean;
}

export interface FormConfig {
  id: string;
  name: string;
  steps: FormStep[];
  basePath: string;
  expirationMinutes?: number;
}

export interface FormInstance<T = Record<string, any>> {
  config: FormConfig;
  data: T;
  currentStepIndex: number;
  completedSteps: Set<number>;
  isDirty: boolean;
  lastSaved: Date | null;
}

interface MultiStepFormContextValue {
  // إدارة النماذج
  registerForm: <T>(config: FormConfig, initialData: T) => void;
  unregisterForm: (formId: string) => void;
  getFormInstance: <T>(formId: string) => FormInstance<T> | null;

  // البيانات
  getFormData: <T>(formId: string) => T | null;
  setFormData: <T>(formId: string, data: T | ((prev: T) => T)) => void;
  updateFormField: <T, K extends keyof T>(formId: string, field: K, value: T[K]) => void;
  mergeFormData: <T>(formId: string, partialData: Partial<T>) => void;

  // التنقل
  getCurrentStep: (formId: string) => number;
  setCurrentStep: (formId: string, stepIndex: number) => void;
  goToNextStep: (formId: string) => void;
  goToPrevStep: (formId: string) => void;
  goToStepByPath: (formId: string, path: string) => void;

  // الحفظ والاسترجاع
  saveForm: (formId: string) => boolean;
  loadForm: <T>(formId: string) => T | null;
  clearForm: (formId: string) => void;
  hasSavedDraft: (formId: string) => boolean;

  // حالة الخطوات
  markStepComplete: (formId: string, stepIndex: number) => void;
  markStepIncomplete: (formId: string, stepIndex: number) => void;
  isStepComplete: (formId: string, stepIndex: number) => boolean;
  getCompletedSteps: (formId: string) => number[];
  getProgress: (formId: string) => number;

  // حالة عامة
  activeFormId: string | null;
  setActiveFormId: (formId: string | null) => void;
}

// ============================================
// 2. تكوينات النماذج المعرفة مسبقاً
// ============================================

export const PREDEFINED_FORMS: Record<string, FormConfig> = {
  // نموذج إضافة إعلان سيارة
  carListing: {
    id: FORM_STORAGE_KEYS.CAR_LISTING,
    name: 'إضافة إعلان سيارة',
    basePath: '/add-listing',
    expirationMinutes: 120,
    steps: [
      { id: 'select-type', title: 'اختيار النوع', path: '' },
      { id: 'car-details', title: 'تفاصيل السيارة', path: '/car-details', isRequired: true },
      { id: 'upload-images', title: 'رفع الصور', path: '/upload-images', isRequired: true },
      { id: 'preview', title: 'المعاينة', path: '/preview' },
    ],
  },

  // نموذج خدمة النقل
  transportService: {
    id: FORM_STORAGE_KEYS.TRANSPORT_SERVICE,
    name: 'إضافة خدمة نقل',
    basePath: '/transport',
    expirationMinutes: 60,
    steps: [
      { id: 'service-details', title: 'تفاصيل الخدمة', path: '/add-service', isRequired: true },
    ],
  },

  // نموذج إضافة مركبة للمعرض
  showroomVehicle: {
    id: FORM_STORAGE_KEYS.SHOWROOM_VEHICLE,
    name: 'إضافة مركبة للمعرض',
    basePath: '/showroom',
    expirationMinutes: 60,
    steps: [
      { id: 'vehicle-details', title: 'تفاصيل المركبة', path: '/add-vehicle', isRequired: true },
    ],
  },
};

// ============================================
// 3. Context Creation
// ============================================

const MultiStepFormContext = createContext<MultiStepFormContextValue | undefined>(undefined);

// ============================================
// 4. Provider Component
// ============================================

interface MultiStepFormProviderProps {
  children: React.ReactNode;
}

export function MultiStepFormProvider({ children }: MultiStepFormProviderProps) {
  const router = useRouter();

  // تخزين النماذج النشطة
  const [forms, setForms] = useState<Map<string, FormInstance>>(new Map());
  const [activeFormId, setActiveFormId] = useState<string | null>(null);

  // مراجع لـ persistence instances
  const persistenceRefs = useRef<Map<string, FormPersistence>>(new Map());

  // ============================================
  // إدارة النماذج
  // ============================================

  const registerForm = useCallback(<T,>(config: FormConfig, initialData: T) => {
    // إنشاء persistence instance
    const persistence = new FormPersistence<T>({
      storageKey: config.id,
      expirationMinutes: config.expirationMinutes || 60,
      autoSave: true,
      autoSaveDelay: 1000,
    });

    persistenceRefs.current.set(config.id, persistence);

    // محاولة تحميل البيانات المحفوظة
    const savedResult = persistence.loadWithMetadata();
    let formData = initialData;
    let completedSteps = new Set<number>();
    let currentStepIndex = 0;
    let lastSaved: Date | null = null;

    if (savedResult.success && savedResult.data) {
      formData = { ...initialData, ...savedResult.data.data };
      if (savedResult.data.metadata?.completedSteps) {
        completedSteps = new Set(savedResult.data.metadata.completedSteps);
      }
      if (savedResult.data.stepIndex !== undefined) {
        currentStepIndex = savedResult.data.stepIndex;
      }
      lastSaved = new Date(savedResult.data.timestamp);
    }

    // إضافة النموذج للمخزن
    setForms((prev) => {
      const newForms = new Map(prev);
      newForms.set(config.id, {
        config,
        data: formData,
        currentStepIndex,
        completedSteps,
        isDirty: false,
        lastSaved,
      });
      return newForms;
    });

    setActiveFormId(config.id);
  }, []);

  const unregisterForm = useCallback(
    (formId: string) => {
      // حفظ البيانات قبل إلغاء التسجيل
      const persistence = persistenceRefs.current.get(formId);
      const form = forms.get(formId);

      if (persistence && form) {
        persistence.save(form.data, {
          stepIndex: form.currentStepIndex,
          metadata: { completedSteps: Array.from(form.completedSteps) },
        });
        persistence.dispose();
      }

      persistenceRefs.current.delete(formId);

      setForms((prev) => {
        const newForms = new Map(prev);
        newForms.delete(formId);
        return newForms;
      });

      if (activeFormId === formId) {
        setActiveFormId(null);
      }
    },
    [activeFormId, forms],
  );

  const getFormInstance = useCallback(
    <T,>(formId: string): FormInstance<T> | null => {
      return (forms.get(formId) as FormInstance<T>) || null;
    },
    [forms],
  );

  // ============================================
  // البيانات
  // ============================================

  const getFormData = useCallback(
    <T,>(formId: string): T | null => {
      const form = forms.get(formId);
      return form ? (form.data as T) : null;
    },
    [forms],
  );

  const setFormData = useCallback(<T,>(formId: string, data: T | ((prev: T) => T)) => {
    setForms((prev) => {
      const newForms = new Map(prev);
      const form = newForms.get(formId);

      if (form) {
        const newData =
          typeof data === 'function' ? (data as (prev: T) => T)(form.data as T) : data;

        newForms.set(formId, {
          ...form,
          data: newData,
          isDirty: true,
        });
      }

      return newForms;
    });
  }, []);

  const updateFormField = useCallback(
    <T, K extends keyof T>(formId: string, field: K, value: T[K]) => {
      setForms((prev) => {
        const newForms = new Map(prev);
        const form = newForms.get(formId);

        if (form) {
          newForms.set(formId, {
            ...form,
            data: { ...form.data, [field]: value },
            isDirty: true,
          });
        }

        return newForms;
      });
    },
    [],
  );

  const mergeFormData = useCallback(<T,>(formId: string, partialData: Partial<T>) => {
    setForms((prev) => {
      const newForms = new Map(prev);
      const form = newForms.get(formId);

      if (form) {
        newForms.set(formId, {
          ...form,
          data: { ...form.data, ...partialData },
          isDirty: true,
        });
      }

      return newForms;
    });
  }, []);

  // ============================================
  // التنقل
  // ============================================

  const getCurrentStep = useCallback(
    (formId: string): number => {
      return forms.get(formId)?.currentStepIndex || 0;
    },
    [forms],
  );

  const setCurrentStep = useCallback((formId: string, stepIndex: number) => {
    setForms((prev) => {
      const newForms = new Map(prev);
      const form = newForms.get(formId);

      if (form && stepIndex >= 0 && stepIndex < form.config.steps.length) {
        newForms.set(formId, {
          ...form,
          currentStepIndex: stepIndex,
        });
      }

      return newForms;
    });
  }, []);

  const goToNextStep = useCallback(
    (formId: string) => {
      const form = forms.get(formId);
      if (!form) return;

      const nextIndex = form.currentStepIndex + 1;
      if (nextIndex < form.config.steps.length) {
        // تحديد الخطوة الحالية كمكتملة
        setForms((prev) => {
          const newForms = new Map(prev);
          const currentForm = newForms.get(formId);

          if (currentForm) {
            const newCompletedSteps = new Set(currentForm.completedSteps);
            newCompletedSteps.add(currentForm.currentStepIndex);

            newForms.set(formId, {
              ...currentForm,
              currentStepIndex: nextIndex,
              completedSteps: newCompletedSteps,
            });
          }

          return newForms;
        });

        // التنقل للصفحة
        const nextStep = form.config.steps[nextIndex];
        router.push(`${form.config.basePath}${nextStep.path}`);
      }
    },
    [forms, router],
  );

  const goToPrevStep = useCallback(
    (formId: string) => {
      const form = forms.get(formId);
      if (!form) return;

      const prevIndex = form.currentStepIndex - 1;
      if (prevIndex >= 0) {
        setCurrentStep(formId, prevIndex);

        const prevStep = form.config.steps[prevIndex];
        router.push(`${form.config.basePath}${prevStep.path}`);
      }
    },
    [forms, router, setCurrentStep],
  );

  const goToStepByPath = useCallback(
    (formId: string, path: string) => {
      const form = forms.get(formId);
      if (!form) return;

      const stepIndex = form.config.steps.findIndex((s) => s.path === path);
      if (stepIndex !== -1) {
        setCurrentStep(formId, stepIndex);
        router.push(`${form.config.basePath}${path}`);
      }
    },
    [forms, router, setCurrentStep],
  );

  // ============================================
  // الحفظ والاسترجاع
  // ============================================

  const saveForm = useCallback(
    (formId: string): boolean => {
      const form = forms.get(formId);
      const persistence = persistenceRefs.current.get(formId);

      if (!form || !persistence) return false;

      const result = persistence.save(form.data, {
        stepIndex: form.currentStepIndex,
        metadata: { completedSteps: Array.from(form.completedSteps) },
      });

      if (result.success) {
        setForms((prev) => {
          const newForms = new Map(prev);
          newForms.set(formId, {
            ...form,
            isDirty: false,
            lastSaved: new Date(),
          });
          return newForms;
        });
      }

      return result.success;
    },
    [forms],
  );

  const loadForm = useCallback(<T,>(formId: string): T | null => {
    const persistence = persistenceRefs.current.get(formId);
    if (!persistence) return null;

    const result = persistence.load();
    return result.success ? (result.data as T) : null;
  }, []);

  const clearForm = useCallback((formId: string) => {
    const persistence = persistenceRefs.current.get(formId);
    persistence?.clear();

    setForms((prev) => {
      const newForms = new Map(prev);
      const form = newForms.get(formId);

      if (form) {
        newForms.set(formId, {
          ...form,
          data: {},
          currentStepIndex: 0,
          completedSteps: new Set(),
          isDirty: false,
          lastSaved: null,
        });
      }

      return newForms;
    });
  }, []);

  const hasSavedDraft = useCallback((formId: string): boolean => {
    const persistence = persistenceRefs.current.get(formId);
    return persistence?.hasSavedData() || false;
  }, []);

  // ============================================
  // حالة الخطوات
  // ============================================

  const markStepComplete = useCallback((formId: string, stepIndex: number) => {
    setForms((prev) => {
      const newForms = new Map(prev);
      const form = newForms.get(formId);

      if (form) {
        const newCompletedSteps = new Set(form.completedSteps);
        newCompletedSteps.add(stepIndex);

        newForms.set(formId, {
          ...form,
          completedSteps: newCompletedSteps,
        });
      }

      return newForms;
    });
  }, []);

  const markStepIncomplete = useCallback((formId: string, stepIndex: number) => {
    setForms((prev) => {
      const newForms = new Map(prev);
      const form = newForms.get(formId);

      if (form) {
        const newCompletedSteps = new Set(form.completedSteps);
        newCompletedSteps.delete(stepIndex);

        newForms.set(formId, {
          ...form,
          completedSteps: newCompletedSteps,
        });
      }

      return newForms;
    });
  }, []);

  const isStepComplete = useCallback(
    (formId: string, stepIndex: number): boolean => {
      const form = forms.get(formId);
      return form?.completedSteps.has(stepIndex) || false;
    },
    [forms],
  );

  const getCompletedSteps = useCallback(
    (formId: string): number[] => {
      const form = forms.get(formId);
      return form ? Array.from(form.completedSteps) : [];
    },
    [forms],
  );

  const getProgress = useCallback(
    (formId: string): number => {
      const form = forms.get(formId);
      if (!form || form.config.steps.length === 0) return 0;

      return (form.completedSteps.size / form.config.steps.length) * 100;
    },
    [forms],
  );

  // ============================================
  // الحفظ التلقائي عند تغيير البيانات
  // ============================================

  useEffect(() => {
    forms.forEach((form, formId) => {
      if (form.isDirty) {
        saveForm(formId);
      }
    });
  }, [forms, saveForm]);

  // ============================================
  // Context Value
  // ============================================

  const contextValue = useMemo<MultiStepFormContextValue>(
    () => ({
      // إدارة النماذج
      registerForm,
      unregisterForm,
      getFormInstance,

      // البيانات
      getFormData,
      setFormData,
      updateFormField,
      mergeFormData,

      // التنقل
      getCurrentStep,
      setCurrentStep,
      goToNextStep,
      goToPrevStep,
      goToStepByPath,

      // الحفظ والاسترجاع
      saveForm,
      loadForm,
      clearForm,
      hasSavedDraft,

      // حالة الخطوات
      markStepComplete,
      markStepIncomplete,
      isStepComplete,
      getCompletedSteps,
      getProgress,

      // حالة عامة
      activeFormId,
      setActiveFormId,
    }),
    [
      registerForm,
      unregisterForm,
      getFormInstance,
      getFormData,
      setFormData,
      updateFormField,
      mergeFormData,
      getCurrentStep,
      setCurrentStep,
      goToNextStep,
      goToPrevStep,
      goToStepByPath,
      saveForm,
      loadForm,
      clearForm,
      hasSavedDraft,
      markStepComplete,
      markStepIncomplete,
      isStepComplete,
      getCompletedSteps,
      getProgress,
      activeFormId,
    ],
  );

  return (
    <MultiStepFormContext.Provider value={contextValue}>{children}</MultiStepFormContext.Provider>
  );
}

// ============================================
// 5. Custom Hook
// ============================================

export function useMultiStepFormContext(): MultiStepFormContextValue {
  const context = useContext(MultiStepFormContext);

  if (!context) {
    throw new Error('useMultiStepFormContext must be used within a MultiStepFormProvider');
  }

  return context;
}

// ============================================
// 6. Hook سهل للنماذج المعرفة مسبقاً
// ============================================

export function useCarListingForm<T extends Record<string, any>>(initialData: T) {
  const context = useMultiStepFormContext();
  const formId = PREDEFINED_FORMS.carListing.id;

  useEffect(() => {
    context.registerForm(PREDEFINED_FORMS.carListing, initialData);

    return () => {
      context.saveForm(formId);
    };
  }, []);

  return {
    data: context.getFormData<T>(formId) || initialData,
    setData: (data: T) => context.setFormData(formId, data),
    updateField: <K extends keyof T>(field: K, value: T[K]) =>
      context.updateFormField<T, K>(formId, field, value),
    save: () => context.saveForm(formId),
    clear: () => context.clearForm(formId),
    goNext: () => context.goToNextStep(formId),
    goPrev: () => context.goToPrevStep(formId),
    currentStep: context.getCurrentStep(formId),
    progress: context.getProgress(formId),
  };
}

export default MultiStepFormContext;
