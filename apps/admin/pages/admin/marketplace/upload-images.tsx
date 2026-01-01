/* eslint-disable @next/next/no-img-element */
/**
 * صفحة رفع صور الإعلان - لوحة التحكم
 */
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CloudArrowUpIcon from '@heroicons/react/24/outline/CloudArrowUpIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  serverUrl?: string;
}

export default function UploadImagesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const MIN_IMAGES = 3;
  const MAX_IMAGES = 30;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // فحص وجود بيانات السيارة عند تحميل الصفحة
  useEffect(() => {
    const savedData = localStorage.getItem('carListingData');
    if (!savedData) {
      router.push('/admin/marketplace/create?type=instant');
    }
  }, [router]);

  // رفع الصور
  const uploadImage = async (
    file: File,
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', 'listings');
      formData.append('userId', 'admin_user');
      formData.append('listingId', 'temp_listing');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/images/upload-car-image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `فشل في رفع الصورة - حالة HTTP: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } catch {
          // تجاهل أخطاء تحليل رسالة الخطأ
        }
        return { success: false, error: errorMessage };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { success: false, error: 'استجابة غير صحيحة من الخادم' };
      }

      const result = await response.json();

      if (result && result.success) {
        return { success: true, url: result.fileUrl || result.url };
      } else {
        return { success: false, error: result?.error || 'فشل في رفع الصورة' };
      }
    } catch (error) {
      let errorMessage = 'خطأ في الاتصال بالخادم';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'انتهت مهلة رفع الصورة';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'فشل في الاتصال بالخادم';
        }
      }
      return { success: false, error: errorMessage };
    }
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'نوع الملف غير مدعوم. يرجى استخدام JPG, PNG, أو WebP';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت';
    }
    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || isUploading) return;

    const newImages: UploadedImage[] = [];
    const currentCount = images.length;

    for (let i = 0; i < files.length && currentCount + newImages.length < MAX_IMAGES; i++) {
      const file = files[i];
      const error = validateFile(file);

      if (!error) {
        const id = Date.now().toString() + i;
        newImages.push({
          id,
          file,
          url: URL.createObjectURL(file),
          uploading: true,
          uploaded: false,
        });
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      uploadImages(newImages);
    }
  };

  const uploadImages = async (imagesToUpload: UploadedImage[]) => {
    setIsUploading(true);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < imagesToUpload.length; i++) {
      const image = imagesToUpload[i];

      try {
        setImages((prev) =>
          prev.map((img) => (img.id === image.id ? { ...img, uploading: true } : img)),
        );

        const result = await uploadImage(image.file);

        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== image.id) return img;
            if (result.success) {
              return {
                ...img,
                uploading: false,
                uploaded: true,
                serverUrl: result.url,
                error: undefined,
              };
            } else {
              return {
                ...img,
                uploading: false,
                uploaded: false,
                error: result.error || 'فشل في رفع الصورة',
              };
            }
          }),
        );

        setUploadProgress(((i + 1) / imagesToUpload.length) * 100);

        if (i < imagesToUpload.length - 1) {
          await delay(500);
        }
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploading: false,
                  uploaded: false,
                  error: 'خطأ غير متوقع في الرفع',
                }
              : img,
          ),
        );

        if (i < imagesToUpload.length - 1) {
          await delay(1000);
        }
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleContinue = () => {
    const uploadedImages = images.filter((img) => img.uploaded);
    if (uploadedImages.length >= MIN_IMAGES) {
      const imageIds = uploadedImages.map((img) => img.id);
      localStorage.setItem('uploadedImages', JSON.stringify(imageIds));
      localStorage.setItem('allUploadedImages', JSON.stringify(uploadedImages));
      router.push('/admin/marketplace/preview');
    }
  };

  const uploadedCount = images.filter((img) => img.uploaded).length;
  const canContinue = uploadedCount >= MIN_IMAGES;

  return (
    <AdminLayout title="رفع صور الإعلان">
      <Head>
        <title>رفع صور الإعلان - السوق الفوري</title>
      </Head>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/marketplace/create?type=instant"
                className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>العودة</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">رفع صور السيارة</h1>
                <p className="text-sm text-slate-400">
                  ارفع من {MIN_IMAGES} إلى {MAX_IMAGES} صورة عالية الجودة
                </p>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                canContinue
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'cursor-not-allowed bg-slate-700 text-slate-500'
              }`}
            >
              <span>متابعة</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Info */}
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-300">
                الصور المرفوعة: {uploadedCount} من {MAX_IMAGES}
              </span>
              <span
                className={`text-sm font-medium ${canContinue ? 'text-green-400' : 'text-amber-400'}`}
              >
                {canContinue ? 'جاهز للمتابعة' : `يحتاج ${MIN_IMAGES - uploadedCount} صور إضافية`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.min((uploadedCount / MIN_IMAGES) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div
            className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <CloudArrowUpIcon className="mx-auto mb-2 h-8 w-8 text-slate-500" />

            <h3 className="mb-1 text-base font-medium text-white">
              {isUploading ? 'جاري رفع الصور...' : 'اسحب الصور هنا أو انقر للاختيار'}
            </h3>

            <p className="mb-3 text-sm text-slate-400">
              {isUploading
                ? 'يرجى الانتظار حتى انتهاء رفع الصور الحالية'
                : `JPG, PNG, WebP حتى ${MAX_FILE_SIZE / (1024 * 1024)} ميجابايت`}
            </p>

            <button
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                isUploading
                  ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <PhotoIcon className="h-4 w-4" />
              <span>{isUploading ? 'جاري الرفع...' : 'اختر الصور'}</span>
            </button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4 rounded-lg bg-slate-700/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  جاري رفع الصور... ({Math.round(uploadProgress)}% مكتمل)
                </span>
                <span className="text-sm text-slate-400">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-600">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              الصور المرفوعة ({images.length})
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {images.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-700">
                    <img
                      src={image.url}
                      alt="صورة السيارة"
                      className="h-full w-full object-cover"
                    />

                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${
                        image.uploading ? 'bg-black/60' : ''
                      } ${image.error ? 'bg-red-500/70' : ''} ${
                        image.uploaded ? 'bg-green-500/0 group-hover:bg-black/30' : ''
                      }`}
                    >
                      {image.uploading && (
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span className="mt-1 text-xs text-white">جاري الرفع...</span>
                        </div>
                      )}
                      {image.error && <ExclamationTriangleIcon className="h-8 w-8 text-white" />}
                      {image.uploaded && (
                        <CheckCircleIcon className="h-8 w-8 text-green-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute left-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="mt-2 text-center">
                    {image.uploading && (
                      <span className="text-xs text-blue-400">جاري الرفع...</span>
                    )}
                    {image.uploaded && <span className="text-xs text-green-400">تم الرفع</span>}
                    {image.error && <span className="text-xs text-red-400">{image.error}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Link
            href="/admin/marketplace/create?type=instant"
            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-6 py-3 text-white transition-colors hover:bg-slate-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>السابق</span>
          </Link>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`flex items-center gap-2 rounded-lg px-8 py-3 transition-colors ${
              canContinue
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'cursor-not-allowed bg-slate-700 text-slate-500'
            }`}
          >
            <span>متابعة</span>
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
