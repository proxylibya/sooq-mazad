import React from 'react';
import { useRouter } from 'next/router';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';

interface TransportServiceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransportServiceInfoModal: React.FC<TransportServiceInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  const handleRegisterClick = () => {
    onClose();
    // حفظ نوع الحساب المطلوب
    localStorage.setItem('pendingAccountType', 'TRANSPORT_OWNER');
    // توجيه لصفحة تسجيل الدخول مع رسالة
    router.push('/?action=register-transport');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
      dir="rtl"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
        style={{
          boxShadow:
            'rgba(0, 0, 0, 0.2) 0px 11px 15px -7px, rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 46px 8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-blue-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">خدمة نقل السيارات</h2>
              <p className="text-sm text-gray-600">متطلبات التسجيل كمقدم خدمة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 transition-all duration-200 hover:border-red-300 hover:bg-red-100"
            title="إغلاق"
          >
            <XMarkIcon className="h-5 w-5 text-red-600 group-hover:text-red-700" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
          {/* تنبيه مهم */}
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
              <div>
                <h3 className="mb-2 font-semibold text-amber-800">متطلبات مهمة للتسجيل</h3>
                <p className="text-sm leading-relaxed text-amber-700">
                  للتسجيل كمقدم خدمة نقل، يجب أن تكون مالكاً لسيارة ساحبة مخصصة لنقل السيارات ولديك
                  الخبرة اللازمة في هذا المجال
                </p>
              </div>
            </div>
          </div>

          {/* الشروط والمتطلبات */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                الشروط المطلوبة
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800">ملكية ساحبة نقل السيارات</h4>
                    <p className="mt-1 text-sm text-green-700">
                      يجب أن تكون مالكاً لسيارة ساحبة مخصصة لنقل السيارات بحالة جيدة وصالحة للعمل
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800">رخصة قيادة سارية</h4>
                    <p className="mt-1 text-sm text-green-700">
                      رخصة قيادة سارية المفعول ومناسبة لقيادة المركبات الثقيلة
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800">خبرة في مجال النقل</h4>
                    <p className="mt-1 text-sm text-green-700">
                      خبرة عملية في نقل السيارات والتعامل مع العملاء بشكل احترافي
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800">تأمين على المركبة</h4>
                    <p className="mt-1 text-sm text-green-700">
                      تأمين ساري المفعول على الساحبة يغطي نقل السيارات
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* المزايا */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">المزايا التي ستحصل عليها</h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <h4 className="mb-1 font-medium text-blue-800">عملاء جدد</h4>
                  <p className="text-sm text-blue-700">الوصول لقاعدة عملاء واسعة</p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <h4 className="mb-1 font-medium text-blue-800">إدارة سهلة</h4>
                  <p className="text-sm text-blue-700">لوحة تحكم لإدارة الطلبات</p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <h4 className="mb-1 font-medium text-blue-800">دفع آمن</h4>
                  <p className="text-sm text-blue-700">نظام دفع محمي ومضمون</p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <h4 className="mb-1 font-medium text-blue-800">دعم فني</h4>
                  <p className="text-sm text-blue-700">دعم فني متواصل 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              إلغاء
            </button>
            <button
              onClick={handleRegisterClick}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
            >
              <span>التالي - التسجيل كمقدم خدمة</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportServiceInfoModal;
