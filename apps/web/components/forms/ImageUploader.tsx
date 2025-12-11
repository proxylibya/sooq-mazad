/**
 * رافع الصور
 */

import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useRef, useState } from 'react';

export interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export interface ImageUploaderProps {
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  onUpload?: (file: File) => Promise<string>;
  maxFiles?: number;
  maxSize?: number;
  acceptedFormats?: string[];
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  multiple?: boolean;
}

export function ImageUploader({
  value = [],
  onChange,
  onUpload,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  label,
  error,
  disabled = false,
  className = '',
  showPreview = true,
  multiple = true,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return 'نوع الملف غير مدعوم';
    }
    if (file.size > maxSize) {
      return `حجم الملف يتجاوز الحد المسموح (${Math.round(maxSize / 1024 / 1024)}MB)`;
    }
    return null;
  };

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (disabled) return;

      const newImages: UploadedImage[] = [];
      const remainingSlots = maxFiles - value.length;

      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i];
        const validationError = validateFile(file);

        const image: UploadedImage = {
          id: generateId(),
          url: URL.createObjectURL(file),
          file,
          name: file.name,
          size: file.size,
          status: validationError ? 'error' : 'pending',
          error: validationError || undefined,
        };

        newImages.push(image);
      }

      const updatedImages = [...value, ...newImages];
      onChange?.(updatedImages);

      // رفع الملفات الصالحة
      if (onUpload) {
        for (const image of newImages) {
          if (image.status === 'pending' && image.file) {
            try {
              // تحديث الحالة إلى uploading
              const uploadingImages = updatedImages.map((img) =>
                img.id === image.id ? { ...img, status: 'uploading' as const, progress: 0 } : img,
              );
              onChange?.(uploadingImages);

              const uploadedUrl = await onUpload(image.file);

              // تحديث الحالة إلى success
              const successImages = uploadingImages.map((img) =>
                img.id === image.id
                  ? { ...img, url: uploadedUrl, status: 'success' as const, progress: 100 }
                  : img,
              );
              onChange?.(successImages);
            } catch (err) {
              // تحديث الحالة إلى error
              const errorImages = updatedImages.map((img) =>
                img.id === image.id
                  ? { ...img, status: 'error' as const, error: 'فشل في الرفع' }
                  : img,
              );
              onChange?.(errorImages);
            }
          }
        }
      }
    },
    [value, maxFiles, disabled, onChange, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const updatedImages = value.filter((img) => img.id !== id);
      onChange?.(updatedImages);
    },
    [value, onChange],
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}

      {/* منطقة السحب والإفلات */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${error ? 'border-red-500' : ''} `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <ArrowUpTrayIcon className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <p className="mb-1 text-sm text-gray-600">اسحب الصور هنا أو انقر للاختيار</p>
        <p className="text-xs text-gray-500">
          {acceptedFormats.map((f) => f.split('/')[1].toUpperCase()).join(', ')} - الحد الأقصى{' '}
          {Math.round(maxSize / 1024 / 1024)}MB
        </p>
        {value.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {value.length} من {maxFiles} صور
          </p>
        )}
      </div>

      {/* معاينة الصور */}
      {showPreview && value.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {value.map((image) => (
            <div key={image.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img src={image.url} alt={image.name} className="h-full w-full object-cover" />

                {/* شريط التقدم */}
                {image.status === 'uploading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="h-2 w-3/4 overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full bg-white transition-all"
                        style={{ width: `${image.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* رسالة الخطأ */}
                {image.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/80 p-2">
                    <p className="text-center text-xs text-white">{image.error}</p>
                  </div>
                )}
              </div>

              {/* زر الحذف */}
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default ImageUploader;
