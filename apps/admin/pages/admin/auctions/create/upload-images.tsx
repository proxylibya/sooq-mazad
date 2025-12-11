/**
 * صفحة رفع صور المزاد - لوحة التحكم
 * Upload Auction Images - Admin Panel
 */

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import StickyActionBar from '../../../../components/ui/StickyActionBar';

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
  const [isUploading, setIsUploading] = useState(false);

  const MIN_IMAGES = 3;
  const MAX_IMAGES = 30;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // فحص وجود بيانات السيارة
  useEffect(() => {
    const savedData = localStorage.getItem('adminAuctionData');
    if (!savedData) {
      router.push('/admin/auctions/create');
    }
  }, [router]);

  // رفع الصورة
  const uploadImage = async (
    file: File,
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', 'auctions');

      const response = await fetch('/api/admin/upload/auction-images', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'فشل في رفع الصورة' }));
        return { success: false, error: error.message || 'فشل في رفع الصورة' };
      }

      const result = await response.json();
      if (result.success) {
        return { success: true, url: result.fileUrl || result.url };
      }
      return { success: false, error: result.error || 'فشل في رفع الصورة' };
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      return { success: false, error: 'خطأ في الاتصال بالخادم' };
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

    for (const image of imagesToUpload) {
      setImages((prev) =>
        prev.map((img) => (img.id === image.id ? { ...img, uploading: true } : img)),
      );

      const result = await uploadImage(image.file);

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                uploading: false,
                uploaded: result.success,
                serverUrl: result.url,
                error: result.error,
              }
            : img,
        ),
      );

      // تأخير بسيط بين الرفعات
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsUploading(false);
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
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const setMainImage = (id: string) => {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);
      if (index > 0) {
        const newImages = [...prev];
        const [image] = newImages.splice(index, 1);
        newImages.unshift(image);
        return newImages;
      }
      return prev;
    });
  };

  const handleContinue = () => {
    const uploadedImages = images.filter((img) => img.uploaded && img.serverUrl);
    if (uploadedImages.length < MIN_IMAGES) {
      alert(`يرجى رفع ${MIN_IMAGES} صور على الأقل`);
      return;
    }

    // حفظ روابط الصور مع التحقق من عدم وجود قيم فارغة
    const imageUrls = uploadedImages
      .map((img) => img.serverUrl)
      .filter((url): url is string => !!url && url.trim() !== '');

    if (imageUrls.length === 0) {
      alert('حدث خطأ في حفظ روابط الصور. يرجى إعادة رفع الصور.');
      return;
    }

    console.log('[Upload] حفظ الصور:', imageUrls);

    const savedData = localStorage.getItem('adminAuctionData');
    if (savedData) {
      const data = JSON.parse(savedData);
      data.images = imageUrls;
      localStorage.setItem('adminAuctionData', JSON.stringify(data));
      console.log('[Upload] تم حفظ البيانات بنجاح:', data.images?.length, 'صورة');
    } else {
      // إنشاء بيانات جديدة إذا لم تكن موجودة
      const newData = { images: imageUrls };
      localStorage.setItem('adminAuctionData', JSON.stringify(newData));
      console.log('[Upload] تم إنشاء بيانات جديدة');
    }

    router.push('/admin/auctions/create/preview');
  };

  const handleBack = () => {
    router.push('/admin/auctions/create');
  };

  const uploadedCount = images.filter((img) => img.uploaded).length;
  const uploadingCount = images.filter((img) => img.uploading).length;

  return (
    <AdminLayout title="رفع صور المزاد">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>العودة</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white">رفع صور السيارة</h1>
          <p className="mt-2 text-slate-400">
            أضف صوراً واضحة للسيارة من جميع الزوايا (الحد الأدنى: {MIN_IMAGES} صور)
          </p>
        </div>

        {/* إحصائيات الرفع */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-center">
            <div className="text-3xl font-bold text-white">{images.length}</div>
            <div className="text-sm text-slate-400">إجمالي الصور</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{uploadedCount}</div>
            <div className="text-sm text-slate-400">تم رفعها</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{uploadingCount}</div>
            <div className="text-sm text-slate-400">جاري الرفع</div>
          </div>
        </div>

        {/* منطقة الرفع */}
        <div
          className={`relative mb-6 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-600 bg-slate-800 hover:border-slate-500'
          }`}
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

          <CloudArrowUpIcon className="mx-auto h-16 w-16 text-slate-500" />
          <h3 className="mt-4 text-lg font-medium text-white">اسحب الصور هنا أو</h3>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            اختر الصور
          </button>
          <p className="mt-3 text-sm text-slate-400">
            JPG, PNG, WebP - الحد الأقصى 5MB للصورة الواحدة
          </p>
          <p className="text-sm text-slate-500">
            {images.length}/{MAX_IMAGES} صورة
          </p>
        </div>

        {/* شريط التقدم */}
        {uploadingCount > 0 && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-300">جاري رفع الصور...</span>
              <span className="text-sm text-blue-400">{uploadingCount} متبقي</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(uploadedCount / images.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* معرض الصور */}
        {images.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h3 className="mb-4 text-lg font-medium text-white">الصور المرفوعة</h3>
            <p className="mb-4 text-sm text-slate-400">انقر على صورة لجعلها الصورة الرئيسية</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`group relative aspect-square overflow-hidden rounded-lg border-2 ${
                    index === 0
                      ? 'border-blue-500'
                      : image.error
                        ? 'border-red-500'
                        : 'border-slate-600'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={`صورة ${index + 1}`}
                    className="h-full w-full object-cover"
                    onClick={() => setMainImage(image.id)}
                  />

                  {/* شارة الصورة الرئيسية */}
                  {index === 0 && (
                    <div className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-1 text-xs text-white">
                      رئيسية
                    </div>
                  )}

                  {/* حالة الرفع */}
                  {image.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}

                  {image.uploaded && !image.uploading && (
                    <div className="absolute bottom-2 right-2">
                      <CheckCircleIcon className="h-6 w-6 text-green-400" />
                    </div>
                  )}

                  {image.error && (
                    <div className="absolute bottom-2 right-2">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                    </div>
                  )}

                  {/* زر الحذف */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تنبيه الحد الأدنى */}
        {uploadedCount < MIN_IMAGES && (
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-400">يرجى رفع {MIN_IMAGES} صور على الأقل</p>
                <p className="text-sm text-yellow-400/70">
                  تم رفع {uploadedCount} من {MIN_IMAGES} صور المطلوبة
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* شريط الأزرار الثابت */}
      <StickyActionBar
        leftButton={{
          label: 'السابق',
          onClick: handleBack,
          icon: 'prev',
          variant: 'secondary',
        }}
        rightButton={{
          label: 'متابعة',
          onClick: handleContinue,
          icon: 'next',
          variant: 'primary',
          disabled: uploadedCount < MIN_IMAGES || isUploading,
        }}
      />
    </AdminLayout>
  );
}
