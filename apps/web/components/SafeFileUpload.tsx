import { CheckCircleIcon, XCircleIcon, FolderIcon, TrashIcon } from '@heroicons/react/24/outline';

import React, { useState, useCallback, useRef } from 'react';
import { createSafeBlobUrl, revokeSafeBlobUrl } from '../utils/blobUrlManager';

interface SafeFileUploadProps {
  onFileSelect: (file: File, previewUrl?: string) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  children?: React.ReactNode;
  showPreview?: boolean;
  previewClassName?: string;
}

/**
 * مكون رفع ملفات آمن مع دعم blob URLs
 */
const SafeFileUpload: React.FC<SafeFileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
  children,
  showPreview = true,
  previewClassName = '',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * معالجة اختيار الملف
   */
  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);

      // التحقق من حجم الملف
      if (file.size > maxSize) {
        setError(`حجم الملف كبير جداً. الحد الأقصى ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
        return;
      }

      // التحقق من نوع الملف
      if (
        accept &&
        !accept.split(',').some((type) => {
          const trimmedType = type.trim();
          if (trimmedType.endsWith('/*')) {
            return file.type.startsWith(trimmedType.slice(0, -1));
          }
          return file.type === trimmedType;
        })
      ) {
        setError('نوع الملف غير مدعوم');
        return;
      }

      try {
        // إنشاء preview URL آمن
        let newPreviewUrl: string | null = null;

        if (showPreview && file.type.startsWith('image/')) {
          newPreviewUrl = createSafeBlobUrl(file, 10 * 60 * 1000); // 10 دقائق
        }

        // تنظيف URL السابق
        if (previewUrl) {
          revokeSafeBlobUrl(previewUrl);
        }

        setSelectedFile(file);
        setPreviewUrl(newPreviewUrl);

        // إشعار المكون الأب
        onFileSelect(file, newPreviewUrl || undefined);

        console.log(`تم اختيار الملف: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
      } catch (error) {
        console.error('خطأ في معالجة الملف:', error);
        setError('خطأ في معالجة الملف');
      }
    },
    [accept, maxSize, showPreview, onFileSelect, previewUrl],
  );

  /**
   * معالجة تغيير input
   */
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  /**
   * معالجة السحب والإفلات
   */
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  /**
   * منع السلوك الافتراضي للسحب
   */
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * إزالة الملف
   */
  const handleRemoveFile = useCallback(() => {
    if (previewUrl) {
      revokeSafeBlobUrl(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (onFileRemove) {
      onFileRemove();
    }

    console.log('تم إزالة الملف');
  }, [previewUrl, onFileRemove]);

  /**
   * فتح مربع حوار اختيار الملف
   */
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // تنظيف عند إلغاء تحميل المكون
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        revokeSafeBlobUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={`safe-file-upload ${className}`}>
      {/* Input مخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* منطقة السحب والإفلات */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
        className={`cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 ${error ? 'border-red-400 bg-red-50' : ''} ${selectedFile ? 'border-green-400 bg-green-50' : ''} `}
      >
        {children || (
          <div className="space-y-2">
            <div className="text-gray-600">
              {selectedFile ? (
                <span className="text-green-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" /> تم اختيار:{' '}
                  {selectedFile.name}
                </span>
              ) : (
                <>
                  <span>اسحب الملف هنا أو </span>
                  <span className="text-blue-600 underline">انقر للاختيار</span>
                </>
              )}
            </div>

            {!selectedFile && (
              <div className="text-sm text-gray-500">
                الحد الأقصى: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </div>
            )}
          </div>
        )}
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
          <XCircleIcon className="h-5 w-5 text-red-500" /> {error}
        </div>
      )}

      {/* معاينة الصورة */}
      {showPreview && previewUrl && selectedFile?.type.startsWith('image/') && (
        <div className={`mt-4 ${previewClassName}`}>
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="معاينة"
              className="max-h-48 max-w-xs rounded-lg border border-gray-200"
              onError={() => {
                console.error('خطأ في تحميل معاينة الصورة');
                setError('خطأ في عرض معاينة الصورة');
              }}
            />

            {/* زر الإزالة */}
            <button
              onClick={handleRemoveFile}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white transition-colors hover:bg-red-600"
              title="إزالة الصورة"
            >
              ×
            </button>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}KB)
          </div>
        </div>
      )}

      {/* معلومات الملف للملفات غير الصور */}
      {selectedFile && !selectedFile.type.startsWith('image/') && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{selectedFile.name}</div>
              <div className="text-sm text-gray-600">
                {selectedFile.type} • {(selectedFile.size / 1024).toFixed(1)}KB
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              className="text-red-600 transition-colors hover:text-red-800"
              title="إزالة الملف"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* مؤشر التحميل */}
      {isUploading && (
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
          <span className="text-sm text-blue-600">جاري الرفع...</span>
        </div>
      )}
    </div>
  );
};

export default SafeFileUpload;
