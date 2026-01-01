import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { OpensooqNavbar } from '../components/common';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';

// Icons (unified with notifications style)
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import EllipsisHorizontalIcon from '@heroicons/react/24/outline/EllipsisHorizontalIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import HeartSolid from '@heroicons/react/24/solid/HeartIcon';
import { CarIcon } from '../components/ui/MissingIcons';

// Types for filters
type FavFilter = 'all' | 'auction' | 'marketplace' | 'transport' | 'showroom' | 'other';

const FavoritesPage = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FavFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [confirmItem, setConfirmItem] = useState<any | null>(null);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);

  const { user, isLoading: authLoading } = useAuth();
  const { favorites, setFavorites, isLoading, error, removeFavoriteById, refreshFavorites } =
    useFavorites();

  // Redirect if not logged in - مع حماية من race condition
  useEffect(() => {
    const checkAuthTimeout = setTimeout(() => {
      if (!authLoading && !user) {
        router.push('/?callbackUrl=' + encodeURIComponent('/favorites'));
      }
    }, 200);

    return () => clearTimeout(checkAuthTimeout);
  }, [user, authLoading, router]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      refreshFavorites();
    }
  }, [user?.id]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Filtering + search
  const filtered = useMemo(() => {
    const byType = favorites.filter((item: any) =>
      activeFilter === 'all'
        ? true
        : activeFilter === 'other'
          ? !['auction', 'marketplace', 'transport', 'showroom'].includes(item.type)
          : item.type === activeFilter,
    );

    if (!searchQuery.trim()) return byType;
    const q = searchQuery.toLowerCase();
    return byType.filter((item: any) => (item.title || '').toLowerCase().includes(q));
  }, [favorites, activeFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const count = (t: FavFilter) =>
      t === 'all'
        ? favorites.length
        : t === 'other'
          ? favorites.filter(
              (i: any) => !['auction', 'marketplace', 'transport', 'showroom'].includes(i.type),
            ).length
          : favorites.filter((i: any) => i.type === t).length;
    return {
      all: count('all'),
      auction: count('auction'),
      marketplace: count('marketplace'),
      transport: count('transport'),
      showroom: count('showroom'),
      other: count('other'),
    };
  }, [favorites]);

  // Actions
  const handleRemoveFavorite = (item: any) => {
    setConfirmItem(item);
  };

  const performRemoveFavorite = async () => {
    if (!confirmItem) return;
    const itemName = confirmItem.title || 'هذا العنصر';
    try {
      const success = await removeFavoriteById(confirmItem.id);
      if (success) {
        setFavorites((prev: any[]) => prev.filter((f: any) => f.id !== confirmItem.id));
        await refreshFavorites();
        setToast({
          message: `تم حذف "${itemName}" من المفضلة`,
          type: 'success',
        });
      } else {
        setToast({
          message: 'فشل في حذف العنصر. حاول مرة أخرى.',
          type: 'error',
        });
      }
    } catch (e) {
      setToast({ message: 'حدث خطأ أثناء حذف العنصر.', type: 'error' });
    } finally {
      setConfirmItem(null);
    }
  };

  const getFilterText = () => {
    return activeFilter === 'all'
      ? 'جميع العناصر'
      : activeFilter === 'auction'
        ? 'جميع المزادات'
        : activeFilter === 'marketplace'
          ? 'جميع السيارات'
          : activeFilter === 'transport'
            ? 'جميع خدمات النقل'
            : activeFilter === 'showroom'
              ? 'جميع المعارض'
              : 'جميع العناصر الأخرى';
  };

  const clearFiltered = () => {
    if (filtered.length === 0) {
      setToast({ message: 'لا توجد عناصر لحذفها', type: 'error' });
      return;
    }
    setConfirmBulkOpen(true);
  };

  const performClearFiltered = async () => {
    let successCount = 0;
    let failCount = 0;

    for (const item of filtered) {
      try {
        const success = await removeFavoriteById(item.id);
        if (success) {
          successCount++;
          setFavorites((prev: any[]) => prev.filter((f: any) => f.id !== item.id));
        } else {
          failCount++;
        }
      } catch (e) {
        failCount++;
      }
    }

    await refreshFavorites();

    if (successCount > 0 && failCount === 0) {
      setToast({
        message: `تم حذف جميع العناصر بنجاح (${successCount})`,
        type: 'success',
      });
    } else if (successCount > 0 && failCount > 0) {
      setToast({
        message: `تم حذف ${successCount} عنصر، وفشل ${failCount} عنصر`,
        type: 'error',
      });
    } else {
      setToast({
        message: 'فشل في حذف العناصر. حاول مرة أخرى.',
        type: 'error',
      });
    }
    setConfirmBulkOpen(false);
  };

  // UI helpers
  const typeMeta: Record<
    Exclude<FavFilter, 'all'>,
    { label: string; color: string; bg: string; Icon: any }
  > = {
    auction: {
      label: 'مزاد',
      color: 'text-green-700',
      bg: 'bg-green-50',
      Icon: CurrencyDollarIcon,
    },
    marketplace: {
      label: 'السوق الفوري',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      Icon: CarIcon,
    },
    transport: {
      label: 'النقل',
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      Icon: TruckIcon,
    },
    showroom: {
      label: 'المعارض',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      Icon: BuildingStorefrontIcon,
    },
    other: {
      label: 'أخرى',
      color: 'text-gray-700',
      bg: 'bg-gray-50',
      Icon: EllipsisHorizontalIcon,
    },
  };

  const getItemLink = (item: any) => {
    if (item.type === 'auction') return `/auction/${item.itemId}`;
    if (item.type === 'marketplace') return `/marketplace/${item.itemId}`;
    if (item.type === 'transport') return `/transport/service/${item.itemId}`;
    if (item.type === 'showroom') return `/showrooms/${item.itemId}`;
    return '#';
  };

  // تم حذف السبينر الداخلي - UnifiedPageTransition يتولى عرض مؤشر التحميل
  if (authLoading) return null;

  if (!user) return null; // will redirect

  return (
    <>
      <Head>
        <title>المفضلة - مزاد السيارات</title>
        <meta name="description" content="عرض جميع العناصر المفضلة" />
      </Head>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg p-3 text-sm shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/80 hover:text-white">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={!!confirmItem}
        title="تأكيد الحذف"
        message={
          confirmItem
            ? `هل أنت متأكد من إزالة "${confirmItem.title || 'هذا العنصر'}" من المفضلة؟`
            : ''
        }
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        onConfirm={performRemoveFavorite}
        onCancel={() => setConfirmItem(null)}
      />
      <ConfirmDialog
        isOpen={confirmBulkOpen}
        title="تأكيد حذف متعدد"
        message={`هل أنت متأكد من حذف ${getFilterText()}؟ (${filtered.length} عنصر)`}
        confirmText="حذف الكل"
        cancelText="إلغاء"
        type="danger"
        onConfirm={performClearFiltered}
        onCancel={() => setConfirmBulkOpen(false)}
      />

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Header */}
          <div className="mb-4">
            <div className="mb-3 flex items-center gap-3">
              <HeartSolid className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900">المفضلة</h1>
              <span className="text-sm text-gray-500">({stats.all} عنصر)</span>
            </div>

            {/* Neutral chips like notifications */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: 'all', label: 'الكل', count: stats.all },
                  { key: 'auction', label: 'المزادات', count: stats.auction },
                  {
                    key: 'marketplace',
                    label: 'السوق الفوري',
                    count: stats.marketplace,
                  },
                  { key: 'transport', label: 'النقل', count: stats.transport },
                  { key: 'showroom', label: 'المعارض', count: stats.showroom },
                  { key: 'other', label: 'أخرى', count: stats.other },
                ] as const
              ).map((chip) => {
                const isActive = activeFilter === chip.key;
                return (
                  <button
                    key={chip.key}
                    onClick={() => setActiveFilter(chip.key as FavFilter)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${isActive ? 'bg-white/80' : 'bg-gray-400'}`}
                    ></span>
                    <span>{chip.label}</span>
                    {chip.count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {chip.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search + actions */}
          <div className="mb-4 rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative max-w-sm flex-1">
                <input
                  type="text"
                  placeholder="البحث في العناوين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {filtered.length > 0 && (
                  <button
                    onClick={clearFiltered}
                    className="rounded-md border border-red-300 px-2 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
                  >
                    مسح العناصر المعروضة
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
              <p className="text-gray-600">يتم تحميل المفضلة...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <EllipsisHorizontalIcon className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">حدث خطأ</h3>
              <p className="mb-6 text-gray-600">فشل في تحميل المفضلة</p>
              <button
                onClick={() => refreshFavorites()}
                className="rounded-xl bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <HeartSolid className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              {searchQuery ? (
                <>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">لا توجد نتائج</h3>
                  <p className="mb-6 text-gray-600">
                    لا توجد سيارات مفضلة تطابق &quot;{searchQuery}&quot;
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">لا توجد مفضلة</h3>
                  <p className="mb-6 text-gray-600">
                    لم تقم بإضافة أي سيارات &quot;مفضلة&quot; بعد
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="animate-fade-in rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    {(() => {
                      const meta =
                        item.type === 'auction'
                          ? typeMeta.auction
                          : item.type === 'marketplace'
                            ? typeMeta.marketplace
                            : item.type === 'transport'
                              ? typeMeta.transport
                              : item.type === 'showroom'
                                ? typeMeta.showroom
                                : typeMeta.other;
                      const TypeIcon = meta.Icon;
                      return (
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}
                        >
                          <TypeIcon className="h-5 w-5" />
                        </div>
                      );
                    })()}

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Link href={getItemLink(item)}>
                          <h3 className="truncate font-semibold text-gray-900 hover:text-blue-600">
                            {item.title}
                          </h3>
                        </Link>
                      </div>

                      {/* Details (compact) */}
                      <div className="text-sm text-gray-700">
                        {item.type === 'auction' ? (
                          <p>
                            {item.brand || ''} {item.model || ''}{' '}
                            {item.year ? `• ${item.year}` : ''}
                            {item.currentPrice ? (
                              <>
                                {' '}
                                •{' '}
                                <span className="font-semibold text-green-700">
                                  {new Intl.NumberFormat('ar-LY', {
                                    style: 'currency',
                                    currency: 'LYD',
                                    minimumFractionDigits: 0,
                                  }).format(item.currentPrice)}
                                </span>
                              </>
                            ) : null}
                            {item.endTime ? (
                              <>
                                {' '}
                                •{' '}
                                <span className="inline-flex items-center gap-1 text-orange-600">
                                  <ClockIcon className="h-3 w-3" />
                                  ينتهي: {new Date(item.endTime).toLocaleDateString('ar-LY')}
                                </span>
                              </>
                            ) : null}
                          </p>
                        ) : item.type === 'marketplace' ? (
                          <p>
                            {item.brand || ''} {item.model || ''}{' '}
                            {item.year ? `• ${item.year}` : ''}
                            {item.price ? (
                              <>
                                {' '}
                                •{' '}
                                <span className="font-semibold text-blue-700">
                                  {new Intl.NumberFormat('ar-LY', {
                                    style: 'currency',
                                    currency: 'LYD',
                                    minimumFractionDigits: 0,
                                  }).format(item.price)}
                                </span>
                              </>
                            ) : null}
                            {item.location ? (
                              <>
                                {' '}
                                •{' '}
                                <span className="inline-flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  {item.location}
                                </span>
                              </>
                            ) : null}
                          </p>
                        ) : item.type === 'transport' ? (
                          <p>
                            {item.truckType || ''}{' '}
                            {item.capacity ? `• سعة ${item.capacity} طن` : ''}
                            {item.pricePerKm ? (
                              <>
                                {' '}
                                •{' '}
                                <span className="font-semibold text-orange-700">
                                  {new Intl.NumberFormat('ar-LY', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(item.pricePerKm)}{' '}
                                  د.ل/كم
                                </span>
                              </>
                            ) : null}
                            {item.serviceArea ? (
                              <>
                                {' '}
                                •{' '}
                                <span className="inline-flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  {item.serviceArea}
                                </span>
                              </>
                            ) : null}
                          </p>
                        ) : item.type === 'showroom' ? (
                          <p>
                            {item.totalCars ? `${item.totalCars} سيارة` : ''}
                            {item.location ? (
                              <>
                                {' '}
                                •{' '}
                                <span className="inline-flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  {item.location}
                                </span>
                              </>
                            ) : null}
                          </p>
                        ) : (
                          <p>{item.description || 'لا توجد تفاصيل إضافية'}</p>
                        )}
                      </div>
                    </div>

                    {/* Remove action */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRemoveFavorite(item)}
                        className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50"
                        aria-label="إزالة من المفضلة"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;

// Animations (aligned with notifications)
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fade-in 0.25s ease-out forwards; opacity: 0; }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style);
}
