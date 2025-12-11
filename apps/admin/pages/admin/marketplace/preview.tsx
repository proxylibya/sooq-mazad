/* eslint-disable @next/next/no-img-element */
/**
 * صفحة معاينة ونشر الإعلان - لوحة التحكم
 */
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface SellerInfo {
  id?: string;
  name: string;
  phone: string;
  isNew?: boolean;
}

interface CarData {
  brand: string;
  model: string;
  year: string;
  condition: string;
  mileage: string;
  price: string;
  city: string;
  area: string;
  title: string;
  description: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  exteriorColor: string;
  contactPhone: string;
  listingType: string;
  seller?: SellerInfo | null;
}

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  serverUrl?: string;
}

export default function PreviewPage() {
  const router = useRouter();
  const [carData, setCarData] = useState<CarData | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    // استرجاع بيانات السيارة من localStorage
    const savedData = localStorage.getItem('carListingData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCarData(parsedData);
      } catch (error) {
        console.error('خطأ في تحليل البيانات:', error);
        router.push('/admin/marketplace/create?type=instant');
      }
    } else {
      router.push('/admin/marketplace/create?type=instant');
    }

    // استرجاع الصور المرفوعة
    const savedImages = localStorage.getItem('allUploadedImages');
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages);
        setImages(parsedImages.filter((img: UploadedImage) => img.uploaded));
      } catch (error) {
        console.error('خطأ في استرجاع الصور:', error);
      }
    }
  }, [router]);

  const handlePublish = async () => {
    if (!carData || images.length === 0) {
      setNotification({
        show: true,
        type: 'error',
        message: 'يرجى التأكد من وجود جميع البيانات المطلوبة',
      });
      return;
    }

    setIsPublishing(true);

    try {
      // إعداد بيانات الإعلان
      const listingData = {
        carData: {
          ...carData,
          location: carData.city,
          listingType: 'marketplace',
        },
        images: images.map((img, index) => {
          const imageUrl = img.serverUrl || img.url;
          const fileName = imageUrl.split('/').pop() || `car_image_${index}.jpg`;
          return {
            id: img.id,
            url: imageUrl,
            serverUrl: imageUrl,
            fileName: fileName,
            fileSize: 0,
          };
        }),
        // تمرير بيانات البائع للـ API
        seller: carData.seller || null,
        userId: 'admin_user',
      };

      console.log('إرسال بيانات الإعلان:', listingData);

      // إرسال البيانات إلى API
      const response = await fetch('/api/admin/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include', // للتأكد من إرسال cookies المصادقة
        body: JSON.stringify(listingData),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : { success: false, message: 'استجابة فارغة' };
      } catch (parseError) {
        console.error('خطأ في تحليل الاستجابة:', parseError);
        throw new Error('استجابة غير صحيحة من الخادم');
      }

      console.log('نتيجة الإرسال:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'فشل في نشر الإعلان');
      }

      // تنظيف البيانات المؤقتة
      localStorage.removeItem('carListingData');
      localStorage.removeItem('uploadedImages');
      localStorage.removeItem('allUploadedImages');

      setNotification({
        show: true,
        type: 'success',
        message: 'تم نشر الإعلان بنجاح!',
      });

      // التوجيه إلى قائمة الإعلانات
      setTimeout(() => {
        router.push('/admin/marketplace');
      }, 2000);
    } catch (error) {
      console.error('خطأ في نشر الإعلان:', error);
      setIsPublishing(false);

      let errorMessage = 'حدث خطأ أثناء نشر الإعلان. يرجى المحاولة مرة أخرى.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setNotification({
        show: true,
        type: 'error',
        message: errorMessage,
      });

      setTimeout(() => {
        setNotification({ show: false, type: 'success', message: '' });
      }, 5000);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ar-LY').format(Number(price));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!carData) {
    return (
      <AdminLayout title="معاينة الإعلان">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="معاينة الإعلان">
      <Head>
        <title>معاينة الإعلان - السوق الفوري</title>
      </Head>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 transform rounded-lg px-6 py-3 shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/marketplace/upload-images"
                className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>العودة</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">معاينة الإعلان</h1>
                <p className="text-slate-400">راجع تفاصيل إعلانك قبل النشر</p>
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <EyeIcon className="h-5 w-5" />
                  <span>نشر الإعلان</span>
                </>
              )}
            </button>
          </div>

          {/* Status */}
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div>
                <p className="font-medium text-green-300">الإعلان جاهز للنشر!</p>
                <p className="text-sm text-green-400/80">تم استكمال جميع المعلومات المطلوبة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          {/* Car Images */}
          {images.length > 0 ? (
            <div className="relative">
              <div className="relative h-64 bg-slate-700">
                <img
                  src={images[currentImageIndex]?.serverUrl || images[currentImageIndex]?.url}
                  alt={`صورة السيارة ${currentImageIndex + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-car.jpg';
                  }}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                  {currentImageIndex + 1} / {images.length}
                </div>

                {/* Edit Button */}
                <Link
                  href="/admin/marketplace/upload-images"
                  className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-sm text-white transition-colors hover:bg-black/80"
                >
                  <PencilIcon className="h-4 w-4" />
                  تعديل الصور
                </Link>
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-slate-700 p-4">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        currentImageIndex === index
                          ? 'border-blue-500'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <img
                        src={image.serverUrl || image.url}
                        alt={`صورة مصغرة ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center bg-slate-700">
              <div className="text-center">
                <PhotoIcon className="mx-auto mb-2 h-16 w-16 text-slate-500" />
                <p className="text-slate-400">لم يتم رفع صور</p>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Title and Type */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  {carData.title || `${carData.brand} ${carData.model} ${carData.year}`}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-0.5 text-sm font-medium text-green-400">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    السوق الفوري
                  </span>
                </div>
              </div>
              <Link
                href="/admin/marketplace/create?type=instant"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                <PencilIcon className="h-4 w-4" />
                تعديل
              </Link>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="mb-1 text-3xl font-bold text-green-400">
                {formatPrice(carData.price)} د.ل
              </div>
              <p className="text-slate-400">السعر النهائي</p>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* معلومات السيارة */}
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <CogIcon className="h-5 w-5 text-slate-400" />
                  معلومات السيارة
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">الماركة</dt>
                    <dd className="font-medium text-white">{carData.brand}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">الموديل</dt>
                    <dd className="font-medium text-white">{carData.model}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">سنة الصنع</dt>
                    <dd className="font-medium text-white">{carData.year}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">الحالة</dt>
                    <dd className="font-medium text-white">{carData.condition}</dd>
                  </div>
                  {carData.mileage && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">المسافة المقطوعة</dt>
                      <dd className="font-medium text-white">{carData.mileage} كم</dd>
                    </div>
                  )}
                  {carData.exteriorColor && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">اللون الخارجي</dt>
                      <dd className="font-medium text-white">{carData.exteriorColor}</dd>
                    </div>
                  )}
                  {carData.fuelType && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">نوع الوقود</dt>
                      <dd className="font-medium text-white">{carData.fuelType}</dd>
                    </div>
                  )}
                  {carData.transmission && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">ناقل الحركة</dt>
                      <dd className="font-medium text-white">{carData.transmission}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* معلومات الموقع والتواصل */}
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <MapPinIcon className="h-5 w-5 text-slate-400" />
                  الموقع والتواصل
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">المدينة</dt>
                    <dd className="font-medium text-white">{carData.city}</dd>
                  </div>
                  {carData.area && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">المنطقة</dt>
                      <dd className="font-medium text-white">{carData.area}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-400">رقم الهاتف</dt>
                    <dd className="flex items-center gap-1 font-medium text-white">
                      <PhoneIcon className="h-4 w-4 text-green-400" />
                      <span dir="ltr">+218 {carData.contactPhone}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* الوصف */}
            {carData.description && (
              <div className="mt-4 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <h4 className="mb-2 font-semibold text-white">الوصف</h4>
                <p className="whitespace-pre-line text-sm text-slate-300">{carData.description}</p>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="mt-4 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>تاريخ النشر: {new Date().toLocaleDateString('ar-LY')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <PhotoIcon className="h-4 w-4" />
                  <span>{images.length} صورة</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Link
            href="/admin/marketplace/upload-images"
            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-6 py-3 text-white transition-colors hover:bg-slate-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>السابق</span>
          </Link>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>جاري النشر...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>نشر الإعلان</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
