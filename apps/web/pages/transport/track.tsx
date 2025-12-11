import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { OpensooqNavbar } from '../../components/common';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';

interface TrackingStatus {
  id: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  timestamp: string;
  location: string;
  description: string;
  driver?: string;
  phone?: string;
}

interface ShipmentDetails {
  trackingNumber: string;
  customerName: string;
  carDetails: string;
  fromCity: string;
  toCity: string;
  pickupDate: string;
  estimatedDelivery: string;
  currentStatus: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  progress: number;
  statusHistory: TrackingStatus[];
}

const TrackingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // تم حذف البيانات الوهمية للتتبع
  const mockShipments: { [key: string]: ShipmentDetails } = {};

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError('يرجى إدخال رقم التتبع');
      return;
    }

    setIsLoading(true);
    setError('');

    // محاكاة استدعاء API
    setTimeout(() => {
      const shipment = mockShipments[trackingNumber.toUpperCase()];

      if (shipment) {
        setShipmentDetails(shipment);
        setError('');
      } else {
        setShipmentDetails(null);
        setError('رقم التتبع غير صحيح أو غير موجود');
      }

      setIsLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'picked-up':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'in-transit':
        return <MapPinIcon className="h-5 w-5 text-orange-600" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'picked-up':
        return 'تم الاستلام';
      case 'in-transit':
        return 'في الطريق';
      case 'delivered':
        return 'تم التسليم';
      case 'cancelled':
        return 'ملغي';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'picked-up':
        return 'text-blue-600 bg-blue-50';
      case 'in-transit':
        return 'text-orange-600 bg-orange-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      <Head>
        <title>تتبع الشحنة | موقع مزاد السيارات</title>
        <meta
          name="description"
          content="تتبع شحنة سيارتك في الوقت الفعلي مع معلومات مفصلة عن حالة النقل"
        />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-6">
            <div className="text-center">
              <TruckIcon className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h1 className="mb-2 text-3xl font-bold text-gray-900">تتبع الشحنة</h1>
              <p className="text-gray-600">أدخل رقم التتبع لمعرفة حالة شحنة سيارتك</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* نموذج البحث */}
          <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="أدخل رقم التتبع (مثال: TR123456789)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                />
              </div>
              <button
                onClick={handleTrack}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                {isLoading ? 'جاري البحث...' : 'تتبع'}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* نتائج التتبع */}
          {shipmentDetails && (
            <div className="space-y-6">
              {/* معلومات الشحنة */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-900">معلومات الشحنة</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">رقم التتبع:</span>
                      <div className="font-mono text-lg font-bold text-blue-600">
                        {shipmentDetails.trackingNumber}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">اسم العميل:</span>
                      <div className="font-medium text-gray-900">
                        {shipmentDetails.customerName}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">تفاصيل السيارة:</span>
                      <div className="font-medium text-gray-900">{shipmentDetails.carDetails}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">المسار:</span>
                      <div className="font-medium text-gray-900">
                        {shipmentDetails.fromCity} ← {shipmentDetails.toCity}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">تاريخ الاستلام:</span>
                      <div className="font-medium text-gray-900">{shipmentDetails.pickupDate}</div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">التسليم المتوقع:</span>
                      <div className="font-medium text-gray-900">
                        {shipmentDetails.estimatedDelivery}
                      </div>
                    </div>
                  </div>
                </div>

                {/* شريط التقدم */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">تقدم الشحنة</span>
                    <span className="text-sm font-medium text-blue-600">
                      {shipmentDetails.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${shipmentDetails.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* الحالة الحالية */}
                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <TruckIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">
                        الحالة الحالية: {shipmentDetails.currentStatus}
                      </div>
                      <div className="text-sm text-blue-700">
                        السائق: {shipmentDetails.driverName} | رقم المركبة:{' '}
                        {shipmentDetails.vehicleNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* تاريخ التتبع */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-900">تاريخ التتبع</h2>

                <div className="space-y-4">
                  {shipmentDetails.statusHistory.map((status, index) => (
                    <div key={status.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(status.status)}`}
                        >
                          {getStatusIcon(status.status)}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {getStatusText(status.status)}
                          </span>
                          <span className="text-sm text-gray-500">{status.timestamp}</span>
                        </div>
                        <div className="mb-1 text-sm text-gray-600">{status.description}</div>
                        <div className="text-sm text-gray-500">{status.location}</div>

                        {status.driver && (
                          <div className="mt-2 flex items-center gap-4">
                            <span className="text-sm text-gray-600">السائق: {status.driver}</span>
                            {status.phone && (
                              <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                                  <PhoneIcon className="h-4 w-4" />
                                  <span dir="ltr">{status.phone}</span>
                                </button>
                                <button className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
                                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                  واتساب
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {index < shipmentDetails.statusHistory.length - 1 && (
                        <div className="absolute right-5 mt-10 h-8 w-px bg-gray-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* معلومات الاتصال */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-900">معلومات الاتصال</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">اتصل بالسائق</div>
                      <div className="text-sm text-gray-600">{shipmentDetails.driverPhone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">واتساب</div>
                      <div className="text-sm text-gray-600">تواصل عبر الواتساب</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* أرقام تتبع تجريبية */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="mb-2 font-medium">أرقام تتبع تجريبية للاختبار:</p>
                <div className="space-y-1">
                  <p>
                    <code className="rounded bg-white px-2 py-1">TR123456789</code> - شحنة في الطريق
                  </p>
                  <p>
                    <code className="rounded bg-white px-2 py-1">TR987654321</code> - شحنة مكتملة
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrackingPage;
