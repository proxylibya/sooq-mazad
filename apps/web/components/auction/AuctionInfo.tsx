/**
 * Auction Info Component
 * مكون معلومات المزاد
 */

import React from 'react';
import {
  InformationCircleIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  TruckIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline';
import { AuctionState } from '../../types/socket';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface AuctionInfoProps {
  auction: AuctionState;
}

const AuctionInfo: React.FC<AuctionInfoProps> = ({ auction }) => {
  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      UPCOMING: { text: 'قادم', color: 'bg-blue-100 text-blue-800' },
      LIVE: { text: 'مباشر', color: 'bg-green-100 text-green-800' },
      ENDING_SOON: { text: 'ينتهي قريباً', color: 'bg-red-100 text-red-800' },
      ENDED: { text: 'انتهى', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { text: 'ملغي', color: 'bg-red-100 text-red-800' },
      SUSPENDED: { text: 'معلق', color: 'bg-yellow-100 text-yellow-800' },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        text: 'غير محدد',
        color: 'bg-gray-100 text-gray-800',
      }
    );
  };

  // Get account type icon
  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'COMPANY':
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'TRANSPORT_OWNER':
        return <TruckIcon className="h-4 w-4" />;
      case 'SHOWROOM':
        return <HomeModernIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const statusInfo = getStatusDisplay(auction.status);

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-lg">
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">معلومات المزاد</h3>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Auction Image */}
      {auction.imageUrl ? (
        <div className="relative">
          <img src={auction.imageUrl} alt={auction.title} className="h-48 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="truncate text-lg font-bold text-white">{auction.title}</h2>
          </div>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center bg-gray-100">
          <div className="text-center">
            <PhotoIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p className="font-medium text-gray-500">{auction.title}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4 p-4">
        {/* Description */}
        {auction.description && (
          <div>
            <p className="text-sm leading-relaxed text-gray-700">{auction.description}</p>
          </div>
        )}

        {/* Key Information */}
        <div className="grid grid-cols-1 gap-3">
          {/* Current Price */}
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
            <div className="flex items-center gap-2 text-green-700">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span className="text-sm font-medium">السعر الحالي</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(auction.currentPrice)}
            </span>
          </div>

          {/* Starting Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">السعر الأولي:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(auction.startingPrice)}
            </span>
          </div>

          {/* Minimum Increment */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">الحد الأدنى للزيادة:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(auction.minimumBidIncrement)}
            </span>
          </div>

          {/* Reserve Price */}
          {auction.reservePrice && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">السعر المحجوز:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(auction.reservePrice)}
              </span>
            </div>
          )}

          {/* Buy Now Price */}
          {auction.buyNowPrice && (
            <div className="flex items-center justify-between rounded bg-blue-50 p-2 text-sm">
              <span className="font-medium text-blue-700">اشتري الآن:</span>
              <span className="font-bold text-blue-600">{formatCurrency(auction.buyNowPrice)}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">بدأ في:</span>
            <span className="font-medium text-gray-900">{formatDateTime(auction.startTime)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">ينتهي في:</span>
            <span className="font-medium text-gray-900">{formatDateTime(auction.endTime)}</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{auction.participantsCount}</div>
            <div className="text-xs text-gray-500">مشارك</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{auction.bidsCount}</div>
            <div className="text-xs text-gray-500">عرض</div>
          </div>
        </div>

        {/* Seller Info */}
        {auction.seller && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">معلومات البائع</h4>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <div className="text-gray-400">{getAccountTypeIcon(auction.seller.accountType)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{auction.seller.name}</span>
                  {auction.seller.verified && (
                    <div className="h-4 w-4 rounded-full bg-green-500" title="موثق" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {auction.seller.accountType === 'COMPANY' && 'شركة'}
                  {auction.seller.accountType === 'TRANSPORT_OWNER' && 'مالك نقل'}
                  {auction.seller.accountType === 'SHOWROOM' && 'معرض'}
                  {auction.seller.accountType === 'REGULAR_USER' && 'مستخدم عادي'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        {auction.categories && auction.categories.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
              <TagIcon className="h-4 w-4" />
              التصنيفات
            </h4>
            <div className="flex flex-wrap gap-2">
              {auction.categories.map((category, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {auction.location && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">الموقع:</span>
              <span className="font-medium text-gray-900">{auction.location}</span>
            </div>
          </div>
        )}

        {/* Auto Extension */}
        {auction.autoExtensionMinutes && (
          <div className="border-t border-gray-200 pt-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-xs text-yellow-800">
                <strong>تمديد تلقائي:</strong> سيتم تمديد المزاد {auction.autoExtensionMinutes}{' '}
                دقائق إضافية إذا تم تقديم عرض في آخر {auction.autoExtensionMinutes} دقائق
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionInfo;
