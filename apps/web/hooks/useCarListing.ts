/**
 * useCarListing - High Performance Hook
 * Hook محسن لإضافة/تعديل إعلان سيارة
 * 
 * @description يوفر إدارة موحدة لنموذج إضافة السيارة
 * محسن لتحمل مئات الآلاف من الزيارات
 */

import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from './useAuth';

// ============ Types ============

export interface CarFormData {
    // Basic Info
    title: string;
    brand: string;
    model: string;
    year: number | null;

    // Details
    mileage: number | null;
    condition: string;
    fuelType: string;
    transmission: string;
    bodyType: string;
    color: string;
    engineSize: string;

    // Pricing
    price: number | null;
    negotiable: boolean;

    // Location
    city: string;
    area: string;

    // Description
    description: string;

    // Features
    features: string[];

    // Contact
    phoneVisible: boolean;
    whatsappEnabled: boolean;
}

export interface CarImage {
    id: string;
    file?: File;
    url: string;
    isPrimary: boolean;
    uploading?: boolean;
    error?: string;
}

export interface FormErrors {
    [key: string]: string;
}

export interface FormStep {
    id: number;
    title: string;
    fields: string[];
    completed: boolean;
}

// ============ Default Values ============

const DEFAULT_FORM_DATA: CarFormData = {
    title: '',
    brand: '',
    model: '',
    year: null,
    mileage: null,
    condition: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    color: '',
    engineSize: '',
    price: null,
    negotiable: false,
    city: '',
    area: '',
    description: '',
    features: [],
    phoneVisible: true,
    whatsappEnabled: false,
};

const FORM_STEPS: FormStep[] = [
    { id: 1, title: 'معلومات أساسية', fields: ['brand', 'model', 'year', 'condition'], completed: false },
    { id: 2, title: 'التفاصيل', fields: ['mileage', 'fuelType', 'transmission', 'color'], completed: false },
    { id: 3, title: 'الصور', fields: ['images'], completed: false },
    { id: 4, title: 'السعر والموقع', fields: ['price', 'city'], completed: false },
    { id: 5, title: 'الوصف والمميزات', fields: ['description'], completed: false },
];

// ============ Main Hook ============

export function useCarListing(listingId?: string) {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // ========== State ==========
    const [formData, setFormData] = useState<CarFormData>(DEFAULT_FORM_DATA);
    const [images, setImages] = useState<CarImage[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Edit mode
    const isEditMode = !!listingId;

    // ========== Auth Check ==========
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/?callbackUrl=' + encodeURIComponent(router.asPath));
        }
    }, [user, authLoading, router]);

    // ========== Fetch Existing Data (Edit Mode) ==========
    useEffect(() => {
        if (!listingId || !user) return;

        const fetchListing = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/cars/${listingId}`);
                if (!response.ok) throw new Error('فشل في تحميل بيانات الإعلان');

                const data = await response.json();
                if (data.success && data.data) {
                    const listing = data.data;
                    setFormData({
                        title: listing.title || '',
                        brand: listing.brand || '',
                        model: listing.model || '',
                        year: listing.year || null,
                        mileage: listing.mileage || null,
                        condition: listing.condition || '',
                        fuelType: listing.fuelType || '',
                        transmission: listing.transmission || '',
                        bodyType: listing.bodyType || '',
                        color: listing.color || '',
                        engineSize: listing.engineSize || '',
                        price: listing.price || null,
                        negotiable: listing.negotiable || false,
                        city: listing.location?.city || '',
                        area: listing.location?.area || '',
                        description: listing.description || '',
                        features: listing.features || [],
                        phoneVisible: listing.phoneVisible ?? true,
                        whatsappEnabled: listing.whatsappEnabled || false,
                    });

                    if (listing.images?.length) {
                        setImages(listing.images.map((url: string, i: number) => ({
                            id: `existing-${i}`,
                            url,
                            isPrimary: i === 0,
                        })));
                    }
                }
            } catch (err) {
                console.error('Error fetching listing:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [listingId, user]);

    // ========== Form Handlers ==========
    const updateField = useCallback(<K extends keyof CarFormData>(
        field: K,
        value: CarFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    const updateMultipleFields = useCallback((updates: Partial<CarFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    }, []);

    const toggleFeature = useCallback((feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature],
        }));
        setIsDirty(true);
    }, []);

    // ========== Image Handlers ==========
    const addImages = useCallback((files: FileList | File[]) => {
        const newImages: CarImage[] = Array.from(files).map((file, i) => ({
            id: `new-${Date.now()}-${i}`,
            file,
            url: URL.createObjectURL(file),
            isPrimary: images.length === 0 && i === 0,
        }));
        setImages(prev => [...prev, ...newImages]);
        setIsDirty(true);
    }, [images.length]);

    const removeImage = useCallback((imageId: string) => {
        setImages(prev => {
            const filtered = prev.filter(img => img.id !== imageId);
            // If removed primary, make first one primary
            if (filtered.length && !filtered.some(img => img.isPrimary)) {
                filtered[0].isPrimary = true;
            }
            return filtered;
        });
        setIsDirty(true);
    }, []);

    const setPrimaryImage = useCallback((imageId: string) => {
        setImages(prev => prev.map(img => ({
            ...img,
            isPrimary: img.id === imageId,
        })));
        setIsDirty(true);
    }, []);

    const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
        setImages(prev => {
            const newImages = [...prev];
            const [moved] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, moved);
            return newImages;
        });
        setIsDirty(true);
    }, []);

    // ========== Validation ==========
    const validateStep = useCallback((step: number): boolean => {
        const newErrors: FormErrors = {};

        switch (step) {
            case 1:
                if (!formData.brand) newErrors.brand = 'الماركة مطلوبة';
                if (!formData.model) newErrors.model = 'الموديل مطلوب';
                if (!formData.year) newErrors.year = 'سنة الصنع مطلوبة';
                if (!formData.condition) newErrors.condition = 'حالة السيارة مطلوبة';
                break;
            case 2:
                if (!formData.fuelType) newErrors.fuelType = 'نوع الوقود مطلوب';
                if (!formData.transmission) newErrors.transmission = 'ناقل الحركة مطلوب';
                break;
            case 3:
                if (images.length === 0) newErrors.images = 'يجب إضافة صورة واحدة على الأقل';
                break;
            case 4:
                if (!formData.price) newErrors.price = 'السعر مطلوب';
                if (!formData.city) newErrors.city = 'المدينة مطلوبة';
                break;
            case 5:
                if (!formData.description || formData.description.length < 20) {
                    newErrors.description = 'الوصف يجب أن يكون 20 حرف على الأقل';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, images]);

    const validateAll = useCallback((): boolean => {
        const allErrors: FormErrors = {};

        if (!formData.brand) allErrors.brand = 'الماركة مطلوبة';
        if (!formData.model) allErrors.model = 'الموديل مطلوب';
        if (!formData.year) allErrors.year = 'سنة الصنع مطلوبة';
        if (!formData.condition) allErrors.condition = 'حالة السيارة مطلوبة';
        if (!formData.fuelType) allErrors.fuelType = 'نوع الوقود مطلوب';
        if (!formData.transmission) allErrors.transmission = 'ناقل الحركة مطلوب';
        if (images.length === 0) allErrors.images = 'يجب إضافة صورة واحدة على الأقل';
        if (!formData.price) allErrors.price = 'السعر مطلوب';
        if (!formData.city) allErrors.city = 'المدينة مطلوبة';
        if (!formData.description || formData.description.length < 20) {
            allErrors.description = 'الوصف يجب أن يكون 20 حرف على الأقل';
        }

        setErrors(allErrors);
        return Object.keys(allErrors).length === 0;
    }, [formData, images]);

    // ========== Navigation ==========
    const nextStep = useCallback(() => {
        if (validateStep(currentStep) && currentStep < FORM_STEPS.length) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, validateStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const goToStep = useCallback((step: number) => {
        if (step >= 1 && step <= FORM_STEPS.length) {
            setCurrentStep(step);
        }
    }, []);

    // ========== Submit ==========
    const submitListing = useCallback(async () => {
        if (!validateAll()) return { success: false, error: 'يرجى تعبئة جميع الحقول المطلوبة' };

        try {
            setSubmitting(true);

            // Upload images first
            const uploadedImages: string[] = [];
            for (const img of images) {
                if (img.file) {
                    const formData = new FormData();
                    formData.append('file', img.file);
                    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                    if (uploadRes.ok) {
                        const data = await uploadRes.json();
                        uploadedImages.push(data.url);
                    }
                } else {
                    uploadedImages.push(img.url);
                }
            }

            // Generate title if empty
            const title = formData.title || `${formData.brand} ${formData.model} ${formData.year}`;

            const payload = {
                ...formData,
                title,
                images: uploadedImages,
                location: { city: formData.city, area: formData.area },
            };

            const url = isEditMode ? `/api/cars/${listingId}` : '/api/cars';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'فشل في حفظ الإعلان');
            }

            const data = await response.json();
            setIsDirty(false);

            return { success: true, listingId: data.id || listingId };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'حدث خطأ' };
        } finally {
            setSubmitting(false);
        }
    }, [formData, images, validateAll, isEditMode, listingId]);

    // ========== Computed Values ==========
    const steps = useMemo(() => {
        return FORM_STEPS.map(step => ({
            ...step,
            completed: step.id < currentStep,
        }));
    }, [currentStep]);

    const progress = useMemo(() => {
        return Math.round((currentStep / FORM_STEPS.length) * 100);
    }, [currentStep]);

    const canSubmit = useMemo(() => {
        return (
            !!formData.brand &&
            !!formData.model &&
            !!formData.year &&
            !!formData.price &&
            !!formData.city &&
            images.length > 0 &&
            formData.description.length >= 20
        );
    }, [formData, images]);

    // ========== Return ==========
    return {
        // Auth
        user,
        authLoading,

        // Mode
        isEditMode,
        listingId,

        // Form Data
        formData,
        updateField,
        updateMultipleFields,
        toggleFeature,

        // Images
        images,
        addImages,
        removeImage,
        setPrimaryImage,
        reorderImages,

        // Validation
        errors,
        validateStep,
        validateAll,

        // Steps
        currentStep,
        steps,
        progress,
        nextStep,
        prevStep,
        goToStep,

        // Submit
        submitting,
        submitListing,
        canSubmit,

        // State
        loading,
        isDirty,
    };
}

export default useCarListing;
