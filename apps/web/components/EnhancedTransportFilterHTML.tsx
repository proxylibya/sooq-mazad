import React, { useState, useCallback } from 'react';

/**
 * مكون HTML محسن لفلاتر النقل - يستخدم التصميم العربي RTL المحسن
 * يحل مشاكل الاتجاه والأيقونات والتفاعل
 * تم تحسينه وفقاً لمتطلبات التصميم العربي والمعايير المطلوبة
 */
const EnhancedTransportFilterHTML: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    truckType: 'all',
    serviceArea: 'all',
    minPrice: '',
    maxPrice: '',
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.truckType !== 'all') count++;
    if (filters.serviceArea !== 'all') count++;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  }, [filters]);

  // إعادة تعيين الفلاتر
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      truckType: 'all',
      serviceArea: 'all',
      minPrice: '',
      maxPrice: '',
    });
  }, []);

  return (
    <div className="lg:col-span-1">
      {/* فلتر سطح المكتب المحسن */}
      <div className="hidden lg:block">
        <div className="transport-filter-compact">
          {/* رأس الفلتر */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="transport-filter-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="no-flip-icon h-4 w-4 text-blue-600"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                />
              </svg>
              الفلاتر
            </h3>
            <div className="flex items-center gap-2">
              {activeFiltersCount() > 0 && (
                <span className="transport-filter-badge">{activeFiltersCount()}</span>
              )}
              <span className="text-xs text-gray-500">15 نتيجة</span>
            </div>
          </div>

          {/* محتوى الفلاتر */}
          <div className="space-y-4">
            {/* البحث المحسن */}
            <div>
              <label className="transport-filter-label">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="no-flip-icon h-3 w-3 text-blue-600"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                البحث في خدمات النقل
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن خدمة نقل، ناقل، أو مدينة..."
                  className="transport-filter-input pl-8 pr-10"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  aria-label="البحث في خدمات النقل"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="no-flip-icon absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                {filters.search && (
                  <button
                    onClick={() => setFilters({ ...filters, search: '' })}
                    className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                    aria-label="مسح البحث"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="no-flip-icon h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* نوع الساحبة */}
            <div>
              <label className="transport-filter-label">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="no-flip-icon h-3 w-3 text-blue-600"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 1-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m6.75 4.5v-3a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3m-6 0h4.5m-4.5 0h-1.5m1.5 0v-3a1.5 1.5 0 0 1 1.5-1.5H9a1.5 1.5 0 0 1 1.5 1.5v3m-3 0h1.5m-1.5 0h-1.5m1.5 0v-3a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3"
                  />
                </svg>
                نوع الساحبة
              </label>
              <div className="relative">
                <select
                  className="transport-filter-select appearance-none pr-10"
                  value={filters.truckType}
                  onChange={(e) => setFilters({ ...filters, truckType: e.target.value })}
                  aria-label="اختيار نوع الساحبة"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="صغيرة">ساحبة صغيرة</option>
                  <option value="متوسطة">ساحبة متوسطة</option>
                  <option value="كبيرة">ساحبة كبيرة</option>
                  <option value="رافعة">ساحبة مع رافعة</option>
                  <option value="مقطورة">شاحنة مقطورة</option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="no-flip-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>

            {/* منطقة الخدمة */}
            <div>
              <label className="transport-filter-label">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="no-flip-icon h-3 w-3 text-blue-600"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                منطقة الخدمة
              </label>
              <div className="relative">
                <select
                  className="transport-filter-select appearance-none pr-10"
                  value={filters.serviceArea}
                  onChange={(e) => setFilters({ ...filters, serviceArea: e.target.value })}
                  aria-label="اختيار منطقة الخدمة"
                >
                  <option value="all">جميع المناطق</option>
                  <option value="طرابلس">طرابلس</option>
                  <option value="بنغازي">بنغازي</option>
                  <option value="مصراتة">مصراتة</option>
                  <option value="الزاوية">الزاوية</option>
                  <option value="سبها">سبها</option>
                  <option value="البيضاء">البيضاء</option>
                  <option value="طبرق">طبرق</option>
                  <option value="درنة">درنة</option>
                  <option value="أجدابيا">أجدابيا</option>
                  <option value="سرت">سرت</option>
                  <option value="الخمس">الخمس</option>
                  <option value="زليتن">زليتن</option>
                  <option value="غريان">غريان</option>
                  <option value="بني وليد">بني وليد</option>
                  <option value="ترهونة">ترهونة</option>
                  <option value="مسلاتة">مسلاتة</option>
                  <option value="يفرن">يفرن</option>
                  <option value="نالوت">نالوت</option>
                  <option value="صبراتة">صبراتة</option>
                  <option value="زوارة">زوارة</option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="no-flip-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>

            {/* نطاق السعر */}
            <div>
              <label className="transport-filter-label">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="no-flip-icon h-3 w-3 text-blue-600"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                نطاق السعر (دينار ليبي)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="الحد الأدنى"
                  className="transport-filter-input text-center"
                  min="0"
                  step="0.5"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  aria-label="الحد الأدنى للسعر"
                />
                <input
                  type="number"
                  placeholder="الحد الأقصى"
                  className="transport-filter-input text-center"
                  min="0"
                  step="0.5"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  aria-label="الحد الأقصى للسعر"
                />
              </div>
            </div>

            {/* زر مسح الفلاتر */}
            <button
              type="button"
              className="transport-filter-button secondary"
              onClick={resetFilters}
              disabled={activeFiltersCount() === 0}
              aria-label="مسح جميع الفلاتر"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="no-flip-icon h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              مسح جميع الفلاتر {activeFiltersCount() > 0 && `(${activeFiltersCount()})`}
            </button>
          </div>
        </div>
      </div>

      {/* زر فلتر الجوال المحسن */}
      <div className="mb-4 lg:hidden">
        <button
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-colors hover:bg-gray-50"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-label="فتح فلاتر البحث"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="no-flip-icon h-4 w-4 text-gray-600"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
              />
            </svg>
            <span className="font-medium">الفلاتر</span>
            {activeFiltersCount() > 0 && (
              <span className="transport-filter-badge">{activeFiltersCount()}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">15 نتيجة</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`no-flip-icon h-4 w-4 text-gray-400 transition-transform ${
                showMobileFilters ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </button>
      </div>

      {/* نافذة فلاتر الجوال المنبثقة */}
      {showMobileFilters && (
        <div className="mobile-filter-overlay lg:hidden">
          <div className="mobile-filter-backdrop" onClick={() => setShowMobileFilters(false)} />
          <div className="mobile-filter-panel">
            <div className="mobile-filter-header">
              <h3 className="mobile-filter-title">فلاتر البحث</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="mobile-filter-close"
                aria-label="إغلاق الفلاتر"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="no-flip-icon h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* محتوى الفلاتر للجوال - نفس المحتوى كسطح المكتب */}
            <div className="space-y-4">
              {/* نسخة مبسطة من فلاتر سطح المكتب */}
              <div className="py-8 text-center text-gray-500">محتوى الفلاتر سيتم إضافته هنا</div>
            </div>

            <button className="mobile-filter-apply" onClick={() => setShowMobileFilters(false)}>
              تطبيق الفلاتر ({activeFiltersCount()})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTransportFilterHTML;
