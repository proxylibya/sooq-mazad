/**
 * صفحة الساحات - قائمة ساحات المزادات
 * Yards Page - Auction Yards Listing
 * تصميم فاتح متوافق مع موقع الويب
 */

import { OpensooqNavbar } from '@/components/common';
import AdvancedFooter from '@/components/common/Footer/AdvancedFooter';
import Globe3D from '@/components/ui/Globe3D';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { dayLabels, type Yard, type YardStats } from '@/data/yards-data';
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { getCityNames, getMainCities } from '@sooq-mazad/utils';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function YardsPage() {
  const [yards, setYards] = useState<Yard[]>([]);
  const [stats, setStats] = useState<YardStats>({ total: 0, totalCapacity: 0, activeAuctions: 0 });
  const [auctionStats, setAuctionStats] = useState({ upcoming: 0, live: 0, sold: 0, ended: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');

  useEffect(() => {
    fetchYards();
  }, []);

  const fetchYards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/yards');
      const data = await res.json();
      if (data.success) {
        setYards(data.yards || []);
        setStats(data.stats || { total: 0, totalCapacity: 0, activeAuctions: 0 });
        // إحصائيات المزادات موجودة داخل stats
        setAuctionStats(data.stats?.auctionStats || { upcoming: 0, live: 0, sold: 0, ended: 0 });
      }
    } catch (error) {
      console.error('Error fetching yards:', error);
    } finally {
      setLoading(false);
    }
  };

  // استخدام قائمة المدن الليبية الكاملة من البيانات المشتركة
  const allCities = useMemo(() => getCityNames(), []);
  const mainCities = useMemo(() => getMainCities().map((c) => c.name), []);

  // المدن التي تحتوي على ساحات (للعرض أولاً)
  const citiesWithYards = useMemo(() => [...new Set(yards.map((y) => y.city))], [yards]);

  const filteredYards = useMemo(() => {
    return yards.filter((yard) => {
      const matchesSearch =
        !search ||
        yard.name.toLowerCase().includes(search.toLowerCase()) ||
        yard.city.toLowerCase().includes(search.toLowerCase()) ||
        yard.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === 'all' || yard.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [yards, search, cityFilter]);

  return (
    <>
      <Head>
        <title>ساحات المزادات | سوق مزاد</title>
        <meta
          name="description"
          content="تصفح ساحات المزادات المعتمدة في ليبيا - طرابلس، بنغازي، مصراتة والمزيد"
        />
      </Head>

      <OpensooqNavbar />

      <main className="min-h-screen bg-gray-50" dir="rtl">
        {/* Hero Section - شريط مضغوط */}
        <div className="relative overflow-hidden bg-gradient-to-l from-blue-700 via-blue-800 to-blue-900 py-3">
          <div className="container relative z-10 mx-auto px-4">
            {/* صف واحد يجمع كل المحتوى */}
            <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between md:gap-4">
              {/* العنوان والوصف - الجانب الأيمن */}
              <div className="flex items-center gap-3 text-center md:text-right">
                <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 md:flex">
                  <BuildingOfficeIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white md:text-xl">ساحات المزادات</h1>
                  <p className="hidden text-xs text-blue-200 md:block">
                    معاينة السيارات والمزايدة حضورياً
                  </p>
                </div>
              </div>

              {/* إحصائيات المزادات - 4 عناصر في صف */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                {/* مزاد قادم */}
                <div className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/20 px-3 py-1.5 backdrop-blur-sm">
                  <CalendarDaysIcon className="h-4 w-4 text-amber-300" />
                  <span className="text-lg font-bold text-white">{auctionStats.upcoming}</span>
                  <span className="hidden text-xs text-amber-200 sm:inline">قادم</span>
                </div>

                {/* مزاد مباشر */}
                <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-1.5 backdrop-blur-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  </span>
                  <span className="text-lg font-bold text-white">{auctionStats.live}</span>
                  <span className="hidden text-xs text-red-200 sm:inline">مباشر</span>
                </div>

                {/* تم البيع */}
                <div className="flex items-center gap-2 rounded-lg border border-green-400/40 bg-green-500/20 px-3 py-1.5 backdrop-blur-sm">
                  <CheckBadgeIcon className="h-4 w-4 text-green-300" />
                  <span className="text-lg font-bold text-white">{auctionStats.sold}</span>
                  <span className="hidden text-xs text-green-200 sm:inline">مباع</span>
                </div>

                {/* منتهي */}
                <div className="flex items-center gap-2 rounded-lg border border-slate-400/40 bg-slate-500/20 px-3 py-1.5 backdrop-blur-sm">
                  <ClockIcon className="h-4 w-4 text-slate-300" />
                  <span className="text-lg font-bold text-white">{auctionStats.ended}</span>
                  <span className="hidden text-xs text-slate-200 sm:inline">منتهي</span>
                </div>
              </div>

              {/* إحصائيات الساحات - الجانب الأيسر */}
              <div className="hidden items-center gap-3 lg:flex">
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                  <BuildingOfficeIcon className="h-3.5 w-3.5" />
                  <span>{stats.total} ساحة</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                  <StarIcon className="h-3.5 w-3.5 text-yellow-300" />
                  <span>{stats.totalCapacity} سعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="container mx-auto px-4 py-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md">
            {/* حقول البحث مع العنوان في صف واحد */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* أيقونة العنوان */}
              <div className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 lg:flex">
                <MagnifyingGlassIcon className="h-4 w-4 text-blue-600" />
              </div>

              {/* حقل البحث الرئيسي */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن ساحة أو منطقة..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-3 pr-11 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* فلتر المدينة */}
              <div className="lg:w-56">
                <SearchableSelect
                  value={cityFilter}
                  onChange={(val) => setCityFilter(val || 'all')}
                  options={[
                    { value: 'all', label: 'جميع المدن' },
                    ...citiesWithYards.map((city) => ({ value: city, label: `${city}` })),
                    ...mainCities
                      .filter((city) => !citiesWithYards.includes(city))
                      .map((city) => ({ value: city, label: city })),
                    ...allCities
                      .filter(
                        (city) => !citiesWithYards.includes(city) && !mainCities.includes(city),
                      )
                      .map((city) => ({ value: city, label: city })),
                  ]}
                  placeholder="المدينة"
                  searchable={true}
                  clearable={false}
                  size="md"
                />
              </div>

              {/* زر البحث للموبايل */}
              <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 lg:hidden">
                <MagnifyingGlassIcon className="h-4 w-4" />
                بحث
              </button>

              {/* عداد النتائج - يظهر في نفس الصف على الشاشات الكبيرة */}
              {!loading && (
                <div className="hidden items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 lg:flex">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
                  <span className="font-bold text-blue-600">{filteredYards.length}</span>
                  <span>ساحة</span>
                </div>
              )}
            </div>

            {/* عداد النتائج للموبايل */}
            {!loading && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 lg:hidden">
                <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  تم العثور على{' '}
                  <span className="font-bold text-blue-600">{filteredYards.length}</span> ساحة
                  {search && <span className="text-gray-400"> للبحث "{search}"</span>}
                  {cityFilter !== 'all' && <span className="text-gray-400"> في {cityFilter}</span>}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Yards Grid */}
        <div className="container mx-auto px-4 pb-12">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
              <p className="mt-4 text-gray-500">جاري تحميل الساحات...</p>
            </div>
          ) : filteredYards.length === 0 ? (
            <div className="py-12 text-center">
              <BuildingOfficeIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-lg text-gray-500">لا توجد ساحات نشطة حالياً</p>
              {stats.total === 0 && (
                <p className="mt-2 text-sm text-gray-400">
                  (إجمالي الساحات في قاعدة البيانات: {(stats as any).totalInDatabase || 0})
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredYards.map((yard) => {
                const hasRealImage =
                  !!yard.image &&
                  !yard.image.includes('default-yard') &&
                  !yard.image.includes('placeholder');
                return (
                  <Link
                    key={yard.id}
                    href={`/yards/${yard.slug}`}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
                  >
                    {/* الكرة الأرضية ثلاثية الأبعاد مع اسم الساحة */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
                      {/* صورة الساحة إذا وُجدت */}
                      {hasRealImage ? (
                        <>
                          <Image
                            src={yard.image}
                            alt={yard.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          {/* طبقة تدرج للنص */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                          {/* اسم الساحة */}
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h3 className="text-2xl font-extrabold leading-tight text-white drop-shadow-lg">
                              {yard.name}
                            </h3>
                            <div className="mt-2 flex items-center gap-2 text-white/95">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-lg">
                                <MapPinIcon className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-base font-medium">
                                {yard.city}
                                {yard.area ? ` - ${yard.area}` : ''}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        // الكرة الأرضية الثلاثية الأبعاد مع معلومات مفيدة
                        <Globe3D
                          yardName={yard.name}
                          city={`${yard.city}${yard.area ? ` - ${yard.area}` : ''}`}
                          activeAuctions={yard.activeAuctions}
                          rating={yard.rating}
                          verified={yard.verified}
                          auctionDays={yard.auctionDays}
                        />
                      )}

                      {/* Badges */}
                      <div className="absolute right-3 top-3 z-10 flex gap-2">
                        {yard.featured && (
                          <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                            <StarIcon className="h-4 w-4 fill-current" />
                            مميز
                          </span>
                        )}
                        {yard.verified && (
                          <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                            <CheckBadgeIcon className="h-4 w-4" />
                            موثق
                          </span>
                        )}
                      </div>

                      {/* عداد المزادات النشطة - يظهر فقط إذا كانت هناك صورة */}
                      {hasRealImage && yard.activeAuctions > 0 && (
                        <div className="absolute left-3 top-3 z-10">
                          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                            </span>
                            <span>{yard.activeAuctions} مزاد</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* اسم الساحة - للبطاقات بدون صورة واضحة */}
                      {!hasRealImage && (
                        <h3 className="mb-3 text-lg font-bold text-gray-900">{yard.name}</h3>
                      )}

                      {/* الوصف */}
                      {yard.description && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                          {yard.description}
                        </p>
                      )}

                      {/* قسم مواعيد المزاد */}
                      {(yard.auctionDays.length > 0 ||
                        (yard.auctionTimeFrom && yard.auctionTimeTo)) && (
                        <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-900">
                            <CalendarDaysIcon className="h-4 w-4" />
                            مواعيد المزاد
                          </h4>

                          {/* أيام المزاد */}
                          {yard.auctionDays.length > 0 && (
                            <div className="mb-3">
                              <span className="mb-2 block text-xs font-medium text-blue-700">
                                أيام العمل:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {yard.auctionDays.map((day) => (
                                  <span
                                    key={day}
                                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm"
                                  >
                                    {dayLabels[day] || day}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* وقت المزاد */}
                          {yard.auctionTimeFrom && yard.auctionTimeTo && (
                            <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2">
                              <ClockIcon className="h-4 w-4 text-blue-600" />
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-blue-600">من</span>
                                <span className="font-bold text-blue-800" dir="ltr">
                                  {(() => {
                                    const formatTime = (time: string) => {
                                      const [hours, minutes] = time.split(':').map(Number);
                                      const period = hours >= 12 ? 'م' : 'ص';
                                      const hour12 = hours % 12 || 12;
                                      return `${hour12}:${minutes.toString().padStart(2, '0')}${period}`;
                                    };
                                    return formatTime(yard.auctionTimeFrom!);
                                  })()}
                                </span>
                                <span className="text-xs text-blue-600">إلى</span>
                                <span className="font-bold text-blue-800" dir="ltr">
                                  {(() => {
                                    const formatTime = (time: string) => {
                                      const [hours, minutes] = time.split(':').map(Number);
                                      const period = hours >= 12 ? 'م' : 'ص';
                                      const hour12 = hours % 12 || 12;
                                      return `${hour12}:${minutes.toString().padStart(2, '0')}${period}`;
                                    };
                                    return formatTime(yard.auctionTimeTo!);
                                  })()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* قسم الموقع والتواصل */}
                      <div className="mt-4 space-y-3">
                        {/* العنوان */}
                        {yard.address && (
                          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-600">
                              <MapPinIcon className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="mb-0.5 block text-[10px] font-medium text-gray-500">
                                العنوان
                              </span>
                              <span className="line-clamp-2 text-sm font-medium text-gray-800">
                                {yard.address}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* أرقام التواصل */}
                        {(yard.phone || yard.managerPhone) && (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {yard.phone && (
                              <a
                                href={`tel:${yard.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-3 rounded-xl bg-green-50 p-3 transition-colors hover:bg-green-100"
                              >
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-600">
                                  <PhoneIcon className="h-4 w-4 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="mb-0.5 block text-[10px] font-medium text-green-600">
                                    هاتف الساحة
                                  </span>
                                  <span
                                    className="block truncate text-sm font-bold text-green-800"
                                    dir="ltr"
                                  >
                                    {yard.phone}
                                  </span>
                                </div>
                              </a>
                            )}
                            {yard.managerPhone && yard.managerPhone !== yard.phone && (
                              <a
                                href={`tel:${yard.managerPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                              >
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
                                  <PhoneIcon className="h-4 w-4 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="mb-0.5 block text-[10px] font-medium text-blue-600">
                                    هاتف المدير
                                  </span>
                                  <span
                                    className="block truncate text-sm font-bold text-blue-800"
                                    dir="ltr"
                                  >
                                    {yard.managerPhone}
                                  </span>
                                </div>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AdvancedFooter />
    </>
  );
}
