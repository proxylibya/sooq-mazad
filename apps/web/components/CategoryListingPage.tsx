import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { OpensooqNavbar } from './common';
import SelectField from './ui/SelectField';
import { SafeLocalStorage } from '../utils/unifiedLocalStorage';
import SafetyTips from './SafetyTips';
import { useFavorites } from '../hooks/useFavorites';

// أنواع البيانات العامة
interface CategoryItem {
  id: string;
  title: string;
  price?: number;
  location: string;
  images: string[];
  featured?: boolean;
  urgent?: boolean;
  [key: string]: any; // للخصائص الإضافية المختلفة لكل فئة
}

interface CategoryStats {
  total: number;
  featured: number;
  urgent: number;
  newItems: number;
}

interface CategoryConfig {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  addButtonText: string;
  addButtonLink: string;
  itemName: string; // مثل "سيارة" أو "قطعة غيار"
  itemNamePlural: string; // مثل "سيارات" أو "قطع غيار"
  filters: {
    searchPlaceholder: string;
    locationLabel: string;
    categoryLabel?: string;
    brandLabel?: string;
    conditionLabel?: string;
    priceLabel?: string;
    customFilters?: Array<{
      key: string;
      label: string;
      options: string[];
      placeholder: string;
    }>;
  };
}

interface CategoryListingPageProps {
  items: CategoryItem[];
  stats: CategoryStats;
  config: CategoryConfig;
  ItemCard: React.ComponentType<{ item: CategoryItem }>;
  ItemCardGrid: React.ComponentType<{ item: CategoryItem }>;
  locationOptions: string[];
  categoryOptions?: string[];
  brandOptions?: string[];
  conditionOptions?: string[];
}

const CategoryListingPage: React.FC<CategoryListingPageProps> = ({
  items: initialItems = [],
  stats = { total: 0, featured: 0, urgent: 0, newItems: 0 },
  config,
  ItemCard,
  ItemCardGrid,
  locationOptions = [],
  categoryOptions = [],
  brandOptions = [],
  conditionOptions = [],
}) => {
  const router = useRouter();
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [isAutoGrid, setIsAutoGrid] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isFilteringInProgress, setIsFilteringInProgress] = useState(false);

  // مراقبة حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);

      // تحويل تلقائي إلى وضع الشبكة عند أقل من 1080px
      if (width < 1080) {
        if (viewMode === 'list') {
          setViewMode('grid');
          setIsAutoGrid(true);
        }
      } else {
        // العودة إلى الوضع المحفوظ عند الشاشات الأكبر
        if (isAutoGrid) {
          const savedViewMode = SafeLocalStorage.getItem('category-view-mode', 'list');
          setViewMode(savedViewMode);
          setIsAutoGrid(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, isAutoGrid]);

  // تحميل وضع العرض المحفوظ
  useEffect(() => {
    const savedViewMode = SafeLocalStorage.getItem('category-view-mode', 'list');
    setViewMode(savedViewMode);
  }, []);

  // حفظ وضع العرض عند التغيير
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    setIsAutoGrid(false);
    SafeLocalStorage.setItem('category-view-mode', mode);
  };

  // حالة الإشعارات
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });

  // استخدام hook المفضلة
  const { isFavorite, toggleFavorite } = useFavorites();

  // تحميل البيانات الأولية
  useEffect(() => {
    if (initialItems && Array.isArray(initialItems)) {
      setItems(initialItems);
    } else {
      setItems([]);
    }
    setLoading(false);

    // إعادة تعيين الفلاتر عند تحميل الصفحة
    setFilters({
      searchQuery: '',
      location: 'جميع المدن',
      category: categoryOptions.length > 0 ? 'جميع الفئات' : '',
      brand: brandOptions.length > 0 ? 'جميع الماركات' : '',
      condition: conditionOptions.length > 0 ? 'جميع الحالات' : '',
    });
  }, [initialItems, categoryOptions, brandOptions, conditionOptions]);

  // فلتر مبسط
  const [filters, setFilters] = useState({
    searchQuery: '',
    location: 'جميع المدن',
    category: '',
    brand: '',
    condition: '',
  });

  // إضافة debouncing للفلاتر
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    setIsFilteringInProgress(true);

    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setIsFilteringInProgress(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsFilteringInProgress(false);
    };
  }, [filters]);

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      location: 'جميع المدن',
      category: categoryOptions.length > 0 ? 'جميع الفئات' : '',
      brand: brandOptions.length > 0 ? 'جميع الماركات' : '',
      condition: conditionOptions.length > 0 ? 'جميع الحالات' : '',
    });

    setNotification({
      show: true,
      type: 'success',
      message: 'تم إعادة تعيين جميع الفلاتر',
    });

    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 2000);
  }, [categoryOptions, brandOptions, conditionOptions]);

  // تحسين الفلترة باستخدام useMemo
  const filteredItems = useMemo(() => {
    let filtered = items;

    // فلتر البحث النصي
    if (debouncedFilters.searchQuery) {
      const query = debouncedFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.brand && item.brand.toLowerCase().includes(query)) ||
          (item.model && item.model.toLowerCase().includes(query)),
      );
    }

    // فلتر المدينة
    if (debouncedFilters.location !== 'جميع المدن') {
      filtered = filtered.filter((item) => item.location.includes(debouncedFilters.location));
    }

    // فلتر الفئة
    if (debouncedFilters.category && debouncedFilters.category !== 'جميع الفئات') {
      filtered = filtered.filter((item) => item.category === debouncedFilters.category);
    }

    // فلتر الماركة
    if (debouncedFilters.brand && debouncedFilters.brand !== 'جميع الماركات') {
      filtered = filtered.filter((item) => item.brand === debouncedFilters.brand);
    }

    // فلتر الحالة
    if (debouncedFilters.condition && debouncedFilters.condition !== 'جميع الحالات') {
      filtered = filtered.filter((item) => item.condition === debouncedFilters.condition);
    }

    return filtered;
  }, [items, debouncedFilters]);

  return (
    <>
      <Head>
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed right-4 top-20 z-50 max-w-sm rounded-lg p-4 shadow-lg ${
              notification.type === 'success'
                ? 'border border-green-400 bg-green-100 text-green-700'
                : notification.type === 'error'
                  ? 'border border-red-400 bg-red-100 text-red-700'
                  : 'border border-yellow-400 bg-yellow-100 text-yellow-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex-1 text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className="mr-2 rounded-lg p-1 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-95"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* فلتر محمول للشاشات الصغيرة */}
        {screenWidth <= 660 && (
          <div className="mx-auto max-w-7xl px-4 py-2">
            <div className="rounded-lg border bg-white shadow-sm">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex w-full items-center justify-between p-4 text-right transition-all duration-200 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-800">الفلاتر</span>
                  {(filters.category !== 'جميع الفئات' ||
                    filters.brand !== 'جميع الماركات' ||
                    filters.location !== 'جميع المدن' ||
                    filters.condition !== 'جميع الحالات') && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      نشط
                    </span>
                  )}
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showMobileFilters && (
                <div className="space-y-3 border-t bg-gray-50/50 p-4">
                  {/* البحث */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">البحث</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={config.filters.searchPlaceholder}
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* الفلاتر الأساسية */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* المدينة */}
                    <SelectField
                      label={config.filters.locationLabel}
                      options={locationOptions}
                      value={filters.location}
                      onChange={(val) => handleFilterChange('location', val)}
                      placeholder="اختر المدينة"
                      size="sm"
                      clearable={true}
                      searchable={true}
                    />

                    {/* الفئة */}
                    {categoryOptions.length > 0 && config.filters.categoryLabel && (
                      <SelectField
                        label={config.filters.categoryLabel}
                        options={categoryOptions}
                        value={filters.category}
                        onChange={(val) => handleFilterChange('category', val)}
                        placeholder="اختر الفئة"
                        size="sm"
                        clearable={true}
                        searchable={true}
                      />
                    )}

                    {/* الماركة */}
                    {brandOptions.length > 0 && config.filters.brandLabel && (
                      <SelectField
                        label={config.filters.brandLabel}
                        options={brandOptions}
                        value={filters.brand}
                        onChange={(val) => handleFilterChange('brand', val)}
                        placeholder="اختر الماركة"
                        size="sm"
                        clearable={true}
                        searchable={true}
                      />
                    )}

                    {/* الحالة */}
                    {conditionOptions.length > 0 && config.filters.conditionLabel && (
                      <SelectField
                        label={config.filters.conditionLabel}
                        options={conditionOptions}
                        value={filters.condition}
                        onChange={(val) => handleFilterChange('condition', val)}
                        placeholder="اختر الحالة"
                        size="sm"
                        clearable={true}
                        searchable={true}
                      />
                    )}
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={resetFilters}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm active:scale-95"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>إزالة الكل</span>
                    </button>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-95"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>تطبيق الفلاتر</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className={`flex items-start gap-4 ${screenWidth <= 660 ? 'flex-col' : ''}`}>
            {/* فلتر محسن - مخفي في الشاشات الصغيرة */}
            <aside className={`w-72 flex-shrink-0 ${screenWidth <= 660 ? 'hidden' : ''}`}>
              <div className="space-y-3 rounded-2xl border bg-white p-5 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
                    الفلاتر
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>إزالة الكل</span>
                  </button>
                </div>

                {/* البحث */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">البحث</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={config.filters.searchPlaceholder}
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      dir="rtl"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* المدينة */}
                <div>
                  <SelectField
                    label={config.filters.locationLabel}
                    options={locationOptions}
                    value={filters.location}
                    onChange={(val) => handleFilterChange('location', val)}
                    placeholder="اختر المدينة"
                    size="md"
                    clearable={true}
                    searchable={true}
                  />
                </div>

                {/* الفئة */}
                {categoryOptions.length > 0 && config.filters.categoryLabel && (
                  <div>
                    <SelectField
                      label={config.filters.categoryLabel}
                      options={categoryOptions}
                      value={filters.category}
                      onChange={(val) => handleFilterChange('category', val)}
                      placeholder="اختر الفئة"
                      size="md"
                      clearable={true}
                      searchable={true}
                    />
                  </div>
                )}

                {/* الماركة */}
                {brandOptions.length > 0 && config.filters.brandLabel && (
                  <div>
                    <SelectField
                      label={config.filters.brandLabel}
                      options={brandOptions}
                      value={filters.brand}
                      onChange={(val) => handleFilterChange('brand', val)}
                      placeholder="اختر الماركة"
                      size="md"
                      clearable={true}
                      searchable={true}
                    />
                  </div>
                )}

                {/* الحالة */}
                {conditionOptions.length > 0 && config.filters.conditionLabel && (
                  <div>
                    <SelectField
                      label={config.filters.conditionLabel}
                      options={conditionOptions}
                      value={filters.condition}
                      onChange={(val) => handleFilterChange('condition', val)}
                      placeholder="اختر الحالة"
                      size="md"
                      clearable={true}
                      searchable={true}
                    />
                  </div>
                )}

                {/* إضافة إعلان جديد */}
                <div className="mt-4 border-t pt-4">
                  <div className="text-center">
                    <h3 className="mb-1 text-base font-bold text-gray-800">
                      {config.addButtonText}
                    </h3>
                    <p className="mb-3 text-xs text-gray-600">{config.description}</p>
                    <button
                      onClick={() => router.push(config.addButtonLink)}
                      className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-lg active:scale-95"
                    >
                      أضف إعلانك الآن
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Items List */}
            <div className={`${screenWidth <= 660 ? 'w-full' : 'flex-1'} min-h-0`}>
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{config.title}</span>
                    <span className="text-gray-500">
                      ({filteredItems.length} من {items.length})
                    </span>
                    {/* زر إعادة تعيين الفلاتر */}
                    {(filters.searchQuery ||
                      filters.location !== 'جميع المدن' ||
                      filters.category !== 'جميع الفئات' ||
                      filters.brand !== 'جميع الماركات' ||
                      filters.condition !== 'جميع الحالات') && (
                      <button
                        onClick={resetFilters}
                        className="ml-3 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-200 hover:text-red-700 active:scale-95"
                        title="إعادة تعيين جميع الفلاتر"
                      >
                        إعادة تعيين الفلاتر
                      </button>
                    )}
                  </h2>

                  <div className="flex items-center gap-4">
                    {/* عداد النتائج */}
                    <div className="text-sm text-gray-600">
                      {isFilteringInProgress ? (
                        <span className="flex items-center gap-2">
                          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                          جاري البحث...
                        </span>
                      ) : (
                        <span>
                          {filteredItems.length} من {items.length} {config.itemName}
                        </span>
                      )}
                    </div>

                    {/* أزرار العرض */}
                    <div className="relative flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                      <button
                        onClick={() => handleViewModeChange('list')}
                        disabled={screenWidth < 1080}
                        className={`rounded-lg p-2.5 transition-all duration-200 ${
                          viewMode === 'list'
                            ? 'border border-blue-200 bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        } ${screenWidth < 1080 ? 'cursor-not-allowed opacity-50' : 'active:scale-95'}`}
                        title={screenWidth < 1080 ? 'غير متاح في الشاشات الصغيرة' : 'عرض قائمة'}
                      >
                        <ListBulletIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleViewModeChange('grid')}
                        className={`rounded-lg p-2.5 transition-all duration-200 ${
                          viewMode === 'grid'
                            ? 'border border-blue-200 bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        } active:scale-95`}
                        title="عرض شبكي"
                      >
                        <Squares2X2Icon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* عرض الفلاتر النشطة */}
                {(filters.searchQuery ||
                  filters.location !== 'جميع المدن' ||
                  filters.category !== 'جميع الفئات' ||
                  filters.brand !== 'جميع الماركات' ||
                  filters.condition !== 'جميع الحالات') && (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">الفلاتر المطبقة:</span>
                      <button
                        onClick={resetFilters}
                        className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                      >
                        إزالة الكل
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.searchQuery && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          البحث: {filters.searchQuery}
                        </span>
                      )}
                      {filters.location !== 'جميع المدن' && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          المدينة: {filters.location}
                        </span>
                      )}
                      {filters.category !== 'جميع الفئات' && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          الفئة: {filters.category}
                        </span>
                      )}
                      {filters.brand !== 'جميع الماركات' && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          الماركة: {filters.brand}
                        </span>
                      )}
                      {filters.condition !== 'جميع الحالات' && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                          الحالة: {filters.condition}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* عرض العناصر */}
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center gap-3">
                      <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                      <span className="font-medium text-gray-600">
                        جاري تحميل {config.itemNamePlural}...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid'
                        ? `grid gap-4 ${
                            screenWidth <= 800
                              ? 'grid-cols-1'
                              : screenWidth < 1080
                                ? 'grid-cols-1 sm:grid-cols-2'
                                : 'grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                          }`
                        : 'space-y-4'
                    }
                  >
                    {/* مؤشر التحميل أثناء الفلترة */}
                    {isFilteringInProgress && (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-3 text-blue-600">
                          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                          <span className="text-sm font-medium">جاري تطبيق الفلاتر...</span>
                        </div>
                      </div>
                    )}

                    {/* عرض العناصر */}
                    {!isFilteringInProgress &&
                      filteredItems.map((item) =>
                        viewMode === 'grid' ? (
                          <ItemCardGrid key={item.id} item={item} />
                        ) : (
                          <ItemCard key={item.id} item={item} />
                        ),
                      )}

                    {/* رسالة عدم وجود نتائج */}
                    {!isFilteringInProgress && filteredItems.length === 0 && (
                      <div className="py-12 text-center">
                        <div className="mb-4 text-gray-400">
                          <svg
                            className="mx-auto h-16 w-16"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                          لا توجد {config.itemNamePlural}
                        </h3>
                        <p className="text-gray-500">
                          جرب تغيير الفلاتر أو إضافة {config.itemName} جديد
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نصائح الأمان */}
      <div className="container mx-auto px-4 py-8">
        <SafetyTips />
      </div>
    </>
  );
};

export default CategoryListingPage;
