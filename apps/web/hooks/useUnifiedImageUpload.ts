/**
 * 🌍 Hook رفع الصور الموحد
 * 
 * hook موحد لجميع عمليات رفع الصور في المشروع
 */

import type { ImageCategory } from '@/lib/image-system';
import { useCallback, useState } from 'react';

// ============================================
// الأنواع
// ============================================

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadedImage {
    url: string;
    path: string;
    size: number;
    width: number;
    height: number;
    format: string;
}

export interface UploadResult {
    success: boolean;
    original?: UploadedImage;
    optimized?: UploadedImage;
    sizes?: Record<string, UploadedImage>;
    formats?: Record<string, UploadedImage>;
    placeholder?: string;
    savings?: {
        bytes: number;
        percentage: number;
    };
    error?: string;
}

export interface UseUnifiedUploadOptions {
    category?: ImageCategory;
    optimize?: boolean;
    generateSizes?: boolean;
    generateFormats?: boolean;
    generatePlaceholder?: boolean;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    maxFileSize?: number;
    acceptedTypes?: string[];
    onProgress?: (progress: UploadProgress) => void;
    onSuccess?: (result: UploadResult) => void;
    onError?: (error: string) => void;
}

// ============================================
// الثوابت
// ============================================

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ============================================
// Hook الرئيسي
// ============================================

export function useUnifiedImageUpload(options: UseUnifiedUploadOptions = {}) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<UploadResult | null>(null);

    const {
        category = 'general',
        optimize = true,
        generateSizes = false,
        generateFormats = false,
        generatePlaceholder = false,
        quality,
        maxWidth,
        maxHeight,
        maxFileSize = DEFAULT_MAX_SIZE,
        acceptedTypes = DEFAULT_TYPES,
        onProgress,
        onSuccess,
        onError,
    } = options;

    /**
     * التحقق من الملف قبل الرفع
     */
    const validateFile = useCallback((file: File): string | null => {
        // التحقق من النوع
        if (!acceptedTypes.includes(file.type)) {
            return `نوع الملف غير مدعوم. الأنواع المسموحة: ${acceptedTypes.join(', ')}`;
        }

        // التحقق من الحجم
        if (file.size > maxFileSize) {
            const maxMB = (maxFileSize / 1024 / 1024).toFixed(1);
            return `حجم الملف كبير جداً. الحد الأقصى: ${maxMB} ميجابايت`;
        }

        return null;
    }, [acceptedTypes, maxFileSize]);

    /**
     * رفع صورة واحدة
     */
    const uploadImage = useCallback(async (file: File, entityId?: string): Promise<UploadResult> => {
        // التحقق
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            onError?.(validationError);
            return { success: false, error: validationError };
        }

        setIsUploading(true);
        setError(null);
        setProgress({ loaded: 0, total: file.size, percentage: 0 });

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('category', category);
            formData.append('optimize', optimize.toString());
            formData.append('generateSizes', generateSizes.toString());
            formData.append('generateFormats', generateFormats.toString());
            formData.append('generatePlaceholder', generatePlaceholder.toString());

            if (entityId) formData.append('entityId', entityId);
            if (quality) formData.append('quality', quality.toString());
            if (maxWidth) formData.append('maxWidth', maxWidth.toString());
            if (maxHeight) formData.append('maxHeight', maxHeight.toString());

            // استخدام XMLHttpRequest للتقدم
            const uploadResult = await new Promise<UploadResult>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // تتبع التقدم
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const prog = {
                            loaded: e.loaded,
                            total: e.total,
                            percentage: Math.round((e.loaded / e.total) * 100),
                        };
                        setProgress(prog);
                        onProgress?.(prog);
                    }
                });

                xhr.addEventListener('load', () => {
                    try {
                        const response = JSON.parse(xhr.responseText);

                        if (xhr.status >= 200 && xhr.status < 300 && response.success) {
                            resolve(response.data || response);
                        } else {
                            reject(new Error(response.error || 'فشل رفع الصورة'));
                        }
                    } catch {
                        reject(new Error('خطأ في معالجة الاستجابة'));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('فشل الاتصال بالخادم'));
                });

                xhr.addEventListener('timeout', () => {
                    reject(new Error('انتهت مهلة الرفع'));
                });

                xhr.open('POST', '/api/upload/unified-image');
                xhr.timeout = 60000; // دقيقة واحدة

                // إضافة الـ authorization إذا وجد
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }

                xhr.send(formData);
            });

            setResult(uploadResult);
            setIsUploading(false);
            setProgress(null);
            onSuccess?.(uploadResult);

            return uploadResult;

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'فشل رفع الصورة';
            setError(errorMsg);
            setIsUploading(false);
            setProgress(null);
            onError?.(errorMsg);

            return { success: false, error: errorMsg };
        }
    }, [
        validateFile, category, optimize, generateSizes, generateFormats,
        generatePlaceholder, quality, maxWidth, maxHeight, onProgress, onSuccess, onError
    ]);

    /**
     * رفع صور متعددة
     */
    const uploadMultiple = useCallback(async (
        files: File[],
        entityId?: string
    ): Promise<UploadResult[]> => {
        const results: UploadResult[] = [];

        for (let i = 0; i < files.length; i++) {
            const result = await uploadImage(files[i], entityId);
            results.push(result);
        }

        return results;
    }, [uploadImage]);

    /**
     * إعادة تعيين الحالة
     */
    const reset = useCallback(() => {
        setIsUploading(false);
        setProgress(null);
        setError(null);
        setResult(null);
    }, []);

    return {
        // الحالة
        isUploading,
        progress,
        error,
        result,

        // الدوال
        uploadImage,
        uploadMultiple,
        validateFile,
        reset,
    };
}

// ============================================
// Hook المعاينة
// ============================================

export function useImagePreview() {
    const [preview, setPreview] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number; } | null>(null);

    const generatePreview = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('الملف ليس صورة'));
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                const dataUrl = reader.result as string;
                setPreview(dataUrl);

                // الحصول على الأبعاد
                const img = new Image();
                img.onload = () => {
                    setDimensions({ width: img.width, height: img.height });
                    resolve(dataUrl);
                };
                img.onerror = () => reject(new Error('فشل قراءة الصورة'));
                img.src = dataUrl;
            };

            reader.onerror = () => reject(new Error('فشل قراءة الملف'));
            reader.readAsDataURL(file);
        });
    }, []);

    const clearPreview = useCallback(() => {
        setPreview(null);
        setDimensions(null);
    }, []);

    return {
        preview,
        dimensions,
        generatePreview,
        clearPreview,
    };
}

// ============================================
// التصدير
// ============================================

export default useUnifiedImageUpload;
