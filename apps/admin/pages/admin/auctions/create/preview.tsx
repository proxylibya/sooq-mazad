/**
 * صفحة معاينة ونشر المزاد - لوحة التحكم
 * Preview and Publish Auction - Admin Panel
 */

import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  SparklesIcon,
  TagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import {
  DurationValue,
  formatDuration,
} from '../../../../components/auctions/AuctionDurationSelector';
import StickyActionBar from '../../../../components/ui/StickyActionBar';

interface AuctionData {
  brand: string;
  model: string;
  year: string;
  condition: string;
  mileage: string;
  price: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  engineSize: string;
  regionalSpec: string;
  exteriorColor: string;
  interiorColor: string;
  seatCount: string;
  city: string;
  area: string;
  // yardId محذوف - المزادات الأونلاين لا ترتبط بساحات
  contactPhone: string;
  title: string;
  description: string;
  chassisNumber: string;
  engineNumber: string;
  features: string[];
  auctionStartTime: string;
  auctionCustomStartTime: string;
  auctionDuration: DurationValue;
  images: string[];
  featured?: boolean;
  promotionPackage?: string;
  promotionDays?: number;
  coordinates?: { lat: number; lng: number };
  detailedAddress?: string;
  inspectionReport?: {
    hasReport: boolean;
    manualReport?: {
      engineCondition: string;
      bodyCondition: string;
      interiorCondition: string;
      tiresCondition: string;
      notes: string;
    };
  };
}

// رابط التطبيق الرئيسي للصور
const WEB_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3021';

// دالة لتحويل الرابط النسبي إلى رابط كامل
const getFullImageUrl = (url: string): string => {
  if (!url) return '';
  // إذا كان الرابط كاملاً بالفعل، إرجاعه كما هو
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // إذا كان blob URL (للمعاينة المحلية)
  if (url.startsWith('blob:')) {
    return url;
  }
  // إضافة رابط التطبيق الرئيسي للروابط النسبية
  return `${WEB_APP_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function PreviewPage() {
  const router = useRouter();
  const [auctionData, setAuctionData] = useState<AuctionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    const savedData = localStorage.getItem('adminAuctionData');
    if (!savedData) {
      console.warn('[Preview] لا توجد بيانات محفوظة - إعادة التوجيه');
      router.push('/admin/auctions/create');
      return;
    }

    try {
      const parsedData = JSON.parse(savedData);
      console.log('[Preview] تم تحميل البيانات:', {
        hasImages: !!parsedData.images,
        imagesCount: parsedData.images?.length || 0,
        images: parsedData.images,
      });
      setAuctionData(parsedData);
    } catch (err) {
      console.error('[Preview] خطأ في تحليل البيانات:', err);
      router.push('/admin/auctions/create');
    }
  }, [router]);

  const getDurationText = (duration: DurationValue): string => {
    if (!duration || typeof duration !== 'object') {
      return 'غير محدد';
    }
    return formatDuration(duration.totalMinutes);
  };

  const getStartTimeText = (startTime: string, customTime?: string) => {
    const times: Record<string, string> = {
      now: 'مزاد مباشر (يبدأ فوراً)',
      after_30_seconds: 'بعد 30 ثانية',
      after_1_hour: 'بعد ساعة',
      after_24_hours: 'بعد 24 ساعة',
      custom: customTime ? new Date(customTime).toLocaleString('ar-LY') : 'مخصص',
    };
    return times[startTime] || startTime;
  };

  const handlePublish = async () => {
    if (!auctionData) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auctions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(auctionData),
      });

      const result = await response.json();

      if (result.success) {
        // مسح البيانات المحفوظة
        localStorage.removeItem('adminAuctionData');
        // التوجيه لصفحة النجاح أو قائمة المزادات
        router.push('/admin/auctions?created=true');
      } else {
        setError(result.message || 'حدث خطأ في نشر المزاد');
      }
    } catch (err) {
      console.error('خطأ في نشر المزاد:', err);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/auctions/create/upload-images');
  };

  if (!auctionData) {
    return (
      <AdminLayout title="معاينة المزاد">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="معاينة المزاد">
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
          <h1 className="text-3xl font-bold text-white">معاينة المزاد</h1>
          <p className="mt-2 text-slate-400">راجع تفاصيل المزاد قبل النشر</p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* معاينة الصور */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">صور السيارة</h2>
          {!auctionData.images || auctionData.images.length === 0 ? (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
              <p className="text-yellow-400">لا توجد صور مرفوعة</p>
              <button
                onClick={handleBack}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
              >
                العودة لرفع الصور
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-400">{auctionData.images.length} صورة مرفوعة</p>
              <div className="grid grid-cols-4 gap-3">
                {auctionData.images.map((url, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                      index === 0
                        ? 'border-blue-500'
                        : imageErrors.has(index)
                          ? 'border-red-500'
                          : 'border-slate-600'
                    }`}
                  >
                    {imageErrors.has(index) ? (
                      <div className="flex h-full w-full items-center justify-center bg-slate-700">
                        <span className="text-xs text-red-400">خطأ في التحميل</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getFullImageUrl(url)}
                        alt={`صورة ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={() => {
                          console.error(`فشل تحميل الصورة ${index + 1}:`, url);
                          setImageErrors((prev) => new Set(prev).add(index));
                        }}
                        onLoad={() => {
                          // إزالة الخطأ إذا تم التحميل بنجاح
                          setImageErrors((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(index);
                            return newSet;
                          });
                        }}
                      />
                    )}
                    {index === 0 && !imageErrors.has(index) && (
                      <div className="absolute left-1 top-1 rounded bg-blue-600 px-2 py-0.5 text-xs text-white">
                        رئيسية
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* تفاصيل السيارة */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">{auctionData.title}</h2>

          {auctionData.description && (
            <p className="mb-4 text-slate-400">{auctionData.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem icon={TruckIcon} label="الماركة" value={auctionData.brand} />
            <InfoItem icon={TruckIcon} label="الموديل" value={auctionData.model} />
            <InfoItem icon={CalendarIcon} label="سنة الصنع" value={auctionData.year} />
            <InfoItem icon={TagIcon} label="الحالة" value={auctionData.condition} />
            <InfoItem icon={TagIcon} label="نوع الوقود" value={auctionData.fuelType} />
            <InfoItem icon={TagIcon} label="ناقل الحركة" value={auctionData.transmission} />
            <InfoItem icon={TagIcon} label="اللون الخارجي" value={auctionData.exteriorColor} />
            <InfoItem icon={TagIcon} label="اللون الداخلي" value={auctionData.interiorColor} />
            {auctionData.mileage && (
              <InfoItem
                icon={TagIcon}
                label="المسافة المقطوعة"
                value={`${auctionData.mileage} كم`}
              />
            )}
            {auctionData.bodyType && (
              <InfoItem icon={TagIcon} label="نوع الهيكل" value={auctionData.bodyType} />
            )}
            {auctionData.regionalSpec && (
              <InfoItem icon={TagIcon} label="المواصفات" value={auctionData.regionalSpec} />
            )}
            {auctionData.engineSize && (
              <InfoItem icon={TagIcon} label="سعة المحرك" value={`${auctionData.engineSize} لتر`} />
            )}
          </div>
        </div>

        {/* إعدادات المزاد */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <ClockIcon className="h-5 w-5 text-blue-400" />
            إعدادات المزاد
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem
              icon={CurrencyDollarIcon}
              label="سعر البداية"
              value={`${parseFloat(auctionData.price).toLocaleString('ar-LY')} د.ل`}
              highlight
            />
            <InfoItem
              icon={ClockIcon}
              label="وقت البداية"
              value={getStartTimeText(
                auctionData.auctionStartTime,
                auctionData.auctionCustomStartTime,
              )}
            />
            <InfoItem
              icon={CalendarIcon}
              label="مدة المزاد"
              value={getDurationText(auctionData.auctionDuration)}
            />
          </div>
        </div>

        {/* الموقع والتواصل */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <MapPinIcon className="h-5 w-5 text-blue-400" />
            الموقع والتواصل
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem icon={MapPinIcon} label="المدينة" value={auctionData.city} />
            <InfoItem icon={MapPinIcon} label="المنطقة" value={auctionData.area} />
            <InfoItem icon={PhoneIcon} label="رقم الهاتف" value={auctionData.contactPhone} />
            {/* الساحة محذوفة - هذا مزاد أونلاين يظهر في /auctions فقط */}
          </div>
        </div>

        {/* الكماليات */}
        {auctionData.features && auctionData.features.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <SparklesIcon className="h-5 w-5 text-blue-400" />
              الكماليات والمميزات
            </h2>
            <div className="flex flex-wrap gap-2">
              {auctionData.features.map((feature, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* تقرير الفحص */}
        {auctionData.inspectionReport?.hasReport && auctionData.inspectionReport.manualReport && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <DocumentTextIcon className="h-5 w-5 text-blue-400" />
              تقرير الفحص
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {auctionData.inspectionReport.manualReport.engineCondition && (
                <div className="rounded-lg bg-slate-700 p-3">
                  <div className="text-sm text-slate-400">حالة المحرك</div>
                  <div className="font-medium text-white">
                    {auctionData.inspectionReport.manualReport.engineCondition}
                  </div>
                </div>
              )}
              {auctionData.inspectionReport.manualReport.bodyCondition && (
                <div className="rounded-lg bg-slate-700 p-3">
                  <div className="text-sm text-slate-400">حالة الهيكل</div>
                  <div className="font-medium text-white">
                    {auctionData.inspectionReport.manualReport.bodyCondition}
                  </div>
                </div>
              )}
              {auctionData.inspectionReport.manualReport.interiorCondition && (
                <div className="rounded-lg bg-slate-700 p-3">
                  <div className="text-sm text-slate-400">حالة الداخلية</div>
                  <div className="font-medium text-white">
                    {auctionData.inspectionReport.manualReport.interiorCondition}
                  </div>
                </div>
              )}
              {auctionData.inspectionReport.manualReport.tiresCondition && (
                <div className="rounded-lg bg-slate-700 p-3">
                  <div className="text-sm text-slate-400">حالة الإطارات</div>
                  <div className="font-medium text-white">
                    {auctionData.inspectionReport.manualReport.tiresCondition}
                  </div>
                </div>
              )}
            </div>
            {auctionData.inspectionReport.manualReport.notes && (
              <div className="mt-4 rounded-lg bg-slate-700 p-3">
                <div className="text-sm text-slate-400">ملاحظات</div>
                <div className="text-white">{auctionData.inspectionReport.manualReport.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* شريط الأزرار الثابت */}
      <StickyActionBar
        leftButton={{
          label: 'تعديل',
          onClick: handleBack,
          icon: 'prev',
          variant: 'secondary',
        }}
        rightButton={{
          label: 'نشر المزاد',
          onClick: handlePublish,
          icon: <CheckCircleIcon className="h-5 w-5" />,
          variant: 'success',
          disabled: isSubmitting,
          loading: isSubmitting,
          loadingText: 'جاري النشر...',
        }}
      />
    </AdminLayout>
  );
}

// مكون عرض المعلومات
function InfoItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className={`mt-1 h-5 w-5 ${highlight ? 'text-green-400' : 'text-slate-500'}`} />
      <div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className={`font-medium ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</div>
      </div>
    </div>
  );
}
