/**
 * مكون بطاقة طلب النقل للرسائل
 * Transport Booking Card Component for Messages
 */

import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import Link from 'next/link';
import { useState } from 'react';

interface TransportBookingCardProps {
  bookingId: string;
  customerName: string;
  fromCity: string;
  toCity: string;
  preferredDate: string;
  serviceTitle?: string;
  status?: string;
  isProvider?: boolean;
  onAccept?: (bookingId: string) => Promise<void>;
  onReject?: (bookingId: string) => Promise<void>;
  onViewDetails?: (bookingId: string) => void;
}

// حالات الطلب
const BOOKING_STATUS: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'في انتظار القبول', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  ACCEPTED: { label: 'تم القبول', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_PROGRESS: { label: 'جاري التنفيذ', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  COMPLETED: { label: 'مكتمل', color: 'text-green-700', bgColor: 'bg-green-100' },
  CANCELLED: { label: 'ملغي', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  REJECTED: { label: 'مرفوض', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export default function TransportBookingCard({
  bookingId,
  customerName,
  fromCity,
  toCity,
  preferredDate,
  serviceTitle,
  status = 'PENDING',
  isProvider = false,
  onAccept,
  onReject,
  onViewDetails,
}: TransportBookingCardProps) {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);

  const statusConfig = BOOKING_STATUS[status] || BOOKING_STATUS.PENDING;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-LY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleAccept = async () => {
    if (!onAccept) return;
    setLoading(true);
    setActionType('accept');
    try {
      await onAccept(bookingId);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setLoading(true);
    setActionType('reject');
    try {
      await onReject(bookingId);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">طلب نقل</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {serviceTitle && <h4 className="mb-3 font-semibold text-gray-900">{serviceTitle}</h4>}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span>
              العميل: <span className="font-medium text-gray-900">{customerName}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
            <span>
              من <span className="font-medium text-gray-900">{fromCity}</span> إلى{' '}
              <span className="font-medium text-gray-900">{toCity}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span>
              التاريخ:{' '}
              <span className="font-medium text-gray-900">{formatDate(preferredDate)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="font-mono text-xs">#{bookingId.slice(-8)}</span>
          </div>
        </div>

        {/* Actions */}
        {isProvider && status === 'PENDING' && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {loading && actionType === 'accept' ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
              قبول
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
            >
              {loading && actionType === 'reject' ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              ) : (
                <XCircleIcon className="h-4 w-4" />
              )}
              رفض
            </button>
          </div>
        )}

        {/* View Details Link */}
        <div className="mt-3 border-t pt-3">
          {onViewDetails ? (
            <button
              onClick={() => onViewDetails(bookingId)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              عرض التفاصيل الكاملة
            </button>
          ) : (
            <Link
              href={`/transport/my-bookings`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              عرض التفاصيل الكاملة
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * دالة مساعدة لتحويل metadata الرسالة إلى props البطاقة
 */
export function parseBookingCardMetadata(
  metadata: string | object,
): TransportBookingCardProps | null {
  try {
    const data = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

    if (data.type !== 'transport_booking_card') {
      return null;
    }

    return {
      bookingId: data.bookingId,
      customerName: data.customerName,
      fromCity: data.fromCity,
      toCity: data.toCity,
      preferredDate: data.preferredDate,
      serviceTitle: data.serviceTitle,
      status: data.status,
    };
  } catch {
    return null;
  }
}
