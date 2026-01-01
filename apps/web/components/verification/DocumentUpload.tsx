import React, { useState, useRef, useCallback } from 'react';
import { DocumentType } from '../../types/verification';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import IdentificationIcon from '@heroicons/react/24/outline/IdentificationIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import CloudArrowUpIcon from '@heroicons/react/24/outline/CloudArrowUpIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';

interface DocumentUploadProps {
  documentType: DocumentType;
  title: string;
  description: string;
  required?: boolean;
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  uploadedFile?: File;
  previewUrl?: string;
  isUploading?: boolean;
  error?: string;
  className?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  title,
  description,
  required = false,
  onFileUpload,
  onFileRemove,
  uploadedFile,
  previewUrl,
  isUploading = false,
  error,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.NATIONAL_ID:
        return IdentificationIcon;
      case DocumentType.PASSPORT:
        return DocumentTextIcon;
      case DocumentType.DRIVING_LICENSE:
        return UserIcon;
      case DocumentType.PROOF_OF_ADDRESS:
        return MapPinIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getDocumentColor = (type: DocumentType) => {
    switch (type) {
      case DocumentType.NATIONAL_ID:
        return 'blue';
      case DocumentType.PASSPORT:
        return 'green';
      case DocumentType.DRIVING_LICENSE:
        return 'purple';
      case DocumentType.PROOF_OF_ADDRESS:
        return 'orange';
      default:
        return 'gray';
    }
  };

  const validateFile = (file: File): string | null => {
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return 'نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG) أو ملف PDF';
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت';
    }

    // التحقق من اسم الملف
    if (!file.name || file.name.length > 255) {
      return 'اسم الملف غير صحيح';
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        // يمكن إضافة معالجة الخطأ هنا
        console.error(validationError);
        return;
      }

      onFileUpload(file);
    },
    [onFileUpload],
  );

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const IconComponent = getDocumentIcon(documentType);
  const color = getDocumentColor(documentType);
  const isUploaded = !!uploadedFile;

  return (
    <div className={`${className}`}>
      <div
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : isUploaded
              ? 'border-green-300 bg-green-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        } ${isUploading ? 'cursor-not-allowed opacity-50' : ''} `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileInputChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={isUploading}
        />

        {/* Upload Icon */}
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isUploaded
              ? 'bg-green-100 text-green-600'
              : error
                ? 'bg-red-100 text-red-600'
                : `bg-${color}-100 text-${color}-600`
          } `}
        >
          {isUploading ? (
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
          ) : isUploaded ? (
            <CheckCircleIcon className="h-6 w-6" />
          ) : error ? (
            <XCircleIcon className="h-6 w-6" />
          ) : (
            <IconComponent className="h-6 w-6" />
          )}
        </div>

        {/* Title and Description */}
        <h4 className="mb-2 font-medium text-gray-900">
          {title}
          {required && <span className="mr-1 text-red-500">*</span>}
        </h4>
        <p className="mb-4 text-sm text-gray-600">{description}</p>

        {/* Status */}
        {isUploading ? (
          <div className="text-sm font-medium text-blue-600">جاري الرفع...</div>
        ) : isUploaded ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">تم الرفع</span>
            </div>
            <div className="text-xs text-gray-500">{uploadedFile?.name}</div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-600">انقر لرفع الملف أو اسحبه هنا</div>
            <div className="text-xs text-gray-500">JPG, PNG, PDF (حتى 5 ميجابايت)</div>
          </div>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white bg-opacity-75">
            <div className="flex items-center gap-2 text-blue-600">
              <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
              <span className="text-sm font-medium">جاري الرفع...</span>
            </div>
          </div>
        )}
      </div>

      {/* File Actions */}
      {isUploaded && !isUploading && (
        <div className="mt-3 flex items-center justify-center gap-3">
          {previewUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <EyeIcon className="h-4 w-4" />
              معاينة
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onFileRemove();
            }}
            className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <XCircleIcon className="h-4 w-4" />
            حذف
          </button>
        </div>
      )}

      {/* File Requirements */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
          <div className="text-xs text-gray-600">
            <div className="mb-1 font-medium">متطلبات الملف:</div>
            <ul className="space-y-0.5">
              <li>• صورة واضحة وغير ضبابية</li>
              <li>• جميع النصوص مقروءة</li>
              <li>• لا توجد انعكاسات أو ظلال</li>
              <li>• الوثيقة كاملة وغير مقطوعة</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="max-h-full max-w-4xl overflow-auto rounded-lg bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-medium text-gray-900">معاينة الوثيقة</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4">
              {uploadedFile?.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt={title}
                  className="mx-auto max-h-96 max-w-full rounded-lg"
                />
              ) : (
                <div className="py-8 text-center">
                  <DocumentTextIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <p className="text-gray-600">معاينة ملف PDF غير متاحة</p>
                  <p className="mt-1 text-sm text-gray-500">{uploadedFile?.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// مكون لعرض قائمة الوثائق المطلوبة
interface DocumentRequirementsProps {
  documentTypes: Array<{
    type: DocumentType;
    title: string;
    description: string;
    required: boolean;
  }>;
  className?: string;
}

export const DocumentRequirements: React.FC<DocumentRequirementsProps> = ({
  documentTypes,
  className = '',
}) => {
  return (
    <div className={`rounded-lg border border-blue-200 bg-blue-50 p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="mb-3 font-semibold text-blue-900">الوثائق المطلوبة للتحقق</h3>

          <div className="space-y-3">
            {documentTypes.map((docType) => (
              <div key={docType.type} className="flex items-start gap-3">
                <div
                  className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${docType.required ? 'bg-red-500' : 'bg-blue-500'} `}
                />
                <div>
                  <div className="font-medium text-blue-800">
                    {docType.title}
                    {docType.required && <span className="mr-1 text-red-500">*</span>}
                  </div>
                  <div className="mt-1 text-sm text-blue-700">{docType.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-blue-200 pt-3">
            <div className="text-sm text-blue-700">
              <span className="text-red-500">*</span> الوثائق المطلوبة للتحقق الأساسي
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
