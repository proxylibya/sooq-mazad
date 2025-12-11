import React, { useState, useRef } from 'react';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';

interface TruckImage {
  id: string;
  type: 'front' | 'back' | 'side' | 'interior';
  url: string;
  file?: File;
  isUploading?: boolean;
}

interface TruckImagesUploadProps {
  currentImages?: TruckImage[];
  onImagesChange: (images: TruckImage[]) => void;
  className?: string;
}

const TruckImagesUpload: React.FC<TruckImagesUploadProps> = ({
  currentImages = [],
  onImagesChange,
  className = '',
}) => {
  const [images, setImages] = useState<TruckImage[]>(currentImages);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const imageTypes = [
    { key: 'front', label: 'من الأمام', icon: TruckIcon, required: true },
    { key: 'back', label: 'من الخلف', icon: TruckIcon, required: true },
    { key: 'side', label: 'من الجانب', icon: TruckIcon, required: true },
    { key: 'interior', label: 'من الداخل', icon: CameraIcon, required: false },
  ];

  const handleFileSelect = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صحيح');
      return;
    }

    // التحقق من حجم الملف (10MB كحد أقصى للساحبة)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
      return;
    }

    setUploadError(null);

    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: TruckImage = {
        id: `${type}_${Date.now()}`,
        type: type as TruckImage['type'],
        url: e.target?.result as string,
        file,
        isUploading: false,
      };

      const updatedImages = images.filter((img) => img.type !== type);
      updatedImages.push(newImage);
      setImages(updatedImages);
      onImagesChange(updatedImages);
    };
    reader.readAsDataURL(file);

    // رفع الصورة
    uploadImage(type, file);
  };

  const uploadImage = async (type: string, file: File) => {
    // تحديث حالة التحميل
    setImages((prev) =>
      prev.map((img) => (img.type === type ? { ...img, isUploading: true } : img)),
    );

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'truck');
      formData.append('position', type);

      const response = await fetch('/api/upload/truck-images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setImages((prev) =>
          prev.map((img) =>
            img.type === type
              ? {
                  ...img,
                  url: result.imageUrl,
                  isUploading: false,
                  file: undefined,
                }
              : img,
          ),
        );
      } else {
        setUploadError(result.error || 'فشل في رفع الصورة');
        // إزالة الصورة في حالة الفشل
        setImages((prev) => prev.filter((img) => img.type !== type));
      }
    } catch (error) {
      setUploadError('حدث خطأ أثناء رفع الصورة');
      setImages((prev) => prev.filter((img) => img.type !== type));
    }
  };

  const handleRemoveImage = (type: string) => {
    const updatedImages = images.filter((img) => img.type !== type);
    setImages(updatedImages);
    onImagesChange(updatedImages);

    // إعادة تعيين حقل الإدخال
    if (fileInputRefs.current[type]) {
      fileInputRefs.current[type]!.value = '';
    }
  };

  const getImageByType = (type: string) => {
    return images.find((img) => img.type === type);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* عنوان القسم */}
      <div className="mb-4 flex items-center gap-3">
        <TruckIcon className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">صور الساحبة</h3>
      </div>

      {/* شبكة الصور */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {imageTypes.map((imageType) => {
          const currentImage = getImageByType(imageType.key);

          return (
            <div key={imageType.key} className="space-y-3">
              {/* تسمية نوع الصورة */}
              <div className="flex items-center gap-2">
                <imageType.icon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">{imageType.label}</span>
                {imageType.required && <span className="text-sm text-red-500">*</span>}
              </div>

              {/* منطقة الصورة */}
              <div className="relative">
                {currentImage ? (
                  <div className="group relative">
                    <img
                      src={currentImage.url}
                      alt={imageType.label}
                      className="h-48 w-full rounded-lg border-2 border-gray-200 object-cover"
                    />

                    {/* أيقونة التحميل */}
                    {currentImage.isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
                        <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                      </div>
                    )}

                    {/* زر الحذف */}
                    {!currentImage.isUploading && (
                      <button
                        onClick={() => handleRemoveImage(imageType.key)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        title="حذف الصورة"
                        data-testid={`remove-button-${imageType.key}`}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRefs.current[imageType.key]?.click()}
                    className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-blue-500 hover:text-blue-600"
                  >
                    <PhotoIcon className="mb-2 h-12 w-12" />
                    <span className="text-sm font-medium">اختيار صورة</span>
                    <span className="text-xs">{imageType.label}</span>
                  </button>
                )}

                {/* حقل الإدخال المخفي */}
                <input
                  ref={(el) => {
                    if (el) fileInputRefs.current[imageType.key] = el;
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(imageType.key, e)}
                  className="hidden"
                  data-testid={`file-input-${imageType.key}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* رسالة الخطأ */}
      {uploadError && (
        <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
          {uploadError}
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h4 className="mb-4 flex items-center gap-3 text-lg font-semibold text-blue-900">
          <InformationCircleIcon className="h-5 w-5 text-blue-600" />
          إرشادات التصوير
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <SunIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <span className="text-sm text-blue-800">
              استخدم إضاءة طبيعية جيدة للحصول على صور واضحة
            </span>
          </div>
          <div className="flex items-start gap-3">
            <EyeIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <span className="text-sm text-blue-800">تأكد من ظهور رقم الساحبة بوضوح في الصورة</span>
          </div>
          <div className="flex items-start gap-3">
            <CameraIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            <span className="text-sm text-blue-800">اعرض حالة الساحبة الفعلية من زوايا مختلفة</span>
          </div>
          <div className="flex items-start gap-3">
            <DocumentIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
            <span className="text-sm text-blue-800">الحد الأقصى لحجم الصورة: 10 ميجابايت</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckImagesUpload;
