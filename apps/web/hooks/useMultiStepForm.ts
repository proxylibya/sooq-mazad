/**
 * useMultiStepForm Hook
 * Hook شامل لإدارة النماذج متعددة الخطوات
 * 
 * الميزات:
 * - حفظ واسترجاع تلقائي للبيانات
 * - تتبع الخطوات المكتملة
 * - التحقق من صحة كل خطوة
 * - دعم التنقل للأمام والخلف
 * - استرجاع المسودات
 * - حفظ تلقائي مع debounce
 */

import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FormPersistence,
    FormPersistenceConfig,
    StoredFormData,
} from '../lib/forms/form-persistence';

// ============================================
// 1. Types & Interfaces
// ============================================

export interface MultiStepFormStep {
    /** معرف الخطوة */
    id: string;
    /** عنوان الخطوة */
    title: string;
    /** مسار الصفحة */
    path: string;
    /** هل الخطوة مطلوبة */
    required?: boolean;
    /** دالة التحقق من صحة الخطوة */
    validate?: (data: any) => boolean | Promise<boolean>;
}

export interface MultiStepFormConfig<T = any> {
    /** معرف النموذج الفريد */
    formId: string;
    /** القيم الابتدائية */
    initialValues: T;
    /** خطوات النموذج */
    steps: MultiStepFormStep[];
    /** إعدادات الحفظ */
    persistenceConfig?: Partial<FormPersistenceConfig>;
    /** حفظ تلقائي */
    autoSave?: boolean;
    /** فترة الانتظار قبل الحفظ التلقائي (ms) */
    autoSaveDelay?: number;
    /** callback عند تغيير البيانات */
    onChange?: (data: T) => void;
    /** callback عند الانتهاء */
    onComplete?: (data: T) => void;
    /** callback عند استرجاع المسودة */
    onDraftRestored?: (data: T) => void;
    /** المسار الأساسي للنموذج */
    basePath?: string;
}

export interface UseMultiStepFormReturn<T> {
    // البيانات
    data: T;
    setData: React.Dispatch<React.SetStateAction<T>>;
    updateField: <K extends keyof T>(field: K, value: T[K]) => void;
    updateFields: (fields: Partial<T>) => void;

    // الخطوات
    currentStep: number;
    currentStepInfo: MultiStepFormStep | undefined;
    totalSteps: number;
    completedSteps: number[];
    isFirstStep: boolean;
    isLastStep: boolean;
    progress: number;

    // التنقل
    goToStep: (stepIndex: number) => void;
    goToNextStep: () => void;
    goToPrevStep: () => void;
    goToStepByPath: (path: string) => void;

    // الحفظ والاسترجاع
    save: () => boolean;
    load: () => T | null;
    clear: () => void;
    hasDraft: boolean;
    lastSaveTime: Date | null;
    isDirty: boolean;

    // التحقق
    validateCurrentStep: () => Promise<boolean>;
    isStepValid: (stepIndex: number) => boolean;
    markStepComplete: (stepIndex: number) => void;
    markStepIncomplete: (stepIndex: number) => void;

    // حالة النموذج
    isLoading: boolean;
    error: string | null;
}

// ============================================
// 2. Default Configuration
// ============================================

const DEFAULT_CONFIG: Partial<MultiStepFormConfig> = {
    autoSave: true,
    autoSaveDelay: 1000,
    basePath: '',
};

// ============================================
// 3. useMultiStepForm Hook
// ============================================

export function useMultiStepForm<T extends Record<string, any>>(
    config: MultiStepFormConfig<T>
): UseMultiStepFormReturn<T> {
    const router = useRouter();
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    // المراجع
    const persistenceRef = useRef<FormPersistence<T> | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const initialLoadDoneRef = useRef(false);

    // الحالة
    const [data, setData] = useState<T>(config.initialValues);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

    // ============================================
    // إعداد Persistence
    // ============================================

    useEffect(() => {
        persistenceRef.current = new FormPersistence<T>({
            storageKey: config.formId,
            expirationMinutes: 120, // ساعتين
            autoSave: mergedConfig.autoSave,
            autoSaveDelay: mergedConfig.autoSaveDelay,
            ...config.persistenceConfig,
        });

        return () => {
            persistenceRef.current?.dispose();
        };
    }, [config.formId]);

    // ============================================
    // تحميل البيانات المحفوظة عند البداية
    // ============================================

    useEffect(() => {
        if (!persistenceRef.current || initialLoadDoneRef.current) return;

        const loadSavedData = () => {
            const result = persistenceRef.current!.loadWithMetadata();

            if (result.success && result.data) {
                const savedData = result.data as StoredFormData<T>;

                // دمج البيانات المحفوظة مع القيم الابتدائية
                const mergedData = { ...config.initialValues, ...savedData.data };
                setData(mergedData);

                // استرجاع الخطوات المكتملة
                if (savedData.metadata?.completedSteps) {
                    setCompletedSteps(savedData.metadata.completedSteps);
                }

                // استرجاع الخطوة الحالية
                if (savedData.stepIndex !== undefined) {
                    setCurrentStep(savedData.stepIndex);
                }

                setLastSaveTime(new Date(savedData.timestamp));

                // إشعار باسترجاع المسودة
                if (config.onDraftRestored) {
                    config.onDraftRestored(mergedData);
                }

                console.log('[MultiStepForm] تم استرجاع البيانات المحفوظة');
            }

            setIsLoading(false);
            initialLoadDoneRef.current = true;
        };

        loadSavedData();
    }, [config.initialValues, config.onDraftRestored]);

    // ============================================
    // تحديد الخطوة الحالية من المسار
    // ============================================

    useEffect(() => {
        const currentPath = router.pathname;
        const stepIndex = config.steps.findIndex((step) => {
            // مطابقة المسار مع أو بدون basePath
            const fullPath = mergedConfig.basePath
                ? `${mergedConfig.basePath}${step.path}`
                : step.path;
            return currentPath === fullPath || currentPath === step.path;
        });

        if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
        }
    }, [router.pathname, config.steps, mergedConfig.basePath]);

    // ============================================
    // الحفظ التلقائي
    // ============================================

    useEffect(() => {
        if (!mergedConfig.autoSave || !isDirty || !persistenceRef.current) return;

        // إلغاء المؤقت السابق
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // إعداد مؤقت جديد
        autoSaveTimerRef.current = setTimeout(() => {
            saveData();
        }, mergedConfig.autoSaveDelay);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [data, isDirty, mergedConfig.autoSave, mergedConfig.autoSaveDelay]);

    // ============================================
    // الحفظ قبل إغلاق الصفحة
    // ============================================

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                saveData();
                e.preventDefault();
                e.returnValue = 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, data]);

    // ============================================
    // Functions
    // ============================================

    /**
     * حفظ البيانات
     */
    const saveData = useCallback((): boolean => {
        if (!persistenceRef.current) return false;

        const result = persistenceRef.current.save(data, {
            stepIndex: currentStep,
            metadata: {
                completedSteps,
                lastField: undefined,
            },
        });

        if (result.success) {
            setIsDirty(false);
            setLastSaveTime(new Date());
        } else {
            setError(result.error || 'فشل في حفظ البيانات');
        }

        return result.success;
    }, [data, currentStep, completedSteps]);

    /**
     * تحميل البيانات
     */
    const loadData = useCallback((): T | null => {
        if (!persistenceRef.current) return null;

        const result = persistenceRef.current.load();
        return result.success ? result.data || null : null;
    }, []);

    /**
     * مسح البيانات
     */
    const clearData = useCallback((): void => {
        persistenceRef.current?.clear();
        setData(config.initialValues);
        setCompletedSteps([]);
        setCurrentStep(0);
        setIsDirty(false);
        setLastSaveTime(null);
    }, [config.initialValues]);

    /**
     * تحديث حقل واحد
     */
    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setData((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);

        if (config.onChange) {
            config.onChange({ ...data, [field]: value });
        }
    }, [data, config.onChange]);

    /**
     * تحديث عدة حقول
     */
    const updateFields = useCallback((fields: Partial<T>) => {
        setData((prev) => ({ ...prev, ...fields }));
        setIsDirty(true);

        if (config.onChange) {
            config.onChange({ ...data, ...fields });
        }
    }, [data, config.onChange]);

    /**
     * الانتقال إلى خطوة معينة
     */
    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex < 0 || stepIndex >= config.steps.length) return;

        // حفظ البيانات قبل التنقل
        saveData();

        const step = config.steps[stepIndex];
        const targetPath = mergedConfig.basePath
            ? `${mergedConfig.basePath}${step.path}`
            : step.path;

        setCurrentStep(stepIndex);
        router.push(targetPath);
    }, [config.steps, mergedConfig.basePath, router, saveData]);

    /**
     * الانتقال للخطوة التالية
     */
    const goToNextStep = useCallback(() => {
        if (currentStep < config.steps.length - 1) {
            // تحديد الخطوة الحالية كمكتملة
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps((prev) => [...prev, currentStep]);
            }
            goToStep(currentStep + 1);
        } else if (config.onComplete) {
            // آخر خطوة - استدعاء onComplete
            saveData();
            config.onComplete(data);
        }
    }, [currentStep, config.steps.length, completedSteps, goToStep, data, saveData, config.onComplete]);

    /**
     * الانتقال للخطوة السابقة
     */
    const goToPrevStep = useCallback(() => {
        if (currentStep > 0) {
            goToStep(currentStep - 1);
        }
    }, [currentStep, goToStep]);

    /**
     * الانتقال لخطوة بواسطة المسار
     */
    const goToStepByPath = useCallback((path: string) => {
        const stepIndex = config.steps.findIndex((s) => s.path === path);
        if (stepIndex !== -1) {
            goToStep(stepIndex);
        }
    }, [config.steps, goToStep]);

    /**
     * التحقق من صحة الخطوة الحالية
     */
    const validateCurrentStep = useCallback(async (): Promise<boolean> => {
        const step = config.steps[currentStep];
        if (!step?.validate) return true;

        try {
            return await step.validate(data);
        } catch {
            return false;
        }
    }, [currentStep, config.steps, data]);

    /**
     * التحقق من صحة خطوة معينة
     */
    const isStepValid = useCallback((stepIndex: number): boolean => {
        return completedSteps.includes(stepIndex);
    }, [completedSteps]);

    /**
     * تحديد خطوة كمكتملة
     */
    const markStepComplete = useCallback((stepIndex: number) => {
        if (!completedSteps.includes(stepIndex)) {
            setCompletedSteps((prev) => [...prev, stepIndex]);
        }
    }, [completedSteps]);

    /**
     * تحديد خطوة كغير مكتملة
     */
    const markStepIncomplete = useCallback((stepIndex: number) => {
        setCompletedSteps((prev) => prev.filter((s) => s !== stepIndex));
    }, []);

    // ============================================
    // Computed Values
    // ============================================

    const currentStepInfo = useMemo(() => {
        return config.steps[currentStep];
    }, [config.steps, currentStep]);

    const totalSteps = config.steps.length;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
    const hasDraft = persistenceRef.current?.hasSavedData() || false;

    // ============================================
    // Return
    // ============================================

    return {
        // البيانات
        data,
        setData,
        updateField,
        updateFields,

        // الخطوات
        currentStep,
        currentStepInfo,
        totalSteps,
        completedSteps,
        isFirstStep,
        isLastStep,
        progress,

        // التنقل
        goToStep,
        goToNextStep,
        goToPrevStep,
        goToStepByPath,

        // الحفظ والاسترجاع
        save: saveData,
        load: loadData,
        clear: clearData,
        hasDraft,
        lastSaveTime,
        isDirty,

        // التحقق
        validateCurrentStep,
        isStepValid,
        markStepComplete,
        markStepIncomplete,

        // حالة النموذج
        isLoading,
        error,
    };
}

export default useMultiStepForm;
