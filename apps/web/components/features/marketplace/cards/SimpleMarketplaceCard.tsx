import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import React from 'react';
import { useFavorites } from '../../../../hooks/useFavorites';

interface SimpleMarketplaceCardProps {
  item: {
    id: number;
    title: string;
    price: string;
    location: string;
    time: string;
    images: number;
    condition: string;
    brand: string;
    model: string;
    year: string;
    mileage: string;
    image: string;
    seller?: {
      name: string;
      rating: number;
      verified: boolean;
    };
  };
  onContactClick: (item: any) => void;
  onChatClick: (item: any) => void;
}

const SimpleMarketplaceCard: React.FC<SimpleMarketplaceCardProps> = ({
  item,
  onContactClick,
  onChatClick,
}) => {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/marketplace/${item.id}`);
  };

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-md"
      onClick={handleCardClick}
    >
      {/* صورة المنتج */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=صورة+المنتج';
          }}
        />

        {/* عدد الصور */}
        <div className="absolute bottom-2 left-2 flex items-start gap-1 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
          <PhotoIcon className="h-3 w-3" />
          <span>{item.images}</span>
        </div>

        {/* زر المفضلة */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await toggleFavorite(item.id.toString());
          }}
          className={`absolute left-2 top-2 rounded-full p-1.5 ${
            isFavorite(item.id.toString()) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'
          }`}
        >
          {isFavorite(item.id.toString()) ? (
            <HeartSolid className="h-4 w-4" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
        </button>

        {/* حالة المنتج */}
        <div className="absolute right-2 top-2 rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white">
          {item.condition}
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-3">
        {/* العنوان والسعر */}
        <div className="mb-2">
          <h3 className="mb-1 line-clamp-2 text-base font-bold text-gray-900 transition-colors hover:text-blue-600">
            {item.title}
          </h3>
          <div className="text-lg font-bold text-green-600">{item.price}</div>
        </div>

        {/* معلومات السيارة */}
        <div className="mb-2 text-sm text-gray-600">
          <div className="flex items-start justify-between text-xs">
            <span>{item.year}</span>
            <span>•</span>
            <span>{item.mileage}</span>
            <span>•</span>
            <span>{item.brand}</span>
          </div>
        </div>

        {/* الموقع والوقت */}
        <div className="mb-2 flex items-start justify-between text-xs text-gray-500">
          <div className="flex items-start gap-1">
            <MapPinIcon className="h-3 w-3" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-start gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>{item.time}</span>
          </div>
        </div>

        {/* معلومات البائع */}
        {item.seller && (
          <div className="mb-2 flex items-start justify-between text-xs text-gray-500">
            <div className="flex items-start gap-1">
              <span>{item.seller.name}</span>
              {item.seller.verified && <div className="h-3 w-3 rounded-full bg-green-500"></div>}
            </div>
            <div className="flex items-start gap-1">
              <StarIcon className="h-3 w-3 fill-current text-yellow-400" />
              <span>{item.seller.rating}</span>
            </div>
          </div>
        )}

        {/* أزرار التفاعل */}
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContactClick(item);
            }}
            className="flex items-start justify-center gap-1 rounded-md bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <PhoneIcon className="h-3 w-3" />
            <span>اتصال</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onChatClick(item);
            }}
            className="flex items-start justify-center gap-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ChatBubbleLeftRightIcon className="h-3 w-3" />
            <span>رسالة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleMarketplaceCard;
