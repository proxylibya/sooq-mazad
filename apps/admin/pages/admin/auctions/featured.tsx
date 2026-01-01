/**
 * صفحة الإعلانات المميزة - Featured Auctions
 * تعرض المزادات التي تم ترويجها أو إضافة شارات مميزة لها
 */

import {
  ArrowPathIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FireIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  SparklesIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  CheckBadgeIcon as CheckBadgeSolid,
  StarIcon as StarSolid,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

// ======================
// نظام معالجة الصور الموحد
// ======================

const DEFAULT_CAR_IMAGE = '/images/cars/default-car.svg';

interface CarImageRecord {
  id?: string;
  fileUrl?: string;
  url?: string;
  imageUrl?: string;
  src?: string;
  path?: string;
  isPrimary?: boolean;
}

/**
 * تنظيف وتصحيح URL الصورة
 */
function cleanImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url
    .trim()
    .replace(/^[\s'"\[\](){}]+|[\s'"\[\](){}]+$/g, '')
    .replace(/%22/gi, '')
    .replace(/[\[\]]/g, '')
    .replace(/\s+/g, '');
  if (cleaned.startsWith('./')) cleaned = cleaned.substring(2);
  if (cleaned && !cleaned.startsWith('/') && !cleaned.startsWith('http')) {
    cleaned = '/' + cleaned;
  }
  return cleaned;
}

/**
 * التحقق من صحة URL الصورة
 */
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 3) return false;
  const fakePatterns = ['unsplash.com', 'placeholder.com', 'via.placeholder', 'picsum.photos'];
  if (fakePatterns.some((pattern) => url.toLowerCase().includes(pattern))) return false;
  const validPatterns = [
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i,
    /\/(images|uploads|assets|media|photos|pictures)\//i,
    /^\/api\//,
    /^https?:\/\//,
  ];
  return validPatterns.some((pattern) => pattern.test(url)) || url.includes('default-car');
}

/**
 * استخراج URL من كائن صورة
 */
function extractUrlFromObject(obj: CarImageRecord | any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const urlFields = ['fileUrl', 'url', 'imageUrl', 'src', 'path', 'image'];
  for (const field of urlFields) {
    if (obj[field] && typeof obj[field] === 'string' && obj[field].trim()) {
      return obj[field].trim();
    }
  }
  return null;
}

/**
 * معالجة الصور من أي نوع بيانات
 */
function resolveAuctionImage(auction: FeaturedAuction): string {
  // 1. محاولة carImages (الصيغة الجديدة)
  if (auction.car?.carImages && Array.isArray(auction.car.carImages)) {
    const sorted = [...auction.car.carImages].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
    for (const img of sorted) {
      const url = extractUrlFromObject(img);
      if (url) {
        const cleaned = cleanImageUrl(url);
        if (isValidImageUrl(cleaned)) return cleaned;
      }
    }
  }

  // 2. محاولة images (الصيغة القديمة - string أو JSON أو array)
  const images = auction.car?.images || auction.images;
  if (images) {
    // إذا كانت مصفوفة
    if (Array.isArray(images)) {
      for (const img of images) {
        const url = typeof img === 'string' ? img : extractUrlFromObject(img);
        if (url) {
          const cleaned = cleanImageUrl(url);
          if (isValidImageUrl(cleaned)) return cleaned;
        }
      }
    }
    // إذا كانت نص
    else if (typeof images === 'string' && images.trim()) {
      const trimmed = images.trim();
      // محاولة تحليل JSON
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          const url = typeof first === 'string' ? first : extractUrlFromObject(first);
          if (url) {
            const cleaned = cleanImageUrl(url);
            if (isValidImageUrl(cleaned)) return cleaned;
          }
        } else if (typeof parsed === 'string') {
          const cleaned = cleanImageUrl(parsed);
          if (isValidImageUrl(cleaned)) return cleaned;
        }
      } catch {
        // ليس JSON، تحقق من الفواصل
        if (trimmed.includes(',')) {
          const first = trimmed.split(',')[0];
          const cleaned = cleanImageUrl(first);
          if (isValidImageUrl(cleaned)) return cleaned;
        } else {
          const cleaned = cleanImageUrl(trimmed);
          if (isValidImageUrl(cleaned)) return cleaned;
        }
      }
    }
  }

  // 3. محاولة حقل image المفرد
  const singleImage = auction.car?.image || auction.image;
  if (singleImage && typeof singleImage === 'string') {
    const cleaned = cleanImageUrl(singleImage);
    if (isValidImageUrl(cleaned)) return cleaned;
  }

  // 4. الصورة الافتراضية
  return DEFAULT_CAR_IMAGE;
}

/**
 * عد الصور المتاحة
 */
function countAuctionImages(auction: FeaturedAuction): number {
  if (auction.car?.carImages && Array.isArray(auction.car.carImages)) {
    return auction.car.carImages.filter((img) => {
      const url = extractUrlFromObject(img);
      return url && isValidImageUrl(cleanImageUrl(url));
    }).length;
  }
  const images = auction.car?.images || auction.images;
  if (images) {
    if (Array.isArray(images)) return images.length;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed.length;
      } catch {
        if (images.includes(',')) return images.split(',').length;
        return 1;
      }
    }
  }
  return 0;
}

interface FeaturedAuction {
  id: string;
  title: string;
  description?: string;
  currentPrice: number;
  startPrice: number;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
  views: number;
  totalBids: number;
  bidsCount: number;
  featured: boolean;
  verified?: boolean;
  promoted?: boolean;
  promotionType?: 'BASIC' | 'PREMIUM' | 'VIP';
  promotionEndDate?: string;
  badges?: string[];
  image?: string;
  images?: string | string[] | CarImageRecord[];
  car?: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    image?: string;
    images?: string | string[] | CarImageRecord[];
    carImages?: CarImageRecord[];
  };
  seller?: {
    id: string;
    name: string;
    phone: string;
    verified?: boolean;
  };
  createdAt: string;
}

type FilterType = 'all' | 'featured' | 'verified' | 'promoted';
type PromotionType = 'all' | 'BASIC' | 'PREMIUM' | 'VIP';

/**
 * مكون عرض صورة المزاد في الجدول
 */
function AuctionImageCell({ auction }: { auction: FeaturedAuction }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = useMemo(() => resolveAuctionImage(auction), [auction]);
  const imageCount = useMemo(() => countAuctionImages(auction), [auction]);
  const isDefaultImage = imageUrl === DEFAULT_CAR_IMAGE;

  return (
    <div className="flex items-center gap-3">
      {/* حاوية الصورة */}
      <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-700">
        {/* مؤشر التحميل */}
        {isLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        )}

        {/* الصورة */}
        {!imageError ? (
          <img
            src={imageUrl}
            alt={auction.title || 'صورة المزاد'}
            className={`h-full w-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PhotoIcon className="h-6 w-6 text-slate-500" />
          </div>
        )}

        {/* عداد الصور */}
        {imageCount > 1 && !isDefaultImage && (
          <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
            <PhotoIcon className="h-3 w-3" />
            <span>{imageCount}</span>
          </div>
        )}

        {/* شارة إذا كانت صورة افتراضية */}
        {isDefaultImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
            <span className="text-[9px] text-slate-400">بدون صورة</span>
          </div>
        )}
      </div>

      {/* معلومات المزاد */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white" title={auction.title}>
          {auction.title}
        </p>
        {auction.car && (
          <p className="truncate text-sm text-slate-400">
            {auction.car.brand} {auction.car.model} - {auction.car.year}
          </p>
        )}
      </div>
    </div>
  );
}

export default function FeaturedAuctionsPage() {
  const [auctions, setAuctions] = useState<FeaturedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [promotionFilter, setPromotionFilter] = useState<PromotionType>('all');
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    verified: 0,
    promoted: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchFeaturedAuctions();
  }, []);

  const fetchFeaturedAuctions = async () => {
    setLoading(true);
    try {
      // جلب الترويجات من API الجديد
      const [auctionsRes, promotionsRes] = await Promise.all([
        fetch('/api/admin/auctions?featured=true'),
        fetch('/api/admin/promotions'),
      ]);

      const auctionsData = await auctionsRes.json();
      const promotionsData = await promotionsRes.json();

      // إنشاء خريطة للترويجات بناءً على sourceId
      const promotionsMap = new Map<string, any>();
      if (promotionsData.success && promotionsData.promotions) {
        promotionsData.promotions.forEach((promo: any) => {
          if (promo.sourceType === 'auction' && promo.sourceId) {
            promotionsMap.set(promo.sourceId, promo);
          }
        });
      }

      if (auctionsData.success) {
        const processedAuctions: FeaturedAuction[] = (auctionsData.auctions || []).map(
          (auction: FeaturedAuction) => {
            const promotion = promotionsMap.get(auction.id);

            // تحديد نوع الترويج من البيانات الحقيقية
            let promotionType: 'BASIC' | 'PREMIUM' | 'VIP' | undefined;
            if (promotion) {
              if (promotion.priority === 3) promotionType = 'VIP';
              else if (promotion.priority === 2) promotionType = 'PREMIUM';
              else promotionType = 'BASIC';
            }

            return {
              ...auction,
              verified: auction.featured,
              promoted: !!promotion,
              promotionType,
              promotionEndDate: promotion?.endDate,
              badges: auction.featured ? ['مميز'] : [],
            };
          },
        );

        setAuctions(processedAuctions);

        const featured = processedAuctions.filter((a) => a.featured).length;
        const verified = processedAuctions.filter((a) => a.verified).length;
        const promoted = processedAuctions.filter((a) => a.promoted).length;
        const totalValue = processedAuctions.reduce((sum, a) => sum + (a.currentPrice || 0), 0);

        setStats({ total: processedAuctions.length, featured, verified, promoted, totalValue });
      }
    } catch (err) {
      console.error('Failed to fetch featured auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch =
      auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.car?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.car?.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesType = true;
    if (filterType === 'featured') matchesType = auction.featured;
    if (filterType === 'verified') matchesType = auction.verified || false;
    if (filterType === 'promoted') matchesType = auction.promoted || false;

    let matchesPromotion = true;
    if (promotionFilter !== 'all') {
      matchesPromotion = auction.promotionType === promotionFilter;
    }

    return matchesSearch && matchesType && matchesPromotion;
  });

  const handleRemoveFeatured = async (id: string) => {
    if (!confirm('هل أنت متأكد من إزالة التمييز عن هذا الإعلان؟')) return;

    try {
      const res = await fetch(`/api/admin/auctions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: false }),
      });

      if (res.ok) {
        fetchFeaturedAuctions();
      }
    } catch (err) {
      console.error('Failed to remove featured:', err);
    }
  };

  const getPromotionColor = (type?: string) => {
    switch (type) {
      case 'VIP':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black';
      case 'PREMIUM':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'BASIC':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getPromotionLabel = (type?: string) => {
    switch (type) {
      case 'VIP':
        return 'VIP';
      case 'PREMIUM':
        return 'بريميوم';
      case 'BASIC':
        return 'أساسي';
      default:
        return 'غير محدد';
    }
  };

  const getRemainingDays = (endDate?: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <AdminLayout title="الإعلانات المميزة">
      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <SparklesIcon className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">إجمالي المميزة</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <StarIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.featured}</p>
              <p className="text-sm text-slate-400">شارة مميز</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <CheckBadgeIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.verified}</p>
              <p className="text-sm text-slate-400">موثوق</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <FireIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.promoted}</p>
              <p className="text-sm text-slate-400">مروّج</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <CurrencyDollarIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.totalValue.toLocaleString('ar-LY')}
              </p>
              <p className="text-sm text-slate-400">القيمة الإجمالية د.ل</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-amber-400" />
          <p className="text-slate-400">{filteredAuctions.length} إعلان مميز</p>
        </div>
        <button
          onClick={fetchFeaturedAuctions}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-600 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-[250px] flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="البحث في الإعلانات المميزة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2.5 pl-4 pr-10 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">جميع الأنواع</option>
            <option value="featured">مميز</option>
            <option value="verified">موثوق</option>
            <option value="promoted">مروّج</option>
          </select>

          <select
            value={promotionFilter}
            onChange={(e) => setPromotionFilter(e.target.value as PromotionType)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">جميع باقات الترويج</option>
            <option value="BASIC">أساسي</option>
            <option value="PREMIUM">بريميوم</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      {/* Auctions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center">
          <SparklesIcon className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-lg text-slate-400">لا توجد إعلانات مميزة</p>
          <p className="mt-2 text-sm text-slate-500">
            الإعلانات التي يتم ترويجها أو إضافة شارات لها ستظهر هنا
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  الإعلان
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  الشارات
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  باقة الترويج
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  السعر الحالي
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  المزايدات
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  المشاهدات
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  البائع
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  انتهاء الترويج
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-slate-400">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredAuctions.map((auction) => (
                <tr key={auction.id} className="transition-colors hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <AuctionImageCell auction={auction} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {auction.featured && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                          <StarSolid className="h-3 w-3" />
                          مميز
                        </span>
                      )}
                      {auction.verified && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                          <CheckBadgeSolid className="h-3 w-3" />
                          موثوق
                        </span>
                      )}
                      {auction.promoted && (
                        <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                          <FireIcon className="h-3 w-3" />
                          مروّج
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {auction.promotionType ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getPromotionColor(auction.promotionType)}`}
                      >
                        {getPromotionLabel(auction.promotionType)}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-bold text-emerald-400">
                      {auction.currentPrice.toLocaleString('ar-LY')} د.ل
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-sm font-medium text-blue-400">
                      {auction.bidsCount}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-center text-slate-300">
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4 text-slate-500" />
                      {auction.views}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{auction.seller?.name || '-'}</span>
                      {auction.seller?.verified && (
                        <CheckBadgeSolid className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    {auction.promoted && auction.promotionEndDate ? (
                      <span
                        className={`text-sm ${getRemainingDays(auction.promotionEndDate) <= 3 ? 'text-red-400' : 'text-amber-400'}`}
                      >
                        {getRemainingDays(auction.promotionEndDate)} يوم
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/auctions/${auction.id}`}
                        className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-500/10"
                        title="عرض التفاصيل"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleRemoveFeatured(auction.id)}
                        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
                        title="إزالة التمييز"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <h3 className="mb-3 font-medium text-white">دليل الشارات والترويج</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-black">
              <StarSolid className="h-3 w-3" />
              مميز
            </span>
            <span className="text-sm text-slate-400">إعلان مميز يظهر في المقدمة</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
              <CheckBadgeSolid className="h-3 w-3" />
              موثوق
            </span>
            <span className="text-sm text-slate-400">بائع موثوق ومعتمد</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${getPromotionColor('VIP')}`}
            >
              VIP
            </span>
            <span className="text-sm text-slate-400">باقة VIP الأعلى</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${getPromotionColor('PREMIUM')}`}
            >
              بريميوم
            </span>
            <span className="text-sm text-slate-400">باقة بريميوم المتقدمة</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
