import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { useRouter } from 'next/router';
import React from 'react';

interface FavoriteCardProps {
  item: any;
  viewMode: 'list' | 'grid';
  onRemove: (item: any) => void;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ item, viewMode, onRemove }) => {
  const router = useRouter();

  // دوال مساعدة
  const formatNumber = (num: string | number) => {
    if (!num) return '0';
    return parseInt(num.toString().replace(/,/g, '')).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCondition = (condition: string) => {
    const conditionMap: { [key: string]: string } = {
      NEW: 'جديد',
      USED: 'مستعمل',
      EXCELLENT: 'ممتاز',
      GOOD: 'جيد',
      FAIR: 'مقبول',
    };
    return conditionMap[condition] || 'مستعمل';
  };

  const formatAuctionStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      UPCOMING: 'قادم',
      LIVE: 'مباشر',
      ENDED: 'انتهى',
      CANCELLED: 'ملغي',
    };
    return statusMap[status] || 'غير محدد';
  };

  const getFirstImage = (item: any) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0].url || item.images[0];
    }
    if (item.car?.carImages && Array.isArray(item.car.carImages) && item.car.carImages.length > 0) {
      return item.car.carImages[0].fileUrl || item.car.carImages[0];
    }
    return '/images/placeholder-car.svg';
  };

  const getImagesCount = (item: any) => {
    if (item.images && Array.isArray(item.images)) {
      return item.images.length;
    }
    if (item.car?.carImages && Array.isArray(item.car.carImages)) {
      return item.car.carImages.length;
    }
    return 0;
  };

  // دوال الإجراءات
  const viewDetails = () => {
    if (item.type === 'auction') {
      router.push(`/auctions/${item.itemId}`);
    } else {
      router.push(`/marketplace/${item.itemId}`);
    }
  };

  const handleCall = () => {
    if (item.seller?.phone) {
      window.open(`tel:${item.seller.phone}`);
    } else {
      alert('رقم الهاتف غير متوفر');
    }
  };

  const handleMessage = () => {
    if (item.seller?.id) {
      router.push(`/chat/${item.seller.id}`);
    } else {
      alert('لا يمكن إرسال رسالة');
    }
  };

  const handleBid = () => {
    if (item.type === 'auction') {
      router.push(`/auctions/${item.itemId}#bid`);
    } else {
      alert('هذا العنصر ليس مزاداً');
    }
  };

  const handleShare = () => {
    const url =
      item.type === 'auction'
        ? `${window.location.origin}/auctions/${item.itemId}`
        : `${window.location.origin}/marketplace/${item.itemId}`;

    if (navigator.share) {
      navigator.share({
        title: item.title,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط');
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className="group cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-md"
        onClick={viewDetails}
      >
        <div className="flex h-full">
          {/* صورة السيارة - مصغرة */}
          <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden">
            <img
              src={getFirstImage(item)}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />

            {/* شارة نوع العنصر - مبسطة */}
            <div
              className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-xs font-medium text-white ${
                item.type === 'auction' ? 'bg-blue-500' : 'bg-green-500'
              }`}
            >
              {item.type === 'auction' ? 'مزاد' : 'فوري'}
            </div>

            {/* عدد الصور - مبسط */}
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black bg-opacity-60 px-1.5 py-0.5 text-xs text-white">
              <EyeIcon className="h-3 w-3" />
              <span>{getImagesCount(item)}</span>
            </div>

            {/* شارة حالة المزاد - مبسطة */}
            {item.type === 'auction' && item.status && (
              <div
                className={`absolute bottom-2 right-2 rounded px-1.5 py-0.5 text-xs font-medium ${
                  item.status === 'LIVE'
                    ? 'animate-pulse bg-red-500 text-white'
                    : item.status === 'UPCOMING'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-500 text-white'
                }`}
              >
                {formatAuctionStatus(item.status)}
              </div>
            )}

            {/* زر الحذف - في الصورة */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              className="absolute bottom-2 left-2 rounded-full bg-white/90 p-1 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="إزالة من المفضلة"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </div>

          {/* محتوى البطاقة */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <h3 className="mb-3 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                {item.title}
              </h3>

              {/* معلومات السيارة */}
              <div className="mb-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  {item.year && <span className="font-medium">{item.year}</span>}
                  {item.year && item.mileage && <span>•</span>}
                  {item.mileage && <span>{formatNumber(item.mileage)} كم</span>}
                  {(item.year || item.mileage) && item.condition && <span>•</span>}
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                    {formatCondition(item.condition)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span>{item.location || 'غير محدد'}</span>
                </div>

                {/* معلومات البائع */}
                {item.seller && (
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                    <span className="text-xs">{item.seller.name}</span>
                    {item.seller.verified && <CheckCircleIcon className="h-3 w-3 text-green-500" />}
                  </div>
                )}

                {/* تاريخ الإضافة */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <CalendarIcon className="h-3 w-3" />
                  <span>أُضيف في {formatDate(item.createdAt)}</span>
                </div>
              </div>

              {/* السعر ومعلومات المزاد */}
              <div className="mb-3">
                {item.type === 'auction' ? (
                  <div>
                    <div className="text-sm text-gray-600">السعر الحالي</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatNumber(item.currentPrice || item.startingPrice)} دينار
                    </div>
                    {item.totalBids > 0 && (
                      <div className="text-xs text-gray-500">{item.totalBids} مزايدة</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-600">السعر</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatNumber(item.price)} دينار
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <div className="flex items-center gap-2">
                {/* زر الاتصال */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCall();
                  }}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  title="اتصال بالبائع"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>اتصال</span>
                </button>

                {/* زر المراسلة */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessage();
                  }}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  title="مراسلة البائع"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span>رسالة</span>
                </button>

                {/* زر المزايدة (للمزادات فقط) */}
                {item.type === 'auction' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBid();
                    }}
                    className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200"
                    title="المزايدة"
                  >
                    <HandRaisedIcon className="h-4 w-4" />
                    <span>زايد</span>
                  </button>
                )}
              </div>

              {/* أزرار الإجراءات الثانوية */}
              <div className="flex items-center gap-1">
                {/* زر المشاركة */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                  title="مشاركة"
                >
                  <ShareIcon className="h-4 w-4" />
                </button>

                {/* زر عرض التفاصيل */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    viewDetails();
                  }}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                  title="عرض التفاصيل"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>

                {/* زر الحذف */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item);
                  }}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="إزالة من المفضلة"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // العرض الشبكي
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-lg"
      onClick={viewDetails}
    >
      {/* صورة السيارة */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={getFirstImage(item)}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />

        {/* شارة نوع العنصر */}
        <div
          className={`absolute right-2 top-2 rounded-md px-2 py-1 text-xs font-medium text-white ${
            item.type === 'auction' ? 'bg-blue-500' : 'bg-green-500'
          }`}
        >
          {item.type === 'auction' ? 'مزاد' : 'سوق فوري'}
        </div>

        {/* عدد الصور */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
          <EyeIcon className="h-3 w-3" />
          <span>{getImagesCount(item)}</span>
        </div>

        {/* شارة حالة المزاد */}
        {item.type === 'auction' && item.status && (
          <div
            className={`absolute bottom-2 right-2 rounded-md px-2 py-1 text-xs font-medium ${
              item.status === 'LIVE'
                ? 'animate-pulse bg-red-500 text-white'
                : item.status === 'UPCOMING'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-500 text-white'
            }`}
          >
            {formatAuctionStatus(item.status)}
          </div>
        )}

        {/* زر الحذف من المفضلة */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item);
          }}
          className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="إزالة من المفضلة"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {/* محتوى البطاقة */}
      <div className="flex flex-1 flex-col p-4">
        {/* العنوان */}
        <h3 className="mb-2 line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600">
          {item.title}
        </h3>

        {/* معلومات السيارة */}
        <div className="mb-3 space-y-1 text-sm text-gray-600">
          <div className="flex items-center justify-between text-xs">
            {item.year && <span className="font-medium">{item.year}</span>}
            {item.year && item.mileage && <span>•</span>}
            {item.mileage && <span>{formatNumber(item.mileage)} كم</span>}
            {(item.year || item.mileage) && item.condition && <span>•</span>}
            <span className="rounded bg-gray-100 px-1 py-0.5 text-xs">
              {formatCondition(item.condition)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <MapPinIcon className="h-3 w-3" />
            <span className="truncate text-xs">{item.location || 'غير محدد'}</span>
          </div>
        </div>

        {/* السعر */}
        <div className="mb-3">
          {item.type === 'auction' ? (
            <div className="text-center">
              <div className="text-xs text-gray-600">السعر الحالي</div>
              <div className="text-lg font-bold text-blue-600">
                {formatNumber(item.currentPrice || item.startingPrice)} دينار
              </div>
              {item.totalBids > 0 && (
                <div className="text-xs text-gray-500">{item.totalBids} مزايدة</div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs text-gray-600">السعر</div>
              <div className="text-lg font-bold text-green-600">
                {formatNumber(item.price)} دينار
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="mt-auto space-y-2">
          {/* الصف الأول - أزرار التواصل */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCall();
              }}
              className="flex items-center justify-center gap-1 rounded-md bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
              title="اتصال بالبائع"
            >
              <PhoneIcon className="h-3 w-3" />
              <span>اتصال</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMessage();
              }}
              className="flex items-center justify-center gap-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              title="مراسلة البائع"
            >
              <ChatBubbleLeftRightIcon className="h-3 w-3" />
              <span>رسالة</span>
            </button>
          </div>

          {/* الصف الثاني - أزرار الإجراءات */}
          <div className="grid grid-cols-3 gap-1">
            {/* زر المزايدة (للمزادات فقط) */}
            {item.type === 'auction' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBid();
                }}
                className="flex items-center justify-center gap-1 rounded-md bg-green-100 px-2 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
                title="المزايدة"
              >
                <HandRaisedIcon className="h-3 w-3" />
                <span>زايد</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  viewDetails();
                }}
                className="flex items-center justify-center gap-1 rounded-md bg-blue-100 px-2 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                title="عرض التفاصيل"
              >
                <EyeIcon className="h-3 w-3" />
                <span>تفاصيل</span>
              </button>
            )}

            {/* زر المشاركة */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="flex items-center justify-center rounded-md bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
              title="مشاركة"
            >
              <ShareIcon className="h-3 w-3" />
            </button>

            {/* زر عرض التفاصيل */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                viewDetails();
              }}
              className="flex items-center justify-center rounded-md bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
              title="عرض التفاصيل"
            >
              <EyeIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteCard;
