import React, { useState, useEffect } from 'react';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import FolderIcon from '@heroicons/react/24/outline/FolderIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';

interface TransportImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function TransportImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: TransportImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  // معالجة مفتاح Escape لإغلاق modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteModal) {
        cancelDelete();
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDeleteModal]);

  // دالة مساعدة لرفع صورة واحدة مع معالجة محسنة للأخطاء
  const uploadSingleImage = async (file: File): Promise<string | null> => {
    let response: Response | null = null;

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const formData = new FormData();
      formData.append('image', file);

      // إضافة timeout للطلب لتجنب التعليق
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانية

      try {
        response = await fetch('/api/upload/transport-images', {
          method: 'POST',
          headers,
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('انتهت مهلة رفع الصورة:', file.name);
          setError(`انتهت مهلة رفع الصورة: ${file.name}`);
          return null;
        }

        throw fetchError;
      }

      // التحقق من حالة الاستجابة أولاً
      if (!response.ok) {
        console.error(`فشل رفع الصورة - حالة HTTP: ${response.status}`);

        // محاولة قراءة رسالة الخطأ من الخادم
        let errorMessage = `خطأ في الخادم (${response.status})`;
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } catch (parseError) {
          // تجاهل أخطاء تحليل رسالة الخطأ
        }

        setError(errorMessage);
        return null;
      }

      // التحقق من نوع المحتوى
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('نوع المحتوى غير صحيح:', contentType);
        setError('استجابة غير صحيحة من الخادم');
        return null;
      }

      // محاولة قراءة JSON مع معالجة الأخطاء المحسنة
      let result;
      try {
        // التأكد من أن Response لم يتم قراءته مسبقاً
        if (response.bodyUsed) {
          console.error('تم قراءة Response body مسبقاً');
          setError('خطأ في معالجة استجابة الخادم');
          return null;
        }

        result = await response.json();
      } catch (jsonError) {
        console.error('فشل في تحليل استجابة JSON:', jsonError);
        setError('فشل في تحليل استجابة الخادم');
        return null;
      }

      if (result && result.success) {
        return result.imageUrl;
      } else {
        console.error('فشل رفع الصورة:', result?.error || 'استجابة غير صحيحة');
        setError(result?.error || result?.message || 'فشل في رفع الصورة');
        return null;
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);

      // تحديد نوع الخطأ لإرجاع رسالة مناسبة
      let errorMessage = 'خطأ في الاتصال بالخادم';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'فشل في الاتصال بالخادم. تحقق من الاتصال بالإنترنت';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'خطأ في الشبكة. يرجى المحاولة مرة أخرى';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // منع رفع صور جديدة إذا كان هناك رفع جاري
    if (uploading) {
      setError('يتم رفع صور حالياً. يرجى الانتظار حتى انتهاء الرفع الحالي');
      return;
    }

    // التحقق من عدد الصور
    if (images.length + files.length > maxImages) {
      setError(`يمكنك رفع حتى ${maxImages} صور فقط`);
      return;
    }

    setUploading(true);
    setError('');

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!extension || !allowedExtensions.includes(extension)) {
          setError(
            `نوع الملف غير مدعوم: ${file.name}. يرجى اختيار ملفات صور فقط (JPG, PNG, WebP, GIF)`,
          );
          return false;
        } else {
        }
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`حجم الصورة كبير جداً: ${file.name}. الحد الأقصى 10MB`);
        return false;
      }

      if (file.size === 0) {
        setError(`الملف فارغ: ${file.name}`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    const newImages = [...images];

    // دالة مساعدة لإضافة تأخير بسيط بين الطلبات
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // رفع الصور بشكل متتالي لتجنب التداخل
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];

      const imageUrl = await uploadSingleImage(file);

      if (imageUrl) {
        newImages.push(imageUrl);
      } else {
        // في حالة الفشل، نتوقف عن رفع باقي الصور
        break;
      }

      // إضافة تأخير بسيط بين رفع الصور لتجنب التداخل
      // (ما عدا الصورة الأخيرة)
      if (i < validFiles.length - 1) {
        await delay(500); // تأخير 500 مللي ثانية
      }
    }

    onImagesChange(newImages);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImageToDelete(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (imageToDelete !== null) {
      const newImages = images.filter((_, i) => i !== imageToDelete);
      onImagesChange(newImages);
      setShowDeleteModal(false);
      setImageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-100');

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-100');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-100');
  };

  return (
    <div className="space-y-4">
      {/* منطقة رفع الصور */}
      <div
        className={`border-3 group cursor-pointer rounded-2xl border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-indigo-50 p-4 text-center transition-all duration-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:shadow-lg ${
          disabled || uploading ? 'cursor-not-allowed opacity-50' : ''
        }`}
        onClick={() => {
          if (!disabled && !uploading) {
            document.getElementById('transportImageInput')?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
          <PhotoIcon className="h-8 w-8 text-white" />
        </div>

        {uploading ? (
          <div className="space-y-2">
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
            <p className="font-medium text-indigo-600">جاري رفع الصور...</p>
            <p className="text-xs text-gray-600">
              يرجى عدم إغلاق الصفحة أو رفع صور إضافية حتى انتهاء الرفع
            </p>
          </div>
        ) : (
          <>
            <h3 className="mb-0.5 text-lg font-bold text-gray-900">
              {disabled ? 'رفع الصور معطل حالياً' : 'اسحب الصور هنا أو انقر لاختيار'}
            </h3>
            <p className="mb-1 text-gray-600">
              {disabled
                ? 'يرجى الانتظار حتى انتهاء العملية الحالية'
                : 'أضف صور واضحة وجذابة للساحبة'}
            </p>
            {!disabled && (
              <div className="mx-auto max-w-md rounded-lg bg-white/80 p-3 text-xs text-gray-500 backdrop-blur-sm">
                <div className="mb-0.5 flex items-center justify-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>يمكنك رفع حتى {maxImages} صور</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>الصيغ المدعومة: JPG, PNG, WEBP, GIF</span>
                  <span>•</span>
                  <span>حد أقصى 10MB لكل صورة</span>
                </div>
              </div>
            )}
          </>
        )}

        <input
          id="transportImageInput"
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled || uploading}
        />
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* عرض الصور المرفوعة */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            الصور المرفوعة ({images.length}/{maxImages})
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {images.map((image, index) => (
              <div key={index} className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  <img
                    src={image}
                    alt={`صورة الساحبة ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/images/transport/default-truck.jpg') {
                        target.src = '/images/transport/default-truck.jpg';
                      }
                    }}
                  />
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-80 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-600 group-hover:opacity-100"
                    title="حذف الصورة"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نصائح للصور */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
        <h4 className="mb-2 flex items-center gap-2 text-base font-semibold text-blue-900">
          <InformationCircleIcon className="h-4 w-4 text-blue-600" />
          إرشادات التصوير
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <CameraIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
            <span className="text-xs text-blue-800">التقط صور واضحة للساحبة من زوايا مختلفة</span>
          </div>
          <div className="flex items-start gap-2">
            <EyeIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-500" />
            <span className="text-xs text-blue-800">أضف صور للجزء الداخلي إذا كان مناسباً</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
            <span className="text-xs text-blue-800">تأكد من أن الصور تظهر حالة الساحبة بوضوح</span>
          </div>
          <div className="flex items-start gap-2">
            <SunIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
            <span className="text-xs text-blue-800">استخدم إضاءة طبيعية جيدة لصور أوضح</span>
          </div>
        </div>
      </div>

      {/* Modal تأكيد الحذف */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity duration-300"
          onClick={cancelDelete}
        >
          <div
            className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">تأكيد حذف الصورة</h3>
                <p className="text-sm text-gray-600">هل أنت متأكد من حذف هذه الصورة؟</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700">
                لن تتمكن من استرداد الصورة بعد حذفها. هذا الإجراء لا يمكن التراجع عنه.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <XMarkIcon className="h-4 w-4" />
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4" />
                حذف الصورة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
