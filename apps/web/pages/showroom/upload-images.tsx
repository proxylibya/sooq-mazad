import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import CloudArrowUpIcon from '@heroicons/react/24/outline/CloudArrowUpIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { Layout } from '../../components/common';
import { BackIcon, ForwardIcon } from '../../components/common/icons/RTLIcon';
import useAuth from '../../hooks/useAuth';
import { getUserSession, refreshAuthToken } from '../../utils/authUtils';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  serverUrl?: string;
}

const ShowroomUploadImagesPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const MIN_IMAGES = 3;
  const MAX_IMAGES = 20;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // التحقق من صلاحية الوصول (السماح أيضاً للمسؤول الإداري)
  useEffect(() => {
    if (authLoading) return;

    try {
      // التحقق من أن المستخدم معرض
      const isAdminCreating =
        typeof window !== 'undefined'
          ? localStorage.getItem('isAdminCreatingShowroom') === 'true'
          : false;

      if (!isAdminCreating && (!user || user.accountType !== 'SHOWROOM')) {
        router.push('/login');
      }
    } catch {
      if (!user || user.accountType !== 'SHOWROOM') {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);

  // تنظيف blob URLs عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

  // فحص وجود بيانات المعرض عند تحميل الصفحة
  useEffect(() => {
    const savedData = localStorage.getItem('showroomData');
    const isAdminCreating = localStorage.getItem('isAdminCreatingShowroom') === 'true';

    if (!savedData) {
      // إذا كان أدمن، أعد توجيهه لصفحة إنشاء المعرض في لوحة التحكم
      const redirectPath = isAdminCreating ? '/admin/showrooms/create' : '/showroom/create';
      router.push(redirectPath);
      return;
    }

    // تنظيف العلامة بعد التحقق منها
    if (isAdminCreating) {
      // لا نحذف العلامة هنا لأننا نحتاجها للتنقل بين الصفحات
      // سيتم حذفها عند النقر على زر المتابعة أو العودة
    }
  }, [router]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WebP)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت';
    }
    return null;
  };

  const uploadImage = async (
    file: File,
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      // الحصول على التوكن من الجلسة
      const session = getUserSession();
      const token = session?.token;

      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', 'showrooms');
      formData.append('userId', session.user?.id || 'showroom_user');

      // إضافة timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const doRequest = async (authToken: string) =>
        fetch('/api/images/upload-car-image', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });

      let response = await doRequest(token);

      // معالجة 401 بتحديث التوكن مرة واحدة
      if (response.status === 401) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          const newSession = getUserSession();
          if (newSession?.token) {
            response = await doRequest(newSession.token);
          }
        }
      }

      clearTimeout(timeoutId);

      // التحقق من نوع المحتوى
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { success: false, error: 'استجابة غير صحيحة من الخادم' };
      }

      const result = await response.json();

      if (response.ok && result?.success) {
        const imageUrl = result.fileUrl || result.url || result.data?.fileUrl;
        return { success: true, url: imageUrl };
      }

      return { success: false, error: result?.error || result?.message || 'فشل في رفع الصورة' };
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'انتهت مهلة رفع الصورة. يرجى المحاولة مرة أخرى' };
      }
      return { success: false, error: 'خطأ في الاتصال بالخادم' };
    }
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

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    if (isUploading) {
      console.log('تحذير يتم رفع صور حالياً. يرجى الانتظار حتى انتهاء الرفع الحالي');
      return;
    }

    const newImages: UploadedImage[] = [];
    const currentCount = images.length;

    for (let i = 0; i < files.length && currentCount + newImages.length < MAX_IMAGES; i++) {
      const file = files[i];
      const error = validateFile(file);

      if (!error) {
        const id = Date.now().toString() + i;
        // إنشاء blob URL مؤقت للمعاينة فقط - لن يتم حفظه في قاعدة البيانات
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          id,
          file,
          url: previewUrl, // هذا للمعاينة فقط
          uploading: true,
          uploaded: false,
        });
      } else {
        console.warn(`تحذير تم تجاهل الملف ${file.name}: ${error}`);
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      uploadImages(newImages);
    }
  };

  const uploadImages = async (imagesToUpload: UploadedImage[]) => {
    setIsUploading(true);

    for (let i = 0; i < imagesToUpload.length; i++) {
      const image = imagesToUpload[i];

      try {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, uploading: true, error: undefined } : img,
          ),
        );

        const result = await uploadImage(image.file);

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploading: false,
                  uploaded: result.success,
                  serverUrl: result.success ? result.url : undefined,
                  error: result.success ? undefined : result.error || 'فشل في رفع الصورة',
                }
              : img,
          ),
        );

        // تأخير بسيط بين الطلبات
        if (i < imagesToUpload.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploading: false,
                  uploaded: false,
                  error: 'خطأ غير متوقع في رفع الصورة',
                }
              : img,
          ),
        );
      }
    }

    setIsUploading(false);
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      // تنظيف blob URL لتجنب تسريب الذاكرة
      if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const retryUpload = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (image && !image.uploaded) {
      uploadImages([image]);
    }
  };

  const handleContinue = () => {
    const uploadedImages = images.filter((img) => img.uploaded && img.serverUrl);
    const isAdmin = localStorage.getItem('isAdminCreatingShowroom') === 'true';

    if (uploadedImages.length < MIN_IMAGES) {
      alert(`يجب رفع ${MIN_IMAGES} صور على الأقل. تم رفع ${uploadedImages.length} صور فقط.`);
      return;
    }

    // التأكد من عدم وجود blob URLs
    const validImages = uploadedImages.filter(
      (img) => img.serverUrl && !img.serverUrl.includes('blob:'),
    );

    if (validImages.length < MIN_IMAGES) {
      alert(
        `يجب رفع ${MIN_IMAGES} صور صالحة على الأقل. تم رفع ${validImages.length} صور صالحة فقط.`,
      );
      return;
    }

    console.log('تم بنجاح حفظ الصور الصالحة في localStorage:', validImages.length);
    localStorage.setItem('showroomImages', JSON.stringify(validImages));

    // تحديد الصفحة التالية بناءً على ما إذا كان أدمن
    const nextPage = isAdmin ? '/admin/showrooms/create/preview' : '/showroom/preview';

    if (isAdmin) {
      localStorage.removeItem('isAdminCreatingShowroom');
    }

    router.push(nextPage);
  };

  const handleBack = () => {
    const isAdmin = localStorage.getItem('isAdminCreatingShowroom') === 'true';
    const backPath = isAdmin ? '/admin/showrooms/create' : '/showroom/create';

    // تنظيف العلامة إذا كان أدمن
    if (isAdmin) {
      localStorage.removeItem('isAdminCreatingShowroom');
    }

    router.push(backPath);
  };

  const uploadedCount = images.filter((img) => img.uploaded).length;
  const canContinue = uploadedCount >= MIN_IMAGES;

  return (
    <Layout title="رفع صور المعرض" description="ارفع صور معرضك من الخارج والداخل">
      <Head>
        <title>رفع صور المعرض</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
              >
                <BackIcon className="h-4 w-4" />
                <span className="text-sm">العودة</span>
              </button>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-1.5">
                <BuildingStorefrontIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">رفع صور المعرض</h1>
                <p className="text-sm text-gray-600">
                  ارفع من {MIN_IMAGES} إلى {MAX_IMAGES} صورة عالية الجودة لمعرضك
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="rounded-lg border bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">
                  تم رفع {uploadedCount} من {MIN_IMAGES} صور مطلوبة
                </span>
                <span
                  className={`font-medium ${canContinue ? 'text-green-600' : 'text-orange-600'}`}
                >
                  {canContinue ? 'جاهز للمتابعة' : `تحتاج ${MIN_IMAGES - uploadedCount} صور إضافية`}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-gray-200">
                <div
                  className="h-1.5 rounded-full bg-green-600 transition-all duration-300"
                  style={{
                    width: `${Math.min((uploadedCount / MIN_IMAGES) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className="mb-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            style={{ height: '120px' }}
          >
            <div
              className={`relative flex h-full items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors ${
                dragActive
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              <div className="flex items-center gap-4">
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />

                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-900">
                    {isUploading ? 'جاري رفع الصور...' : 'ارفع صور المعرض'}
                  </h3>
                  <p className="text-xs text-gray-500">اسحب الصور هنا أو اضغط لاختيارها</p>
                </div>

                <div
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isUploading ? 'bg-gray-400 text-gray-200' : 'bg-green-600 text-white'
                  }`}
                >
                  <PhotoIcon className="h-4 w-4" />
                  <span>{isUploading ? 'جاري الرفع...' : 'اختر الصور'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Images */}
          {images.length > 0 && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                صور المعرض ({images.length})
              </h3>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((image) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={image.url}
                        alt="صورة المعرض"
                        className="h-full w-full object-cover"
                      />

                      {/* Status Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                        {image.uploading && (
                          <div className="text-center text-white">
                            <div
                              className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                              style={{ width: 24, height: 24 }}
                              role="status"
                              aria-label="جاري التحميل"
                            />
                            <span className="text-xs">جاري الرفع...</span>
                          </div>
                        )}

                        {image.uploaded && <CheckCircleIcon className="h-8 w-8 text-green-400" />}

                        {image.error && (
                          <div className="text-center text-white">
                            <ExclamationTriangleIcon className="mx-auto mb-1 h-6 w-6 text-red-400" />
                            <button
                              onClick={() => retryUpload(image.id)}
                              className="text-xs underline"
                            >
                              إعادة المحاولة
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Status Indicator */}
                    <div className="mt-2 text-center">
                      {image.uploaded && (
                        <span className="text-xs font-medium text-green-600">تم الرفع</span>
                      )}
                      {image.uploading && (
                        <span className="text-xs font-medium text-blue-600">جاري الرفع...</span>
                      )}
                      {image.error && (
                        <span className="text-xs font-medium text-red-600">فشل الرفع</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <BackIcon className="h-5 w-5" />
              <span>السابق</span>
            </button>

            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`flex items-center gap-2 rounded-lg px-8 py-3 text-white transition-all ${
                canContinue
                  ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                  : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              <span>معاينة المعرض</span>
              <ForwardIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShowroomUploadImagesPage;
