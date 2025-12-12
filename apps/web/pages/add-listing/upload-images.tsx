/* eslint-disable @next/next/no-img-element */
import {
  CheckCircleIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import NavigationButtons from '../../components/add-listing/NavigationButtons';
import { Layout } from '../../components/common';
import { BackIcon, ForwardIcon } from '../../components/common/icons/RTLIcon';
import { getUserSession, refreshAuthToken } from '../../utils/authUtils';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  serverUrl?: string; // URL من الخادم بعد الرفع الناجح
}

const UploadImagesPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentPath = router.pathname || '';
  const isAdminAuctions = currentPath.startsWith('/admin/auctions');
  const isAdminMarketplace = currentPath.startsWith('/admin/marketplace');
  const baseRoot = isAdminAuctions
    ? '/admin/auctions'
    : isAdminMarketplace
      ? '/admin/marketplace'
      : '/add-listing';
  const detailsPath = isAdminAuctions
    ? '/admin/auctions/create?type=auction'
    : isAdminMarketplace
      ? '/admin/marketplace/create?type=instant'
      : '/add-listing/car-details';

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [_uploadQueue, _setUploadQueue] = useState<File[]>([]); // قائمة انتظار الرفع

  const MIN_IMAGES = 3;
  const MAX_IMAGES = 30;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // فحص وجود بيانات السيارة عند تحميل الصفحة
  useEffect(() => {
    const savedData = localStorage.getItem('carListingData');
    const showroomData = localStorage.getItem('showroomCarData');

    if (!savedData && !showroomData) {
      // إعادة توجيه إلى صفحة التفاصيل المناسبة إذا لم توجد بيانات
      router.push(detailsPath);
    }
  }, [router, detailsPath]);

  // رفع الصور مع معالجة محسنة للأخطاء
  const uploadImage = async (
    file: File,
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    let response: Response | null = null;

    try {
      // الحصول على التوكن من الجلسة
      const session = getUserSession();
      const token = session?.token;

      if (!token) {
        console.error('❌ لا يوجد توكن مصادقة');
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // محاولة الرفع الحقيقي أولاً
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', 'listings');
      formData.append('userId', session.user?.id || 'temp_user');
      formData.append('listingId', 'temp_listing');

      // إضافة timeout للطلب لتجنب التعليق
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانية

      const doRequest = async (authToken: string) => {
        return fetch('/api/images/upload-car-image', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });
      };

      try {
        response = await doRequest(token);

        // في حال انتهاء الجلسة أو رفض غير مصرح، جرّب تحديث التوكن ثم أعد المحاولة مرة واحدة
        if (response.status === 401) {
          console.log('🔄 محاولة تحديث التوكن...');
          const refreshed = await refreshAuthToken();
          if (refreshed) {
            const newSession = getUserSession();
            if (newSession?.token) {
              response = await doRequest(newSession.token);
            }
          }
        }

        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('انتهت مهلة رفع الصورة');
          return {
            success: false,
            error: 'انتهت مهلة رفع الصورة. يرجى المحاولة مرة أخرى',
          };
        }

        throw fetchError;
      }

      // التحقق من حالة الاستجابة أولاً
      if (!response.ok) {
        console.error(`فشل الرفع الحقيقي - حالة HTTP: ${response.status}`);

        // محاولة قراءة رسالة الخطأ من الخادم
        let errorMessage = `فشل في رفع الصورة - حالة HTTP: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } catch (parseError) {
          // تجاهل أخطاء تحليل رسالة الخطأ
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      // التحقق من نوع المحتوى
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('نوع المحتوى غير صحيح:', contentType);
        return {
          success: false,
          error: 'استجابة غير صحيحة من الخادم',
        };
      }

      // محاولة قراءة JSON مع معالجة الأخطاء المحسنة
      let result;
      try {
        // التأكد من أن Response لم يتم قراءته مسبقاً
        if (response.bodyUsed) {
          console.error('تم قراءة Response body مسبقاً');
          return {
            success: false,
            error: 'خطأ في معالجة استجابة الخادم',
          };
        }

        result = await response.json();
      } catch (jsonError) {
        console.error('فشل في تحليل استجابة JSON:', jsonError);
        return {
          success: false,
          error: 'فشل في تحليل استجابة الخادم',
        };
      }

      if (result && result.success) {
        console.log('تم بنجاح تم رفع الصورة بنجاح:', result.fileUrl || result.url);
        return {
          success: true,
          url: result.fileUrl || result.url,
        };
      } else {
        console.error('فشل الرفع الحقيقي:', result?.error || 'استجابة غير صحيحة');
        return {
          success: false,
          error: result?.error || result?.message || 'فشل في رفع الصورة',
        };
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

      return {
        success: false,
        error: errorMessage,
      };
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
    if (!files) return;

    // منع رفع صور جديدة إذا كان هناك رفع جاري
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
        newImages.push({
          id,
          file,
          url: URL.createObjectURL(file),
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
    } else {
    }
  };

  const uploadImages = async (imagesToUpload: UploadedImage[]) => {
    setIsUploading(true);

    // دالة مساعدة لإضافة تأخير بسيط بين الطلبات
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < imagesToUpload.length; i++) {
      const image = imagesToUpload[i];

      try {
        // تحديث حالة الصورة لتظهر أنها قيد الرفع
        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== image.id) return img;
            const { error: _removed, ...rest } = img;
            const updated: UploadedImage = { ...rest, uploading: true };
            return updated;
          }),
        );

        console.log(`بدء رفع الصورة ${i + 1} من ${imagesToUpload.length}: ${image.file.name}`);

        const result = await uploadImage(image.file);

        console.log(
          `${result.success ? 'تم بنجاح' : 'فشل'} انتهاء رفع الصورة ${i + 1}: ${result.success ? 'نجح' : result.error}`,
        );

        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== image.id) return img;
            if (result.success) {
              const { error: _e, ...rest } = img;
              const updated: UploadedImage = {
                ...rest,
                uploading: false,
                uploaded: true,
                ...(result.url ? { serverUrl: result.url } : {}),
              };
              return updated;
            } else {
              const { serverUrl: _s, ...rest } = img;
              const updated: UploadedImage = {
                ...rest,
                uploading: false,
                uploaded: false,
                error: result.error || 'فشل في رفع الصورة',
              };
              return updated;
            }
          }),
        );

        setUploadProgress(((i + 1) / imagesToUpload.length) * 100);

        // إضافة تأخير بسيط بين رفع الصور لتجنب التداخل
        // (ما عدا الصورة الأخيرة)
        if (i < imagesToUpload.length - 1) {
          await delay(500); // تأخير 500 مللي ثانية
        }
      } catch (error) {
        console.error(`فشل خطأ غير متوقع في رفع الصورة ${i + 1}:`, error);
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploading: false,
                  uploaded: false,
                  error: error instanceof Error ? error.message : 'خطأ غير متوقع في الرفع',
                }
              : img,
          ),
        );

        // في حالة الخطأ، أيضاً نضيف تأخير قبل المحاولة التالية
        if (i < imagesToUpload.length - 1) {
          await delay(1000); // تأخير أطول في حالة الخطأ
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
      // حفظ معرفات الصور في localStorage
      const imageIds = uploadedImages.map((img) => img.id);
      localStorage.setItem('uploadedImages', JSON.stringify(imageIds));

      // حفظ بيانات الصور الكاملة للاستخدام في صفحة المعاينة
      localStorage.setItem('allUploadedImages', JSON.stringify(uploadedImages));

      // التحقق من نوع الإعلان (عادي أم معرض)
      const showroomData = localStorage.getItem('showroomCarData');
      if (showroomData) {
        // إذا كان إعلان معرض، حفظ الصور للمعرض أيضاً
        localStorage.setItem('showroomUploadedImages', JSON.stringify(uploadedImages));
      }

      router.push(`${baseRoot}/preview`);
    }
  };

  const handleBack = () => {
    router.push(detailsPath);
  };

  const uploadedCount = images.filter((img) => img.uploaded).length;
  const canContinue = uploadedCount >= MIN_IMAGES;

  return (
    <Layout title="إضافة إعلان - رفع الصور" description="ارفع صور سيارتك للحصول على أفضل النتائج">
      <Head>
        <title>إضافة إعلان - رفع الصور</title>
      </Head>

      <div className="min-h-screen select-none bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4">
            <div className="mb-3 flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
              >
                <BackIcon className="h-5 w-5" />
                <span>العودة</span>
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">رفع صور السيارة</h1>
                <p className="text-sm text-gray-600">
                  ارفع من {MIN_IMAGES} إلى {MAX_IMAGES} صورة عالية الجودة
                </p>
              </div>

              {/* زر المتابعة في أعلى الصفحة */}
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                  canContinue
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                } `}
                title={
                  canContinue
                    ? 'انقر للمتابعة إلى المعاينة'
                    : `يحتاج ${MIN_IMAGES - uploadedCount} صور إضافية للمتابعة`
                }
              >
                <span>متابعة</span>
                <ForwardIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  الصور المرفوعة: {uploadedCount} من {MAX_IMAGES}
                </span>
                <span
                  className={`text-sm font-medium ${canContinue ? 'text-green-600' : 'text-orange-600'}`}
                >
                  {canContinue
                    ? '[تم] جاهز للمتابعة'
                    : `يحتاج ${MIN_IMAGES - uploadedCount} صور إضافية`}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-blue-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.min((uploadedCount / MIN_IMAGES) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div
              className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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

              <CloudArrowUpIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />

              <h3 className="mb-1 text-base font-medium text-gray-900">
                {isUploading ? 'جاري رفع الصور...' : 'اسحب الصور هنا أو انقر للاختيار'}
              </h3>

              <p className="mb-3 text-sm text-gray-500">
                {isUploading
                  ? 'يرجى الانتظار حتى انتهاء رفع الصور الحالية'
                  : `JPG, PNG, WebP حتى ${MAX_FILE_SIZE / (1024 * 1024)} ميجابايت`}
              </p>

              <button
                onClick={() => !isUploading && fileInputRef.current?.click()}
                disabled={isUploading}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isUploading
                    ? 'cursor-not-allowed bg-gray-400 text-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <PhotoIcon className="h-4 w-4" />
                <span>{isUploading ? 'جاري الرفع...' : 'اختر الصور'}</span>
              </button>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    جاري رفع الصور... ({Math.round(uploadProgress)}% مكتمل)
                  </span>
                  <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  يرجى عدم إغلاق الصفحة أو رفع صور إضافية حتى انتهاء الرفع
                </div>
              </div>
            )}
          </div>

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                الصور المرفوعة ({images.length})
              </h3>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((image) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={image.url}
                        alt="صورة السيارة"
                        className="h-full w-full object-cover"
                      />

                      {/* Overlay */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center ${image.uploading ? 'bg-black bg-opacity-50' : ''} ${image.error ? 'bg-red-500 bg-opacity-75' : ''} ${image.uploaded ? 'bg-green-500 bg-opacity-0 group-hover:bg-opacity-20' : ''} `}
                      >
                        {image.uploading && (
                          <div className="flex flex-col items-center">
                            <div
                              className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                              style={{ width: 24, height: 24 }}
                              role="status"
                              aria-label="جاري التحميل"
                            />
                            <span className="text-xs text-white">جاري الرفع...</span>
                          </div>
                        )}
                        {image.error && <ExclamationTriangleIcon className="h-8 w-8 text-white" />}
                        {image.uploaded && (
                          <CheckCircleIcon className="h-8 w-8 text-green-600 opacity-0 transition-opacity group-hover:opacity-100" />
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
                        <span className="text-xs text-blue-600">جاري الرفع...</span>
                      )}
                      {image.uploaded && (
                        <span className="text-xs text-green-600">تم الرفع [تم]</span>
                      )}
                      {image.error && <span className="text-xs text-red-600">{image.error}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* مساحة للأزرار الثابتة */}
          <div className="h-24" />
        </div>
      </div>

      {/* أزرار التنقل الثابتة */}
      <NavigationButtons onBack={handleBack} onNext={handleContinue} canContinue={canContinue} />
    </Layout>
  );
};

export default UploadImagesPage;
