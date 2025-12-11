import React from 'react';
import { TrophyIcon, CheckCircleIcon, PhoneIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';

interface WinnerCongratulationsCardProps {
  carTitle: string;
  finalPrice: string | number;
  sellerName: string;
  sellerPhone?: string;
  formatNumber: (num: string | number) => string;
  onContactSeller?: () => void;
  onMessageSeller?: () => void;
}

/**
 * مكون خاص يظهر فقط للمزايد الفائز بالمزاد
 * يعرض رسالة تهنئة ومعلومات التواصل مع البائع
 */
const WinnerCongratulationsCard: React.FC<WinnerCongratulationsCardProps> = ({
  carTitle,
  finalPrice,
  sellerName,
  sellerPhone,
  formatNumber,
  onContactSeller,
  onMessageSeller,
}) => {
  return (
    <div className="rounded-xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-4 sm:p-6 shadow-xl">
      {/* رأس التهنئة */}
      <div className="mb-4 sm:mb-6 text-center">
        <div className="mx-auto mb-3 sm:mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg animate-pulse">
          <TrophyIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
        </div>
        <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-amber-900">
          مبروك! أنت المشتري!
        </h2>
        <p className="text-base sm:text-lg font-semibold text-amber-800">
          لقد تم قبول عرضك بنجاح!
        </p>
      </div>

      {/* تفاصيل الفوز */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        {/* معلومات السيارة */}
        <div className="rounded-lg border border-amber-200 bg-white p-3 sm:p-4 shadow-sm">
          <h3 className="mb-3 flex items-center text-base sm:text-lg font-semibold text-gray-800">
            <CheckCircleIcon className="ml-2 h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            تفاصيل الشراء
          </h3>
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b border-gray-100 pb-3">
              <span className="text-xs sm:text-sm text-gray-600">السيارة:</span>
              <span className="font-semibold text-gray-800 text-sm sm:text-base break-words">{carTitle}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b border-gray-100 pb-3">
              <span className="text-xs sm:text-sm text-gray-600">سعر الشراء:</span>
              <span className="text-lg sm:text-xl font-bold text-green-600">
                {formatNumber(finalPrice)} د.ل
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600">البائع:</span>
              <span className="font-semibold text-gray-800 text-sm sm:text-base break-words">{sellerName}</span>
            </div>

            {sellerPhone && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-t border-gray-100 pt-3">
                <span className="text-xs sm:text-sm text-gray-600">رقم البائع:</span>
                <span className="font-semibold text-blue-600 text-sm sm:text-base" dir="ltr">{sellerPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* الخطوات التالية */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
          <h4 className="mb-3 flex items-center text-sm sm:text-base font-semibold text-blue-900">
            <ClockIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            الخطوات التالية
          </h4>
          <ol className="space-y-2 text-xs sm:text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 min-w-[1.25rem] sm:min-w-[1.5rem] items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white leading-none">1</span>
              <span className="flex-1 pt-0.5">تواصل مع البائع لترتيب موعد المعاينة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 min-w-[1.25rem] sm:min-w-[1.5rem] items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white leading-none">2</span>
              <span className="flex-1 pt-0.5">افحص السيارة جيداً والتأكد من مطابقتها للمواصفات</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 min-w-[1.25rem] sm:min-w-[1.5rem] items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white leading-none">3</span>
              <span className="flex-1 pt-0.5">اتفق مع البائع على طريقة الدفع والتسليم</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 min-w-[1.25rem] sm:min-w-[1.5rem] items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white leading-none">4</span>
              <span className="flex-1 pt-0.5">استلم السيارة والمستندات الرسمية بعد إتمام الاتفاق</span>
            </li>
          </ol>
        </div>
      </div>

      {/* أزرار التواصل */}
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
        {onContactSeller && sellerPhone && (
          <button
            onClick={onContactSeller}
            className="flex flex-1 items-center justify-center rounded-lg bg-green-600 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white transition-colors hover:bg-green-700 active:bg-green-800 shadow-md"
          >
            <PhoneIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            اتصل بالبائع
          </button>
        )}

        {onMessageSeller && (
          <button
            onClick={onMessageSeller}
            className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 shadow-md"
          >
            <ChatBubbleLeftRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            راسل البائع
          </button>
        )}
      </div>

      {/* تحذير مهم */}
      <div className="mt-3 sm:mt-4 rounded-lg border border-red-200 bg-red-50 p-2.5 sm:p-3">
        <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
          <strong>تحذير مهم:</strong> تأكد من معاينة السيارة جيداً قبل الاتفاق النهائي. 
          يُنصح بالالتقاء في مكان عام آمن والتأكد من جميع المستندات الرسمية.
        </p>
      </div>

      {/* رسالة إضافية */}
      <div className="mt-3 sm:mt-4 rounded-lg border border-green-200 bg-green-50 p-2.5 sm:p-3 text-center">
        <p className="text-xs sm:text-sm text-green-800">
          <strong>تم إرسال إشعار ورسالة إلى حسابك</strong>
          <br />
          <span className="text-[10px] sm:text-xs">يمكنك مراجعة الإشعارات والرسائل في حسابك للحصول على جميع التفاصيل</span>
        </p>
      </div>
    </div>
  );
};

export default WinnerCongratulationsCard;
