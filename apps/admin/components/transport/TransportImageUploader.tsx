/**
 * مكون رفع صور خدمات النقل للوحة التحكم
 * نسخة محسنة للمديرين مع تصميم داكن متوافق
 */
import {
  CameraIcon,
  CheckCircleIcon,
  EyeIcon,
  InformationCircleIcon,
  PhotoIcon,
  SunIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

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

  // دالة مساعدة لرفع صورة واحدة
  const uploadSingleImage = async (file: File): Promise<string | null> => {
    let response: Response | null = null;

    try {
      const formData = new FormData();
      formData.append('image', file);

      // إضافة timeout للطلب
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        response = await fetch('/api/admin/upload/transport-images', {
          method: 'POST',
          body: formData,
          credentials: 'include', // للـ cookies
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

      if (!response.ok) {
        console.error(`فشل رفع الصورة - حالة HTTP: ${response.status}`);
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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('نوع المحتوى غير صحيح:', contentType);
        setError('استجابة غير صحيحة من الخادم');
        return null;
      }

      let result;
      try {
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

    if (uploading) {
      setError('يتم رفع صور حالياً. يرجى الانتظار حتى انتهاء الرفع الحالي');
      return;
    }

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
          setError(`نوع الملف غير مدعوم: ${file.name}`);
          return false;
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
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const imageUrl = await uploadSingleImage(file);

      if (imageUrl) {
        newImages.push(imageUrl);
      } else {
        break;
      }

      if (i < validFiles.length - 1) {
        await delay(500);
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
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-900/30');

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      e.currentTarget.classList.add('border-blue-400', 'bg-blue-900/30');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-900/30');
  };

  return (
    <div className="space-y-4">
      {/* منطقة رفع الصور */}
      <div
        className={`group cursor-pointer rounded-xl border-2 border-dashed border-slate-600 bg-slate-700/30 p-6 text-center transition-all duration-300 hover:border-blue-400 hover:bg-slate-700/50 ${
          disabled || uploading ? 'cursor-not-allowed opacity-50' : ''
        }`}
        onClick={() => {
          if (!disabled && !uploading) {
            document.getElementById('adminTransportImageInput')?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
          <PhotoIcon className="h-7 w-7 text-white" />
        </div>

        {uploading ? (
          <div className="space-y-2">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500"></div>
            <p className="font-medium text-blue-400">جاري رفع الصور...</p>
            <p className="text-xs text-slate-400">يرجى عدم إغلاق الصفحة</p>
          </div>
        ) : (
          <>
            <h3 className="mb-1 text-base font-bold text-white">
              {disabled ? 'رفع الصور معطل حالياً' : 'اسحب الصور هنا أو انقر لاختيار'}
            </h3>
            <p className="mb-2 text-sm text-slate-400">
              {disabled
                ? 'يرجى الانتظار حتى انتهاء العملية الحالية'
                : 'أضف صور واضحة وجذابة للساحبة'}
            </p>
            {!disabled && (
              <div className="rounded-lg bg-slate-800/80 p-2 text-xs text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-400" />
                  <span>حتى {maxImages} صور • JPG, PNG, WEBP • حد أقصى 10MB</span>
                </div>
              </div>
            )}
          </>
        )}

        <input
          id="adminTransportImageInput"
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
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* عرض الصور المرفوعة */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">
            الصور المرفوعة ({images.length}/{maxImages})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((image, index) => (
              <div key={index} className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg border border-slate-600 bg-slate-700">
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
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600"
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
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400">
          <InformationCircleIcon className="h-5 w-5" />
          إرشادات التصوير
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CameraIcon className="h-4 w-4 text-green-400" />
            <span>صور واضحة من زوايا مختلفة</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeIcon className="h-4 w-4 text-blue-400" />
            <span>أضف صور للجزء الداخلي</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
            <span>أظهر حالة الساحبة بوضوح</span>
          </div>
          <div className="flex items-center gap-2">
            <SunIcon className="h-4 w-4 text-amber-400" />
            <span>استخدم إضاءة طبيعية جيدة</span>
          </div>
        </div>
      </div>

      {/* Modal تأكيد الحذف */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={cancelDelete}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                <TrashIcon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">تأكيد حذف الصورة</h3>
                <p className="text-sm text-slate-400">هل أنت متأكد من حذف هذه الصورة؟</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
