import React from 'react';
import Link from 'next/link';
import { 
  HeartIcon, 
  ShareIcon, 
  EyeIcon, 
  ClockIcon, 
  MapPinIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface AuctionHeaderProps {
  auction: {
    id: string;
    title: string;
    location: string;
    views: number;
    createdAt: string;
    status: string;
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}

const AuctionHeader: React.FC<AuctionHeaderProps> = ({
  auction,
  isFavorite,
  onToggleFavorite,
  onShare,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-LY", {
      day: "numeric",
      month: "numeric", 
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'نشط', class: 'bg-green-100 text-green-800 border-green-200' },
      UPCOMING: { label: 'قادم', class: 'bg-blue-100 text-blue-800 border-blue-200' },
      ENDED: { label: 'انتهى', class: 'bg-gray-100 text-gray-800 border-gray-200' },
      CANCELLED: { label: 'ملغى', class: 'bg-red-100 text-red-800 border-red-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* شريط التنقل */}
        <div className="flex items-center gap-2 py-3 text-sm text-gray-600">
          <Link 
            href="/" 
            className="hover:text-blue-600 transition-colors"
          >
            الرئيسية
          </Link>
          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          <Link 
            href="/auctions" 
            className="hover:text-blue-600 transition-colors"
          >
            المزادات
          </Link>
          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">تفاصيل المزاد</span>
        </div>

        {/* العنوان الرئيسي والأدوات */}
        <div className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* العنوان ومعلومات أساسية */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {auction.title}
                </h1>
                {getStatusBadge(auction.status)}
              </div>

              {/* المعلومات الفرعية */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDate(auction.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{auction.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4" />
                  <span>{auction.views.toLocaleString()} مشاهدة</span>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center gap-3">
              {/* زر المفضلة */}
              <button
                onClick={onToggleFavorite}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${isFavorite 
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }
                `}
                aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              >
                {isFavorite ? (
                  <HeartSolid className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">
                  {isFavorite ? 'مضاف للمفضلة' : 'أضف للمفضلة'}
                </span>
              </button>

              {/* زر المشاركة */}
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                aria-label="مشاركة المزاد"
              >
                <ShareIcon className="w-5 h-5" />
                <span className="hidden sm:inline">مشاركة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionHeader;
