/**
 * مكون رفع الصور بالسحب والإفلات
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageUpload, useImagePreview } from '@/hooks/useImageUpload';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface ImageUploadDropzoneProps {
  onUploadComplete?: (result: any) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedFormats?: string[];
  className?: string;
  showPreview?: boolean;
  optimize?: boolean;
  generateSizes?: boolean;
  multiFormat?: boolean;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  onUploadComplete,
  onError,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
  showPreview = true,
  optimize = true,
  generateSizes = false,
  multiFormat = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { uploadImage, isUploading, progress, error } = useImageUpload({
    maxSize,
    acceptedFormats,
    optimize,
    generateSizes,
    multiFormat,
  });
  const { preview, generatePreview, clearPreview } = useImagePreview();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setFiles(acceptedFiles);

      if (showPreview && acceptedFiles[0]) {
        generatePreview(acceptedFiles[0]);
      }

      // رفع الملفات
      for (const file of acceptedFiles.slice(0, maxFiles)) {
        const result = await uploadImage(file);

        if (result?.success && onUploadComplete) {
          onUploadComplete(result.data);
        } else if (result?.error && onError) {
          onError(result.error);
        }
      }
    },
    [uploadImage, onUploadComplete, onError, maxFiles, showPreview, generatePreview],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFormats.map((format) => format.replace('image/', '.')),
    },
    maxFiles,
    maxSize,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (index === 0) {
      clearPreview();
    }
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-8 transition-colors duration-200 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'} ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-400'} `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? 'أفلت الصور هنا...' : 'اسحب وأفلت الصور هنا، أو انقر للاختيار'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            الصيغ المدعومة: {acceptedFormats.map((f) => f.replace('image/', '')).join(', ')}
          </p>
          <p className="text-xs text-gray-500">
            الحد الأقصى: {maxFiles} صور، {(maxSize / 1024 / 1024).toFixed(0)} MB لكل صورة
          </p>
        </div>
      </div>

      {isUploading && progress && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">جاري الرفع...</span>
            <span className="text-sm font-medium text-gray-900">{progress.percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {showPreview && preview && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700">المعاينة</h3>
          <div className="relative inline-block">
            <img src={preview} alt="معاينة" className="max-w-xs rounded-lg shadow-md" />
            <button
              onClick={() => clearPreview()}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {files.length > 0 && !showPreview && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            الملفات المحددة ({files.length})
          </h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <PhotoIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-red-500 transition-colors hover:text-red-700"
                  disabled={isUploading}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUploadDropzone;
