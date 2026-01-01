/**
 * useFormPersistence Hook
 * Hook بسيط وسهل لحفظ واسترجاع بيانات النماذج
 * 
 * الاستخدام:
 * const { data, setData, updateField, save, load, clear, hasDraft } = useFormPersistence({
 *   key: 'carListingData',
 *   initialValues: { brand: '', model: '', ... },
 *   autoSave: true,
 * });
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// Types
// ============================================

export interface UseFormPersistenceConfig<T> {
    /** مفتاح التخزين */
    key: string;
    /** القيم الابتدائية */
    initialValues: T;
    /** حفظ تلقائي عند التغيير */
    autoSave?: boolean;
    /** فترة الانتظار قبل الحفظ التلقائي (ms) */
    autoSaveDelay?: number;
    /** مدة الصلاحية بالدقائق */
    expirationMinutes?: number;
    /** نوع التخزين */
    storageType?: 'local' | 'session';
    /** callback عند استرجاع المسودة */
    onDraftRestored?: (data: T) => void;
    /** callback عند التغيير */
    onChange?: (data: T) => void;
}

export interface UseFormPersistenceReturn<T> {
    /** البيانات الحالية */
    data: T;
    /** تعيين البيانات */
    setData: React.Dispatch<React.SetStateAction<T>>;
    /** تحديث حقل واحد */
    updateField: <K extends keyof T>(field: K, value: T[K]) => void;
    /** تحديث عدة حقول */
    updateFields: (fields: Partial<T>) => void;
    /** حفظ البيانات يدوياً */
    save: () => boolean;
    /** تحميل البيانات */
    load: () => T | null;
    /** مسح البيانات */
    clear: () => void;
    /** هل يوجد مسودة محفوظة */
    hasDraft: boolean;
    /** هل البيانات متغيرة (غير محفوظة) */
    isDirty: boolean;
    /** وقت آخر حفظ */
    lastSaved: Date | null;
    /** هل تم تحميل المسودة */
    draftLoaded: boolean;
}

// ============================================
// Storage Utilities
// ============================================

interface StoredData<T> {
    data: T;
    timestamp: number;
    version: number;
}

const STORAGE_VERSION = 1;

function getStorage(type: 'local' | 'session'): Storage | null {
    if (typeof window === 'undefined') return null;
    return type === 'local' ? localStorage : sessionStorage;
}

function isExpired(timestamp: number, expirationMinutes: number): boolean {
    const now = Date.now();
    const expirationTime = timestamp + expirationMinutes * 60 * 1000;
    return now > expirationTime;
}

// ============================================
// Hook Implementation
// ============================================

export function useFormPersistence<T extends Record<string, any>>(
    config: UseFormPersistenceConfig<T>
): UseFormPersistenceReturn<T> {
    const {
        key,
        initialValues,
        autoSave = true,
        autoSaveDelay = 1000,
        expirationMinutes = 120,
        storageType = 'local',
        onDraftRestored,
        onChange,
    } = config;

    // State
    const [data, setData] = useState<T>(initialValues);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasDraft, setHasDraft] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(false);

    // Refs
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const initialLoadRef = useRef(false);
    const storageKeyRef = useRef(`form_${key}_v${STORAGE_VERSION}`);

    // ============================================
    // Storage Functions
    // ============================================

    const getStorageKey = useCallback(() => storageKeyRef.current, []);

    const saveToStorage = useCallback((dataToSave: T): boolean => {
        const storage = getStorage(storageType);
        if (!storage) return false;

        try {
            const storedData: StoredData<T> = {
                data: dataToSave,
                timestamp: Date.now(),
                version: STORAGE_VERSION,
            };
            storage.setItem(getStorageKey(), JSON.stringify(storedData));
            setLastSaved(new Date());
            setIsDirty(false);
            setHasDraft(true);
            return true;
        } catch (error) {
            console.error('[useFormPersistence] خطأ في الحفظ:', error);
            return false;
        }
    }, [storageType, getStorageKey]);

    const loadFromStorage = useCallback((): T | null => {
        const storage = getStorage(storageType);
        if (!storage) return null;

        try {
            const storedString = storage.getItem(getStorageKey());
            if (!storedString) return null;

            const stored: StoredData<T> = JSON.parse(storedString);

            // التحقق من الإصدار
            if (stored.version !== STORAGE_VERSION) {
                console.log('[useFormPersistence] إصدار البيانات غير متوافق، سيتم مسحها');
                storage.removeItem(getStorageKey());
                return null;
            }

            // التحقق من انتهاء الصلاحية
            if (isExpired(stored.timestamp, expirationMinutes)) {
                console.log('[useFormPersistence] انتهت صلاحية البيانات المحفوظة');
                storage.removeItem(getStorageKey());
                return null;
            }

            return stored.data;
        } catch (error) {
            console.error('[useFormPersistence] خطأ في التحميل:', error);
            return null;
        }
    }, [storageType, expirationMinutes, getStorageKey]);

    const clearStorage = useCallback(() => {
        const storage = getStorage(storageType);
        if (storage) {
            storage.removeItem(getStorageKey());
        }
        setHasDraft(false);
        setLastSaved(null);
        setIsDirty(false);
    }, [storageType, getStorageKey]);

    const checkHasDraft = useCallback((): boolean => {
        const storage = getStorage(storageType);
        if (!storage) return false;
        return storage.getItem(getStorageKey()) !== null;
    }, [storageType, getStorageKey]);

    // ============================================
    // تحميل البيانات المحفوظة عند البداية
    // ============================================

    useEffect(() => {
        if (initialLoadRef.current) return;
        initialLoadRef.current = true;

        // التحقق من وجود مسودة
        setHasDraft(checkHasDraft());

        // محاولة تحميل البيانات المحفوظة
        const savedData = loadFromStorage();

        if (savedData) {
            // دمج البيانات المحفوظة مع القيم الابتدائية
            // البيانات المحفوظة تأخذ الأولوية
            const mergedData = { ...initialValues, ...savedData };
            setData(mergedData);
            setDraftLoaded(true);

            console.log('[useFormPersistence] تم استرجاع البيانات المحفوظة للنموذج:', key);

            if (onDraftRestored) {
                onDraftRestored(mergedData);
            }
        }
    }, [key]); // فقط عند تغيير المفتاح

    // ============================================
    // الحفظ التلقائي
    // ============================================

    useEffect(() => {
        if (!autoSave || !isDirty) return;

        // إلغاء المؤقت السابق
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // إعداد مؤقت جديد
        autoSaveTimerRef.current = setTimeout(() => {
            saveToStorage(data);
            console.log('[useFormPersistence] حفظ تلقائي:', key);
        }, autoSaveDelay);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [data, isDirty, autoSave, autoSaveDelay, saveToStorage, key]);

    // ============================================
    // الحفظ قبل إغلاق الصفحة
    // ============================================

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (isDirty) {
                saveToStorage(data);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, data, saveToStorage]);

    // ============================================
    // Public Functions
    // ============================================

    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setData((prev) => {
            const newData = { ...prev, [field]: value };
            if (onChange) {
                onChange(newData);
            }
            return newData;
        });
        setIsDirty(true);
    }, [onChange]);

    const updateFields = useCallback((fields: Partial<T>) => {
        setData((prev) => {
            const newData = { ...prev, ...fields };
            if (onChange) {
                onChange(newData);
            }
            return newData;
        });
        setIsDirty(true);
    }, [onChange]);

    const save = useCallback((): boolean => {
        return saveToStorage(data);
    }, [data, saveToStorage]);

    const load = useCallback((): T | null => {
        return loadFromStorage();
    }, [loadFromStorage]);

    const clear = useCallback(() => {
        clearStorage();
        setData(initialValues);
    }, [clearStorage, initialValues]);

    // Custom setData that marks as dirty
    const setDataWithDirty = useCallback((newData: React.SetStateAction<T>) => {
        setData((prev) => {
            const resolved = typeof newData === 'function'
                ? (newData as (prev: T) => T)(prev)
                : newData;
            if (onChange) {
                onChange(resolved);
            }
            return resolved;
        });
        setIsDirty(true);
    }, [onChange]);

    return {
        data,
        setData: setDataWithDirty,
        updateField,
        updateFields,
        save,
        load,
        clear,
        hasDraft,
        isDirty,
        lastSaved,
        draftLoaded,
    };
}

export default useFormPersistence;
