import { XCircleIcon } from '@heroicons/react/24/outline';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ShowroomImagesProps {
  showroomId: string;
  showroomName: string;
  className?: string;
  showNavigation?: boolean;
  showIndicators?: boolean;
}

interface ShowroomData {
  id: string;
  name: string;
  images: string[];
}

const ShowroomImages: React.FC<ShowroomImagesProps> = ({
  showroomId,
  showroomName,
  className = '',
  showNavigation = true,
  showIndicators = true,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>(showroomName);

  // جلب بيانات المعرض من API
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchShowroomData = async () => {
      try {
        setLoading(true);
        setError(null);

        // التحقق من إلغاء الطلب
        if (abortController.signal.aborted) {
          return;
        }

        const response = await fetch(`/api/showrooms/${showroomId}`, {
          signal: abortController.signal,
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (!isMounted || abortController.signal.aborted) return;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // التحقق من أن response لم يتم استهلاكه بواسطة interceptors
        if (response.bodyUsed) {
          console.warn(
            '<ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /> تم استهلاك response body بواسطة interceptor، محاولة طلب جديد...',
          );

          // طلب جديد مع تجاهل cache وinterceptors
          const freshResponse = await fetch(`/api/showrooms/${showroomId}?t=${Date.now()}`, {
            signal: abortController.signal,
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          });

          if (!freshResponse.ok) {
            throw new Error(`HTTP ${freshResponse.status}: ${freshResponse.statusText}`);
          }

          const result = await freshResponse.json();

          if (!isMounted || abortController.signal.aborted) return;

          await processShowroomData(result);
          return;
        }

        // معالجة آمنة للاستجابة
        let result;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          } else {
            const text = await response.text();
            // محاولة تحليل النص كـ JSON إذا كان يبدو كـ JSON
            if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
              result = JSON.parse(text);
            } else {
              throw new Error('استجابة غير صالحة من الخادم');
            }
          }
        } catch (parseError: unknown) {
          // إذا كان الخطأ بسبب استهلاك response body، طلب جديد
          const errorMessage =
            parseError instanceof Error ? parseError.message : String(parseError);
          if (
            errorMessage.includes('body stream already read') ||
            errorMessage.includes('استهلاك') ||
            response.bodyUsed
          ) {
            // طلب جديد مع تجاهل cache وinterceptors
            const freshResponse = await fetch(`/api/showrooms/${showroomId}?t=${Date.now()}`, {
              signal: abortController.signal,
              cache: 'no-cache',
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
              },
            });

            if (!freshResponse.ok) {
              throw new Error(`HTTP ${freshResponse.status}: ${freshResponse.statusText}`);
            }

            result = await freshResponse.json();
          } else {
            throw new Error('خطأ في تحليل استجابة الخادم');
          }
        }

        if (!isMounted || abortController.signal.aborted) return;

        await processShowroomData(result);
      } catch (err: unknown) {
        if (!isMounted) return;

        // تجاهل أخطاء الإلغاء بشكل صامت
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        // تجاهل الأخطاء إذا تم إلغاء الطلب
        if (abortController.signal.aborted) {
          return;
        }

        console.error(
          '<XCircleIcon className="w-5 h-5 text-red-500" /> خطأ في جلب بيانات المعرض:',
          err,
        );

        // استخدام صور محلية بدلاً من Unsplash لتجنب مشاكل التحميل
        const fallbackImages = [
          '/images/showrooms/default-showroom-1.svg',
          '/images/showrooms/default-showroom-2.svg',
          '/images/showrooms/default-showroom-3.svg',
        ];

        setImages(fallbackImages);
        setDisplayName(showroomName || 'معرض السيارات');
        setCurrentIndex(0);
        setError(null); // لا نعرض خطأ، بل نستخدم صور افتراضية
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // دالة معالجة بيانات المعرض
    const processShowroomData = async (result: {
      success: boolean;
      data?: ShowroomData;
      error?: string;
    }) => {
      if (!result.success || !result.data) {
        throw new Error(result.error || 'فشل في جلب بيانات المعرض');
      }

      const showroomData: ShowroomData = result.data;

      // معالجة الصور
      let processedImages: string[] = [];

      if (showroomData.images && Array.isArray(showroomData.images)) {
        processedImages = showroomData.images.filter((img) => {
          if (!img || typeof img !== 'string') return false;
          const cleanImg = img.trim();

          // استبعاد blob URLs والصور غير الصالحة
          if (cleanImg.includes('blob:') || cleanImg.includes('data:')) {
            console.warn(
              `<XCircleIcon className="w-5 h-5 text-red-500" /> تم تجاهل صورة غير صالحة: ${cleanImg}`,
            );
            return false;
          }

          // قبول الصور المحلية والخارجية
          return cleanImg.startsWith('/') || cleanImg.startsWith('http');
        });
      }

      // إذا لم توجد صور صالحة، استخدم صور محلية افتراضية
      if (processedImages.length === 0) {
        processedImages = [
          '/images/showrooms/default-showroom-1.svg',
          '/images/showrooms/default-showroom-2.svg',
          '/images/showrooms/default-showroom-3.svg',
        ];
      }

      setImages(processedImages);
      setDisplayName(showroomData.name || showroomName || 'معرض السيارات');
      setCurrentIndex(0);
    };

    if (showroomId) {
      fetchShowroomData();
    }

    // تنظيف: إلغاء الطلب عند تغيير showroomId أو إلغاء تحميل المكون
    return () => {
      isMounted = false;
      // إلغاء الطلب مع إضافة سبب واضح لتجنب الأخطاء في React Strict Mode
      abortController.abort('Component unmounted or dependencies changed');
    };
  }, [showroomId, showroomName]);

  // تحديث displayName عند تغيير showroomName prop
  useEffect(() => {
    setDisplayName(showroomName);
  }, [showroomName]);

  // التنقل للصورة التالية
  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // التنقل للصورة السابقة
  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // الانتقال لصورة محددة
  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // إضافة دعم لوحة المفاتيح للتنقل
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (images.length <= 1) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          nextImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          prevImage();
          break;
        case 'Home':
          event.preventDefault();
          goToImage(0);
          break;
        case 'End':
          event.preventDefault();
          goToImage(images.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, nextImage, prevImage, goToImage]);

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex h-full w-full animate-pulse items-center justify-center bg-gray-200">
          <div className="text-center">
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
            <p className="mt-2 text-sm text-gray-500">جاري تحميل الصور...</p>
          </div>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-red-500">
              <XCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <p className="mt-2 text-sm text-gray-600">خطأ في تحميل الصور</p>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden ${className}`}>
      {/* الصورة الرئيسية */}
      <Image
        src={images[currentIndex]}
        alt={`${displayName} - صورة ${currentIndex + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-all duration-500 group-hover:scale-105"
        onError={(e) => {
          console.warn(
            `<XCircleIcon className="w-5 h-5 text-red-500" /> فشل تحميل الصورة: ${images[currentIndex]}`,
          );
          // في حالة فشل تحميل الصورة، استخدم صورة افتراضية محلية
          (e.target as HTMLImageElement).src = '/images/showrooms/default-showroom-1.svg';
        }}
        onLoad={() => {}}
      />

      {/* أسهم التنقل */}
      {showNavigation && images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-xl group-hover:opacity-100"
            aria-label="الصورة السابقة"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-xl group-hover:opacity-100"
            aria-label="الصورة التالية"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* مؤشرات الصور */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentIndex
                  ? 'scale-125 bg-white shadow-lg'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`الذهاب إلى الصورة ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* عداد الصور */}
      {images.length > 1 && (
        <div className="absolute left-4 top-4 z-20 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-lg backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ShowroomImages;
