/**
 * مكون بطاقة طلب النقل المحسنة
 * يعرض تفاصيل طلب النقل مع أزرار الإجراءات
 */

import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  HashtagIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface TransportBookingCardProps {
  /** معرف الطلب */
  bookingId: string;
  /** عنوان الخدمة */
  serviceTitle: string;
  /** اسم العميل */
  customerName: string;
  /** رقم هاتف العميل */
  customerPhone?: string;
  /** مدينة الانطلاق */
  fromCity: string;
  /** مدينة الوصول */
  toCity: string;
  /** تاريخ الطلب */
  preferredDate: string;
  /** هل الرسالة مرسلة من المستخدم الحالي */
  isMine?: boolean;
  /** حالة الطلب */
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  /** دالة عند قبول الطلب */
  onAccept?: () => void;
  /** دالة عند رفض الطلب */
  onReject?: () => void;
  /** دالة عند عرض التفاصيل */
  onViewDetails?: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'في الانتظار', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  ACCEPTED: { label: 'تم القبول', color: 'text-green-700', bgColor: 'bg-green-100' },
  REJECTED: { label: 'مرفوض', color: 'text-red-700', bgColor: 'bg-red-100' },
  COMPLETED: { label: 'مكتمل', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  CANCELLED: { label: 'ملغي', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export default function TransportBookingCard({
  bookingId,
  serviceTitle,
  customerName,
  customerPhone,
  fromCity,
  toCity,
  preferredDate,
  isMine = false,
  status = 'PENDING',
  onAccept,
  onReject,
  onViewDetails,
}: TransportBookingCardProps) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // تنسيق التاريخ
  const formattedDate = preferredDate
    ? new Date(preferredDate).toLocaleDateString('ar-LY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'غير محدد';

  // رقم الطلب المختصر
  const shortBookingId = bookingId.slice(-8).toUpperCase();

  // نسخ رقم الهاتف
  const handleCopyPhone = async () => {
    if (!customerPhone) return;

    try {
      await navigator.clipboard.writeText(customerPhone);
      setCopied(true);

      // إرسال حدث مخصص
      window.dispatchEvent(new CustomEvent('phone-copied', { detail: { phone: customerPhone } }));

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('فشل نسخ الرقم:', error);
    }
  };

  // الاتصال المباشر
  const handleCall = () => {
    if (!customerPhone) return;
    window.location.href = `tel:${customerPhone}`;
  };

  // بدء محادثة (يمكن تنفيذها لاحقاً)
  const handleStartChat = () => {
    // يمكن إضافة منطق لفتح محادثة جديدة مع العميل
    console.log('بدء محادثة مع:', customerName);
  };

  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.PENDING;

  return (
    <div
      className={`overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md ${
        isMine
          ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* رأس البطاقة */}
      <div className={`px-4 py-3 ${isMine ? 'bg-blue-600' : 'bg-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">طلب نقل جديد</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="space-y-3 p-4">
        {/* عنوان الخدمة */}
        <div className="flex items-start gap-2">
          <TruckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">الخدمة</p>
            <p className="truncate font-medium text-gray-900" title={serviceTitle}>
              {serviceTitle}
            </p>
          </div>
        </div>

        {/* اسم العميل */}
        <div className="flex items-start gap-2">
          <UserIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">العميل</p>
            <p className="font-medium text-gray-900">{customerName}</p>
          </div>
        </div>

        {/* مسار النقل */}
        <div className="flex items-start gap-2">
          <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">مسار النقل</p>
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <span className="rounded bg-green-100 px-2 py-0.5 text-sm text-green-700">
                {fromCity}
              </span>
              <span className="text-gray-400">←</span>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-sm text-blue-700">
                {toCity}
              </span>
            </div>
          </div>
        </div>

        {/* التاريخ ورقم الطلب - في صف واحد */}
        <div className="grid grid-cols-2 gap-3">
          {/* التاريخ */}
          <div className="flex items-start gap-2">
            <CalendarDaysIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">التاريخ المفضل</p>
              <p className="truncate font-medium text-gray-900" title={formattedDate}>
                {formattedDate}
              </p>
            </div>
          </div>

          {/* رقم الطلب */}
          <div className="flex items-start gap-2">
            <HashtagIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">رقم الطلب</p>
              <p className="font-mono font-medium text-gray-900" dir="ltr">
                #{shortBookingId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      {!isMine && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-3">
          <div className="flex flex-col gap-2">
            {/* صف الأزرار الرئيسية */}
            {customerPhone && (
              <div className="flex gap-2">
                {/* زر الاتصال */}
                <button
                  onClick={handleCall}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>اتصل الآن</span>
                </button>

                {/* زر نسخ الرقم */}
                <button
                  onClick={handleCopyPhone}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={customerPhone}
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  <span>{copied ? 'تم النسخ' : 'نسخ الرقم'}</span>
                </button>
              </div>
            )}

            {/* زر المراسلة */}
            <button
              onClick={handleStartChat}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>مراسلة العميل</span>
            </button>

            {/* أزرار القبول والرفض */}
            {status === 'PENDING' && (onAccept || onReject) && (
              <div className="flex gap-2 border-t border-gray-200 pt-2">
                {onAccept && (
                  <button
                    onClick={onAccept}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>قبول الطلب</span>
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={onReject}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    <span>رفض الطلب</span>
                  </button>
                )}
              </div>
            )}

            {/* زر عرض التفاصيل */}
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4" />
                <span>عرض التفاصيل الكاملة</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* للرسائل المرسلة (من المستخدم الحالي) */}
      {isMine && (
        <div className="border-t border-blue-100 bg-blue-50/50 px-4 py-2">
          <p className="text-center text-xs text-blue-600">تم إرسال طلب النقل بنجاح</p>
        </div>
      )}
    </div>
  );
}

/**
 * دالة مساعدة لتحليل metadata الرسالة
 */
export function parseTransportBookingMetadata(
  content: string,
  metadata?: string | object,
): {
  isTransportBooking: boolean;
  bookingData: {
    bookingId: string;
    serviceTitle: string;
    customerName: string;
    customerPhone?: string;
    fromCity: string;
    toCity: string;
    preferredDate: string;
  } | null;
} {
  try {
    // محاولة تحليل metadata
    let meta: any = null;

    if (typeof metadata === 'string') {
      meta = JSON.parse(metadata);
    } else if (typeof metadata === 'object') {
      meta = metadata;
    }

    // التحقق من نوع الرسالة
    if (meta?.type === 'transport_booking_card') {
      return {
        isTransportBooking: true,
        bookingData: {
          bookingId: meta.bookingId || '',
          serviceTitle: meta.serviceTitle || 'خدمة نقل',
          customerName: meta.customerName || 'عميل',
          customerPhone: meta.customerPhone,
          fromCity: meta.fromCity || '',
          toCity: meta.toCity || '',
          preferredDate: meta.preferredDate || '',
        },
      };
    }

    // محاولة استخراج البيانات من المحتوى النصي
    if (content.includes('طلب نقل جديد') || content.includes('طلب نقل')) {
      const bookingIdMatch = content.match(/#([a-zA-Z0-9]+)/);
      const fromMatch = content.match(/من:\s*([^\n]+)/);
      const toMatch = content.match(/إلى:\s*([^\n]+)/);
      const customerMatch = content.match(/العميل:\s*([^\n]+)/);
      const dateMatch = content.match(/التاريخ:\s*([^\n]+)/);
      const serviceMatch = content.match(/خدمة نقل\s*([^\n-]+)/);

      if (fromMatch || toMatch) {
        return {
          isTransportBooking: true,
          bookingData: {
            bookingId: bookingIdMatch?.[1] || Date.now().toString(),
            serviceTitle: serviceMatch?.[1]?.trim() || 'خدمة نقل',
            customerName: customerMatch?.[1]?.trim() || 'عميل',
            fromCity: fromMatch?.[1]?.trim() || '',
            toCity: toMatch?.[1]?.trim() || '',
            preferredDate: dateMatch?.[1]?.trim() || '',
          },
        };
      }
    }

    return { isTransportBooking: false, bookingData: null };
  } catch {
    return { isTransportBooking: false, bookingData: null };
  }
}
