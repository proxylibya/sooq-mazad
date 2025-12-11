/**
 * Hook لرفع الصور مع التحسين التلقائي
 */

import { useState, useCallback } from 'react';

export interface UploadOptions {
  optimize?: boolean;
  generateSizes?: boolean;
  multiFormat?: boolean;
  format?: 'webp' | 'avif';
  quality?: number;
  width?: number;
  height?: number;
  maxSize?: number; // بالبايت
  acceptedFormats?: string[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  data?: {
    original: {
      url: string;
      fileName: string;
      size: number;
      format: string;
      width: number;
      height: number;
    };
    optimized?: {
      url: string;
      fileName: string;
      size: number;
      format: string;
      width: number;
      height: number;
    };
    sizes?: Array<{
      size: number;
      result: {
        url: string;
        fileName: string;
        size: number;
        format: string;
        width: number;
        height: number;
      };
    }>;
    formats?: Record<string, any>;
  };
  error?: string;
}

export function useImageUpload(defaultOptions: UploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  /**
   * رفع صورة واحدة
   */
  const uploadImage = useCallback(
    async (file: File, options: UploadOptions = {}): Promise<UploadResult | null> => {
      const finalOptions = { ...defaultOptions, ...options };

      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        const errorMsg = 'الملف المرفوع يجب أن يكون صورة';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // التحقق من الصيغة المقبولة
      if (finalOptions.acceptedFormats) {
        const isAccepted = finalOptions.acceptedFormats.some((format) =>
          file.type.includes(format),
        );
        if (!isAccepted) {
          const errorMsg = `الصيغة غير مدعومة. الصيغ المقبولة: ${finalOptions.acceptedFormats.join(', ')}`;
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      }

      // التحقق من الحجم
      if (finalOptions.maxSize && file.size > finalOptions.maxSize) {
        const maxSizeMB = (finalOptions.maxSize / 1024 / 1024).toFixed(1);
        const errorMsg = `حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB} MB`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('optimize', finalOptions.optimize ? 'true' : 'false');
        formData.append('generateSizes', finalOptions.generateSizes ? 'true' : 'false');
        formData.append('multiFormat', finalOptions.multiFormat ? 'true' : 'false');

        if (finalOptions.format) {
          formData.append('format', finalOptions.format);
        }
        if (finalOptions.quality) {
          formData.append('quality', finalOptions.quality.toString());
        }
        if (finalOptions.width) {
          formData.append('width', finalOptions.width.toString());
        }
        if (finalOptions.height) {
          formData.append('height', finalOptions.height.toString());
        }

        const xhr = new XMLHttpRequest();

        // تتبع التقدم
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress({
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            });
          }
        });

        const response = await new Promise<UploadResult>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`خطأ في الرفع: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('فشل رفع الصورة'));
          });

          xhr.open('POST', '/api/upload/image');
          xhr.send(formData);
        });

        setResult(response);
        setIsUploading(false);
        setProgress(null);

        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'فشل رفع الصورة';
        setError(errorMsg);
        setIsUploading(false);
        setProgress(null);
        return { success: false, error: errorMsg };
      }
    },
    [defaultOptions],
  );

  /**
   * رفع صور متعددة
   */
  const uploadMultipleImages = useCallback(
    async (files: File[], options: UploadOptions = {}): Promise<UploadResult[]> => {
      const results: UploadResult[] = [];

      for (const file of files) {
        const result = await uploadImage(file, options);
        if (result) {
          results.push(result);
        }
      }

      return results;
    },
    [uploadImage],
  );

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
    uploadImage,
    uploadMultipleImages,
    isUploading,
    progress,
    error,
    result,
    reset,
  };
}

/**
 * Hook للمعاينة قبل الرفع
 */
export function useImagePreview() {
  const [preview, setPreview] = useState<string | null>(null);

  const generatePreview = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    preview,
    generatePreview,
    clearPreview,
  };
}

/**
 * Hook للتحقق من أبعاد الصورة
 */
export function useImageDimensions() {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const checkDimensions = useCallback(
    (
      file: File,
    ): Promise<{
      width: number;
      height: number;
    }> => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error('الملف ليس صورة'));
          return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
          const dims = {
            width: img.width,
            height: img.height,
          };
          setDimensions(dims);
          URL.revokeObjectURL(url);
          resolve(dims);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('فشل قراءة الصورة'));
        };

        img.src = url;
      });
    },
    [],
  );

  return {
    dimensions,
    checkDimensions,
  };
}

export default useImageUpload;
