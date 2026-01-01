import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { OpensooqNavbar } from '../../components/common';

interface BookingConfirmation {
  bookingId: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  fromCity: string;
  toCity: string;
  serviceType: string;
  totalPrice: number;
  estimatedDelivery: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  status: string;
}

const ConfirmationPage = () => {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل بيانات الحجز
    const { booking: bookingStatus } = router.query;

    if (bookingStatus === 'success') {
      setTimeout(() => {
        setBooking({
          bookingId: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          trackingNumber: 'TR' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          customerName: 'أحمد محمد',
          customerPhone: '+218-91-123-4567',
          fromCity: 'طرابلس',
          toCity: 'بنغازي',
          serviceType: 'ساحبة نقل متوسطة (حتى 8 سيارات)',
          totalPrice: 2625,
          estimatedDelivery: '2024-01-17',
          driverName: 'محمد علي',
          driverPhone: '+218-92-234-5678',
          vehicleNumber: 'ط ن 12345',
          status: 'مؤكد',
        });
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, [router.query]);

  const handleTrackShipment = () => {
    if (booking?.trackingNumber) {
      router.push(`/transport/track?tracking=${booking.trackingNumber}`);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share && booking) {
      navigator.share({
        title: 'تأكيد حجز النقل',
        text: `تم تأكيد حجز نقل السيارة - رقم الحجز: ${booking.bookingId}`,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <TruckIcon className="mx-auto mb-4 h-16 w-16 animate-pulse text-blue-600" />
          <p className="text-gray-600">جاري تحميل تفاصيل الحجز...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <TruckIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">لم يتم العثور على الحجز</h3>
          <p className="mb-6 text-gray-500">الحجز المطلوب غير موجود أو تم حذفه</p>
          <button
            onClick={() => router.push('/transport')}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeftIcon className="ml-2 h-5 w-5" />
            العودة لصفحة النقل
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>تأكيد الحجز - {booking.bookingId} | موقع مزاد السيارات</title>
        <meta
          name="description"
          content={`تأكيد حجز نقل السيارة من ${booking.fromCity} إلى ${booking.toCity}`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* رسالة النجاح */}
          <div className="mb-8 rounded-xl border bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">تم تأكيد الحجز بنجاح!</h1>
              <p className="mb-6 text-lg text-gray-600">
                شكراً لك، تم تأكيد طلب نقل سيارتك وسيتم التواصل معك قريباً
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleTrackShipment}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <TruckIcon className="h-5 w-5" />
                  تتبع الشحنة
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 rounded-lg border px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  >
                    <PrinterIcon className="h-5 w-5" />
                    طباعة
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 rounded-lg border px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  >
                    <ShareIcon className="h-5 w-5" />
                    مشاركة
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل الحجز */}
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">تفاصيل الحجز</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">رقم الحجز</span>
                  <div className="font-mono text-lg font-bold text-blue-600">
                    {booking.bookingId}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">رقم التتبع</span>
                  <div className="font-mono text-lg font-bold text-green-600">
                    {booking.trackingNumber}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">اسم العميل</span>
                  <div className="font-medium text-gray-900">{booking.customerName}</div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">رقم الهاتف</span>
                  <div className="font-medium text-gray-900">{booking.customerPhone}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">المسار</span>
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    {booking.fromCity} ← {booking.toCity}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">نوع الخدمة</span>
                  <div className="font-medium text-gray-900">{booking.serviceType}</div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">التسليم المتوقع</span>
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    {booking.estimatedDelivery}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">الحالة</span>
                  <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    {booking.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">إجمالي التكلفة:</span>
                <span className="text-2xl font-bold text-green-600">{booking.totalPrice} د.ل</span>
              </div>
            </div>
          </div>

          {/* معلومات السائق */}
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">معلومات السائق والمركبة</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">اسم السائق</span>
                  <div className="font-medium text-gray-900">{booking.driverName}</div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">رقم هاتف السائق</span>
                  <div className="font-medium text-gray-900">{booking.driverPhone}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">رقم المركبة</span>
                  <div className="font-medium text-gray-900">{booking.vehicleNumber}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => handleCall(booking.driverPhone)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <PhoneIcon className="h-5 w-5" />
                اتصل بالسائق
              </button>
            </div>
          </div>

          {/* الخطوات التالية */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-4 text-lg font-bold text-blue-900">الخطوات التالية</h2>

            <div className="space-y-3 text-blue-800">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  1
                </div>
                <div>
                  <div className="font-medium">سيتم التواصل معك</div>
                  <div className="text-sm text-blue-700">
                    سيتصل بك السائق خلال 24 ساعة لتأكيد موعد الاستلام
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  2
                </div>
                <div>
                  <div className="font-medium">استلام السيارة</div>
                  <div className="text-sm text-blue-700">
                    سيتم استلام السيارة من العنوان المحدد في الموعد المتفق عليه
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  3
                </div>
                <div>
                  <div className="font-medium">تتبع الشحنة</div>
                  <div className="text-sm text-blue-700">
                    يمكنك تتبع موقع سيارتك في الوقت الفعلي باستخدام رقم التتبع
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  4
                </div>
                <div>
                  <div className="font-medium">التسليم</div>
                  <div className="text-sm text-blue-700">
                    سيتم تسليم السيارة في العنوان المحدد والتاريخ المتوقع
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => router.push('/transport')}
              className="rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              العودة لصفحة النقل
            </button>

            <button
              onClick={() => router.push('/my-account')}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              عرض جميع الحجوزات
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationPage;
