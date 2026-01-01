/**
 * قسم المزادات المميزة - يعرض أفضل المزادات المميزة في الصفحة الرئيسية
 */

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { NewAuctionCard } from './index';

interface FeaturedAuction {
  id: string | number;
  title: string;
  price: string;
  currentBid: string;
  startingBid: string;
  bidCount: number;
  location: string;
  area?: string;
  time: string;
  images: string[];
  condition: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  type: string;
  phone: string;
  isAuction: boolean;
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
  auctionStartTime: string;
  auctionEndTime: string;
  featured: boolean;
  image: string;
  description: string;
  imageList?: string[];
  car?: {
    carImages?: Array<{ fileUrl: string; isPrimary?: boolean }>;
  };
}

interface FeaturedAuctionsSectionProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  onContactClick?: (auction: FeaturedAuction) => void;
  onChatClick?: (auction: FeaturedAuction) => void;
  onBidClick?: (auction: FeaturedAuction) => void;
  onFavoriteClick?: (auctionId: number) => void;
  isFavorite?: (auctionId: number) => boolean;
}

const FeaturedAuctionsSection: React.FC<FeaturedAuctionsSectionProps> = ({
  title = 'مزادات مميزة',
  subtitle = 'أفضل المزادات المختارة لك هذا الأسبوع',
  maxItems = 4,
  onContactClick = () => {},
  onChatClick = () => {},
  onBidClick = () => {},
  onFavoriteClick = () => {},
  isFavorite = () => false,
}) => {
  const [featuredAuctions, setFeaturedAuctions] = useState<FeaturedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedAuctions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/auctions/paginated?featured=true&pageSize=${maxItems}&status=ACTIVE`,
        );

        if (!response.ok) {
          throw new Error('فشل في جلب المزادات المميزة');
        }

        const result = await response.json();

        const transformedAuctions = (result.data || []).map((auction: any) => {
          const carImages = Array.isArray(auction.car?.carImages) ? auction.car.carImages : [];

          let imageList: string[] = [];

          if (carImages.length > 0) {
            const normalized = carImages
              .filter((img: any) => img && typeof img.fileUrl === 'string' && img.fileUrl.trim())
              .sort((a: any, b: any) => {
                if (a.isPrimary && !b.isPrimary) return -1;
                if (!a.isPrimary && b.isPrimary) return 1;
                return 0;
              })
              .map((img: any) => {
                const url = img.fileUrl.trim();
                if (url.startsWith('http') || url.startsWith('/')) return url;
                return `/images/cars/listings/${url}`;
              });

            if (normalized.length > 0) {
              imageList = normalized;
            }
          }

          if (imageList.length === 0 && auction.car?.images) {
            if (Array.isArray(auction.car.images) && auction.car.images.length > 0) {
              const cleanImages = auction.car.images.filter(
                (img: any) => img && typeof img === 'string' && img.trim(),
              );
              if (cleanImages.length > 0) {
                imageList = cleanImages;
              }
            } else if (typeof auction.car.images === 'string' && auction.car.images.trim()) {
              const splitImages = auction.car.images
                .split(',')
                .map((img: string) => img.trim())
                .filter((img: string) => img);
              if (splitImages.length > 0) {
                imageList = splitImages;
              }
            }
          }

          if (imageList.length === 0) {
            imageList = ['/images/cars/default-car.svg'];
          }

          const primaryImage = imageList[0] || '/images/cars/default-car.svg';

          const normalizedCarImages = carImages
            .filter((img: any) => img && typeof img.fileUrl === 'string' && img.fileUrl.trim())
            .map((img: any) => {
              const url = img.fileUrl.trim();
              const normalizedUrl =
                url.startsWith('http') || url.startsWith('/')
                  ? url
                  : `/images/cars/listings/${url}`;
              return { ...img, fileUrl: normalizedUrl };
            });

          return {
            id: auction.id,
            title:
              auction.car?.title ||
              `${auction.car?.brand || ''} ${auction.car?.model || ''}`.trim() ||
              'مزاد سيارة',
            price: String(auction.currentPrice || auction.startPrice || 0),
            currentBid: String(auction.currentPrice || 0),
            startingBid: String(auction.startPrice || 0),
            bidCount: auction._count?.bids || 0,
            location: auction.car?.location || auction.location || 'ليبيا',
            area: auction.area,
            time: auction.endDate ? new Date(auction.endDate).toLocaleDateString('ar-LY') : '',
            images: imageList,
            condition: auction.car?.condition || 'جيدة',
            brand: auction.car?.brand || '',
            model: auction.car?.model || '',
            year: String(auction.car?.year || ''),
            mileage: String(auction.car?.mileage || '0'),
            type: 'auction',
            phone: auction.seller?.phone || '',
            isAuction: true,
            auctionType: getAuctionType(auction),
            auctionStartTime: auction.startDate,
            auctionEndTime: auction.endDate,
            featured: auction.featured || false,
            image: primaryImage,
            description: auction.description || '',
            imageList,
            car: {
              carImages: normalizedCarImages,
            },
          } as FeaturedAuction;
        });

        setFeaturedAuctions(transformedAuctions);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured auctions:', err);
        setError('فشل في تحميل المزادات المميزة');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAuctions();
  }, [maxItems]);

  // دالة تحديد نوع المزاد
  const getAuctionType = (auction: any): 'upcoming' | 'live' | 'ended' | 'sold' => {
    if (auction.status === 'SOLD') return 'sold';
    if (auction.status === 'ENDED') return 'ended';

    const now = new Date();
    const startDate = new Date(auction.startDate);
    const endDate = new Date(auction.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'live';
  };

  // إذا لا توجد مزادات مميزة، لا نعرض القسم
  if (!loading && featuredAuctions.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-amber-50/50 to-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 shadow-sm">
              <StarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>

          <Link
            href="/auctions?featured=true"
            className="flex items-center gap-1 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
          >
            <span>عرض الكل</span>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Auctions Grid */}
        {!loading && !error && featuredAuctions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredAuctions.map((auction) => (
              <NewAuctionCard
                key={auction.id}
                car={auction as any}
                onContactClick={() => onContactClick(auction)}
                onChatClick={() => onChatClick(auction)}
                onBidClick={() => onBidClick(auction)}
                onFavoriteClick={() => onFavoriteClick(Number(auction.id))}
                isFavorite={isFavorite(Number(auction.id))}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedAuctionsSection;
